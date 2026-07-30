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
} from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import EvidenceImage from "@/components/EvidenceImage";
import { Skeleton } from "boneyard-js/react";
import { MagicCard } from "@/components/ui/magic-card";

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDIENTE":
        return (
          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded text-xs font-medium border border-amber-500/20">
            Pendiente pago
          </span>
        );
      case "REVISANDO":
        return (
          <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded text-xs font-medium border border-sky-500/20">
            En revisión
          </span>
        );
      case "TERMINADO":
        return (
          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-medium border border-emerald-500/20">
            Análisis completado
          </span>
        );
      default:
        return (
          <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-medium border border-border">
            {status}
          </span>
        );
    }
  };

  return (
    <PortalLayout>
      <Skeleton name="dashboard-main" loading={false}>
      <div className="space-y-6 animate-fade-in">
        {/* Bienvenida */}
        <div>
          <h1 className="text-2xl font-bold">
            Bienvenido, {user.name?.split(" ")[0] || "Usuario"}
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus solicitudes de análisis forense digital
          </p>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Solicitudes",
              value: counts.total,
              icon: BarChart3,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              label: "Pendientes Pago",
              value: counts.pendientes,
              icon: Clock,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
            },
            {
              label: "En Revisión",
              value: counts.revisando,
              icon: Search,
              color: "text-sky-400",
              bg: "bg-sky-500/10",
            },
            {
              label: "Completados",
              value: counts.terminados,
              icon: CheckCircle2,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <MagicCard key={stat.label} gradientColor="rgba(var(--primary), 0.1)" className="rounded-xl border border-border bg-card">
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-2xl sm:text-3xl font-extrabold mt-1 text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`${stat.bg} p-3 rounded-xl ${stat.color} shadow-sm`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </MagicCard>
            );
          })}
        </div>

        {/* Tabla de solicitudes */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              Mis solicitudes
            </h2>
            <Link href="/dashboard/nueva-solicitud">
              <Button size="sm" className="w-full sm:w-auto">
                <PlusCircle className="w-4 h-4 mr-2" />
                Nueva solicitud
              </Button>
            </Link>
          </div>

          {evidencias.length === 0 ? (
            <div className="text-center py-16 px-4 bg-muted/20 rounded-xl border border-dashed border-border mt-4 flex flex-col items-center justify-center gap-4 transition-all hover:bg-muted/30">
              <div className="p-4 bg-primary/10 rounded-full text-primary mb-2 shadow-sm animate-pulse">
                <FolderSearch className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1 text-foreground">
                  No tienes solicitudes pendientes
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
                  Aún no has enviado ninguna evidencia digital para análisis.
                  Crea tu primera solicitud para comenzar.
                </p>
              </div>
              <Link href="/dashboard/nueva-solicitud">
                <Button className="shadow-lg shadow-primary/20">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Crear primera solicitud
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto w-full max-w-full rounded-xl border border-border mt-4 shadow-sm">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-muted/80 backdrop-blur-md border-b border-border text-muted-foreground uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Evidencia</th>
                    <th className="px-5 py-4">Fecha</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {evidencias.map((evidence: any) => (
                    <tr
                      key={evidence.id}
                      className="hover:bg-muted/50 transition-colors group"
                    >
                      <td className="px-5 py-4 font-medium">
                        <div className="flex items-center gap-4">
                          <EvidenceImage
                          src={evidence.imagePath}
                          alt={evidence.originalName}
                          thumbnail
                        />
                          <span className="truncate max-w-[200px] text-foreground font-semibold group-hover:text-primary transition-colors">
                            {evidence.originalName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground font-medium">
                        {new Date(evidence.createdAt).toLocaleDateString(
                          "es-BO"
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {getStatusBadge(evidence.status)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {evidence.status === "PENDIENTE" ? (
                          <Link href={`/dashboard/pagar/${evidence.id}`}>
                            <Button size="sm">
                              Pagar (Bs. {evidence.amount})
                            </Button>
                          </Link>
                        ) : evidence.status === "TERMINADO" ||
                          evidence.status === "RECEPCIONADO" ? (
                          <Link
                            href={`/dashboard/evidencias/${evidence.id}`}
                          >
                            <Button size="sm" variant="outline">
                              Ver resultado
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            En proceso
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </Skeleton>
    </PortalLayout>
  );
}
