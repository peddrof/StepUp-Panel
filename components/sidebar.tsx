"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, BookOpen, FileText, Settings, HelpCircle, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/groups", label: "Groups", icon: BookOpen },
  { href: "/admin/people", label: "People", icon: Users },
  { href: "/admin/class-logs", label: "Classes", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

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
        <button className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 w-full transition-colors">
          <Settings className="h-4 w-4 flex-shrink-0" />
          <span>Settings</span>
        </button>
        <button className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 w-full transition-colors">
          <HelpCircle className="h-4 w-4 flex-shrink-0" />
          <span>Get Help</span>
        </button>
        <button className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 w-full transition-colors">
          <Search className="h-4 w-4 flex-shrink-0" />
          <span>Search</span>
        </button>
      </div>

      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-gray-300 text-gray-700 text-xs font-medium">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">Admin</p>
            <p className="text-xs text-gray-500 truncate">me@stepup.org</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-90">
              <circle cx="8" cy="3" r="1" fill="currentColor"/>
              <circle cx="8" cy="8" r="1" fill="currentColor"/>
              <circle cx="8" cy="13" r="1" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
