"use client";

import { Sidebar } from "@/components/sidebar";
import { ProtectedRoute } from "@/components/protected-route";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-60 h-screen overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
