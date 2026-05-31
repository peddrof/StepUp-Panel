/*
  # Attendance stats view + at-risk RPC

  Centralizes the per-student attendance calculation that was duplicated in
  the dashboard, People page, and group-details modal. The membership test
  uses the jsonb `?` containment operator on class_logs.attendance_data
  (a JSON array of student-id strings, inserted from JS string[]).

  Denominator = all non-deleted sessions for the groups the student belongs
  to. There is no enrollment-date cutoff today (group_students has no such
  semantics in use), so a freshly-added student's rate counts sessions held
  before they joined; the recent-absences signal is enrollment-agnostic and
  is the more reliable risk indicator.

  Both objects are SECURITY INVOKER, so the existing admin RLS on
  students/group_students/groups/class_logs still applies when admins read
  via the Next client; the portal edge functions read via the service role
  (which bypasses RLS). Grants go to `authenticated` only, never `anon`.

  At-risk rule (mirrored in lib/attendance.ts — keep the two in lockstep):
    is_at_risk = recent_absences >= 3
                 OR (total_sessions >= 4 AND attendance_rate < 0.5)

  Pre-flight sanity check (read-only, run once before relying on the view):
    SELECT id FROM class_logs WHERE jsonb_typeof(attendance_data) <> 'array';
*/

CREATE OR REPLACE VIEW student_attendance_stats
WITH (security_invoker = true) AS
SELECT
  s.id        AS student_id,
  gs.group_id AS group_id,
  count(cl.id) AS total_sessions,
  count(cl.id) FILTER (WHERE cl.attendance_data ? s.id::text) AS attended_sessions
FROM students s
JOIN group_students gs ON gs.student_id = s.id
JOIN groups g          ON g.id = gs.group_id AND g.deleted_at IS NULL
LEFT JOIN class_logs cl ON cl.group_id = gs.group_id AND cl.deleted_at IS NULL
GROUP BY s.id, gs.group_id;

CREATE OR REPLACE FUNCTION get_student_risk()
RETURNS TABLE (
  student_id uuid,
  group_id uuid,
  total_sessions int,
  attended_sessions int,
  attendance_rate numeric,   -- 0..1, NULL when total_sessions = 0
  recent_absences int,       -- leading run of consecutive most-recent missed sessions
  is_at_risk boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH ordered AS (
    SELECT
      gs.student_id,
      gs.group_id,
      (cl.attendance_data ? gs.student_id::text) AS present,
      row_number() OVER (
        PARTITION BY gs.student_id, gs.group_id
        ORDER BY cl.date DESC, cl.created_at DESC
      ) AS rn
    FROM group_students gs
    JOIN groups g          ON g.id = gs.group_id AND g.deleted_at IS NULL
    JOIN class_logs cl     ON cl.group_id = gs.group_id AND cl.deleted_at IS NULL
  ),
  streak AS (
    -- count only the leading all-absent prefix (most-recent sessions, no gaps)
    SELECT student_id, group_id, count(*) AS recent_absences
    FROM (
      SELECT o.*,
             bool_or(o.present) OVER (
               PARTITION BY o.student_id, o.group_id ORDER BY o.rn
             ) AS seen_present
      FROM ordered o
    ) t
    WHERE seen_present = false
    GROUP BY student_id, group_id
  ),
  agg AS (
    SELECT student_id, group_id,
           count(*) AS total_sessions,
           count(*) FILTER (WHERE present) AS attended_sessions
    FROM ordered
    GROUP BY student_id, group_id
  )
  SELECT
    a.student_id,
    a.group_id,
    a.total_sessions,
    a.attended_sessions,
    CASE WHEN a.total_sessions > 0
         THEN round(a.attended_sessions::numeric / a.total_sessions, 4)
         ELSE NULL END AS attendance_rate,
    COALESCE(st.recent_absences, 0) AS recent_absences,
    (
      COALESCE(st.recent_absences, 0) >= 3
      OR (a.total_sessions >= 4
          AND a.attended_sessions::numeric / a.total_sessions < 0.5)
    ) AS is_at_risk
  FROM agg a
  LEFT JOIN streak st USING (student_id, group_id);
$$;

-- Lock these down to intended roles only. CREATE VIEW / CREATE FUNCTION
-- auto-grant to PUBLIC (and thus anon) via default privileges; revoke that so
-- the public mentor form's `anon` role can never read student stats through
-- them. The portal edge functions call get_student_risk() as service_role.
GRANT SELECT ON student_attendance_stats TO authenticated;
REVOKE SELECT ON student_attendance_stats FROM anon;
GRANT EXECUTE ON FUNCTION get_student_risk() TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION get_student_risk() FROM PUBLIC, anon;
