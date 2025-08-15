-- Update notification triggers to use secure headers

-- Update application notification trigger
CREATE OR REPLACE FUNCTION public.notify_new_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
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
    PERFORM
        net.http_post(
            url := 'https://apyogunkydkilyzidmve.supabase.co/functions/v1/send-notification',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'x-notification-secret', current_setting('app.notification_secret', true)
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

    RETURN NEW;
END;
$$;

-- Update booking notification trigger
CREATE OR REPLACE FUNCTION public.notify_new_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
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
    PERFORM
        net.http_post(
            url := 'https://apyogunkydkilyzidmve.supabase.co/functions/v1/send-notification',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'x-notification-secret', current_setting('app.notification_secret', true)
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

    RETURN NEW;
END;
$$;

-- Set the notification secret as a database setting (will be set by environment)
-- This is just a placeholder - the actual secret will come from environment variables
ALTER DATABASE postgres SET app.notification_secret = 'placeholder_will_be_overridden';