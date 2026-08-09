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

-- 3. Reload PostgREST schema cache immediately
NOTIFY pgrst, 'reload schema';
