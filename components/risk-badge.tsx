import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Red "at risk" pill used in the dashboard, People table, and mentor portal.
 * `label` is the human reason (e.g. "3 absences in a row"); falls back to a
 * generic label when not provided.
 */
export function RiskBadge({ label }: { label?: string | null }) {
  return (
    <Badge className="gap-1 bg-red-100 text-red-700 hover:bg-red-100">
      <AlertTriangle className="h-3 w-3" />
      {label || "At risk"}
    </Badge>
  );
}
