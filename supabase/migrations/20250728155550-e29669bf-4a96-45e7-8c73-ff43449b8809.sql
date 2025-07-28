-- Make sitter_id nullable to allow bookings without assigned sitters
ALTER TABLE public.bookings ALTER COLUMN sitter_id DROP NOT NULL;