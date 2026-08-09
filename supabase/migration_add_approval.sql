-- ====================================================================
-- CSE COMMUNITY: Add Confession Authorization & Moderation Columns
-- Run this script in your Supabase Dashboard -> SQL Editor -> Click 'Run'
-- ====================================================================

-- 1. Add status and is_approved columns to confessions table
ALTER TABLE public.confessions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- 2. Update all existing confessions so they are marked as approved (live)
UPDATE public.confessions 
SET is_approved = true, status = 'APPROVED' 
WHERE is_approved IS NULL OR status IS NULL;

-- 3. Enable Delete and Update RLS Policies so Admin can delete/moderate
DROP POLICY IF EXISTS "Allow delete on confessions" ON public.confessions;
CREATE POLICY "Allow delete on confessions" ON public.confessions FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow update on confessions" ON public.confessions;
CREATE POLICY "Allow update on confessions" ON public.confessions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete on comments" ON public.comments;
CREATE POLICY "Allow delete on comments" ON public.comments FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow delete on resources" ON public.resources;
CREATE POLICY "Allow delete on resources" ON public.resources FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow update on resources" ON public.resources;
CREATE POLICY "Allow update on resources" ON public.resources FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete on reports" ON public.reports;
CREATE POLICY "Allow delete on reports" ON public.reports FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow update on reports" ON public.reports;
CREATE POLICY "Allow update on reports" ON public.reports FOR UPDATE USING (true);

-- 4. Reload PostgREST schema cache immediately
NOTIFY pgrst, 'reload schema';
