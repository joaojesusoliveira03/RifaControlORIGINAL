/* ============================================================
   Supabase client — instância única do app
   ============================================================ */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://iqlgjrctbhcvcmylhnpo.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxbGdqcmN0YmhjdmNteWxobnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0NTk3ODksImV4cCI6MjEwNzAzNTc4OX0.C_j3Qb1DRbo19EEySCCxZLDww6ArDo0f1QrcskB3RRk';

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON);