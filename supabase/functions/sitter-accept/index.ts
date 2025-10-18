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

    const { booking_id, proposed_price_cents } = await req.json();

    if (!booking_id || !proposed_price_cents || proposed_price_cents <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid inputs' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify sitter owns this booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings_new')
      .select('sitter_id, owner_id')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking || booking.sitter_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized or booking not found' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update booking
    const { error: updateError } = await supabaseClient
      .from('bookings_new')
      .update({
        status: 'accepted',
        price_cents: proposed_price_cents,
      })
      .eq('id', booking_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to accept booking' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log analytics
    await supabaseClient.from('analytics_events').insert({
      user_id: user.id,
      event_name: 'booking_accepted',
      meta: { booking_id, proposed_price_cents },
    });

    // Log ledger
    await supabaseClient.from('ledger').insert({
      event_name: 'booking_accepted',
      actor_id: user.id,
      booking_id,
      meta: { proposed_price_cents },
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