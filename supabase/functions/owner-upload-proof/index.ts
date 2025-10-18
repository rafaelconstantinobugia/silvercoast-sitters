import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';
import { validateUUID, validateURL } from '../_shared/validation.ts';

console.log('Owner upload payment proof function started');

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

    const { booking_id, proof_url } = await req.json();

    if (!booking_id || !proof_url) {
      throw new Error('Missing required fields: booking_id, proof_url');
    }

    // Validate inputs
    const bookingValidation = validateUUID(booking_id, 'booking_id');
    if (!bookingValidation.success) {
      throw new Error(bookingValidation.error);
    }

    const urlValidation = validateURL(proof_url, 'proof_url');
    if (!urlValidation.success) {
      throw new Error(urlValidation.error);
    }

    console.log('Processing payment proof upload:', { booking_id, user_id: user.id });

    // Verify booking belongs to user and is in confirmed status
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('owner_id, status')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    if (booking.owner_id !== user.id) {
      throw new Error('Unauthorized');
    }

    if (booking.status !== 'confirmed') {
      throw new Error('Booking must be in confirmed status to upload payment proof');
    }

    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, status, total_cents')
      .eq('booking_id', booking_id)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found for this booking');
    }

    // Create payment record with proof
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoice.id,
        payer_id: user.id,
        amount_cents: invoice.total_cents,
        method: 'mbway',
        proof_url,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Log analytics
    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_name: 'payment_proof_uploaded',
      meta: {
        booking_id,
        invoice_id: invoice.id,
        payment_id: payment.id
      }
    });

    console.log('Payment proof uploaded successfully:', payment.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_id: payment.id,
        message: 'Comprovativo enviado. Aguarde validação do admin.' 
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
