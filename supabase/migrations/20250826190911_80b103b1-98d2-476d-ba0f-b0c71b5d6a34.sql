-- Create triggers if they don't exist (DROP and CREATE to ensure they're active)
DROP TRIGGER IF EXISTS trigger_notify_new_application ON public.applicants;
DROP TRIGGER IF EXISTS trigger_notify_new_booking ON public.bookings;

-- Recreate triggers
CREATE TRIGGER trigger_notify_new_application
    AFTER INSERT ON public.applicants
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_application();

CREATE TRIGGER trigger_notify_new_booking
    AFTER INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_booking();

-- Test if triggers exist
SELECT 
    event_object_table as table_name,
    trigger_name,
    event_manipulation as event_type,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN ('trigger_notify_new_application', 'trigger_notify_new_booking')
ORDER BY event_object_table;