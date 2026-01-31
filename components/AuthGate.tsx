"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) {
        return;
      }
      if (!data.session && pathname !== "/login") {
        router.replace("/login");
        return;
      }
      setReady(true);
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (!ready && pathname !== "/login") {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950" />;
  }

  return <>{children}</>;
}
