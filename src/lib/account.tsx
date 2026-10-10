import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useRouter } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';

const AccountContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });
export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active) { setUser(data.user); setLoading(false); } });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'INITIAL_SESSION'].includes(event)) return;
      setUser(session?.user ?? null); setLoading(false);
      if (event === 'INITIAL_SESSION') return;
      void router.invalidate();
      if (event !== 'SIGNED_OUT') void queryClient.invalidateQueries();
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [router, queryClient]);
  return <AccountContext.Provider value={{ user, loading }}>{children}</AccountContext.Provider>;
}
export const useAccount = () => useContext(AccountContext);
