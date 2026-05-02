"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { GroupsClient } from "./groups-client";

export default function GroupsPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<{ groups: any[]; mentors: any[]; students: any[] }>({
    groups: [],
    mentors: [],
    students: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [groupsRes, mentorsRes, studentsRes, groupStudentsRes] =
      await Promise.all([
        supabase.from("groups").select("*, mentor:mentors(*)").is("deleted_at", null),
        supabase.from("mentors").select("*"),
        supabase.from("students").select("*").eq("status", "active"),
        supabase.from("group_students").select("*"),
      ]);

    const groups = groupsRes.data || [];
    const mentors = mentorsRes.data || [];
    const students = studentsRes.data || [];
    const groupStudents = groupStudentsRes.data || [];

    const groupsWithDetails = groups.map((group: any) => {
      const studentIds = groupStudents
        .filter((gs: any) => gs.group_id === group.id)
        .map((gs: any) => gs.student_id);
      const groupStudentList = students.filter((s: any) => studentIds.includes(s.id));

      return {
        ...group,
        mentor: group.mentor || null,
        students: groupStudentList,
      };
    });

    setData({ groups: groupsWithDetails, mentors, students });
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

  const groupId = searchParams.get("group");

  return <GroupsClient data={data as any} onDataChange={fetchData} initialGroupId={groupId} />;
}
