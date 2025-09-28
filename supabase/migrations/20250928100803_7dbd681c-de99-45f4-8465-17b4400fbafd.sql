-- Remove the security definer view and just use functions
DROP VIEW IF EXISTS public.sitters_public_view;

-- Update the RPC function to work without the view
CREATE OR REPLACE FUNCTION app.list_public_sitters()
RETURNS TABLE (
  sitter_id uuid, name text, city text, bio_short text, avatar_url text, rating numeric
) LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id as sitter_id,
    COALESCE(s.name, 'Sitter') as name,
    s.location as city,
    s.description as bio_short,
    s.photo_url as avatar_url,
    s.average_rating as rating
  FROM public.sitters s
  WHERE s.verified = true
$$;

-- Update search function with proper search_path
CREATE OR REPLACE FUNCTION app.search_sitters(p_service_id uuid, p_zone text)
RETURNS TABLE (
  sitter_id uuid, name text, city text, avatar_url text, hourly_rate_cents int, discount_percent int
) LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id as sitter_id, 
    COALESCE(s.name, 'Sitter') as name, 
    s.location as city, 
    s.photo_url as avatar_url,
    ss.hourly_rate_cents, 
    COALESCE(ss.discount_percent, 0) as discount_percent
  FROM public.sitters s
  JOIN public.sitter_services ss ON ss.sitter_id = s.id AND ss.active = true
  JOIN public.sitter_services_mapping sm ON sm.sitter_id = s.id AND sm.service_id = p_service_id
  WHERE s.verified = true
    AND (p_zone IS NULL OR s.location ILIKE p_zone || '%')
$$;