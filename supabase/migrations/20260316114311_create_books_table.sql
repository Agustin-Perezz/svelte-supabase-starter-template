-- Create books table
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access"
  ON public.books
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous insert access
CREATE POLICY "Allow anonymous insert access"
  ON public.books
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous update access
CREATE POLICY "Allow anonymous update access"
  ON public.books
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anonymous delete access
CREATE POLICY "Allow anonymous delete access"
  ON public.books
  FOR DELETE
  TO anon
  USING (true);
