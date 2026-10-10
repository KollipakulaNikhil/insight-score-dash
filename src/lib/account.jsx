import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { getSession } from "@/lib/auth.functions";
const AccountContext = createContext({ user: null, loading: true, refresh: async () => null });
export function AccountProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const refresh = useCallback(async () => {
    const next = await getSession().catch(() => null);
    setUser(next);
    setLoading(false);
    void router.invalidate();
    void queryClient.invalidateQueries();
    return next;
  }, [router, queryClient]);
  useEffect(() => {
    let active = true;
    getSession()
      .catch(() => null)
      .then((next) => {
        if (active) {
          setUser(next);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <AccountContext.Provider value={{ user, loading, refresh }}>{children}</AccountContext.Provider>
  );
}
export const useAccount = () => useContext(AccountContext);
