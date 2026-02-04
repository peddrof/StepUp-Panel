"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Eye, Users } from "lucide-react";
import { format } from "date-fns";
import type { ClassLogWithDetails } from "@/lib/database.types";

interface ClassLogsData {
  classLogs: Array<{
    id: string;
    group_id: string;
    date: string;
    topic: string;
    attendance_data: unknown;
    notes: string | null;
    created_at: string;
    group: {
      id: string;
      name: string;
      level: string;
      schedule_time: string;
      mentor_id: string | null;
      created_at: string;
      mentor: {
        id: string;
        name: string;
        phone: string | null;
        email: string;
        expertise_level: string;
        pin_code: string;
        created_at: string;
      } | null;
    } | null;
  }>;
}

export function ClassLogsClient({ data }: { data: ClassLogsData }) {
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<(typeof data.classLogs)[0] | null>(null);

  const filteredLogs = data.classLogs.filter(
    (log) =>
      log.topic.toLowerCase().includes(search.toLowerCase()) ||
      log.group?.name.toLowerCase().includes(search.toLowerCase()) ||
      log.group?.mentor?.name.toLowerCase().includes(search.toLowerCase())
  );

  const getAttendanceCount = (attendance: unknown) => {
    if (Array.isArray(attendance)) {
      return attendance.length;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="View all class reports submitted by mentors"
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by topic, group, or mentor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card className="border-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Group</TableHead>
                <TableHead className="font-semibold">Topic</TableHead>
                <TableHead className="font-semibold">Mentor</TableHead>
                <TableHead className="font-semibold">Attendance</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {format(new Date(log.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{log.group?.name || "-"}</span>
                      {log.group && (
                        <Badge className="bg-cyan-500 text-white hover:bg-cyan-600 text-xs">
                          {log.group.level}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{log.topic}</TableCell>
                  <TableCell className="text-gray-600">
                    {log.group?.mentor?.name || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Users className="h-4 w-4" />
                      {getAttendanceCount(log.attendance_data)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-sky-800 hover:text-sky-900 hover:bg-sky-50"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Class Report Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Date</p>
                              <p className="text-sm text-gray-900">
                                {format(new Date(log.date), "MMMM d, yyyy")}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Group</p>
                              <p className="text-sm text-gray-900">
                                {log.group?.name || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Mentor</p>
                              <p className="text-sm text-gray-900">
                                {log.group?.mentor?.name || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Attendance
                              </p>
                              <p className="text-sm text-gray-900">
                                {getAttendanceCount(log.attendance_data)} students
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Topic</p>
                            <p className="text-sm text-gray-900">{log.topic}</p>
                          </div>
                          {log.notes && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Notes</p>
                              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                {log.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No class logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
