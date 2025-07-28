import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const body = await req.json();
    const { 
      sitterId, 
      startDate, 
      endDate, 
      serviceType, 
      petDetails, 
      houseDetails, 
      emergencyContact, 
      notes, 
      totalPrice 
    } = body;

    logStep("Request body parsed", { sitterId, serviceType, totalPrice });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No existing customer found");
    }

    // Calculate platform fee (10%)
    const platformFee = Math.round(totalPrice * 0.1 * 100); // Convert to cents
    const sitterAmount = Math.round(totalPrice * 0.9 * 100); // Convert to cents
    
    logStep("Calculated fees", { totalPrice, platformFee, sitterAmount });

    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { 
              name: `Pet/House Sitting Service`,
              description: `${serviceType.replace('_', ' ')} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
            },
            unit_amount: totalPrice * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/booking/checkout/${sitterId}`,
      metadata: {
        userId: user.id,
        sitterId,
        serviceType,
        startDate,
        endDate,
        platformFee: platformFee.toString(),
        sitterAmount: sitterAmount.toString()
      }
    });

    // Create booking record in pending status
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: booking, error: bookingError } = await supabaseService
      .from("bookings")
      .insert({
        owner_id: user.id,
        sitter_id: sitterId,
        service_id: "00000000-0000-0000-0000-000000000001", // Default service ID
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice,
        status: 'pending',
        payment_status: 'pending',
        payment_intent_id: session.id,
        pet_details: petDetails,
        house_details: houseDetails,
        notes: `Emergency Contact: ${emergencyContact}\n\nNotes: ${notes}`
      })
      .select()
      .single();

    if (bookingError) {
      logStep("Booking creation error", bookingError);
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    logStep("Booking created", { bookingId: booking.id });

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      bookingId: booking.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});