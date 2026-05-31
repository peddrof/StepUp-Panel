"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, CheckCircle2, Loader2, LogOut } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { RiskBadge } from "@/components/risk-badge";
import { riskLabel, type AttendanceStatus } from "@/lib/attendance";

const FN_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface PortalStudent {
  id: string;
  name: string;
  english_level: string;
  status: string;
  attended: number;
  total: number;
  attendance_rate: number | null;
  recent_absences: number;
  is_at_risk: boolean;
}

interface PortalClassLog {
  id: string;
  date: string;
  topic: string;
  notes: string | null;
  homework: string | null;
  attendanceCount: number;
}

interface PortalGroup {
  id: string;
  name: string;
  level: string;
  schedule_time: string;
  students: PortalStudent[];
  classLogs: PortalClassLog[];
}

interface PortalData {
  mentor: { id: string; name: string };
  groups: PortalGroup[];
}

type StatusEntry = { status: AttendanceStatus; engagement: number | null };

async function callFn(path: string, body: unknown) {
  const res = await fetch(`${FN_URL}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON}`,
      apikey: ANON,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export default function MentorPortalPage() {
  const { toast } = useToast();

  // Gate state
  const [mentorOptions, setMentorOptions] = useState<{ id: string; name: string }[]>([]);
  const [mentorId, setMentorId] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [authing, setAuthing] = useState(false);

  // Portal state
  const [portal, setPortal] = useState<PortalData | null>(null);

  useEffect(() => {
    callFn("mentor-portal-data", { list: true }).then(({ res, data }) => {
      if (res.ok) setMentorOptions(data.mentors || []);
    });
  }, []);

  async function loadPortal(id: string, pinCode: string) {
    const { res, data } = await callFn("mentor-portal-data", {
      mentor_id: id,
      pin_code: pinCode,
    });
    return { res, data };
  }

  const handleEnter = async () => {
    if (!mentorId || !pin) return;
    setPinError(false);
    setAuthing(true);
    try {
      const { res, data } = await loadPortal(mentorId, pin);
      if (res.status === 401) {
        setPinError(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || `Failed (HTTP ${res.status})`);
      setPortal(data as PortalData);
    } catch (error) {
      toast({
        title: "Could not load your portal",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAuthing(false);
    }
  };

  const refreshPortal = async () => {
    const { res, data } = await loadPortal(mentorId, pin);
    if (res.ok) setPortal(data as PortalData);
  };

  const handleSignOut = () => {
    setPortal(null);
    setPin("");
    setPinError(false);
  };

  // ---- Gate view ----
  if (!portal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">StepUp</h1>
            <p className="text-sm text-gray-500 mt-1">Mentor Portal</p>
          </div>
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Sign in</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Your name</Label>
                <Select value={mentorId} onValueChange={setMentorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your name" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentorOptions.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">PIN Code</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter your 8-digit PIN"
                  value={pin}
                  maxLength={8}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setPinError(false);
                  }}
                  className={cn(pinError && "border-red-500")}
                />
                {pinError && <p className="text-sm text-red-500">Invalid PIN code</p>}
              </div>
              <Button
                onClick={handleEnter}
                disabled={authing || !mentorId || !pin}
                className="w-full bg-sky-800 hover:bg-gray-200"
              >
                {authing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Enter"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ---- Portal view ----
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome, {portal.mentor.name}
            </h1>
            <p className="text-sm text-gray-500">Mentor Portal</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>

        <Tabs defaultValue="groups" className="space-y-6">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="groups" className="data-[state=active]:bg-white">
              My Groups
            </TabsTrigger>
            <TabsTrigger value="report" className="data-[state=active]:bg-white">
              New Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="space-y-6">
            {portal.groups.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                You have no groups assigned yet.
              </p>
            ) : (
              portal.groups.map((g) => <GroupCard key={g.id} group={g} />)
            )}
          </TabsContent>

          <TabsContent value="report">
            <ReportForm
              groups={portal.groups}
              pin={pin}
              onSubmitted={refreshPortal}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function GroupCard({ group }: { group: PortalGroup }) {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {group.name}
          <Badge variant="outline" className="border-sky-800 text-sky-800">
            {group.level}
          </Badge>
          <span className="text-sm font-normal text-gray-500">
            {group.schedule_time}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Students ({group.students.length})
          </h4>
          <div className="space-y-1.5">
            {group.students.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="font-medium text-gray-900">{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">
                    {s.total > 0 ? `${s.attended}/${s.total}` : "—"}
                  </span>
                  {s.is_at_risk && <RiskBadge label={riskLabel(s)} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">
            Recent classes
          </h4>
          {group.classLogs.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No classes logged yet.</p>
          ) : (
            <div className="space-y-2">
              {group.classLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{log.topic}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(log.date + "T00:00:00"), "MMM d")} ·{" "}
                      {log.attendanceCount} present
                    </span>
                  </div>
                  {log.homework && (
                    <p className="mt-1 text-xs text-gray-600">
                      <span className="font-medium">Homework:</span> {log.homework}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ReportForm({
  groups,
  pin,
  onSubmitted,
}: {
  groups: PortalGroup[];
  pin: string;
  onSubmitted: () => void;
}) {
  const { toast } = useToast();
  const [groupId, setGroupId] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [topic, setTopic] = useState("");
  const [homework, setHomework] = useState("");
  const [notes, setNotes] = useState("");
  const [attendance, setAttendance] = useState<Record<string, StatusEntry>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const group = groups.find((g) => g.id === groupId);

  // Default everyone to present when a group is picked; mentor marks exceptions.
  useEffect(() => {
    if (!group) {
      setAttendance({});
      return;
    }
    const init: Record<string, StatusEntry> = {};
    group.students.forEach((s) => {
      init[s.id] = { status: "present", engagement: null };
    });
    setAttendance(init);
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        status,
        engagement: status === "absent" ? null : prev[studentId]?.engagement ?? null,
      },
    }));
  };

  const setEngagement = (studentId: string, engagement: number | null) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { status: prev[studentId]?.status ?? "present", engagement },
    }));
  };

  const resetForm = () => {
    setGroupId("");
    setTopic("");
    setHomework("");
    setNotes("");
    setAttendance({});
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!groupId || !date || !topic || !group) return;
    setSubmitting(true);
    try {
      const attendance_detail = group.students.map((s) => ({
        student_id: s.id,
        status: attendance[s.id]?.status ?? "present",
        engagement: attendance[s.id]?.engagement ?? null,
      }));

      const { res, data } = await callFn("submit-mentor-report", {
        group_id: groupId,
        date: format(date, "yyyy-MM-dd"),
        topic,
        attendance_data: [],
        attendance_detail,
        homework: homework || null,
        notes: notes || null,
        pin_code: pin,
      });

      if (!res.ok) throw new Error(data.error || `Submit failed (HTTP ${res.status})`);
      setSubmitted(true);
      onSubmitted();
    } catch (error) {
      toast({
        title: "Could not submit report",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-gray-200">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Report Submitted!
          </h2>
          <p className="text-gray-500 mb-6">Your class report has been recorded.</p>
          <Button onClick={resetForm} className="bg-sky-800 hover:bg-gray-200">
            Submit Another Report
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg">New Class Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Group</Label>
          <Select value={groupId} onValueChange={setGroupId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name} — {g.level} · {g.schedule_time}
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
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
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

        {group && group.students.length > 0 && (
          <div className="space-y-2">
            <Label>Attendance</Label>
            <ScrollArea className="h-64 border rounded-lg p-3">
              <div className="space-y-2">
                {group.students.map((s) => {
                  const entry = attendance[s.id] ?? {
                    status: "present" as AttendanceStatus,
                    engagement: null,
                  };
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-2 border-b border-gray-50 pb-2 last:border-0"
                    >
                      <span className="text-sm font-medium flex-1 truncate">
                        {s.name}
                      </span>
                      <div className="inline-flex overflow-hidden rounded-md border">
                        {(["present", "late", "absent"] as AttendanceStatus[]).map(
                          (st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setStatus(s.id, st)}
                              className={cn(
                                "px-2 py-1 text-xs capitalize transition-colors",
                                entry.status === st
                                  ? st === "present"
                                    ? "bg-green-600 text-white"
                                    : st === "late"
                                    ? "bg-amber-500 text-white"
                                    : "bg-gray-500 text-white"
                                  : "bg-white text-gray-600 hover:bg-gray-50"
                              )}
                            >
                              {st}
                            </button>
                          )
                        )}
                      </div>
                      <select
                        aria-label="Engagement"
                        value={entry.engagement ?? ""}
                        disabled={entry.status === "absent"}
                        onChange={(e) =>
                          setEngagement(
                            s.id,
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="h-7 rounded-md border border-gray-200 bg-white px-1 text-xs text-gray-700 disabled:opacity-40"
                      >
                        <option value="">–</option>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <p className="text-xs text-gray-400">
              Status defaults to Present. The number is an optional engagement
              rating (1–5).
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="homework">Homework (Optional)</Label>
          <Textarea
            id="homework"
            placeholder="Any homework assigned..."
            value={homework}
            onChange={(e) => setHomework(e.target.value)}
            rows={2}
          />
        </div>

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

        <Button
          onClick={handleSubmit}
          disabled={submitting || !groupId || !date || !topic}
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
  );
}
