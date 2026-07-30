import React from "react";
import PortalLayout from "@/app/components/PortalLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function NuevaSolicitudLoading() {
  return (
    <PortalLayout>
      <div className="max-w-3xl mx-auto space-y-8 mt-4">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Skeleton className="w-12 h-12 rounded-full bg-muted/60" />
          <Skeleton className="h-8 w-64 rounded-lg bg-muted/60" />
          <Skeleton className="h-5 w-96 max-w-full rounded-lg bg-muted/40" />
        </div>

        {/* Card Form */}
        <div className="border border-border/40 bg-card/40 rounded-3xl overflow-hidden p-6 sm:p-10 space-y-8">
          
          {/* Dropzone */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-32 rounded bg-muted/60" />
            <div className="h-48 w-full border-2 border-dashed border-border/60 bg-muted/10 rounded-2xl flex flex-col items-center justify-center space-y-3">
               <Skeleton className="w-12 h-12 rounded-full bg-muted/40" />
               <Skeleton className="h-4 w-48 rounded bg-muted/40" />
               <Skeleton className="h-3 w-32 rounded bg-muted/20" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4 pt-4">
            <div className="flex justify-between">
               <Skeleton className="h-4 w-40 rounded bg-muted/60" />
               <Skeleton className="h-3 w-16 rounded bg-muted/40" />
            </div>
            <Skeleton className="h-32 w-full rounded-xl border border-border/40 bg-muted/20" />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Skeleton className="h-10 w-24 rounded-xl bg-muted/40" />
            <Skeleton className="h-10 w-36 rounded-xl bg-muted/60" />
          </div>

        </div>
      </div>
    </PortalLayout>
  );
}
