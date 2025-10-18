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
    
    // Verify user auth
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { listing_id, start_ts, end_ts, pet_ids, notes } = await req.json();

    // Validate inputs
    if (!listing_id || !start_ts || !end_ts) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get listing details
    const { data: listing, error: listingError } = await supabaseClient
      .from('service_listings')
      .select('sitter_id, price_cents')
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) {
      return new Response(JSON.stringify({ error: 'Listing not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings_new')
      .insert({
        listing_id,
        owner_id: user.id,
        sitter_id: listing.sitter_id,
        start_ts,
        end_ts,
        status: 'pending',
        notes,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking error:', bookingError);
      return new Response(JSON.stringify({ error: 'Failed to create booking' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Link pets if provided
    if (pet_ids && pet_ids.length > 0) {
      const petLinks = pet_ids.map((pet_id: string) => ({
        booking_id: booking.id,
        pet_id,
      }));
      
      await supabaseClient.from('booking_pets').insert(petLinks);
    }

    // Log analytics
    await supabaseClient.from('analytics_events').insert({
      user_id: user.id,
      event_name: 'booking_submitted',
      meta: { booking_id: booking.id, listing_id },
    });

    return new Response(JSON.stringify({ success: true, booking }), {
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