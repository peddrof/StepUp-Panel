-- Make mentor email optional (nullable).
-- The column remains UNIQUE so duplicate emails are still prevented when present;
-- multiple NULLs are allowed in PostgreSQL UNIQUE columns.
ALTER TABLE mentors
  ALTER COLUMN email DROP NOT NULL;
