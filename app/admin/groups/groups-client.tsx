"use client";

import { useState, useEffect } from "react";
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
import { Plus, Clock, User, Users, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { GroupWithDetails, Mentor, Student } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface GroupsData {
  groups: GroupWithDetails[];
  mentors: Mentor[];
  students: Student[];
}

export function GroupsClient({ 
  data, 
  onDataChange,
  initialGroupId 
}: { 
  data: GroupsData; 
  onDataChange: () => void;
  initialGroupId?: string | null;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupWithDetails | null>(null);
  const [groupPendingDelete, setGroupPendingDelete] =
    useState<{ id: string; name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
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
      if (editingGroup) {
        await supabase
          .from("groups")
          .update({
            name: formData.name,
            level: formData.level,
            schedule_time: formData.schedule_time,
            mentor_id: formData.mentor_id,
          } as any)
          .eq("id", editingGroup.id);

        const existingStudentIds = editingGroup.students.map((s) => s.id);
        const toRemove = existingStudentIds.filter((id) => !formData.student_ids.includes(id));
        const toAdd = formData.student_ids.filter((id) => !existingStudentIds.includes(id));

        if (toRemove.length > 0) {
          await supabase
            .from("group_students")
            .delete()
            .eq("group_id", editingGroup.id)
            .in("student_id", toRemove);
        }

        if (toAdd.length > 0) {
          const groupStudentInserts = toAdd.map((studentId) => ({
            group_id: editingGroup.id,
            student_id: studentId,
          }));
          await supabase.from("group_students").insert(groupStudentInserts as any);
        }
      } else {
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
      }

      setOpen(false);
      setEditingGroup(null);
      setFormData({
        name: "",
        level: "A1",
        schedule_time: "",
        mentor_id: "",
        student_ids: [],
      });
      onDataChange();
    } catch (error) {
      console.error("Error saving group:", error);
      toast({
        title: "Could not save group",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = (group: GroupWithDetails) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      level: group.level,
      schedule_time: group.schedule_time,
      mentor_id: group.mentor_id || "",
      student_ids: group.students.map((s) => s.id),
    });
    setOpen(true);
  };

  const handleDeleteGroup = async () => {
    if (!groupPendingDelete) return;
    if (deleteConfirmText !== groupPendingDelete.name) return;

    const deletedAt = new Date().toISOString();
    setLoading(true);
    try {
      await supabase
        .from("class_logs")
        .update({ deleted_at: deletedAt } as any)
        .eq("group_id", groupPendingDelete.id)
        .is("deleted_at", null);
      await supabase
        .from("groups")
        .update({ deleted_at: deletedAt } as any)
        .eq("id", groupPendingDelete.id);
      setGroupPendingDelete(null);
      setDeleteConfirmText("");
      onDataChange();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Could not delete group",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialGroupId && data.groups.length > 0) {
      const group = data.groups.find((g) => g.id === initialGroupId);
      if (group) {
        setSelectedGroup(group);
        setGroupModalOpen(true);
      }
    }
  }, [initialGroupId, data.groups]);

  return (
    <div className="space-y-6">
      <div>
        <div className="border-b border-gray-200 pb-5 mb-1">
          <h1 className="text-2xl font-semibold text-gray-900">Groups</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your class groups and enrollments</p>
        </div>
        <div className="flex justify-end mt-4">
          <Dialog
            open={open}
            onOpenChange={(isOpen) => {
              setOpen(isOpen);
              if (!isOpen) {
                setEditingGroup(null);
                setFormData({
                  name: "",
                  level: "A1",
                  schedule_time: "",
                  mentor_id: "",
                  student_ids: [],
                });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-sky-800 hover:bg-gray-200">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? "Edit Group" : "Create New Group"}
              </DialogTitle>
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
                className="w-full bg-sky-800 hover:bg-gray-200"
              >
                {loading
                  ? editingGroup
                    ? "Saving..."
                    : "Creating..."
                  : editingGroup
                  ? "Save Changes"
                  : "Create Group"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <GroupDetailsModal
        group={selectedGroup}
        open={groupModalOpen}
        onOpenChange={setGroupModalOpen}
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...data.groups]
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
          .map((group) => (
          <Card key={group.id} className="border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle
                  className="text-lg font-semibold text-gray-900 cursor-pointer flex-1"
                  onClick={() => {
                    setSelectedGroup(group);
                    setGroupModalOpen(true);
                  }}
                >
                  {group.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-500 text-white hover:bg-cyan-600">
                    {group.level}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-gray-200 hover:text-sky-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditGroup(group);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGroupPendingDelete({ id: group.id, name: group.name });
                      setDeleteConfirmText("");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent
              className="space-y-4 cursor-pointer"
              onClick={() => {
                setSelectedGroup(group);
                setGroupModalOpen(true);
              }}
            >
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

      <AlertDialog
        open={!!groupPendingDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setGroupPendingDelete(null);
            setDeleteConfirmText("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              This hides the group and its class logs from all views. The records are preserved and can be restored by clearing <code className="font-mono text-xs">deleted_at</code> in the database. To confirm, type the group name below:
              <span className="block mt-2 font-medium text-gray-900">
                {groupPendingDelete?.name}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type group name"
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              disabled={
                loading ||
                !groupPendingDelete ||
                deleteConfirmText !== groupPendingDelete.name
              }
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
