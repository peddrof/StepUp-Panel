"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface GroupSummary {
  id: string;
  name: string;
  level: string;
  schedule_time: string;
}

interface Student {
  id: string;
  name: string;
}

export default function MentorReportPage() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pinError, setPinError] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [attendance, setAttendance] = useState<string[]>([]);
  const [pinCode, setPinCode] = useState("");

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  useEffect(() => {
    async function loadData() {
      const { data: groupsData } = await supabase
        .from("groups")
        .select("id, name, level, schedule_time")
        .is("deleted_at", null)
        .order("name");

      setGroups((groupsData as GroupSummary[]) || []);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadStudents() {
      if (!selectedGroupId) {
        setStudents([]);
        setAttendance([]);
        return;
      }

      const { data: groupStudents } = await supabase
        .from("group_students")
        .select("student_id")
        .eq("group_id", selectedGroupId);

      if (groupStudents && groupStudents.length > 0) {
        const studentIds = (groupStudents as any[]).map((gs) => gs.student_id);
        const { data: studentsData } = await supabase
          .from("students")
          .select("*")
          .in("id", studentIds);

        setStudents((studentsData as any) || []);
      } else {
        setStudents([]);
      }
      setAttendance([]);
    }
    loadStudents();
  }, [selectedGroupId]);

  const handleAttendanceToggle = (studentId: string) => {
    setAttendance((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedGroupId || !selectedDate || !topic || !pinCode) return;

    setPinError(false);
    setSubmitting(true);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-mentor-report`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_id: selectedGroupId,
          date: format(selectedDate, "yyyy-MM-dd"),
          topic,
          attendance_data: attendance,
          notes: notes || null,
          pin_code: pinCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || data.error === "Invalid PIN code") {
          setPinError(true);
          setSubmitting(false);
          return;
        }
        throw new Error(data.error || "Failed to submit report");
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Could not submit report",
        description: error instanceof Error ? error.message : "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-800" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-gray-200">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Report Submitted!
            </h2>
            <p className="text-gray-500 mb-6">
              Your class report has been successfully recorded.
            </p>
            <Button
              onClick={() => {
                setSubmitted(false);
                setSelectedGroupId("");
                setTopic("");
                setNotes("");
                setAttendance([]);
                setPinCode("");
              }}
              className="bg-sky-800 hover:bg-gray-200"
            >
              Submit Another Report
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">StepUp Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Mentor Class Report</p>
        </div>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Submit Class Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Group</Label>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} — {group.level} · {group.schedule_time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Class Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Class Topic</Label>
              <Input
                id="topic"
                placeholder="What did you teach today?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            {students.length > 0 && (
              <div className="space-y-2">
                <Label>Attendance ({attendance.length}/{students.length})</Label>
                <ScrollArea className="h-48 border rounded-lg p-3">
                  <div className="space-y-2">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`student-${student.id}`}
                          checked={attendance.includes(student.id)}
                          onCheckedChange={() => handleAttendanceToggle(student.id)}
                        />
                        <label
                          htmlFor={`student-${student.id}`}
                          className="text-sm font-medium leading-none cursor-pointer flex-1"
                        >
                          {student.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any observations about the class..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin">PIN Code</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter your 8-digit PIN"
                value={pinCode}
                onChange={(e) => {
                  setPinCode(e.target.value);
                  setPinError(false);
                }}
                maxLength={8}
                className={cn(pinError && "border-red-500")}
              />
              {pinError && (
                <p className="text-sm text-red-500">Invalid PIN code</p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={
                submitting || !selectedGroupId || !selectedDate || !topic || !pinCode
              }
              className="w-full bg-sky-800 hover:bg-gray-200"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
