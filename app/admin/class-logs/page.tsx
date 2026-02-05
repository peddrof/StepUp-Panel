import { createClient } from "@/lib/supabase-server";
import { ClassLogsClient } from "./class-logs-client";

async function getClassLogsData() {
  const supabase = createClient();

  const { data: classLogs, error } = await supabase
    .from("class_logs")
    .select("*, group:groups(*, mentor:mentors(*))")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching class logs:", error);
  }

  return { classLogs: classLogs || [] };
}

export default async function ClassLogsPage() {
  const data = await getClassLogsData();
  return <ClassLogsClient data={data as any} />;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
