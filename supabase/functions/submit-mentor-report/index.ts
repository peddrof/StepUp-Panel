import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AttendanceDetailEntry {
  student_id: string;
  status: "present" | "absent" | "late";
  engagement: number | null;
}

interface SubmitReportRequest {
  group_id: string;
  date: string;
  topic: string;
  attendance_data: string[];
  notes?: string;
  pin_code: string;
  homework?: string;
  attendance_detail?: AttendanceDetailEntry[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: SubmitReportRequest = await req.json();
    const { group_id, date, topic, attendance_data, notes, pin_code, homework, attendance_detail } = payload;

    if (!group_id || !date || !topic || !pin_code) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("id, mentor_id, deleted_at, mentor:mentors(id, pin_code)")
      .eq("id", group_id)
      .is("deleted_at", null)
      .maybeSingle();

    if (groupError || !group) {
      return new Response(
        JSON.stringify({ error: "Group not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const mentor = (group as any).mentor;
    if (!mentor || mentor.pin_code !== pin_code) {
      return new Response(
        JSON.stringify({ error: "Invalid PIN code" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // When attendance_detail is supplied, the present-list is everyone not
    // marked absent (present + late); otherwise fall back to the legacy array.
    const presentIds = Array.isArray(attendance_detail)
      ? attendance_detail
          .filter((a) => a.status !== "absent")
          .map((a) => a.student_id)
      : attendance_data || [];

    const { data: classLog, error: insertError } = await supabase
      .from("class_logs")
      .insert({
        group_id,
        date,
        topic,
        attendance_data: presentIds,
        notes: notes || null,
        homework: homework || null,
        attendance_detail: Array.isArray(attendance_detail) ? attendance_detail : null,
      })
      .select()
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: classLog }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in submit-mentor-report:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
