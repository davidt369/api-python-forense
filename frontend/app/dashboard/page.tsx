import React from "react";
import PortalLayout from "@/app/components/PortalLayout";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { getServerUser } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import {
  FolderSearch,
  PlusCircle,
  Clock,
  CheckCircle2,
  Search,
  Inbox,
  BarChart3,
  CreditCard,
  Eye,
  Activity,
  FileBadge
} from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import EvidenceImage from "@/components/EvidenceImage";
import { Skeleton } from "boneyard-js/react";
import { MagicCard } from "@/components/ui/magic-card";
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
      <Skeleton name="dashboard-main" loading={false}>
        <DashboardClient user={user} evidencias={evidencias} counts={counts} />
      </Skeleton>
    </PortalLayout>
  );
}
