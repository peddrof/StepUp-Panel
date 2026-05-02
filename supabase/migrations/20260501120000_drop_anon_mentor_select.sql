/*
  # Close mentor PIN leak

  The mentor-report page previously joined mentors via the Supabase JS
  client, exposing pin_code to any anonymous browser visiting the page.
  Two anon SELECT policies on `mentors` allowed this. Both are dropped
  here. The Edge Function (`submit-mentor-report`) uses the service role
  key and is unaffected; it continues to look up and verify pins
  server-side.

  Frontend was updated in tandem to stop fetching mentors at all from
  the public report page.
*/

DROP POLICY IF EXISTS "Public can read mentors for verification" ON mentors;
DROP POLICY IF EXISTS "Public users can read mentors" ON mentors;
