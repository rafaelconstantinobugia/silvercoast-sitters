-- Fix security vulnerability: Create public view for sitters without sensitive data
-- and update RLS policies to protect personal information

-- First, let's create a public view that only shows safe information
CREATE VIEW public.sitters_public AS
SELECT 
    id,
    name,
    location,
    photo_url,
    description,
    services_offered,
    experience_years,
    average_rating,
    price_per_day,
    response_time,
    available,
    verified,
    created_at,
    updated_at
FROM public.sitters
WHERE verified = true;

-- Grant public access to the view
GRANT SELECT ON public.sitters_public TO anon;
GRANT SELECT ON public.sitters_public TO authenticated;

-- Update RLS policy to restrict full sitter table access
-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view verified sitters" ON public.sitters;

-- Create new restrictive policies
-- Only authenticated users can view full sitter profiles (including contact info)
CREATE POLICY "Authenticated users can view verified sitters" 
ON public.sitters 
FOR SELECT 
TO authenticated
USING (verified = true OR auth.uid() = user_id);

-- Sitters can still view and update their own profiles
CREATE POLICY "Sitters can view their own profile" 
ON public.sitters 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Anonymous users have NO access to the main sitters table
-- They must use the public view instead

-- Create a function to get sitter contact details (only for authenticated users)
CREATE OR REPLACE FUNCTION public.get_sitter_contact_details(sitter_id uuid)
RETURNS TABLE(email text, phone text)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT email, phone 
  FROM public.sitters 
  WHERE id = sitter_id 
    AND verified = true
    AND auth.uid() IS NOT NULL; -- Only for authenticated users
$$;

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_sitter_contact_details(uuid) TO authenticated;