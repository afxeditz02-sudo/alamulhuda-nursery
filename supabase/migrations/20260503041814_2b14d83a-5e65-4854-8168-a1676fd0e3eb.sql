-- The "Anyone can view site images" SELECT policy on storage.objects allowed
-- anonymous clients to LIST every file in the public bucket. Public-bucket files
-- are still served by the storage CDN via their direct URLs without this policy,
-- so removing it blocks enumeration without breaking image rendering.
DROP POLICY IF EXISTS "Anyone can view site images" ON storage.objects;
