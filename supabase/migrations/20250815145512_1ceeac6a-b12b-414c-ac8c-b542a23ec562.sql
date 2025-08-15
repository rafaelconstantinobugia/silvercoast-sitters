-- Allow public sitter applications by making user_id optional
ALTER TABLE public.applicants
ALTER COLUMN user_id DROP NOT NULL;

-- Create trigger to notify on new sitter applications
DROP TRIGGER IF EXISTS trg_notify_new_application ON public.applicants;
CREATE TRIGGER trg_notify_new_application
AFTER INSERT ON public.applicants
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_application();

-- Create trigger to notify on new bookings
DROP TRIGGER IF EXISTS trg_notify_new_booking ON public.bookings;
CREATE TRIGGER trg_notify_new_booking
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_booking();