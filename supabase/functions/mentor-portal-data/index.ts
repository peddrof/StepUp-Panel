import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PortalRequest {
  // List mode: return the mentor picker options only (no PIN required).
  list?: boolean;
  // Data mode: return one mentor's groups/rosters/history (PIN required).
  mentor_id?: string;
  pin_code?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { list, mentor_id, pin_code }: PortalRequest = await req.json();

    // --- List mode: mentor names for the login picker (no PIN, no pin_code) ---
    if (list) {
      const { data: mentors, error } = await supabase
        .from("mentors")
        .select("id, name")
        .order("name");
      if (error) return json({ error: error.message }, 500);
      return json({ mentors: mentors ?? [] });
    }

    // --- Data mode: PIN-gated ---
    if (!mentor_id || !pin_code) {
      return json({ error: "Missing required fields" }, 400);
    }

    const { data: mentor, error: mentorError } = await supabase
      .from("mentors")
      .select("id, name, pin_code")
      .eq("id", mentor_id)
      .maybeSingle();

    if (mentorError || !mentor) {
      return json({ error: "Mentor not found" }, 404);
    }

    // Mirror submit-mentor-report's PIN check exactly.
    if ((mentor as { pin_code: string }).pin_code !== pin_code) {
      return json({ error: "Invalid PIN code" }, 401);
    }

    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select("id, name, level, schedule_time")
      .eq("mentor_id", mentor_id)
      .is("deleted_at", null)
      .order("name");
    if (groupsError) return json({ error: groupsError.message }, 500);

    const groupIds = (groups ?? []).map((g: { id: string }) => g.id);

    if (groupIds.length === 0) {
      return json({ mentor: { id: mentor.id, name: mentor.name }, groups: [] });
    }

    const [rosterRes, logsRes, riskRes] = await Promise.all([
      supabase
        .from("group_students")
        .select("group_id, student:students(id, name, english_level, status)")
        .in("group_id", groupIds),
      supabase
        .from("class_logs")
        .select("id, group_id, date, topic, notes, homework, attendance_data")
        .in("group_id", groupIds)
        .is("deleted_at", null)
        .order("date", { ascending: false }),
      supabase.rpc("get_student_risk"),
    ]);

    if (rosterRes.error) return json({ error: rosterRes.error.message }, 500);
    if (logsRes.error) return json({ error: logsRes.error.message }, 500);
    if (riskRes.error) return json({ error: riskRes.error.message }, 500);

    const roster = rosterRes.data ?? [];
    const logs = logsRes.data ?? [];

    // Index risk by `${student_id}:${group_id}` for this mentor's groups.
    const riskByKey = new Map<string, any>();
    (riskRes.data ?? []).forEach((r: any) => {
      if (groupIds.indexOf(r.group_id) !== -1) {
        riskByKey.set(`${r.student_id}:${r.group_id}`, r);
      }
    });

    const result = (groups ?? []).map((g: any) => {
      const students = roster
        .filter((rs: any) => rs.group_id === g.id && rs.student)
        .map((rs: any) => {
          const s = rs.student;
          const risk = riskByKey.get(`${s.id}:${g.id}`);
          return {
            id: s.id,
            name: s.name,
            english_level: s.english_level,
            status: s.status,
            attended: risk ? risk.attended_sessions : 0,
            total: risk ? risk.total_sessions : 0,
            attendance_rate: risk ? risk.attendance_rate : null,
            recent_absences: risk ? risk.recent_absences : 0,
            is_at_risk: risk ? risk.is_at_risk : false,
          };
        });

      const classLogs = logs
        .filter((l: any) => l.group_id === g.id)
        .map((l: any) => ({
          id: l.id,
          date: l.date,
          topic: l.topic,
          notes: l.notes,
          homework: l.homework,
          attendanceCount: Array.isArray(l.attendance_data)
            ? l.attendance_data.length
            : 0,
        }));

      return {
        id: g.id,
        name: g.name,
        level: g.level,
        schedule_time: g.schedule_time,
        students,
        classLogs,
      };
    });

    return json({ mentor: { id: mentor.id, name: mentor.name }, groups: result });
  } catch (error) {
    console.error("Error in mentor-portal-data:", error);
    return json({ error: "Internal server error" }, 500);
  }
});
