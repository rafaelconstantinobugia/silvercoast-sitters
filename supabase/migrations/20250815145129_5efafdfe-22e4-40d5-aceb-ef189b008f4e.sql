-- Update notification triggers to call the edge function
CREATE OR REPLACE FUNCTION public.notify_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

    -- Call edge function for email notification
    PERFORM
        net.http_post(
            url := 'https://apyogunkydkilyzidmve.supabase.co/functions/v1/send-notification',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweW9ndW5reWRraWx5emlkbXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTE4ODksImV4cCI6MjA2OTI2Nzg4OX0.LQU1dwhK2DMTSa6QlepQ22SYPgwnYYy6pQwrUjWtlWY"}'::jsonb,
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

CREATE OR REPLACE FUNCTION public.notify_new_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

    -- Call edge function for email notification
    PERFORM
        net.http_post(
            url := 'https://apyogunkydkilyzidmve.supabase.co/functions/v1/send-notification',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweW9ndW5reWRraWx5emlkbXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTE4ODksImV4cCI6MjA2OTI2Nzg4OX0.LQU1dwhK2DMTSa6QlepQ22SYPgwnYYy6pQwrUjWtlWY"}'::jsonb,
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