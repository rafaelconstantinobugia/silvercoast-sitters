import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';
import { validateUUID, validateEnum, validateStringLength } from '../_shared/validation.ts';

console.log('Admin mark payout paid function started');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify admin role
    const { data: profile, error: roleError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !profile) {
      throw new Error('Admin access required');
    }

    const { payout_id, payment_method, transaction_reference } = await req.json();

    if (!payout_id) {
      throw new Error('Missing required field: payout_id');
    }

    // Validate payout_id
    const payoutValidation = validateUUID(payout_id, 'payout_id');
    if (!payoutValidation.success) {
      throw new Error(payoutValidation.error);
    }

    // Validate payment_method if provided
    if (payment_method) {
      const methodValidation = validateEnum(
        payment_method,
        'payment_method',
        ['bank_transfer', 'mbway', 'cash', 'other']
      );
      if (!methodValidation.success) {
        throw new Error(methodValidation.error);
      }
    }

    // Validate transaction_reference if provided
    if (transaction_reference) {
      const refValidation = validateStringLength(transaction_reference, 'transaction_reference', 255);
      if (!refValidation.success) {
        throw new Error(refValidation.error);
      }
    }

    console.log('Processing payout marking:', { payout_id, admin_id: user.id });

    // Get payout details
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .select('*')
      .eq('id', payout_id)
      .single();

    if (payoutError || !payout) {
      throw new Error('Payout not found');
    }

    if (payout.status !== 'scheduled') {
      throw new Error(`Payout must be in scheduled status, currently: ${payout.status}`);
    }

    // Update payout status to paid
    const { error: updateError } = await supabase
      .from('payouts')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_method: payment_method || 'bank_transfer',
        transaction_reference: transaction_reference || null
      })
      .eq('id', payout_id);

    if (updateError) throw updateError;

    // Log ledger
    await supabase.from('ledger').insert({
      event_name: 'payout_paid',
      actor_id: user.id,
      booking_id: payout.booking_id,
      payout_id: payout.id,
      meta: {
        sitter_id: payout.sitter_id,
        amount_cents: payout.amount_cents,
        payment_method: payment_method || 'bank_transfer',
        transaction_reference
      }
    });

    // Log analytics
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_name: 'payout_marked_paid',
      meta: {
        payout_id,
        sitter_id: payout.sitter_id,
        booking_id: payout.booking_id,
        amount_cents: payout.amount_cents
      }
    });

    console.log('Payout marked as paid successfully:', payout_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        payout_id,
        message: 'Payout marcado como pago' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in admin-mark-payout-paid:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
