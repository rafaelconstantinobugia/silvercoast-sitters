import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

// Create Supabase client using service role for sending emails
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: string;
  data: any;
  title: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, title, message }: NotificationRequest = await req.json();

    console.log(`Processing notification: ${type}`, data);

    // Admin email (you should configure this)
    const adminEmail = "admin@silvercoastsitters.com"; // Replace with actual admin email

    let emailSubject = "";
    let emailBody = "";

    if (type === "new_application") {
      emailSubject = `New Sitter Application - ${data.first_name} ${data.last_name}`;
      emailBody = `
New Sitter Application Received

A new sitter application has been submitted with the following details:

Name: ${data.first_name} ${data.last_name}
Email: ${data.email || 'Not provided'}
Location: ${data.location}

Please review the application in your admin dashboard.
      `.trim();
    } else if (type === "new_booking") {
      emailSubject = `New Booking Request - €${data.total_price}`;
      emailBody = `
New Booking Request

A new booking request has been submitted:

Booking ID: ${data.booking_id}
Total Price: €${data.total_price}
Start Date: ${new Date(data.start_date).toLocaleDateString()}
End Date: ${new Date(data.end_date).toLocaleDateString()}

Please review and confirm the booking in your admin dashboard.
      `.trim();
    }

    // Use Supabase's built-in email service (uses inbucket in development)
    const { data: emailResult, error: emailError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: adminEmail,
      options: {
        data: {
          subject: emailSubject,
          body: emailBody,
          notification_type: type
        }
      }
    });

    if (emailError) {
      console.error("Email error:", emailError);
      // Fallback: just log the notification
      console.log("NOTIFICATION:", {
        to: adminEmail,
        subject: emailSubject,
        body: emailBody
      });
    } else {
      console.log("Email notification prepared successfully");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Notification processed",
      email_sent: !emailError 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);