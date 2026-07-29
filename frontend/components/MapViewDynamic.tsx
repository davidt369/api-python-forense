"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <Skeleton className="w-full h-full min-h-[300px] rounded-xl" />
  ),
});

export default MapView;
