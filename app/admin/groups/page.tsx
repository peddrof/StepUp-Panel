import { createClient } from "@/lib/supabase-server";
import { GroupsClient } from "./groups-client";

async function getGroupsData() {
  const supabase = createClient();

  const [groupsRes, mentorsRes, studentsRes, groupStudentsRes] =
    await Promise.all([
      supabase.from("groups").select("*, mentor:mentors(*)"),
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

  return { groups: groupsWithDetails, mentors, students };
}

export default async function GroupsPage() {
  const data = await getGroupsData();
  return <GroupsClient data={data as any} />;
}
