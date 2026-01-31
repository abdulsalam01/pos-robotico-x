"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserSummary {
  name: string;
  role: string;
}

const fallbackUser: UserSummary = {
  name: "Signed-in user",
  role: "Staff"
};

export default function UserProfile() {
  const [user, setUser] = useState<UserSummary>(fallbackUser);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!isMounted) {
        return;
      }
      const profile = data.user;
      if (!profile) {
        setUser(fallbackUser);
        return;
      }
      const metadata = profile.user_metadata as { full_name?: string; role?: string } | undefined;
      const name = metadata?.full_name || profile.email || fallbackUser.name;
      const role = metadata?.role || fallbackUser.role;
      setUser({ name, role });
    };

    loadUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      isMounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-coral-500" />
      <div className="text-xs">
        <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
        <p className="text-slate-500 dark:text-slate-400">{user.role}</p>
      </div>
    </div>
  );
}
