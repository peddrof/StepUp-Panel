"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DashboardClient } from "./dashboard-client";

interface DashboardData {
  totalStudents: number;
  totalMentors: number;
  activeGroups: number;
  classesThisWeek: number;
  attendanceChartData: Array<{ level: string; rate: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalStudents: 0,
    totalMentors: 0,
    activeGroups: 0,
    classesThisWeek: 0,
    attendanceChartData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDashboardData() {
      const [studentsRes, mentorsRes, groupsRes, classLogsRes, groupStudentsRes] =
        await Promise.all([
          supabase.from("students").select("*"),
          supabase.from("mentors").select("*"),
          supabase.from("groups").select("*").is("deleted_at", null),
          supabase
            .from("class_logs")
            .select("*, group:groups(*, mentor:mentors(*))")
            .is("deleted_at", null),
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

      setData({
        totalStudents: students.length,
        totalMentors: mentors.length,
        activeGroups: groups.length,
        classesThisWeek: classesThisWeek.length,
        attendanceChartData,
      });
      setLoading(false);
    }

    getDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return <DashboardClient data={data} />;
}
