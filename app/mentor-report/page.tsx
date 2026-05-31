"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// The standalone mentor report form has been superseded by the PIN-gated
// Mentor Portal (/mentor), which loads rosters only after authentication.
// Keeping this route as a redirect preserves any existing bookmarks/links.
export default function MentorReportRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/mentor");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-sky-800" />
    </div>
  );
}
