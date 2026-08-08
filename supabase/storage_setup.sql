-- ====================================================================
-- Run this in Supabase Dashboard -> SQL Editor to enable PDF Uploads
-- ====================================================================

-- 1. Create Public Storage Bucket for Academic PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'academic-vault',
  'academic-vault',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/zip', 'text/plain', 'text/x-python', 'text/x-c', 'text/x-java-source', 'application/octet-stream', 'application/x-zip-compressed']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies if any to prevent conflict
DROP POLICY IF EXISTS "Allow Public Uploads to Academic Vault" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Reads from Academic Vault" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Updates to Academic Vault" ON storage.objects;

-- 3. Create Storage Policies allowing anyone to upload and read notes
CREATE POLICY "Allow Public Uploads to Academic Vault"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'academic-vault');

CREATE POLICY "Allow Public Reads from Academic Vault"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'academic-vault');

CREATE POLICY "Allow Public Updates to Academic Vault"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'academic-vault');
