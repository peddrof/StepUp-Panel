"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { GroupDetailsModal } from "@/components/group-details-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Clock, User, Users } from "lucide-react";
import type { GroupWithDetails, Mentor, Student } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

interface GroupsData {
  groups: GroupWithDetails[];
  mentors: Mentor[];
  students: Student[];
}

export function GroupsClient({ data }: { data: GroupsData }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    level: "A1",
    schedule_time: "",
    mentor_id: "",
    student_ids: [] as string[],
  });

  const handleStudentToggle = (studentId: string) => {
    setFormData((prev) => ({
      ...prev,
      student_ids: prev.student_ids.includes(studentId)
        ? prev.student_ids.filter((id) => id !== studentId)
        : [...prev.student_ids, studentId],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.schedule_time || !formData.mentor_id) return;

    setLoading(true);
    try {
      const { data: newGroup, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: formData.name,
          level: formData.level,
          schedule_time: formData.schedule_time,
          mentor_id: formData.mentor_id,
        } as any)
        .select()
        .single();

      if (groupError) throw groupError;

      const insertedGroup = newGroup as { id: string } | null;
      if (insertedGroup && formData.student_ids.length > 0) {
        const groupStudentInserts = formData.student_ids.map((studentId) => ({
          group_id: insertedGroup.id,
          student_id: studentId,
        }));

        await supabase.from("group_students").insert(groupStudentInserts as any);
      }

      setOpen(false);
      setFormData({
        name: "",
        level: "A1",
        schedule_time: "",
        mentor_id: "",
        student_ids: [],
      });
      router.refresh();
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Turmas"
          description="Manage your class groups and enrollments"
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sky-800 hover:bg-sky-900">
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., A1.1, A1.2"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, level: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A1">A1</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                      <SelectItem value="B1">B1</SelectItem>
                      <SelectItem value="B2">B2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Input
                    id="schedule"
                    placeholder="e.g., Mon/Wed 09:00"
                    value={formData.schedule_time}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        schedule_time: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mentor">Mentor</Label>
                <Select
                  value={formData.mentor_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, mentor_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Students</Label>
                <ScrollArea className="h-48 border rounded-lg p-3">
                  <div className="space-y-2">
                    {data.students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={student.id}
                          checked={formData.student_ids.includes(student.id)}
                          onCheckedChange={() => handleStudentToggle(student.id)}
                        />
                        <label
                          htmlFor={student.id}
                          className="text-sm font-medium leading-none cursor-pointer flex-1"
                        >
                          {student.name}
                          <span className="text-gray-500 ml-2 text-xs">
                            ({student.english_level})
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-sky-800 hover:bg-sky-900"
              >
                {loading ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <GroupDetailsModal
        group={selectedGroup}
        open={groupModalOpen}
        onOpenChange={setGroupModalOpen}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.groups.map((group) => (
          <Card
            key={group.id}
            className="border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedGroup(group);
              setGroupModalOpen(true);
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {group.name}
                </CardTitle>
                <Badge className="bg-cyan-500 text-white hover:bg-cyan-600">
                  {group.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4 text-sky-800" />
                <span>{group.mentor?.name || "No mentor assigned"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-sky-800" />
                <span>{group.schedule_time}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Users className="h-4 w-4 text-sky-800" />
                  <span>{group.students.length} students</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {group.students.slice(0, 5).map((student) => (
                    <span
                      key={student.id}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {student.name.split(" ")[0]}
                    </span>
                  ))}
                  {group.students.length > 5 && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                      +{group.students.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
