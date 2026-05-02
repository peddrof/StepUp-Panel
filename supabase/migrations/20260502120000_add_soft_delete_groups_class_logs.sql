/*
  # Soft delete for groups and class_logs

  Hard deletes were destroying historical attendance data the NGO needs
  for funding and reporting. Adds nullable deleted_at columns to groups
  and class_logs. Application code soft-deletes by setting the timestamp
  and filters all reads with `deleted_at IS NULL`. Manual restore is
  done by clearing the column.

  group_students intentionally keeps no deleted_at: when its parent
  group is soft-deleted the rows become unreachable through the UI but
  remain available for restore.
*/

ALTER TABLE groups ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE class_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
