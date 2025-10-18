import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { invoice_id, amount_cents } = await req.json();

    if (!invoice_id || !amount_cents) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get invoice and booking details
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select('booking_id')
      .eq('id', invoice_id)
      .single();

    if (invoiceError || !invoice) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update invoice status
    const { error: invoiceUpdateError } = await supabaseClient
      .from('invoices')
      .update({ status: 'paid_escrow' })
      .eq('id', invoice_id);

    if (invoiceUpdateError) {
      console.error('Invoice update error:', invoiceUpdateError);
      return new Response(JSON.stringify({ error: 'Failed to update invoice' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update payment received_at
    const { error: paymentUpdateError } = await supabaseClient
      .from('payments')
      .update({
        received_at: new Date().toISOString(),
        recorded_by: user.id,
      })
      .eq('invoice_id', invoice_id);

    if (paymentUpdateError) {
      console.error('Payment update error:', paymentUpdateError);
    }

    // Check if booking starts soon, update status to in_progress
    const { data: booking } = await supabaseClient
      .from('bookings_new')
      .select('start_ts')
      .eq('id', invoice.booking_id)
      .single();

    if (booking) {
      const startTime = new Date(booking.start_ts);
      const now = new Date();
      const hoursDiff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursDiff <= 24 && hoursDiff >= 0) {
        await supabaseClient
          .from('bookings_new')
          .update({ status: 'in_progress' })
          .eq('id', invoice.booking_id);
      }
    }

    // Log ledger
    await supabaseClient.from('ledger').insert({
      event_name: 'payment_received',
      actor_id: user.id,
      booking_id: invoice.booking_id,
      invoice_id,
      meta: { amount_cents },
    });

    // Log analytics
    await supabaseClient.from('analytics_events').insert({
      user_id: user.id,
      event_name: 'payment_marked_received',
      meta: { invoice_id, amount_cents },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});