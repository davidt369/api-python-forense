import React from "react";
import PortalLayout from "@/app/components/PortalLayout";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { getServerUser } from "@/app/lib/auth";
import { redirect } from "next/navigation";

import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getServerUser();

  if (!user) {
    redirect("/auth/login");
  }

  const evidencias = await prisma.evidence.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    pendientes: evidencias.filter((e) => e.status === "PENDIENTE").length,
    revisando: evidencias.filter((e) => e.status === "REVISANDO").length,
    terminados: evidencias.filter(
      (e) => e.status === "TERMINADO" || e.status === "RECEPCIONADO"
    ).length,
    total: evidencias.length,
  };

  return (
    <PortalLayout>
        <DashboardClient user={user} evidencias={evidencias} counts={counts} />
    </PortalLayout>
  );
}
