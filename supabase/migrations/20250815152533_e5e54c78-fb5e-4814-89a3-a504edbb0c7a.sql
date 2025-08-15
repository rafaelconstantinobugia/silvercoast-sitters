-- COMPREHENSIVE SECURITY FIXES

-- 1. Create proper role system to fix privilege escalation
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles safely
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix users table RLS to prevent privilege escalation
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND user_type = 'owner'); -- Prevent user_type changes

-- 3. Lock down bookings table - remove public access
DROP POLICY IF EXISTS "Anyone can view recent bookings function" ON public.bookings;

-- 4. Update all admin policies to use proper role system
-- Admin notifications
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.admin_notifications;
CREATE POLICY "Admins can view all notifications" 
ON public.admin_notifications 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Applicants
DROP POLICY IF EXISTS "Admins can view all applications" ON public.applicants;
DROP POLICY IF EXISTS "Admins can update applications" ON public.applicants;
CREATE POLICY "Admins can view all applications" 
ON public.applicants 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update applications" 
ON public.applicants 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Sitters
DROP POLICY IF EXISTS "Admins can update sitters" ON public.sitters;
DROP POLICY IF EXISTS "Admins can delete sitters" ON public.sitters;
CREATE POLICY "Admins can update sitters" 
ON public.sitters 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sitters" 
ON public.sitters 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Sitter services
DROP POLICY IF EXISTS "Admins can manage all sitter services" ON public.sitter_services;
CREATE POLICY "Admins can manage all sitter services" 
ON public.sitter_services 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Sitter services mapping
DROP POLICY IF EXISTS "Admins can manage all sitter services mapping" ON public.sitter_services_mapping;
CREATE POLICY "Admins can manage all sitter services mapping" 
ON public.sitter_services_mapping 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Harden SECURITY DEFINER functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_recent_bookings()
RETURNS TABLE(id uuid, service_name text, service_type service_type, sitter_name text, total_price numeric, average_rating numeric, verified boolean, created_at timestamp with time zone)
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    b.id,
    s.name as service_name,
    s.service_type,
    LEFT(u.name, 1) || '***' as sitter_name,
    b.total_price,
    st.average_rating,
    st.verified,
    b.created_at
  FROM public.bookings b
  JOIN public.services s ON b.service_id = s.id
  JOIN public.sitters st ON b.sitter_id = st.id
  JOIN public.users u ON st.user_id = u.id
  WHERE b.status = 'completed' 
    AND st.verified = true
  ORDER BY b.created_at DESC
  LIMIT 10;
$$;

CREATE OR REPLACE FUNCTION public.get_sitter_contact_details(sitter_id uuid)
RETURNS TABLE(email text, phone text)
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT email, phone 
  FROM public.sitters 
  WHERE id = sitter_id 
    AND verified = true
    AND auth.uid() IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.get_sitters_by_service(service_id_param uuid)
RETURNS TABLE(id uuid, name text, location text, photo_url text, average_rating numeric, verified boolean, available boolean, price_per_day numeric, description text, experience_years integer, response_time text)
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO ''
AS $$
    SELECT DISTINCT 
        s.id,
        s.name,
        s.location,
        s.photo_url,
        s.average_rating,
        s.verified,
        s.available,
        s.price_per_day,
        s.description,
        s.experience_years,
        s.response_time
    FROM public.sitters s
    LEFT JOIN public.sitter_services_mapping ssm ON s.id = ssm.sitter_id
    WHERE s.verified = true 
        AND s.available = true
        AND (service_id_param IS NULL OR ssm.service_id = service_id_param)
    ORDER BY s.average_rating DESC;
$$;

-- 6. Restrict reviews to authenticated users only
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Authenticated users can view reviews" 
ON public.reviews 
FOR SELECT 
TO authenticated
USING (true);

-- 7. Remove duplicate triggers (keep the newer ones)
DROP TRIGGER IF EXISTS trg_notify_new_application ON public.applicants;
DROP TRIGGER IF EXISTS trg_notify_new_booking ON public.bookings;

-- 8. Create secure notification secret for edge function validation
-- Note: The actual secret will be added via Supabase dashboard, this creates a placeholder
CREATE OR REPLACE FUNCTION public.validate_notification_request(secret_header text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    -- This will be used by the edge function to validate requests
    -- The actual secret validation will be done in the edge function
    RETURN secret_header IS NOT NULL;
END;
$$;

-- 9. Insert admin role for existing admin users (if any exist with user_type = 'admin')
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM public.users 
WHERE user_type = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;