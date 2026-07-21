// Shared Supabase client for the whole site (public pages + admin CMS).
// Loaded after the Supabase UMD script:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
//   <script src="/supabase-client.js"></script>
//
// The publishable key below is meant to be public — it is safe to commit.
// Write access (insert/update/delete) is enforced server-side by Postgres
// Row Level Security policies (see supabase/schema.sql), which only allow
// writes from a logged-in ("authenticated") session. Never put a `secret`
// (sb_secret_...) key here or in any client-side file.
const SUPABASE_URL = 'https://menrvcyincaregjdlqej.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Sf_IyiRYcF8QSA0oO_m1LQ_cAT25Cy1';

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
