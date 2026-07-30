import React from "react";
import PortalLayout from "@/app/components/PortalLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <PortalLayout>
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
          <div className="space-y-3">
            <Skeleton className="h-9 w-64 rounded-lg bg-muted/60" />
            <Skeleton className="h-5 w-80 rounded-lg bg-muted/40" />
          </div>
          <Skeleton className="h-10 w-44 rounded-xl bg-muted/60" />
        </div>

        {/* 4 Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl border border-border/40 bg-card/40 flex items-center justify-between p-5">
              <div className="space-y-3">
                <Skeleton className="h-3 w-20 rounded bg-muted/60" />
                <Skeleton className="h-8 w-12 rounded bg-muted/60" />
              </div>
              <Skeleton className="h-12 w-12 rounded-2xl bg-muted/40" />
            </div>
          ))}
        </div>

        {/* List Skeleton */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded-md bg-muted/60" />
            <Skeleton className="h-6 w-56 rounded-lg bg-muted/60" />
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 md:h-20 w-full rounded-2xl border border-border/40 bg-card/40 flex items-center p-4">
                <Skeleton className="h-12 w-12 rounded-xl bg-muted/60 shrink-0" />
                <div className="ml-4 space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4 rounded bg-muted/60" />
                  <Skeleton className="h-3 w-1/3 rounded bg-muted/40" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full shrink-0 bg-muted/60" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
