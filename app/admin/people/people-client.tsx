"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { GroupDetailsModal } from "@/components/group-details-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, MessageCircle, Mail, Pencil, Trash2 } from "lucide-react";
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
import type { Student, Mentor } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

interface PeopleData {
  students: (Student & { groups?: any[] })[];
  mentors: (Mentor & { groups?: any[] })[];
}

export function PeopleClient({ data }: { data: PeopleData }) {
  const router = useRouter();
  const [studentSearch, setStudentSearch] = useState("");
  const [mentorSearch, setMentorSearch] = useState("");
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [mentorDialogOpen, setMentorDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);
  const [deleteMentorId, setDeleteMentorId] = useState<string | null>(null);

  const [newStudent, setNewStudent] = useState({
    name: "",
    phone: "",
    email: "",
    english_level: "A1",
    status: "active",
  });

  const [newMentor, setNewMentor] = useState({
    name: "",
    phone: "",
    email: "",
    expertise_level: "intermediate",
    pin_code: "",
  });

  const filteredStudents = data.students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.english_level.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredMentors = data.mentors.filter(
    (m) =>
      m.name.toLowerCase().includes(mentorSearch.toLowerCase()) ||
      m.expertise_level.toLowerCase().includes(mentorSearch.toLowerCase())
  );

  const handleCreateStudent = async () => {
    if (!newStudent.name || !newStudent.email) return;
    setLoading(true);
    try {
      if (editingStudent) {
        await supabase
          .from("students")
          .update(newStudent as any)
          .eq("id", editingStudent.id);
      } else {
        await supabase.from("students").insert(newStudent as any);
      }
      setStudentDialogOpen(false);
      setEditingStudent(null);
      setNewStudent({
        name: "",
        phone: "",
        email: "",
        english_level: "A1",
        status: "active",
      });
      router.refresh();
    } catch (error) {
      console.error("Error saving student:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setNewStudent({
      name: student.name,
      phone: student.phone || "",
      email: student.email || "",
      english_level: student.english_level,
      status: student.status,
    });
    setStudentDialogOpen(true);
  };

  const handleDeleteStudent = async () => {
    if (!deleteStudentId) return;
    setLoading(true);
    try {
      await supabase.from("group_students").delete().eq("student_id", deleteStudentId);
      await supabase.from("students").delete().eq("id", deleteStudentId);
      setDeleteStudentId(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting student:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMentor = async () => {
    if (!newMentor.name || !newMentor.email || !newMentor.pin_code) return;
    setLoading(true);
    try {
      if (editingMentor) {
        await supabase
          .from("mentors")
          .update(newMentor as any)
          .eq("id", editingMentor.id);
      } else {
        await supabase.from("mentors").insert(newMentor as any);
      }
      setMentorDialogOpen(false);
      setEditingMentor(null);
      setNewMentor({
        name: "",
        phone: "",
        email: "",
        expertise_level: "intermediate",
        pin_code: "",
      });
      router.refresh();
    } catch (error) {
      console.error("Error saving mentor:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMentor = (mentor: Mentor) => {
    setEditingMentor(mentor);
    setNewMentor({
      name: mentor.name,
      phone: mentor.phone || "",
      email: mentor.email,
      expertise_level: mentor.expertise_level,
      pin_code: mentor.pin_code,
    });
    setMentorDialogOpen(true);
  };

  const handleDeleteMentor = async () => {
    if (!deleteMentorId) return;
    setLoading(true);
    try {
      await supabase.from("groups").update({ mentor_id: null }).eq("mentor_id", deleteMentorId);
      await supabase.from("mentors").delete().eq("id", deleteMentorId);
      setDeleteMentorId(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting mentor:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatWhatsAppLink = (phone: string | null) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, "");
    return `https://wa.me/${cleaned}`;
  };

  const handleGroupClick = (group: any) => {
    setSelectedGroup(group);
    setGroupModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="People"
        description="Manage students and mentors"
      />

      <GroupDetailsModal
        group={selectedGroup}
        open={groupModalOpen}
        onOpenChange={setGroupModalOpen}
      />

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="students" className="data-[state=active]:bg-white">
            Students ({data.students.length})
          </TabsTrigger>
          <TabsTrigger value="mentors" className="data-[state=active]:bg-white">
            Mentors ({data.mentors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog
              open={studentDialogOpen}
              onOpenChange={(open) => {
                setStudentDialogOpen(open);
                if (!open) {
                  setEditingStudent(null);
                  setNewStudent({
                    name: "",
                    phone: "",
                    email: "",
                    english_level: "A1",
                    status: "active",
                  });
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-sky-800 hover:bg-sky-900">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingStudent ? "Edit Student" : "Add New Student"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-name">Name</Label>
                    <Input
                      id="student-name"
                      value={newStudent.name}
                      onChange={(e) =>
                        setNewStudent((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email</Label>
                    <Input
                      id="student-email"
                      type="email"
                      value={newStudent.email}
                      onChange={(e) =>
                        setNewStudent((prev) => ({ ...prev, email: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-phone">Phone</Label>
                    <Input
                      id="student-phone"
                      value={newStudent.phone}
                      onChange={(e) =>
                        setNewStudent((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="+5511999999999"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>English Level</Label>
                      <Select
                        value={newStudent.english_level}
                        onValueChange={(value) =>
                          setNewStudent((prev) => ({ ...prev, english_level: value }))
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
                      <Label>Status</Label>
                      <Select
                        value={newStudent.status}
                        onValueChange={(value) =>
                          setNewStudent((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateStudent}
                    disabled={loading}
                    className="w-full bg-sky-800 hover:bg-sky-900"
                  >
                    {loading
                      ? editingStudent
                        ? "Saving..."
                        : "Adding..."
                      : editingStudent
                      ? "Save Changes"
                      : "Add Student"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-gray-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Groups</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>
                        {student.groups && student.groups.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {student.groups.map((group: any) => (
                              <Badge
                                key={group.id}
                                variant="outline"
                                className="border-sky-800 text-sky-800 cursor-pointer hover:bg-sky-50"
                                onClick={() => handleGroupClick(group)}
                              >
                                {group.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 italic">No groups</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            student.status === "active"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                          }
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.email ? (
                          <a
                            href={`mailto:${student.email}`}
                            className="inline-flex items-center gap-1 text-sky-800 hover:text-sky-900 hover:underline"
                          >
                            <Mail className="h-4 w-4" />
                            {student.email}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {student.phone ? (
                          <a
                            href={formatWhatsAppLink(student.phone) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-700"
                          >
                            <MessageCircle className="h-4 w-4" />
                            {student.phone}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-sky-50 hover:text-sky-800"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setDeleteStudentId(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentors" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search mentors..."
                value={mentorSearch}
                onChange={(e) => setMentorSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog
              open={mentorDialogOpen}
              onOpenChange={(open) => {
                setMentorDialogOpen(open);
                if (!open) {
                  setEditingMentor(null);
                  setNewMentor({
                    name: "",
                    phone: "",
                    email: "",
                    expertise_level: "intermediate",
                    pin_code: "",
                  });
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-sky-800 hover:bg-sky-900">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mentor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingMentor ? "Edit Mentor" : "Add New Mentor"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="mentor-name">Name</Label>
                    <Input
                      id="mentor-name"
                      value={newMentor.name}
                      onChange={(e) =>
                        setNewMentor((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mentor-email">Email</Label>
                    <Input
                      id="mentor-email"
                      type="email"
                      value={newMentor.email}
                      onChange={(e) =>
                        setNewMentor((prev) => ({ ...prev, email: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mentor-phone">Phone</Label>
                    <Input
                      id="mentor-phone"
                      value={newMentor.phone}
                      onChange={(e) =>
                        setNewMentor((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="+5511999999999"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expertise Level</Label>
                      <Select
                        value={newMentor.expertise_level}
                        onValueChange={(value) =>
                          setNewMentor((prev) => ({ ...prev, expertise_level: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mentor-pin">PIN Code</Label>
                      <Input
                        id="mentor-pin"
                        value={newMentor.pin_code}
                        onChange={(e) =>
                          setNewMentor((prev) => ({ ...prev, pin_code: e.target.value }))
                        }
                        placeholder="8-digit PIN"
                        maxLength={8}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleCreateMentor}
                    disabled={loading}
                    className="w-full bg-sky-800 hover:bg-sky-900"
                  >
                    {loading
                      ? editingMentor
                        ? "Saving..."
                        : "Adding..."
                      : editingMentor
                      ? "Save Changes"
                      : "Add Mentor"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-gray-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Groups</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMentors.map((mentor) => (
                    <TableRow key={mentor.id}>
                      <TableCell className="font-medium">{mentor.name}</TableCell>
                      <TableCell>
                        {mentor.groups && mentor.groups.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {mentor.groups.map((group: any) => (
                              <Badge
                                key={group.id}
                                variant="outline"
                                className="border-cyan-600 text-cyan-600 cursor-pointer hover:bg-cyan-50"
                                onClick={() => handleGroupClick(group)}
                              >
                                {group.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 italic">No groups</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {mentor.email ? (
                          <a
                            href={`mailto:${mentor.email}`}
                            className="inline-flex items-center gap-1 text-sky-800 hover:text-sky-900 hover:underline"
                          >
                            <Mail className="h-4 w-4" />
                            {mentor.email}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {mentor.phone ? (
                          <a
                            href={formatWhatsAppLink(mentor.phone) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-700"
                          >
                            <MessageCircle className="h-4 w-4" />
                            {mentor.phone}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-sky-50 hover:text-sky-800"
                            onClick={() => handleEditMentor(mentor)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setDeleteMentorId(mentor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteStudentId} onOpenChange={() => setDeleteStudentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this student? This will also remove them from all groups. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStudent}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteMentorId} onOpenChange={() => setDeleteMentorId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mentor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this mentor? Their groups will be unassigned. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMentor}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
