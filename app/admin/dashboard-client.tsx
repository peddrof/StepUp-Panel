"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
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

interface DashboardData {
  totalStudents: number;
  totalMentors: number;
  activeGroups: number;
  classesThisWeek: number;
  classLogs: any[];
  groupStudents: any[];
}

type DateFilter = "7d" | "30d" | "90d";

const kpiCards = [
  {
    key: "totalStudents",
    label: "Total Students",
    trend: "+12.5%",
    trendUp: true,
    subtitle: "Growing steadily",
    description: "Enrollment exceeds targets",
  },
  {
    key: "totalMentors",
    label: "Total Mentors",
    trend: "+8.2%",
    trendUp: true,
    subtitle: "Stable recruitment",
    description: "Strong mentor retention",
  },
  {
    key: "activeGroups",
    label: "Active Groups",
    trend: "+15.3%",
    trendUp: true,
    subtitle: "Expanding capacity",
    description: "New groups launched",
  },
  {
    key: "classesThisWeek",
    label: "Classes This Week",
    trend: "-5%",
    trendUp: false,
    subtitle: "Below average",
    description: "Holiday period impact",
  },
] as const;

const filterOptions: Array<{ value: DateFilter; label: string; days: number }> = [
  { value: "90d", label: "Last 3 months", days: 90 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "7d", label: "Last 7 days", days: 7 },
];

export function DashboardClient({ data }: { data: DashboardData }) {
  const [activeFilter, setActiveFilter] = useState<DateFilter>("90d");

  const attendanceChartData = useMemo(() => {
    const option = filterOptions.find((f) => f.value === activeFilter)!;
    const cutoff = subDays(new Date(), option.days);

    const filtered = data.classLogs.filter(
      (log: any) => new Date(log.date) >= cutoff
    );

    const byLevel: Record<string, { total: number; attended: number }> = {};

    filtered.forEach((log: any) => {
      const group = log.group as { level: string; id: string } | null;
      if (!group) return;

      const level = group.level;
      const groupId = group.id;

      const studentsInGroup = data.groupStudents.filter(
        (gs: any) => gs.group_id === groupId
      );
      const totalStudents = studentsInGroup.length;
      const attendedStudents = Array.isArray(log.attendance_data)
        ? (log.attendance_data as string[]).length
        : 0;

      if (!byLevel[level]) byLevel[level] = { total: 0, attended: 0 };
      byLevel[level].total += totalStudents;
      byLevel[level].attended += attendedStudents;
    });

    return Object.entries(byLevel).map(([level, d]) => ({
      level,
      rate: d.total > 0 ? Math.round((d.attended / d.total) * 100) : 0,
    }));
  }, [data.classLogs, data.groupStudents, activeFilter]);

  const activeOption = filterOptions.find((f) => f.value === activeFilter)!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your English teaching program"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <Card key={card.key} className="border-gray-200 shadow-sm">
            <CardContent className="p-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {card.label}
                  </span>
                  <div
                    className={`flex items-center gap-0.5 text-xs font-medium ${
                      card.trendUp ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {card.trendUp ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{card.trend}</span>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-gray-900">
                    {data[card.key].toLocaleString()}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-900 font-medium mb-0.5">
                    <span>{card.subtitle}</span>
                    <ArrowUpRight className="h-3 w-3 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
            {attendanceChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                No class data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={attendanceChartData}
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
