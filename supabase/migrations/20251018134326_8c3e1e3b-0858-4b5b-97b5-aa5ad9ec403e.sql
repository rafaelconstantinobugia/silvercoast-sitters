-- Silver Coast Sitters v1.0 - Core Schema Migration
-- Alinha base de dados com TDD: escrow manual, faturação interna, MB WAY/IBAN

-- 1) PROFILES: adicionar role e locality
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role text CHECK (role IN ('owner','sitter','admin')) DEFAULT 'owner',
  ADD COLUMN IF NOT EXISTS locality text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Atualizar email dos profiles existentes a partir de auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 2) PETS: criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text CHECK (species IN ('dog','cat','other')) NOT NULL DEFAULT 'dog',
  notes text,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_rw" ON public.pets;
CREATE POLICY "owner_rw" ON public.pets 
  FOR ALL 
  USING (auth.uid() = owner_id) 
  WITH CHECK (auth.uid() = owner_id);

-- 3) SERVICE LISTINGS: criar tabela
CREATE TABLE IF NOT EXISTS public.service_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sitter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_type text CHECK (service_type IN ('pet_sitting','dog_walking','house_sitting')) NOT NULL,
  title text NOT NULL,
  description text,
  price_cents integer NOT NULL,
  price_unit text CHECK (price_unit IN ('hour','visit','day')) NOT NULL DEFAULT 'hour',
  locality text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_listings_locality_type 
  ON public.service_listings (locality, service_type);

ALTER TABLE public.service_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active" ON public.service_listings;
CREATE POLICY "public_read_active" ON public.service_listings 
  FOR SELECT 
  USING (active = true);

DROP POLICY IF EXISTS "sitter_crud_own" ON public.service_listings;
CREATE POLICY "sitter_crud_own" ON public.service_listings 
  FOR ALL 
  USING (auth.uid() = sitter_id) 
  WITH CHECK (auth.uid() = sitter_id);

-- 4) AVAILABILITY SLOTS
CREATE TABLE IF NOT EXISTS public.availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sitter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_ts timestamptz NOT NULL,
  end_ts timestamptz NOT NULL,
  is_booked boolean DEFAULT false,
  CONSTRAINT slot_valid CHECK (end_ts > start_ts)
);

CREATE INDEX IF NOT EXISTS idx_availability_sitter_start 
  ON public.availability_slots (sitter_id, start_ts);

ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sitter_manage_own" ON public.availability_slots 
  FOR ALL 
  USING (auth.uid() = sitter_id) 
  WITH CHECK (auth.uid() = sitter_id);

CREATE POLICY "public_read_slots" ON public.availability_slots 
  FOR SELECT 
  USING (NOT is_booked);

-- 5) BOOKINGS: adicionar colunas necessárias do TDD
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS listing_id uuid REFERENCES public.service_listings(id),
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS start_ts timestamptz,
  ADD COLUMN IF NOT EXISTS end_ts timestamptz,
  ADD COLUMN IF NOT EXISTS price_cents integer,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS notes text;

-- Atualizar bookings existentes para ter owner_id = customer_id
UPDATE public.bookings SET owner_id = customer_id WHERE owner_id IS NULL;

-- Adicionar índices
CREATE INDEX IF NOT EXISTS idx_bookings_sitter_start ON public.bookings (sitter_id, start_ts);
CREATE INDEX IF NOT EXISTS idx_bookings_owner_start ON public.bookings (owner_id, start_ts);

-- Atualizar políticas RLS para bookings
DROP POLICY IF EXISTS "participants_ro" ON public.bookings;
DROP POLICY IF EXISTS "owner_insert" ON public.bookings;
DROP POLICY IF EXISTS "participants_update" ON public.bookings;

CREATE POLICY "participants_ro" ON public.bookings 
  FOR SELECT 
  USING (auth.uid() IN (owner_id, sitter_id));

CREATE POLICY "owner_insert" ON public.bookings 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "participants_update" ON public.bookings 
  FOR UPDATE 
  USING (auth.uid() IN (owner_id, sitter_id));

-- 6) BOOKING_PETS: junction table
CREATE TABLE IF NOT EXISTS public.booking_pets (
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  pet_id uuid REFERENCES public.pets(id) ON DELETE CASCADE,
  PRIMARY KEY (booking_id, pet_id)
);

ALTER TABLE public.booking_pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_view" ON public.booking_pets 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = booking_id 
      AND auth.uid() IN (b.owner_id, b.sitter_id)
    )
  );

-- 7) INVOICES
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  invoice_number text UNIQUE,
  issue_date date DEFAULT CURRENT_DATE,
  due_date date,
  total_cents integer NOT NULL,
  currency text DEFAULT 'EUR',
  status text CHECK (status IN ('issued','awaiting_payment','paid_escrow','refunded','cancelled')) NOT NULL DEFAULT 'issued',
  payment_method text CHECK (payment_method IN ('mbway','bank_transfer')) NOT NULL DEFAULT 'mbway',
  payment_reference text,
  payment_instructions text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices (status);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_read" ON public.invoices 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b 
      WHERE b.id = booking_id 
      AND b.owner_id = auth.uid()
    )
  );

-- 8) INVOICE LINES
CREATE TABLE IF NOT EXISTS public.invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  qty numeric NOT NULL DEFAULT 1,
  unit_price_cents integer NOT NULL,
  total_cents integer NOT NULL
);

ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_read_lines" ON public.invoice_lines 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices i 
      JOIN public.bookings b ON b.id = i.booking_id
      WHERE i.id = invoice_id 
      AND b.owner_id = auth.uid()
    )
  );

-- 9) PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  payer_id uuid NOT NULL REFERENCES public.profiles(id),
  amount_cents integer NOT NULL,
  method text CHECK (method IN ('mbway','bank_transfer')) NOT NULL,
  proof_url text,
  received_at timestamptz,
  recorded_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_upload_proof" ON public.payments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices i 
      JOIN public.bookings b ON b.id = i.booking_id
      WHERE i.id = invoice_id 
      AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY "owner_view_own" ON public.payments 
  FOR SELECT 
  USING (auth.uid() = payer_id);

-- 10) PAYOUTS
CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sitter_id uuid NOT NULL REFERENCES public.profiles(id),
  amount_cents integer NOT NULL,
  status text CHECK (status IN ('scheduled','paid','cancelled')) NOT NULL DEFAULT 'scheduled',
  paid_at timestamptz,
  payment_method text,
  transaction_reference text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sitter_view_own" ON public.payouts 
  FOR SELECT 
  USING (auth.uid() = sitter_id);

-- 11) LEDGER
CREATE TABLE IF NOT EXISTS public.ledger (
  id bigserial PRIMARY KEY,
  event_ts timestamptz DEFAULT now(),
  event_name text NOT NULL,
  actor_id uuid,
  booking_id uuid,
  invoice_id uuid,
  payout_id uuid,
  meta jsonb
);

CREATE INDEX IF NOT EXISTS idx_ledger_event_ts ON public.ledger (event_ts DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_booking ON public.ledger (booking_id);

-- 12) SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS public.system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);

-- Insert default settings
INSERT INTO public.system_settings (key, value) 
VALUES 
  ('INVOICE_PREFIX', '"SCS-"'),
  ('INVOICE_DUE_DAYS', '2'),
  ('PLATFORM_FEE_PERCENT', '15'),
  ('LOCALITIES', '["Óbidos","Caldas da Rainha","Bombarral","Peniche"]'),
  ('PAYMENT_METHODS', '["mbway","bank_transfer"]')
ON CONFLICT (key) DO NOTHING;

-- 13) FUNCTION: Generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prefix text;
  year text;
  next_num integer;
  invoice_num text;
BEGIN
  -- Get prefix from settings
  SELECT value #>> '{}' INTO prefix FROM public.system_settings WHERE key = 'INVOICE_PREFIX';
  prefix := COALESCE(prefix, 'SCS-');
  
  year := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  -- Get next number for this year
  SELECT COALESCE(MAX(
    NULLIF(regexp_replace(invoice_number, '^' || prefix || year || '-', ''), '')::integer
  ), 0) + 1
  INTO next_num
  FROM public.invoices
  WHERE invoice_number LIKE prefix || year || '-%';
  
  invoice_num := prefix || year || '-' || LPAD(next_num::text, 4, '0');
  
  RETURN invoice_num;
END;
$$;

-- 14) Update profiles RLS
DROP POLICY IF EXISTS "me" ON public.profiles;
CREATE POLICY "me" ON public.profiles 
  FOR SELECT 
  USING (
    auth.uid() = id 
    OR EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role='admin')
  );

DROP POLICY IF EXISTS "me_update" ON public.profiles;
CREATE POLICY "me_update" ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- 15) Admin helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;