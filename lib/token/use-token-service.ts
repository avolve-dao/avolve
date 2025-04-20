import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { TokenService } from './token-service';

export function useTokenService(): TokenService {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);
  const [tokenService] = useState(() => new TokenService(supabase));
  return tokenService;
}
