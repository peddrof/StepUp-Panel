import { format } from "date-fns";
import { attendedCount, isPresent, type AttendanceLog } from "@/lib/attendance";

interface MatrixStudent {
  id: string;
  name: string;
}

type MatrixLog = AttendanceLog & {
  id: string;
  date: string;
};

/**
 * Students (rows) × sessions (columns) attendance grid with a per-student
 * total. Shared by the group-details modal (full roster) and the per-student
 * admin view (a single row). Present/absent logic comes from lib/attendance.
 */
export function AttendanceMatrix({
  students,
  logs,
}: {
  students: MatrixStudent[];
  logs: MatrixLog[];
}) {
  if (logs.length === 0) {
    return <p className="text-sm text-gray-500 italic">No classes recorded yet</p>;
  }
  if (students.length === 0) {
    return <p className="text-sm text-gray-500 italic">No students enrolled</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="text-sm w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="sticky left-0 z-10 bg-gray-50 text-left font-medium text-gray-700 px-3 py-2 min-w-[140px] border-r border-gray-200">
              Student
            </th>
            {logs.map((log) => (
              <th
                key={log.id}
                className="text-center font-medium text-gray-500 px-2 py-2 min-w-[52px] whitespace-nowrap"
              >
                {format(new Date(log.date + "T00:00:00"), "MMM d")}
              </th>
            ))}
            <th className="text-center font-semibold text-gray-700 px-3 py-2 min-w-[52px] border-l border-gray-200">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, i) => {
            const attended = attendedCount(logs, student.id);
            return (
              <tr key={student.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td
                  className="sticky left-0 z-10 font-medium text-gray-900 px-3 py-2 border-r border-gray-200 whitespace-nowrap"
                  style={{ backgroundColor: i % 2 === 0 ? "white" : "#f9fafb" }}
                >
                  {student.name}
                </td>
                {logs.map((log) => {
                  const present = isPresent(log, student.id);
                  return (
                    <td key={log.id} className="text-center px-2 py-2">
                      {present ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-300">·</span>
                      )}
                    </td>
                  );
                })}
                <td className="text-center px-3 py-2 font-medium text-gray-700 border-l border-gray-200">
                  {attended}/{logs.length}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
