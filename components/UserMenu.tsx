"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";
import { translate } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

interface UserSummary {
  name: string;
  role: string;
}

const fallbackUser: UserSummary = {
  name: "Signed-in user",
  role: "Staff"
};

export default function UserMenu() {
  const router = useRouter();
  const { locale } = useLanguage();
  const [user, setUser] = useState<UserSummary>(fallbackUser);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-xs transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-coral-500" />
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {user.name === fallbackUser.name ? translate(locale, user.name) : user.name}
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            {user.role === fallbackUser.role ? translate(locale, user.role) : user.role}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {open ? (
        <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-slate-950">
          <div className="space-y-4">
            <ThemeToggle />
            <LanguageToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              {translate(locale, "Log out")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
