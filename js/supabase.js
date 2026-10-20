import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://zisyxcaisivzkjarqfde.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_5yqJ-XCXk68QEqkLXzKTDQ_8Iwf4kpy';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
