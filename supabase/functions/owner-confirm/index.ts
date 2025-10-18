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

    const { booking_id } = await req.json();

    if (!booking_id) {
      return new Response(JSON.stringify({ error: 'Missing booking_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify owner owns this booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings_new')
      .select('owner_id, price_cents, status')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking || booking.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized or booking not found' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (booking.status !== 'accepted') {
      return new Response(JSON.stringify({ error: 'Booking must be in accepted state' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update booking to confirmed
    const { error: updateError } = await supabaseClient
      .from('bookings_new')
      .update({ status: 'confirmed' })
      .eq('id', booking_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to confirm booking' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate invoice
    const { data: settings } = await supabaseClient
      .from('platform_settings')
      .select('key, value')
      .in('key', ['INVOICE_PREFIX', 'INVOICE_DUE_DAYS', 'MBWAY_NUMBER', 'BANK_IBAN']);

    const settingsMap = settings?.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>) || {};
    
    const invoiceNumber = `${settingsMap.INVOICE_PREFIX || 'SCS-'}${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(settingsMap.INVOICE_DUE_DAYS || '2'));

    const paymentInstructions = `MB WAY: ${settingsMap.MBWAY_NUMBER || 'N/A'}\nReferência: ${invoiceNumber}\n\nTransferência Bancária:\nIBAN: ${settingsMap.BANK_IBAN || 'N/A'}\nReferência: ${invoiceNumber}`;

    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .insert({
        booking_id,
        invoice_number: invoiceNumber,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        total_cents: booking.price_cents,
        status: 'awaiting_payment',
        payment_instructions: paymentInstructions,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Invoice error:', invoiceError);
      return new Response(JSON.stringify({ error: 'Failed to create invoice' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create invoice line
    await supabaseClient.from('invoice_lines').insert({
      invoice_id: invoice.id,
      description: 'Serviço de Pet Sitting',
      qty: 1,
      unit_price_cents: booking.price_cents,
      total_cents: booking.price_cents,
    });

    // Log events
    await supabaseClient.from('analytics_events').insert({
      user_id: user.id,
      event_name: 'owner_confirmed',
      meta: { booking_id },
    });

    await supabaseClient.from('ledger').insert({
      event_name: 'invoice_issued',
      actor_id: user.id,
      booking_id,
      invoice_id: invoice.id,
      meta: { invoice_number: invoiceNumber },
    });

    return new Response(JSON.stringify({ success: true, invoice }), {
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