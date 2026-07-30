import React from "react";
import PortalLayout from "@/app/components/PortalLayout";
import { Skeleton } from "boneyard-js/react";

export default function DashboardLoading() {
  return (
    <PortalLayout>
      <Skeleton name="dashboard-main" loading={true}>
        <div />
      </Skeleton>
    </PortalLayout>
  );
}
