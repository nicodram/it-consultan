-- Run this once in the Supabase SQL Editor, after schema.sql.
-- Creates a public storage bucket for admin-uploaded documents (e.g. the
-- Education & Certifications document viewer) and the RLS policies that
-- let anyone read files but only a logged-in admin upload/replace/delete them.

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

drop policy if exists "Public can read documents bucket" on storage.objects;
create policy "Public can read documents bucket"
  on storage.objects for select
  to anon
  using (bucket_id = 'documents');

drop policy if exists "Authenticated can read documents bucket" on storage.objects;
create policy "Authenticated can read documents bucket"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'documents');

drop policy if exists "Authenticated can upload to documents bucket" on storage.objects;
create policy "Authenticated can upload to documents bucket"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'documents');

drop policy if exists "Authenticated can update documents bucket" on storage.objects;
create policy "Authenticated can update documents bucket"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'documents')
  with check (bucket_id = 'documents');

drop policy if exists "Authenticated can delete from documents bucket" on storage.objects;
create policy "Authenticated can delete from documents bucket"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'documents');
