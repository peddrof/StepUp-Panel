"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";

interface ClassLog {
  id: string;
  date: string;
  attendance_data: unknown;
}

interface GroupDetailsModalProps {
  group: {
    id: string;
    name: string;
    level: string;
    schedule_time: string;
    created_at: string;
    mentor?: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      expertise_level: string;
    } | null;
    students?: Array<{
      id: string;
      name: string;
      email: string;
      phone: string | null;
      english_level: string;
      status: string;
    }>;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupDetailsModal({
  group,
  open,
  onOpenChange,
}: GroupDetailsModalProps) {
  const [classLogs, setClassLogs] = useState<ClassLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (!open || !group?.id) {
      setClassLogs([]);
      return;
    }

    setLogsLoading(true);
    supabase
      .from("class_logs")
      .select("id, date, attendance_data")
      .eq("group_id", group.id)
      .is("deleted_at", null)
      .order("date", { ascending: true })
      .then(({ data }) => {
        setClassLogs((data as ClassLog[]) || []);
        setLogsLoading(false);
      });
  }, [open, group?.id]);

  if (!group) return null;

  const students = group.students || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {group.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-50 rounded-lg">
                    <Clock className="h-5 w-5 text-sky-800" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Schedule
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {group.schedule_time}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-50 rounded-lg">
                    <Users className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Level</p>
                    <Badge variant="outline" className="border-sky-800 text-sky-800">
                      {group.level}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Mentor
            </h3>
            {group.mentor ? (
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{group.mentor.name}</p>
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      {group.mentor.email ? (
                        <a
                          href={`mailto:${group.mentor.email}`}
                          className="text-sky-800 hover:underline"
                        >
                          {group.mentor.email}
                        </a>
                      ) : (
                        <span className="text-gray-500">No email</span>
                      )}
                      {group.mentor.phone && (
                        <p className="text-gray-600">{group.mentor.phone}</p>
                      )}
                    </div>
                    <Badge className="bg-cyan-500 text-white hover:bg-sky-800">
                      {group.mentor.expertise_level}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-gray-500 italic">No mentor assigned</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students ({students.length})
            </h3>
            {students.length > 0 ? (
              <div className="space-y-2">
                {students.map((student) => (
                  <Card key={student.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">
                            {student.name}
                          </p>
                          <a
                            href={`mailto:${student.email}`}
                            className="text-sm text-sky-800 hover:underline"
                          >
                            {student.email}
                          </a>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant="outline"
                            className="border-sky-800 text-sky-800"
                          >
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No students enrolled</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Attendance
            </h3>
            {logsLoading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : classLogs.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No classes recorded yet</p>
            ) : students.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No students enrolled</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="text-sm w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="sticky left-0 z-10 bg-gray-50 text-left font-medium text-gray-700 px-3 py-2 min-w-[140px] border-r border-gray-200">
                        Student
                      </th>
                      {classLogs.map((log) => (
                        <th
                          key={log.id}
                          className="text-center font-medium text-gray-500 px-2 py-2 min-w-[52px] whitespace-nowrap"
                        >
                          {format(new Date(log.date + "T00:00:00"), "MMM d")}
                        </th>
                      ))}
                      <th className="text-center font-semibold text-gray-700 px-3 py-2 min-w-[52px] border-l border-gray-200">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, i) => {
                      const attended = classLogs.filter(
                        (log) =>
                          Array.isArray(log.attendance_data) &&
                          (log.attendance_data as string[]).includes(student.id)
                      ).length;
                      return (
                        <tr
                          key={student.id}
                          className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td
                            className="sticky left-0 z-10 font-medium text-gray-900 px-3 py-2 border-r border-gray-200 whitespace-nowrap"
                            style={{ backgroundColor: i % 2 === 0 ? "white" : "#f9fafb" }}
                          >
                            {student.name}
                          </td>
                          {classLogs.map((log) => {
                            const present =
                              Array.isArray(log.attendance_data) &&
                              (log.attendance_data as string[]).includes(student.id);
                            return (
                              <td key={log.id} className="text-center px-2 py-2">
                                {present ? (
                                  <span className="text-green-600 font-bold">✓</span>
                                ) : (
                                  <span className="text-gray-300">·</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="text-center px-3 py-2 font-medium text-gray-700 border-l border-gray-200">
                            {attended}/{classLogs.length}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>
                Created {format(new Date(group.created_at), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
