"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, BookOpen, FileText, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

const mainNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/groups", label: "Groups", icon: BookOpen },
  { href: "/admin/people", label: "People", icon: Users },
  { href: "/admin/class-logs", label: "Classes", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <aside className="flex h-screen w-60 flex-col bg-gray-50 border-r border-gray-200">
      <div className="flex h-16 items-center px-4 border-b border-gray-200">
        <span className="text-2xl font-bold text-sky-800">Step</span>
        <span className="text-2xl font-bold text-cyan-500">Up</span>
        <span className="text-2xl font-bold text-gray-800">Adm</span>
      </div>

      <div className="flex-1 px-2 py-2 overflow-y-auto">
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

      <div className="border-t border-gray-200 p-2 space-y-0.5">
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 w-full transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-gray-300 text-gray-700 text-xs font-medium">
              {user?.email ? getInitials(user.email) : "AD"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">
              {user?.email?.split("@")[0] || "Admin"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || "admin@stepup.org"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
