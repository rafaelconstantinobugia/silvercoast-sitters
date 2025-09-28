-- Add missing columns to sitter_services table
ALTER TABLE public.sitter_services 
  ADD COLUMN IF NOT EXISTS hourly_rate_cents integer NOT NULL DEFAULT 0 CHECK (hourly_rate_cents >= 0),
  ADD COLUMN IF NOT EXISTS discount_percent integer NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

-- Create app schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS app;

-- Grant usage on app schema to anon and authenticated users
GRANT USAGE ON SCHEMA app TO anon, authenticated;

-- 1) Vista pública de sitters (tolerante a nomes de colunas)
CREATE OR REPLACE VIEW public.sitters_public_view AS
SELECT
  s.id as sitter_id,
  COALESCE(s.name, 'Sitter') as name,
  s.location,
  s.description as bio_short,
  s.photo_url as avatar_url,
  s.average_rating as rating
FROM public.sitters s
WHERE s.verified = true;

-- 2) RPC para listar sitters públicos (anónimo pode chamar)
CREATE OR REPLACE FUNCTION app.list_public_sitters()
RETURNS TABLE (
  sitter_id uuid, name text, city text, bio_short text, avatar_url text, rating numeric
) LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT sitter_id, name, location as city, bio_short, avatar_url, rating
  FROM public.sitters_public_view
$$;

GRANT EXECUTE ON FUNCTION app.list_public_sitters() TO anon;

-- 3) RPC de pesquisa por serviço + zona
CREATE OR REPLACE FUNCTION app.search_sitters(p_service_id uuid, p_zone text)
RETURNS TABLE (
  sitter_id uuid, name text, city text, avatar_url text, hourly_rate_cents int, discount_percent int
) LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, extensions
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

GRANT EXECUTE ON FUNCTION app.search_sitters(uuid, text) TO anon, authenticated;