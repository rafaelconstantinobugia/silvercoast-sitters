-- Create notification triggers for automatic Resend emails

-- Create trigger for new applications
CREATE TRIGGER trigger_notify_new_application
    AFTER INSERT ON public.applicants
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_application();

-- Create trigger for new bookings  
CREATE TRIGGER trigger_notify_new_booking
    AFTER INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_booking();

-- Verify triggers were created
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN ('trigger_notify_new_application', 'trigger_notify_new_booking');