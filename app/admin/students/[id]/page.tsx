"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { AttendanceMatrix } from "@/components/attendance-matrix";
import { RiskBadge } from "@/components/risk-badge";
import { StudentDetailSkeleton } from "@/components/skeletons";
import {
  attendedCount,
  attendanceRate,
  buildRiskMap,
  type StudentRisk,
  type StudentRiskRow,
} from "@/lib/attendance";

interface GroupInfo {
  id: string;
  name: string;
  level: string;
  schedule_time: string;
  mentorName: string | null;
}

interface LogInfo {
  id: string;
  group_id: string;
  date: string;
  topic: string;
  attendance_data: unknown;
}

export default function StudentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any | null>(null);
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [logs, setLogs] = useState<LogInfo[]>([]);
  const [risk, setRisk] = useState<StudentRisk | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [studentRes, gsRes, riskRes] = await Promise.all([
      supabase.from("students").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("group_students")
        .select(
          "group:groups(id, name, level, schedule_time, deleted_at, mentor:mentors(name))"
        )
        .eq("student_id", id),
      supabase.rpc("get_student_risk"),
    ]);

    const groupRows: GroupInfo[] = (gsRes.data || [])
      .map((r: any) => r.group)
      .filter((g: any) => g && !g.deleted_at)
      .map((g: any) => ({
        id: g.id,
        name: g.name,
        level: g.level,
        schedule_time: g.schedule_time,
        mentorName: g.mentor?.name ?? null,
      }));
    const groupIds = groupRows.map((g) => g.id);

    let logRows: LogInfo[] = [];
    if (groupIds.length > 0) {
      const { data: logData } = await supabase
        .from("class_logs")
        .select("id, group_id, date, topic, attendance_data")
        .in("group_id", groupIds)
        .is("deleted_at", null)
        .order("date", { ascending: false });
      logRows = (logData as LogInfo[]) || [];
    }

    const riskMap = buildRiskMap((riskRes.data as StudentRiskRow[]) || []);

    setStudent(studentRes.data);
    setGroups(groupRows);
    setLogs(logRows);
    setRisk(
      riskMap.get(id) ?? { atRisk: false, reason: null, label: null, groupId: null }
    );
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <StudentDetailSkeleton />;
  }

  if (!student) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/people"
          className="inline-flex items-center gap-1 text-sm text-sky-800 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to People
        </Link>
        <p className="text-gray-500">Student not found.</p>
      </div>
    );
  }

  const totalAttended = attendedCount(logs, id);
  const totalSessions = logs.length;
  const rate = attendanceRate(logs, id);
  const recentTopics = logs.slice(0, 10);
  const groupName = (gid: string) => groups.find((g) => g.id === gid)?.name ?? "";

  return (
    <div className="space-y-6">
      <Link
        href="/admin/people"
        className="inline-flex items-center gap-1 text-sm text-sky-800 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to People
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900">{student.name}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-sky-800 text-sky-800">
            {student.english_level}
          </Badge>
          <Badge
            className={
              student.status === "active"
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : "bg-gray-100 text-gray-600 hover:bg-gray-100"
            }
          >
            {student.status}
          </Badge>
          {risk?.atRisk && <RiskBadge label={risk.label} />}
        </div>
        <div className="flex flex-wrap items-center gap-4 pt-1 text-sm">
          {student.email && (
            <a
              href={`mailto:${student.email}`}
              className="inline-flex items-center gap-1 text-sky-800 hover:underline"
            >
              <Mail className="h-4 w-4" />
              {student.email}
            </a>
          )}
          {student.phone && (
            <a
              href={`https://wa.me/${student.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-green-600 hover:text-green-700"
            >
              <MessageCircle className="h-4 w-4" />
              {student.phone}
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Attendance
            </p>
            <p className="text-3xl font-semibold text-gray-900 mt-2">
              {totalSessions > 0 ? `${totalAttended}/${totalSessions}` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Rate
            </p>
            <p className="text-3xl font-semibold text-gray-900 mt-2">
              {rate === null ? "—" : `${Math.round(rate * 100)}%`}
            </p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Groups
            </p>
            <p className="text-3xl font-semibold text-gray-900 mt-2">
              {groups.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-900">
          Schedule &amp; attendance
        </h2>
        {groups.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Not enrolled in any group.</p>
        ) : (
          groups.map((g) => (
            <Card key={g.id} className="border-gray-200">
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-gray-900">{g.name}</span>
                  <Badge variant="outline" className="border-sky-800 text-sky-800">
                    {g.level}
                  </Badge>
                  <span className="text-sm text-gray-500">{g.schedule_time}</span>
                  {g.mentorName && (
                    <span className="text-sm text-gray-400">· {g.mentorName}</span>
                  )}
                </div>
                <AttendanceMatrix
                  students={[{ id: student.id, name: student.name }]}
                  logs={logs.filter((l) => l.group_id === g.id)}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-gray-900">Recent topics</h2>
        {recentTopics.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No classes recorded yet.</p>
        ) : (
          <Card className="border-gray-200">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {recentTopics.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                  >
                    <span className="font-medium text-gray-900 truncate">
                      {l.topic}
                    </span>
                    <span className="shrink-0 text-xs text-gray-500">
                      {groupName(l.group_id)} ·{" "}
                      {format(new Date(l.date + "T00:00:00"), "MMM d, yyyy")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
