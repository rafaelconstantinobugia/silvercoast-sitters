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

    // Verify admin role
    const { data: profile, error: roleError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !profile) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { booking_id, platform_fee_percent } = await req.json();

    if (!booking_id) {
      return new Response(JSON.stringify({ error: 'Missing booking_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('sitter_id, price_cents, status')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update booking to completed
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', booking_id);

    if (updateError) {
      console.error('Booking update error:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to complete booking' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get platform fee from settings or use provided value
    const { data: feeSetting } = await supabaseClient
      .from('system_settings')
      .select('value')
      .eq('key', 'PLATFORM_FEE_PERCENT')
      .single();

    const feePercent = platform_fee_percent || (feeSetting?.value ? parseInt(feeSetting.value) : 15);
    const platformFee = Math.round((booking.price_cents * feePercent) / 100);
    const payoutAmount = booking.price_cents - platformFee;

    // Create payout record
    const { data: payout, error: payoutError } = await supabaseClient
      .from('payouts')
      .insert({
        booking_id,
        sitter_id: booking.sitter_id,
        amount_cents: payoutAmount,
        status: 'scheduled',
        notes: `Taxa plataforma: ${feePercent}% (€${(platformFee / 100).toFixed(2)})`,
      })
      .select()
      .single();

    if (payoutError) {
      console.error('Payout error:', payoutError);
      return new Response(JSON.stringify({ error: 'Failed to create payout' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log ledger
    await supabaseClient.from('ledger').insert({
      event_name: 'booking_completed',
      actor_id: user.id,
      booking_id,
      payout_id: payout.id,
      meta: { platform_fee_percent: feePercent, platform_fee: platformFee, payout_amount: payoutAmount },
    });

    // Log analytics
    await supabaseClient.from('analytics_events').insert({
      user_id: user.id,
      event_name: 'booking_completed',
      meta: { booking_id },
    });

    return new Response(JSON.stringify({ success: true, payout }), {
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
