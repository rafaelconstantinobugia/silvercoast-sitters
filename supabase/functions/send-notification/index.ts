import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';
import { Resend } from "npm:resend@4.0.0";

// Create Supabase client using service role
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const notificationSecret = Deno.env.get('NOTIFICATION_SECRET') ?? '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-notification-secret",
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
    // Validate notification secret
    const providedSecret = req.headers.get('x-notification-secret');
    if (!providedSecret || providedSecret !== notificationSecret) {
      console.error("Invalid or missing notification secret");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { type, data, title, message }: NotificationRequest = await req.json();

    console.log(`Processing notification: ${type}`, data);

    // Admin email
    const adminEmail = "admin@silvercoastsitters.com";

    let emailSubject = "";
    let emailHtml = "";

    if (type === "new_application") {
      emailSubject = `Nova Aplicação de Sitter - ${data.first_name} ${data.last_name}`;
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nova Aplicação SilverCoast Sitters</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">🐾 SilverCoast Sitters</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Nova Aplicação de Sitter</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea;">
            <h2 style="color: #667eea; margin-top: 0;">Detalhes da Aplicação</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px 0; font-weight: bold; color: #495057;">Nome:</td>
                <td style="padding: 10px 0;">${data.first_name} ${data.last_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px 0; font-weight: bold; color: #495057;">Email:</td>
                <td style="padding: 10px 0;">${data.email || 'Não fornecido'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px 0; font-weight: bold; color: #495057;">Localização:</td>
                <td style="padding: 10px 0;">${data.location}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://silvercoastsitters.com/admin" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Revisar no Dashboard Admin
            </a>
          </div>
          
          <div style="text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p>SilverCoast Sitters - Cuidado profissional para seus pets</p>
          </div>
        </body>
        </html>
      `;
    } else if (type === "new_booking") {
      emailSubject = `Nova Reserva - €${data.total_price}`;
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nova Reserva SilverCoast Sitters</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">💰 SilverCoast Sitters</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Nova Reserva Recebida</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #28a745;">
            <h2 style="color: #28a745; margin-top: 0;">Detalhes da Reserva</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px 0; font-weight: bold; color: #495057;">ID da Reserva:</td>
                <td style="padding: 10px 0; font-family: monospace;">${data.booking_id}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px 0; font-weight: bold; color: #495057;">Valor Total:</td>
                <td style="padding: 10px 0; font-size: 18px; font-weight: bold; color: #28a745;">€${data.total_price}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px 0; font-weight: bold; color: #495057;">Data de Início:</td>
                <td style="padding: 10px 0;">${new Date(data.start_date).toLocaleDateString('pt-PT')}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e9ecef;">
                <td style="padding: 10px 0; font-weight: bold; color: #495057;">Data de Fim:</td>
                <td style="padding: 10px 0;">${new Date(data.end_date).toLocaleDateString('pt-PT')}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://silvercoastsitters.com/admin" 
               style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Gerir Reserva no Dashboard
            </a>
          </div>
          
          <div style="text-align: center; color: #6c757d; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p>SilverCoast Sitters - Cuidado profissional para seus pets</p>
          </div>
        </body>
        </html>
      `;
    }

    // Send email using Resend
    if (resendApiKey && emailSubject && emailHtml) {
      try {
        const { data: emailResult, error: emailError } = await resend.emails.send({
          from: "SilverCoast Sitters <notifications@silvercoastsitters.com>",
          to: [adminEmail],
          subject: emailSubject,
          html: emailHtml,
        });

        if (emailError) {
          console.error("Resend email error:", emailError);
          // Log notification as fallback
          console.log("NOTIFICATION FALLBACK:", {
            to: adminEmail,
            subject: emailSubject,
            html: emailHtml
          });
        } else {
          console.log("Email sent successfully via Resend:", emailResult);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: "Notification processed via Resend",
          email_sent: !emailError,
          email_id: emailResult?.id 
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      } catch (resendError) {
        console.error("Resend service error:", resendError);
        
        // Fallback: log the notification
        console.log("NOTIFICATION FALLBACK:", {
          to: adminEmail,
          subject: emailSubject,
          html: emailHtml
        });

        return new Response(JSON.stringify({ 
          success: true, 
          message: "Notification logged (Resend unavailable)",
          email_sent: false 
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
    } else {
      // Missing configuration
      console.log("NOTIFICATION LOGGED (missing config):", {
        to: adminEmail,
        subject: emailSubject,
        html: emailHtml
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Notification logged (configuration incomplete)",
        email_sent: false 
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
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