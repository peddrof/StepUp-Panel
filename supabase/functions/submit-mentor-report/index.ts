import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SubmitReportRequest {
  group_id: string;
  date: string;
  topic: string;
  attendance_data: string[];
  notes?: string;
  pin_code: string;
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
    const { group_id, date, topic, attendance_data, notes, pin_code } = payload;

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
      .select("id, mentor_id, mentor:mentors(id, pin_code)")
      .eq("id", group_id)
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

    const { data: classLog, error: insertError } = await supabase
      .from("class_logs")
      .insert({
        group_id,
        date,
        topic,
        attendance_data: attendance_data || [],
        notes: notes || null,
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
