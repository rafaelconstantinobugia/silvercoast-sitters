import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    let emailHtml = "";

    if (type === "new_application") {
      emailSubject = `New Sitter Application - ${data.first_name} ${data.last_name}`;
      emailHtml = `
        <h2>New Sitter Application Received</h2>
        <p>A new sitter application has been submitted with the following details:</p>
        <ul>
          <li><strong>Name:</strong> ${data.first_name} ${data.last_name}</li>
          <li><strong>Email:</strong> ${data.email || 'Not provided'}</li>
          <li><strong>Location:</strong> ${data.location}</li>
        </ul>
        <p>Please review the application in your admin dashboard.</p>
      `;
    } else if (type === "new_booking") {
      emailSubject = `New Booking Request - €${data.total_price}`;
      emailHtml = `
        <h2>New Booking Request</h2>
        <p>A new booking request has been submitted:</p>
        <ul>
          <li><strong>Booking ID:</strong> ${data.booking_id}</li>
          <li><strong>Total Price:</strong> €${data.total_price}</li>
          <li><strong>Start Date:</strong> ${new Date(data.start_date).toLocaleDateString()}</li>
          <li><strong>End Date:</strong> ${new Date(data.end_date).toLocaleDateString()}</li>
        </ul>
        <p>Please review and confirm the booking in your admin dashboard.</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "SilverCoastSitters <notifications@silvercoastsitters.com>",
      to: [adminEmail],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
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