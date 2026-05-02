"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ClassLogsClient } from "./class-logs-client";

export default function ClassLogsPage() {
  const [data, setData] = useState<{ classLogs: any[] }>({ classLogs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getClassLogsData() {
      const { data: classLogs, error } = await supabase
        .from("class_logs")
        .select("*, group:groups(*, mentor:mentors(*))")
        .is("deleted_at", null)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching class logs:", error);
      }

      setData({ classLogs: classLogs || [] });
      setLoading(false);
    }

    getClassLogsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return <ClassLogsClient data={data as any} />;
}
