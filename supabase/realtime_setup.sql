-- ====================================================================
-- Run this in Supabase Dashboard -> SQL Editor to enable Realtime
-- ====================================================================

-- 1. Enable Full Replication Identity so UPDATE events broadcast full records
ALTER TABLE public.confessions REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;

-- 2. Add Tables to the Supabase Realtime Publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'confessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.confessions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  END IF;
END $$;
