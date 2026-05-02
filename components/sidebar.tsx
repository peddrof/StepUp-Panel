"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, BookOpen, FileText, Settings, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { SettingsModal } from "@/components/settings-modal";
import { supabase } from "@/lib/supabase";

const mainNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/groups", label: "Groups", icon: BookOpen },
  { href: "/admin/people", label: "People", icon: Users },
  { href: "/admin/class-logs", label: "Classes", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<"settings" | "profile">("settings");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, display_name")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setAvatarUrl(data.avatar_url);
        setDisplayName(data.display_name || user.email?.split("@")[0] || "");
      } else {
        setDisplayName(user.email?.split("@")[0] || "Admin");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleOpenSettings = (section: "settings" | "profile" = "settings") => {
    setSettingsSection(section);
    setSettingsOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setSettingsOpen(open);
    if (!open) {
      loadProfile();
    }
  };

  return (
    <>
      <aside className="fixed top-0 left-0 flex h-screen w-60 flex-col bg-gray-50 border-r border-gray-200">
        <div className="flex h-16 items-center px-4 border-b border-gray-200 flex-shrink-0">
          <span className="text-2xl font-bold text-sky-800">Step</span>
          <span className="text-2xl font-bold text-cyan-500">Up</span>
          <span className="text-2xl font-bold text-gray-800">Adm</span>
        </div>

        <div className="flex-1 px-2 py-2 overflow-hidden">
          <nav className="space-y-0.5">
            {mainNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-200 text-black"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-gray-200 p-2 space-y-0.5 flex-shrink-0">
          <button
            onClick={() => {}}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 w-full transition-colors"
          >
            <Search className="h-4 w-4 flex-shrink-0" />
            <span>Search</span>
          </button>
          <button
            onClick={() => handleOpenSettings("settings")}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 w-full transition-colors"
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            <span>Settings</span>
          </button>
        </div>

        <div className="border-t border-gray-200 p-3 flex-shrink-0">
          <button
            onClick={() => handleOpenSettings("profile")}
            className="flex items-center gap-2 w-full rounded-md hover:bg-gray-100 p-1 transition-colors"
          >
            <Avatar className="h-7 w-7">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile" />}
              <AvatarFallback className="bg-gray-300 text-gray-700 text-xs font-medium">
                {user?.email ? getInitials(user.email) : "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-medium text-gray-900 truncate">
                {displayName || user?.email?.split("@")[0] || "Admin"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || "admin@stepup.org"}
              </p>
            </div>
          </button>
        </div>
      </aside>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={handleModalClose}
        defaultSection={settingsSection}
      />
    </>
  );
}
