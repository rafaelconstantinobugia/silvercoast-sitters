-- Phase 2: Database Schema Consistency
-- Rename bookings_new to bookings and drop old bookings table if it exists

-- First, drop old bookings table and related objects if they exist
DROP TRIGGER IF EXISTS on_booking_created ON public.bookings;
DROP FUNCTION IF EXISTS public.notify_new_booking();

-- Rename bookings_new to bookings
ALTER TABLE IF EXISTS public.bookings_new RENAME TO bookings;

-- Recreate the trigger on the new bookings table
CREATE OR REPLACE FUNCTION public.notify_new_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    secret_value text;
BEGIN
    SELECT value INTO secret_value FROM public.app_secrets WHERE key = 'notification_secret';
    
    INSERT INTO public.admin_notifications (
        type,
        title,
        message,
        data,
        created_at
    ) VALUES (
        'new_booking',
        'New Booking Request',
        'A new booking request has been submitted',
        jsonb_build_object(
            'booking_id', NEW.id,
            'customer_id', NEW.customer_id,
            'sitter_id', NEW.sitter_id,
            'start_time', NEW.start_ts,
            'end_time', NEW.end_ts,
            'status', NEW.status
        ),
        now()
    );

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
                    'message', 'A new booking request has been submitted',
                    'data', jsonb_build_object(
                        'booking_id', NEW.id,
                        'customer_id', NEW.customer_id,
                        'sitter_id', NEW.sitter_id
                    )
                )
            );
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_booking_created
    AFTER INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_booking();