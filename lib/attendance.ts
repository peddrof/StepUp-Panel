/**
 * Shared attendance + at-risk helpers.
 *
 * Source-of-truth split (deliberate, to avoid logic drift):
 *  - The AT-RISK FLAG is computed once in SQL by get_student_risk()
 *    (supabase/migrations/20260601120000_*). Both the dashboard and the People
 *    page call that RPC and pass its rows through buildRiskMap() here. The
 *    constants below mirror the SQL purely for labeling/reference.
 *  - The order-independent COUNTS (attended/total, rate) are computed in TS
 *    from raw class_logs the admin pages already hold in memory. These are pure
 *    membership counts, so TS and SQL agree by construction.
 *
 * Deno edge functions cannot import this module; they read the same numbers
 * from student_attendance_stats / get_student_risk() via the service role.
 */

// At-risk thresholds — keep in lockstep with get_student_risk() in
// supabase/migrations/20260601120000_attendance_stats_view_and_risk_rpc.sql
export const RISK_CONSECUTIVE_ABSENCES = 3;
export const RISK_MIN_SESSIONS = 4;
export const RISK_LOW_RATE = 0.5;

/** Minimal shape needed for the count helpers — a class_logs row. */
export interface AttendanceLog {
  attendance_data: unknown;
}

/** True if the student's id appears in this session's attendance array. */
export function isPresent(log: AttendanceLog, studentId: string): boolean {
  return (
    Array.isArray(log.attendance_data) &&
    (log.attendance_data as unknown[]).includes(studentId)
  );
}

/** Number of given sessions the student attended. */
export function attendedCount(logs: AttendanceLog[], studentId: string): number {
  return logs.reduce((n, log) => (isPresent(log, studentId) ? n + 1 : n), 0);
}

/** Attendance rate (0..1) over the given sessions, or null when there are none. */
export function attendanceRate(
  logs: AttendanceLog[],
  studentId: string
): number | null {
  if (logs.length === 0) return null;
  return attendedCount(logs, studentId) / logs.length;
}

// ---- Richer report detail (per-student status + engagement) ----

export type AttendanceStatus = "present" | "absent" | "late";

export interface AttendanceDetailEntry {
  student_id: string;
  status: AttendanceStatus;
  engagement: number | null;
}

// ---- Risk (fed by the get_student_risk() RPC) ----

export type RiskReason = "consecutive" | "low_rate";

/** The minimal risk fields needed to label a verdict (a StudentRiskRow subset). */
export interface RiskSignals {
  is_at_risk: boolean;
  recent_absences: number;
  attendance_rate: number | null;
}

/** One row of get_student_risk(): risk per (student, group). */
export interface StudentRiskRow {
  student_id: string;
  group_id: string;
  total_sessions: number;
  attended_sessions: number;
  attendance_rate: number | null;
  recent_absences: number;
  is_at_risk: boolean;
}

/** Aggregated risk verdict for a student across all their groups. */
export interface StudentRisk {
  atRisk: boolean;
  reason: RiskReason | null;
  /** Human-readable explanation, e.g. "3 absences in a row" / "42% attendance". */
  label: string | null;
  /** The group driving the verdict (the worst one), for display. */
  groupId: string | null;
}

function reasonFor(row: RiskSignals): RiskReason | null {
  if (!row.is_at_risk) return null;
  if (row.recent_absences >= RISK_CONSECUTIVE_ABSENCES) return "consecutive";
  return "low_rate";
}

export function riskLabel(row: RiskSignals): string | null {
  const reason = reasonFor(row);
  if (reason === "consecutive") {
    return `${row.recent_absences} absences in a row`;
  }
  if (reason === "low_rate" && row.attendance_rate !== null) {
    return `${Math.round(row.attendance_rate * 100)}% attendance`;
  }
  return null;
}

/**
 * Collapse per-(student, group) RPC rows into one verdict per student.
 * A student is at risk if any of their groups is flagged; we surface the most
 * urgent reason (consecutive absences over low rate, then the worst figure).
 */
export function buildRiskMap(rows: StudentRiskRow[]): Map<string, StudentRisk> {
  const byStudent = new Map<string, StudentRiskRow[]>();
  rows.forEach((row) => {
    const list = byStudent.get(row.student_id);
    if (list) list.push(row);
    else byStudent.set(row.student_id, [row]);
  });

  const result = new Map<string, StudentRisk>();
  byStudent.forEach((studentRows, studentId) => {
    const flagged = studentRows.filter((r) => r.is_at_risk);
    if (flagged.length === 0) {
      result.set(studentId, {
        atRisk: false,
        reason: null,
        label: null,
        groupId: null,
      });
      return;
    }
    // Most urgent: consecutive first (by absences desc), else lowest rate.
    const worst = flagged.slice().sort((a, b) => {
      const ra = reasonFor(a);
      const rb = reasonFor(b);
      if (ra === "consecutive" && rb !== "consecutive") return -1;
      if (rb === "consecutive" && ra !== "consecutive") return 1;
      if (ra === "consecutive") return b.recent_absences - a.recent_absences;
      return (a.attendance_rate ?? 1) - (b.attendance_rate ?? 1);
    })[0];

    result.set(studentId, {
      atRisk: true,
      reason: reasonFor(worst),
      label: riskLabel(worst),
      groupId: worst.group_id,
    });
  });
  return result;
}
