import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Admin mark payout paid function started');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is authenticated and is admin
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      throw new Error('Admin access required');
    }

    const { payout_id, payment_method, transaction_reference } = await req.json();

    if (!payout_id) {
      throw new Error('Missing required field: payout_id');
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

    if (payout.status !== 'pending') {
      throw new Error('Payout is not in pending status');
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

    // Log to ledger
    await supabase.from('ledger').insert({
      entity_type: 'payout',
      entity_id: payout_id,
      event_type: 'payout_marked_paid',
      amount_cents: payout.amount_cents,
      currency: 'EUR',
      metadata: {
        sitter_id: payout.sitter_id,
        booking_id: payout.booking_id,
        marked_by: user.id,
        payment_method: payment_method || 'bank_transfer',
        transaction_reference
      }
    });

    // Log analytics event
    await supabase.from('analytics_events').insert({
      event_type: 'payout_marked_paid',
      event_data: {
        payout_id,
        sitter_id: payout.sitter_id,
        booking_id: payout.booking_id,
        amount_cents: payout.amount_cents,
        marked_by: user.id
      }
    });

    console.log('Payout marked as paid successfully:', payout_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        payout_id,
        message: 'Payout marked as paid successfully' 
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
