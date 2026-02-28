-- Create questions table
CREATE TABLE public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  input_format TEXT NOT NULL,
  output_format TEXT NOT NULL,
  constraints TEXT NOT NULL,
  example_1_input TEXT NOT NULL,
  example_1_output TEXT NOT NULL,
  example_2_input TEXT NOT NULL,
  example_2_output TEXT NOT NULL,
  avg_time INTEGER DEFAULT 180,
  round TEXT NOT NULL,
  base_points INTEGER NOT NULL,
  sequence_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create test_cases table
CREATE TABLE public.test_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  input_data TEXT NOT NULL,
  output_data TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies (optional, but good practice for Supabase)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admins to insert and view
CREATE POLICY "Admins can insert questions" ON public.questions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can view questions" ON public.questions FOR SELECT TO authenticated USING (true);
