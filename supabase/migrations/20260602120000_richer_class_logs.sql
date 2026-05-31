/*
  # Richer mentor class reports (additive, back-compatible)

  Adds two optional columns to class_logs. The existing attendance_data
  (a JSON array of present student-ids) stays the canonical present-list, so
  every existing stat, the student_attendance_stats view, and get_student_risk()
  keep working unchanged.

    - homework: free-text assignment given for the session.
    - attendance_detail: optional JSON array of per-student detail,
        [{ student_id: uuid, status: 'present'|'absent'|'late', engagement: 1..5|null }].

  When a report supplies attendance_detail, the submit-mentor-report edge
  function derives attendance_data from the rows whose status <> 'absent', so
  the binary present-list and the detailed list never disagree. Reports that
  don't supply it behave exactly as before.

  No RLS change: both columns inherit the existing class_logs policies.
*/

ALTER TABLE class_logs ADD COLUMN IF NOT EXISTS homework text;
ALTER TABLE class_logs ADD COLUMN IF NOT EXISTS attendance_detail jsonb;
