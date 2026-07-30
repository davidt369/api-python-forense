"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import {
  FolderSearch,
  PlusCircle,
  Clock,
  CheckCircle2,
  Search,
  BarChart3,
  CreditCard,
  Eye,
  Activity,
  FileBadge
} from "lucide-react";
import EvidenceImage from "@/components/EvidenceImage";
import { MagicCard } from "@/components/ui/magic-card";
import { motion } from "framer-motion";

export const DashboardClient = ({
  user,
  evidencias,
  counts,
}: {
  user: any;
  evidencias: any[];
  counts: any;
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDIENTE":
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-semibold border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
            <Clock className="w-3.5 h-3.5" />
            Pendiente pago
          </span>
        );
      case "REVISANDO":
        return (
          <span className="inline-flex items-center gap-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 px-3 py-1 rounded-full text-xs font-semibold border border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]">
            <Search className="w-3.5 h-3.5" />
            En revisión
          </span>
        );
      case "TERMINADO":
      case "RECEPCIONADO":
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-semibold border border-border">
            <Activity className="w-3.5 h-3.5" />
            {status}
          </span>
        );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Bento */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Bienvenido, {user.name?.split(" ")[0] || "Usuario"}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Panel de control de análisis forense digital
          </p>
        </div>
        <Link href="/dashboard/nueva-solicitud">
          <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
            <PlusCircle className="w-4 h-4 mr-2" />
            Nueva Solicitud
          </Button>
        </Link>
      </div>

      {/* Tarjetas Bento de Resumen */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Total Solicitudes", value: counts.total, icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Pendientes Pago", value: counts.pendientes, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "En Revisión", value: counts.revisando, icon: Search, color: "text-sky-400", bg: "bg-sky-500/10" },
          { label: "Completados", value: counts.terminados, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={itemVariants}>
              <MagicCard gradientColor="rgba(var(--primary), 0.15)" className="rounded-2xl border-border/40 bg-card/40 backdrop-blur-md h-full">
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-black text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.bg} p-3.5 rounded-2xl ${stat.color} shadow-inner`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </MagicCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Lista Horizontal (Bento Data List) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FolderSearch className="w-5 h-5 text-primary" />
          Mis Evidencias Recientes
        </h2>

        {evidencias.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-4 bg-muted/10 rounded-3xl border border-dashed border-border/60 flex flex-col items-center justify-center gap-5 transition-all hover:bg-muted/20 backdrop-blur-sm"
          >
            <div className="p-5 bg-primary/10 rounded-full text-primary shadow-[0_0_30px_rgba(var(--primary),0.2)]">
              <FolderSearch className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground">
                Panel Vacío
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2 leading-relaxed">
                Aún no has enviado ninguna evidencia digital para análisis. Inicia un nuevo flujo para comenzar.
              </p>
            </div>
            <Link href="/dashboard/nueva-solicitud">
              <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                <PlusCircle className="w-5 h-5 mr-2" />
                Iniciar Análisis
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-3"
          >
            {evidencias.map((evidence: any) => (
              <motion.div
                key={evidence.id}
                variants={itemVariants}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-md hover:bg-card/60 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-center gap-5 w-full sm:w-auto mb-4 sm:mb-0">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden ring-1 ring-border/50 group-hover:ring-primary/50 transition-colors shadow-inner bg-muted/50 flex-shrink-0">
                    <EvidenceImage
                      src={evidence.imagePath}
                      alt={evidence.originalName}
                      thumbnail
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-base group-hover:text-primary transition-colors line-clamp-1">
                      {evidence.originalName}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(evidence.createdAt).toLocaleDateString("es-BO")}</span>
                      <span className="text-border text-[10px]">|</span>
                      <span className="truncate max-w-[120px] sm:max-w-[200px]" title={evidence.id}>ID: {evidence.id.split("").slice(-6).join("")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pl-21 sm:pl-0">
                  <div className="flex-shrink-0">
                    {getStatusBadge(evidence.status)}
                  </div>
                  
                  <div className="flex-shrink-0">
                    {evidence.status === "PENDIENTE" ? (
                      <Link href={`/dashboard/pagar/${evidence.id}`}>
                        <Button size="sm" className="rounded-lg shadow-md shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 text-white">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Bs. {evidence.amount}
                        </Button>
                      </Link>
                    ) : evidence.status === "TERMINADO" || evidence.status === "RECEPCIONADO" ? (
                      <Link href={`/dashboard/evidencias/${evidence.id}`}>
                        <Button size="sm" variant="outline" className="rounded-lg hover:bg-primary hover:text-primary-foreground border-primary/20">
                          <FileBadge className="w-4 h-4 mr-2" />
                          Resultados
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" variant="secondary" className="rounded-lg opacity-50 cursor-not-allowed">
                        <Activity className="w-4 h-4 mr-2" />
                        Procesando
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
