import { createClient } from "@/lib/supabase-server";
import { DashboardClient } from "./dashboard-client";

async function getDashboardData() {
  const supabase = await createClient();

  const [studentsRes, mentorsRes, groupsRes, classLogsRes, groupStudentsRes] =
    await Promise.all([
      supabase.from("students").select("*"),
      supabase.from("mentors").select("*"),
      supabase.from("groups").select("*"),
      supabase.from("class_logs").select("*, group:groups(*, mentor:mentors(*))"),
      supabase.from("group_students").select("*, student:students(*), group:groups(*)"),
    ]);

  const students = studentsRes.data || [];
  const mentors = mentorsRes.data || [];
  const groups = groupsRes.data || [];
  const classLogs = classLogsRes.data || [];
  const groupStudents = groupStudentsRes.data || [];

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const classesThisWeek = classLogs.filter((log: any) => {
    const logDate = new Date(log.date);
    return logDate >= weekStart && logDate <= weekEnd;
  });

  const attendanceByLevel: Record<string, { total: number; attended: number }> = {};

  classLogs.forEach((log: any) => {
    const group = log.group as { level: string; id: string } | null;
    if (!group) return;

    const level = group.level;
    const groupId = group.id;

    const studentsInGroup = groupStudents.filter(
      (gs: any) => gs.group_id === groupId
    );
    const totalStudents = studentsInGroup.length;
    const attendedStudents = Array.isArray(log.attendance_data)
      ? (log.attendance_data as string[]).length
      : 0;

    if (!attendanceByLevel[level]) {
      attendanceByLevel[level] = { total: 0, attended: 0 };
    }
    attendanceByLevel[level].total += totalStudents;
    attendanceByLevel[level].attended += attendedStudents;
  });

  const attendanceChartData = Object.entries(attendanceByLevel).map(
    ([level, data]) => ({
      level,
      rate: data.total > 0 ? Math.round((data.attended / data.total) * 100) : 0,
    })
  );

  return {
    totalStudents: students.length,
    totalMentors: mentors.length,
    activeGroups: groups.length,
    classesThisWeek: classesThisWeek.length,
    attendanceChartData,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardClient data={data} />;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
