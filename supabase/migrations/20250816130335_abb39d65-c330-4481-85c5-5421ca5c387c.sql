-- Fix Security Issues and Improve Business Data Protection

-- 1. Fix Security Definer View issue by removing problematic views
-- (The sitters_public view appears to be the issue)
DROP VIEW IF EXISTS public.sitters_public;

-- 2. Restrict sitter_services table access to authenticated users only
DROP POLICY IF EXISTS "Anyone can view sitter services" ON public.sitter_services;
CREATE POLICY "Authenticated users can view sitter services" 
ON public.sitter_services 
FOR SELECT 
TO authenticated
USING (true);

-- 3. Restrict sitter_services_mapping to authenticated users only  
DROP POLICY IF EXISTS "Anyone can view sitter services mapping" ON public.sitter_services_mapping;
CREATE POLICY "Authenticated users can view sitter services mapping" 
ON public.sitter_services_mapping 
FOR SELECT 
TO authenticated
USING (true);

-- 4. Create a secure secrets table for notification secret
CREATE TABLE IF NOT EXISTS public.app_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on secrets table
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

-- Only service role can access secrets
CREATE POLICY "Service role only access" 
ON public.app_secrets 
FOR ALL 
USING (false);

-- Insert notification secret (will be updated via environment)
INSERT INTO public.app_secrets (key, value) 
VALUES ('notification_secret', 'placeholder_to_be_updated')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 5. Update notification functions to use secrets table
CREATE OR REPLACE FUNCTION public.get_app_secret(secret_key text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
    SELECT value FROM public.app_secrets WHERE key = secret_key;
$$;

-- 6. Update application notification trigger  
CREATE OR REPLACE FUNCTION public.notify_new_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    secret_value text;
BEGIN
    -- Get the notification secret
    SELECT value INTO secret_value FROM public.app_secrets WHERE key = 'notification_secret';
    
    -- Insert a notification record
    INSERT INTO public.admin_notifications (
        type,
        title,
        message,
        data,
        created_at
    ) VALUES (
        'new_application',
        'New Sitter Application',
        'A new sitter application has been submitted from ' || NEW.first_name || ' ' || NEW.last_name,
        jsonb_build_object(
            'applicant_id', NEW.id,
            'first_name', NEW.first_name,
            'last_name', NEW.last_name,
            'email', NEW.email,
            'location', NEW.location
        ),
        now()
    );

    -- Call edge function with secure header
    IF secret_value IS NOT NULL AND secret_value != 'placeholder_to_be_updated' THEN
        PERFORM
            net.http_post(
                url := 'https://apyogunkydkilyzidmve.supabase.co/functions/v1/send-notification',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'x-notification-secret', secret_value
                ),
                body := jsonb_build_object(
                    'type', 'new_application',
                    'title', 'New Sitter Application',
                    'message', 'A new sitter application has been submitted from ' || NEW.first_name || ' ' || NEW.last_name,
                    'data', jsonb_build_object(
                        'applicant_id', NEW.id,
                        'first_name', NEW.first_name,
                        'last_name', NEW.last_name,
                        'email', NEW.email,
                        'location', NEW.location
                    )
                )
            );
    END IF;

    RETURN NEW;
END;
$$;

-- 7. Update booking notification trigger
CREATE OR REPLACE FUNCTION public.notify_new_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
    secret_value text;
BEGIN
    -- Get the notification secret
    SELECT value INTO secret_value FROM public.app_secrets WHERE key = 'notification_secret';
    
    -- Insert a notification record for new bookings
    INSERT INTO public.admin_notifications (
        type,
        title,
        message,
        data,
        created_at
    ) VALUES (
        'new_booking',
        'New Booking Request',
        'A new booking request has been submitted for €' || NEW.total_price,
        jsonb_build_object(
            'booking_id', NEW.id,
            'owner_id', NEW.owner_id,
            'service_id', NEW.service_id,
            'total_price', NEW.total_price,
            'start_date', NEW.start_date,
            'end_date', NEW.end_date
        ),
        now()
    );

    -- Call edge function with secure header
    IF secret_value IS NOT NULL AND secret_value != 'placeholder_to_be_updated' THEN
        PERFORM
            net.http_post(
                url := 'https://apyogunkydkilyzidmve.supabase.co/functions/v1/send-notification',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'x-notification-secret', secret_value
                ),
                body := jsonb_build_object(
                    'type', 'new_booking',
                    'title', 'New Booking Request',
                    'message', 'A new booking request has been submitted for €' || NEW.total_price,
                    'data', jsonb_build_object(
                        'booking_id', NEW.id,
                        'owner_id', NEW.owner_id,
                        'service_id', NEW.service_id,
                        'total_price', NEW.total_price,
                        'start_date', NEW.start_date,
                        'end_date', NEW.end_date
                    )
                )
            );
    END IF;

    RETURN NEW;
END;
$$;