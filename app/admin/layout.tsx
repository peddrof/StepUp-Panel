"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { CommandPalette } from "@/components/command-palette";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar onSearchClick={() => setSearchOpen(true)} />
        <main className="ml-60 h-screen overflow-auto">
          <div className="p-8">{children}</div>
        </main>
        <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    </ProtectedRoute>
  );
}
