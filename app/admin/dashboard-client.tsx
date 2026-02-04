"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
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
  attendanceChartData: Array<{ level: string; rate: number }>;
}

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

export function DashboardClient({ data }: { data: DashboardData }) {
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
                Total for the last 3 months
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
                Last 3 months
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
                Last 30 days
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
                Last 7 days
              </button>
            </div>
          </div>
        </div>
        <CardContent className="pt-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.attendanceChartData}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
