"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CatchAllPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-gray-500">Redirecting...</div>
    </div>
  );
}
