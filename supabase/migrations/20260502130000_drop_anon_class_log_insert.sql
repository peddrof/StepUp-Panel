/*
  # Drop anon INSERT on class_logs

  The base schema allowed any anonymous client to POST directly to
  /rest/v1/class_logs and insert rows, bypassing the PIN check that the
  submit-mentor-report Edge Function enforces. The Edge Function uses
  the service role key and is unaffected by this policy.

  After this migration, the only paths that can write to class_logs are:
  - the Edge Function (service role)
  - authenticated admins (existing policy)
*/

DROP POLICY IF EXISTS "Public can insert class logs" ON class_logs;
