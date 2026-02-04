import { supabase } from "@/lib/supabase";
import { PeopleClient } from "./people-client";

async function getPeopleData() {
  const [studentsRes, mentorsRes, groupsRes, groupStudentsRes] = await Promise.all([
    supabase.from("students").select("*").order("name"),
    supabase.from("mentors").select("*").order("name"),
    supabase.from("groups").select("*, mentor:mentors(*)"),
    supabase.from("group_students").select("*"),
  ]);

  const students = studentsRes.data || [];
  const mentors = mentorsRes.data || [];
  const groups = groupsRes.data || [];
  const groupStudents = groupStudentsRes.data || [];

  const studentsWithGroups = students.map((student: any) => {
    const studentGroupIds = groupStudents
      .filter((gs: any) => gs.student_id === student.id)
      .map((gs: any) => gs.group_id);
    const studentGroups = groups.filter((g: any) => studentGroupIds.includes(g.id));

    return {
      ...student,
      groups: studentGroups,
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

  return {
    students: studentsWithGroups,
    mentors: mentorsWithGroups,
  };
}

export default async function PeoplePage() {
  const data = await getPeopleData();
  return <PeopleClient data={data as any} />;
}
