import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

function HeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
  );
}

function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-0">
        <div className="flex gap-4 border-b border-gray-100 bg-gray-50 px-4 py-3">
          {range(cols).map((c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
        <div className="divide-y divide-gray-100">
          {range(rows).map((r) => (
            <div key={r} className="flex gap-4 px-4 py-3.5">
              {range(cols).map((c) => (
                <Skeleton key={c} className="h-4 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {range(4).map((i) => (
          <Card key={i} className="border-gray-200 shadow-sm">
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-5 w-40" />
          {range(3).map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function PeopleSkeleton() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-24" />
      </div>
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}

export function GroupsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {range(6).map((i) => (
          <Card key={i} className="border-gray-200">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2 border-t pt-3">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-1">
                  {range(4).map((j) => (
                    <Skeleton key={j} className="h-5 w-12 rounded" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ClassLogsSkeleton() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <Skeleton className="h-9 w-72" />
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}

export function StudentDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-28" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {range(3).map((i) => (
          <Card key={i} className="border-gray-200 shadow-sm">
            <CardContent className="space-y-2 p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-48" />
        <Card className="border-gray-200">
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
