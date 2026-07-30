import React from "react";
import PortalLayout from "@/app/components/PortalLayout";
import { Skeleton } from "boneyard-js/react";

export default function NuevaSolicitudLoading() {
  return (
    <PortalLayout>
      <Skeleton name="nueva-solicitud-main" loading={true}>
        <div />
      </Skeleton>
    </PortalLayout>
  );
}
