-- Security Fixes Migration

-- 1. Fix applicants table RLS - Remove anonymous insert, require authentication
DROP POLICY IF EXISTS "anon_can_insert_applicants" ON public.applicants;
DROP POLICY IF EXISTS "anon_insert_applicants" ON public.applicants;

CREATE POLICY "authenticated_users_can_insert_applicants"
  ON public.applicants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid()) AND
    email IS NOT NULL AND
    full_name IS NOT NULL
  );

-- 2. Remove dangerous profiles.role column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- 3. Add validation constraints for bookings
CREATE OR REPLACE FUNCTION validate_booking_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time <= NEW.start_time THEN
    RAISE EXCEPTION 'end_time must be after start_time';
  END IF;
  
  IF NEW.start_time < now() THEN
    RAISE EXCEPTION 'start_time must be in the future';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_booking_dates_trigger ON public.bookings;
CREATE TRIGGER validate_booking_dates_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION validate_booking_dates();

-- 4. Add price validation constraints
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_amount_positive CHECK (amount_cents IS NULL OR amount_cents > 0),
  ADD CONSTRAINT bookings_rate_positive CHECK (hourly_rate_cents IS NULL OR hourly_rate_cents > 0);

-- 5. Add constraints to reviews_new
ALTER TABLE public.reviews_new
  ADD CONSTRAINT reviews_comment_length CHECK (comment IS NULL OR length(comment) <= 2000);