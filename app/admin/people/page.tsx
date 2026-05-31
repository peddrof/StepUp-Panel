"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { attendedCount, buildRiskMap, type StudentRiskRow } from "@/lib/attendance";
import { PeopleClient } from "./people-client";

export default function PeoplePage() {
  const [data, setData] = useState<{ students: any[]; mentors: any[] }>({
    students: [],
    mentors: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [studentsRes, mentorsRes, groupsRes, groupStudentsRes, classLogsRes, riskRes] = await Promise.all([
      supabase.from("students").select("*").order("name"),
      supabase.from("mentors").select("*").order("name"),
      supabase.from("groups").select("*, mentor:mentors(*)").is("deleted_at", null),
      supabase.from("group_students").select("*"),
      supabase.from("class_logs").select("group_id, attendance_data").is("deleted_at", null),
      supabase.rpc("get_student_risk"),
    ]);

    const students = studentsRes.data || [];
    const mentors = mentorsRes.data || [];
    const groups = groupsRes.data || [];
    const groupStudents = groupStudentsRes.data || [];
    const classLogs = classLogsRes.data || [];
    const riskMap = buildRiskMap((riskRes.data as StudentRiskRow[]) || []);

    const studentsWithGroups = students.map((student: any) => {
      const studentGroupIds = groupStudents
        .filter((gs: any) => gs.student_id === student.id)
        .map((gs: any) => gs.group_id);
      const studentGroups = groups.filter((g: any) => studentGroupIds.includes(g.id));

      const studentLogs = classLogs.filter((log: any) =>
        studentGroupIds.includes(log.group_id)
      );
      const totalClasses = studentLogs.length;
      const attendedClasses = attendedCount(studentLogs, student.id);

      return {
        ...student,
        groups: studentGroups,
        totalClasses,
        attendedClasses,
        risk: riskMap.get(student.id) ?? { atRisk: false, reason: null, label: null },
      };
    });

    const mentorsWithGroups = mentors.map((mentor: any) => {
      const mentorGroups = groups.filter((g: any) => g.mentor_id === mentor.id);

      const groupsWithStudents = mentorGroups.map((group: any) => {
        const studentIds = groupStudents
          .filter((gs: any) => gs.group_id === group.id)
          .map((gs: any) => gs.student_id);
        const groupStudentList = students.filter((s: any) => studentIds.includes(s.id));

        return {
          ...group,
          students: groupStudentList,
        };
      });

      return {
        ...mentor,
        groups: groupsWithStudents,
      };
    });

    setData({
      students: studentsWithGroups,
      mentors: mentorsWithGroups,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <PeopleClient data={data as any} onDataChange={fetchData} />
    </Suspense>
  );
}
