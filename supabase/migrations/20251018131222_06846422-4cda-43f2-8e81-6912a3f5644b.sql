-- Phase 5: Reviews System Schema

-- Create reviews_new table (TDD specifies this name)
CREATE TABLE IF NOT EXISTS public.reviews_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  reviewee_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(booking_id, reviewer_id)
);

-- Enable RLS
ALTER TABLE public.reviews_new ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews_new
CREATE POLICY "Users can view reviews for sitters"
  ON public.reviews_new
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their bookings"
  ON public.reviews_new
  FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE id = booking_id
      AND (customer_id = auth.uid() OR sitter_id = auth.uid())
      AND status = 'completed'
    )
  );

-- Trigger to update sitter rating when review is added
CREATE OR REPLACE FUNCTION public.update_sitter_rating_new()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update sitter_public average rating
  UPDATE public.sitter_public
  SET updated_at = now()
  WHERE sitter_id = NEW.reviewee_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews_new
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sitter_rating_new();