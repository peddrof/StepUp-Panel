"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ClassLogsClient } from "./class-logs-client";
import { useToast } from "@/hooks/use-toast";
import { ClassLogsSkeleton } from "@/components/skeletons";

export default function ClassLogsPage() {
  const { toast } = useToast();
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
        toast({
          title: "Could not load class logs",
          description: error.message,
          variant: "destructive",
        });
      }

      setData({ classLogs: classLogs || [] });
      setLoading(false);
    }

    getClassLogsData();
  }, [toast]);

  if (loading) {
    return <ClassLogsSkeleton />;
  }

  return <ClassLogsClient data={data as any} />;
}
