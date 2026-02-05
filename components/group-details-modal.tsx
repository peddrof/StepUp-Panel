"use client";

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
  if (!group) return null;

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
              Students ({group.students?.length || 0})
            </h3>
            {group.students && group.students.length > 0 ? (
              <div className="space-y-2">
                {group.students.map((student) => (
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
