"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { AlertCircle } from "lucide-react";
import { subDays } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface AtRiskStudent {
  id: string;
  name: string;
  groupName: string | null;
  label: string | null;
}

interface DashboardData {
  totalStudents: number;
  totalMentors: number;
  activeGroups: number;
  classesThisWeek: number;
  classLogs: any[];
  groupStudents: any[];
  atRiskStudents: AtRiskStudent[];
}

type DateFilter = "7d" | "30d" | "90d";

const filterOptions: Array<{ value: DateFilter; label: string; days: number }> = [
  { value: "90d", label: "Last 3 months", days: 90 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "7d", label: "Last 7 days", days: 7 },
];

export function DashboardClient({ data }: { data: DashboardData }) {
  const [activeFilter, setActiveFilter] = useState<DateFilter>("90d");

  const attendance = useMemo(() => {
    const option = filterOptions.find((f) => f.value === activeFilter)!;
    const cutoff = subDays(new Date(), option.days);

    const filtered = data.classLogs.filter(
      (log: any) => new Date(log.date) >= cutoff
    );

    const byLevel: Record<string, { total: number; attended: number }> = {};
    let programTotal = 0;
    let programAttended = 0;

    filtered.forEach((log: any) => {
      const group = log.group as { level: string; id: string } | null;
      if (!group) return;

      const totalStudents = data.groupStudents.filter(
        (gs: any) => gs.group_id === group.id
      ).length;
      const attendedStudents = Array.isArray(log.attendance_data)
        ? (log.attendance_data as string[]).length
        : 0;

      if (!byLevel[group.level]) byLevel[group.level] = { total: 0, attended: 0 };
      byLevel[group.level].total += totalStudents;
      byLevel[group.level].attended += attendedStudents;

      programTotal += totalStudents;
      programAttended += attendedStudents;
    });

    const chart = Object.entries(byLevel).map(([level, d]) => ({
      level,
      rate: d.total > 0 ? Math.round((d.attended / d.total) * 100) : 0,
    }));

    return {
      chart,
      programRate:
        programTotal > 0
          ? Math.round((programAttended / programTotal) * 100)
          : null,
    };
  }, [data.classLogs, data.groupStudents, activeFilter]);

  const activeOption = filterOptions.find((f) => f.value === activeFilter)!;

  const kpiCards = [
    { label: "Total Students", value: data.totalStudents.toLocaleString() },
    { label: "Total Mentors", value: data.totalMentors.toLocaleString() },
    { label: "Active Groups", value: data.activeGroups.toLocaleString() },
    {
      label: `Attendance · ${activeOption.label}`,
      value: attendance.programRate === null ? "—" : `${attendance.programRate}%`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your English teaching program"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <Card key={card.label} className="border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <div className="space-y-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {card.label}
                </span>
                <p className="text-3xl font-semibold text-gray-900">
                  {card.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-gray-200 shadow-sm">
        <div className="p-6 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <h3 className="text-base font-semibold text-gray-900">
              Needs attention
            </h3>
          </div>
          {data.atRiskStudents.length > 0 && (
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
              {data.atRiskStudents.length}
            </Badge>
          )}
        </div>
        <CardContent className="pt-0">
          {data.atRiskStudents.length === 0 ? (
            <p className="text-sm text-gray-400">
              No students currently flagged.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.atRiskStudents.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/students/${s.id}`}
                  className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-gray-50"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium text-gray-900">
                      {s.name}
                    </span>
                    {s.groupName && (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-sky-800 text-sky-800"
                      >
                        {s.groupName}
                      </Badge>
                    )}
                  </div>
                  {s.label && (
                    <span className="shrink-0 text-sm text-red-600">
                      {s.label}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Attendance Rate by Level
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {activeOption.label}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeFilter === opt.value
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <CardContent className="pt-6">
          <div className="h-80">
            {attendance.chart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                No class data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={attendance.chart}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis
                    dataKey="level"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Attendance"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#374151", fontWeight: 500 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#6b7280"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRate)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
