-- Update the notification secret to match the one configured in Supabase
UPDATE public.app_secrets 
SET value = (SELECT value FROM app_secrets WHERE key = 'notification_secret' LIMIT 1)
WHERE key = 'notification_secret';

-- Test if notification functions work correctly
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname IN ('notify_new_application', 'notify_new_booking');