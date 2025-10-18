import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Owner upload payment proof function started');

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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { booking_id, proof_url } = await req.json();

    if (!booking_id || !proof_url) {
      throw new Error('Missing required fields: booking_id, proof_url');
    }

    console.log('Processing payment proof upload:', { booking_id, user_id: user.id });

    // Verify the booking belongs to this user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, customer_id, status, invoice_id')
      .eq('id', booking_id)
      .eq('customer_id', user.id)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found or unauthorized');
    }

    if (booking.status !== 'awaiting_payment') {
      throw new Error('Booking is not in awaiting_payment status');
    }

    // Get or create invoice
    let invoiceId = booking.invoice_id;
    
    if (!invoiceId) {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          booking_id: booking.id,
          status: 'pending'
        })
        .select('id')
        .single();

      if (invoiceError) throw invoiceError;
      invoiceId = invoice.id;

      // Update booking with invoice_id
      await supabase
        .from('bookings')
        .update({ invoice_id: invoiceId })
        .eq('id', booking.id);
    }

    // Create payment record with proof
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        payment_proof_url: proof_url,
        uploaded_by: user.id
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update booking status to awaiting_payment_review
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'awaiting_payment_review' })
      .eq('id', booking_id);

    if (updateError) throw updateError;

    // Log analytics event
    await supabase.from('analytics_events').insert({
      event_type: 'payment_proof_uploaded',
      event_data: {
        booking_id,
        invoice_id: invoiceId,
        payment_id: payment.id
      }
    });

    console.log('Payment proof uploaded successfully:', payment.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_id: payment.id,
        message: 'Payment proof uploaded successfully. Awaiting admin review.' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in owner-upload-proof:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
