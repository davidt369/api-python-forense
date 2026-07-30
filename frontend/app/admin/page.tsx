"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, FileText, Clock, CheckCircle2, AlertTriangle,
  Users, Eye, TrendingUp, MapPin, DollarSign,
  Activity, Zap, ArrowUpRight, ArrowDownRight, Minus,
  BarChart3, Fingerprint, RefreshCw
} from "lucide-react";
import Link from "next/link";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  Area, ComposedChart, Line,
} from "recharts";
import MapViewDynamic from "@/components/MapViewDynamic";
import { motion } from "framer-motion";
import { MagicCard } from "@/components/ui/magic-card";

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface AnalyticsData {
  summary: {
    totalEvidencias: number;
    pendientes: number;
    revisando: number;
    terminados: number;
    recepcionados: number;
    totalClientes: number;
    totalAnalisis: number;
    totalCertificados: number;
    ingresosTotales: number;
  };
  statusDistribution: { name: string; value: number; color: string }[];
  evidenciasPorMes: { mes: string; fecha: string; evidencias: number; ingresos: number }[];
  riesgoDistribution: { name: string; value: number; color: string }[];
  topClientes: { name: string; evidencias: number; ingresos: number }[];
  recentEvidencias: {
    id: string; originalName: string; status: string; createdAt: string;
    user?: { name: string }; analysis?: { elaScore: number; elaResult: string };
  }[];
  ubicacionesGPS: { lat: number; lng: number; name: string; evidenceId: string; elaResult?: string }[];
  tiempoPromedioHoras: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("es-BO");
const fmtBs = (n: number) =>
  n >= 1000 ? `Bs. ${(n / 1000).toFixed(1)}k` : `Bs. ${n.toFixed(0)}`;

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  PENDIENTE:    { label: "Pendiente",    dot: "bg-amber-400",   badge: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
  REVISANDO:    { label: "En Revisión",  dot: "bg-sky-400",     badge: "bg-sky-400/10 text-sky-400 border-sky-400/20" },
  TERMINADO:    { label: "Terminado",    dot: "bg-emerald-400", badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" },
  RECEPCIONADO: { label: "Recepcionado", dot: "bg-violet-400",  badge: "bg-violet-400/10 text-violet-400 border-violet-400/20" },
};

// Tooltip estilizado para recharts
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl text-sm">
      {label && <p className="font-semibold text-foreground mb-1.5">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold text-foreground">
            {p.dataKey === "ingresos" ? fmtBs(p.value) : fmt(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="space-y-7 animate-pulse">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-lg bg-muted" />
          <div className="h-4 w-80 rounded bg-muted/50" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-muted" />
          <div className="h-9 w-28 rounded-lg bg-muted" />
          <div className="h-9 w-28 rounded-lg bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted/40" />
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-muted/40" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-muted/40" />
        <div className="h-72 rounded-2xl bg-muted/40" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-64 rounded-2xl bg-muted/40" />
        <div className="h-64 rounded-2xl bg-muted/40" />
      </div>
    </div>
  );
}

// ─── Tarjeta KPI ─────────────────────────────────────────────────────────────
function KpiCard({
  label, value, icon: Icon, colorClass, bgClass, trend, trendLabel,
}: {
  label: string; value: string | number;
  icon: any; colorClass: string; bgClass: string;
  trend?: "up" | "down" | "flat"; trendLabel?: string;
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-muted-foreground";
  return (
    <MagicCard gradientColor="rgba(99,102,241,0.08)" className="rounded-2xl border-border/40 bg-card/60">
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground leading-tight">{label}</p>
          <div className={`${bgClass} ${colorClass} p-2 rounded-xl`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div>
          <p className="text-2xl font-black text-foreground tabular-nums">{value}</p>
          {trend && trendLabel && (
            <p className={`flex items-center gap-0.5 text-[10px] font-semibold mt-1 ${trendColor}`}>
              <TrendIcon className="w-3 h-3" />
              {trendLabel}
            </p>
          )}
        </div>
      </div>
    </MagicCard>
  );
}

// ─── Sección con header ───────────────────────────────────────────────────────
function Section({
  title, subtitle, icon: Icon, iconColor, children, className = "",
}: {
  title: string; subtitle?: string;
  icon: any; iconColor: string;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border/50 bg-card/60 flex flex-col ${className}`}>
      <div className="px-5 pt-5 pb-4 border-b border-border/30 flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-current/0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div>
          <h2 className="font-bold text-sm text-foreground">{title}</h2>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ─── Animaciones ──────────────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const spring = { type: "spring" as const, stiffness: 280, damping: 24 };

// ─── Dashboard principal ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) { router.push("/auth/login"); return; }
      setData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const completionRate = useMemo(() => {
    if (!data) return 0;
    const { terminados, recepcionados, totalEvidencias } = data.summary;
    return totalEvidencias > 0
      ? Math.round(((terminados + recepcionados) / totalEvidencias) * 100)
      : 0;
  }, [data]);

  if (loading) return <Skeleton />;
  if (!data) return null;

  const { summary, statusDistribution, evidenciasPorMes, riesgoDistribution, topClientes, ubicacionesGPS, recentEvidencias, tiempoPromedioHoras } = data;
  const pieData = statusDistribution.filter(d => d.value > 0);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} transition={spring} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Centro de Operaciones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Agencia de Análisis Forense Digital — métricas en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border/60 bg-card hover:bg-muted transition-colors text-muted-foreground disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Actualizar
          </button>
          <Link href="/admin/evidencias">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200">
              <Eye className="w-3.5 h-3.5" />
              Evidencias
            </span>
          </Link>
          <Link href="/admin/analisis">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all duration-200">
              <Activity className="w-3.5 h-3.5" />
              Análisis
            </span>
          </Link>
        </div>
      </motion.div>

      {/* KPIs principales */}
      <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Casos", value: fmt(summary.totalEvidencias), icon: FileText, colorClass: "text-blue-400", bgClass: "bg-blue-400/10" },
          { label: "Pendientes", value: fmt(summary.pendientes), icon: Clock, colorClass: "text-amber-400", bgClass: "bg-amber-400/10", trend: (summary.pendientes > 0 ? "up" : "flat") as "up"|"flat", trendLabel: summary.pendientes > 0 ? "Requieren acción" : "Sin pendientes" },
          { label: "En Revisión", value: fmt(summary.revisando), icon: Zap, colorClass: "text-sky-400", bgClass: "bg-sky-400/10" },
          { label: "Completados", value: fmt(summary.terminados + summary.recepcionados), icon: CheckCircle2, colorClass: "text-emerald-400", bgClass: "bg-emerald-400/10", trend: "up" as "up", trendLabel: `${completionRate}% tasa completado` },
          { label: "Clientes", value: fmt(summary.totalClientes), icon: Users, colorClass: "text-violet-400", bgClass: "bg-violet-400/10" },
          { label: "Ingresos", value: fmtBs(summary.ingresosTotales), icon: DollarSign, colorClass: "text-emerald-400", bgClass: "bg-emerald-400/10", trendLabel: "Pagos verificados" },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp} transition={spring}>
            <KpiCard {...kpi} />
          </motion.div>
        ))}
      </motion.div>

      {/* Métricas secundarias */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Tiempo Promedio", value: `${tiempoPromedioHoras}h`, sub: "Desde solicitud a resultado", dot: "bg-primary" },
          { label: "Análisis Forenses", value: fmt(summary.totalAnalisis), sub: "Total procesados por motores ELA", dot: "bg-sky-400" },
          { label: "Certificados", value: fmt(summary.totalCertificados), sub: "Documentos legales emitidos", dot: "bg-emerald-400" },
          { label: "Tasa Completado", value: `${completionRate}%`, sub: `${summary.terminados + summary.recepcionados} de ${summary.totalEvidencias} casos`, dot: "bg-violet-400" },
        ].map((m) => (
          <motion.div key={m.label} variants={fadeUp} transition={spring}>
            <div className="rounded-2xl border border-border/50 bg-card/60 p-4 flex items-center gap-4 h-full">
              <div className={`w-1 self-stretch rounded-full ${m.dot} opacity-80`} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{m.label}</p>
                <p className="text-xl font-black text-foreground mt-0.5 tabular-nums">{m.value}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5 leading-tight">{m.sub}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Area Chart + Pie */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Gráfico de área — flujo mensual con ingresos superpuestos */}
        <motion.div variants={fadeUp} transition={spring} className="lg:col-span-2">
          <Section title="Flujo Mensual de Evidencias" subtitle="Casos ingresados e ingresos verificados — últimos 7 meses" icon={TrendingUp} iconColor="text-blue-400" className="h-full">
            <div className="px-5 pb-5 pt-4">
              <div className="h-[270px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={evidenciasPorMes} margin={{ top: 4, right: 16, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradEv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#10b981" }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`} width={44} />
                    <Tooltip content={<DarkTooltip />} />
                    <Area yAxisId="left" type="monotone" dataKey="evidencias" name="Evidencias" stroke="#3b82f6" fill="url(#gradEv)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
                    <Line yAxisId="right" type="monotone" dataKey="ingresos" name="ingresos" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-5 mt-2">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="w-3 h-0.5 bg-blue-400 inline-block rounded" /> Evidencias
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="w-3 h-0.5 bg-emerald-400 inline-block rounded" /> Ingresos (Bs.)
                </span>
              </div>
            </div>
          </Section>
        </motion.div>

        {/* Pie — distribución de estados */}
        <motion.div variants={fadeUp} transition={spring} className="lg:col-span-1">
          <Section title="Distribución Operativa" subtitle={`${summary.totalEvidencias} casos en total`} icon={Activity} iconColor="text-primary" className="h-full">
            <div className="px-5 pb-5 pt-2">
              <div className="h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DarkTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                {statusDistribution.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                    <span className="text-[11px] text-muted-foreground truncate">{entry.name}</span>
                    <span className="text-[11px] font-bold text-foreground ml-auto tabular-nums">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </motion.div>
      </motion.div>

      {/* Riesgo ELA + Top Clientes */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Bar chart — niveles de riesgo */}
        <motion.div variants={fadeUp} transition={spring}>
          <Section title="Distribución de Riesgo ELA" subtitle={`${summary.totalAnalisis} análisis procesados`} icon={AlertTriangle} iconColor="text-amber-400" className="h-full">
            <div className="px-5 pb-5 pt-4 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riesgoDistribution} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} dy={8} />
                  <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="value" name="Casos" radius={[6, 6, 0, 0]} maxBarSize={56}>
                    {riesgoDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </motion.div>

        {/* Top clientes — barras de progreso horizontales */}
        <motion.div variants={fadeUp} transition={spring}>
          <Section title="Top 5 Clientes" subtitle="Por volumen de casos presentados" icon={Users} iconColor="text-violet-400" className="h-full">
            {topClientes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <Users className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">Sin datos de clientes</p>
              </div>
            ) : (
              <div className="px-5 pb-5 pt-4 space-y-4">
                {topClientes.map((c, i) => {
                  const max = topClientes[0]?.evidencias || 1;
                  const pct = Math.round((c.evidencias / max) * 100);
                  const hue = 258 + i * 14;
                  return (
                    <div key={c.name} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground truncate max-w-[160px]">{c.name}</span>
                        <div className="flex items-center gap-3 text-[11px] shrink-0">
                          <span className="text-muted-foreground"><b className="text-foreground tabular-nums">{c.evidencias}</b> casos</span>
                          <span className="text-emerald-400 font-semibold tabular-nums">{fmtBs(c.ingresos)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: `hsl(${hue}, 68%, 60%)` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </motion.div>
      </motion.div>

      {/* Mapa GPS + Feed reciente */}
      <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Mapa geoespacial */}
        <motion.div variants={fadeUp} transition={spring} className="lg:col-span-2">
          <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden flex flex-col h-full">
            <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-400/10">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-foreground">Monitoreo Geoespacial</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Coordenadas GPS extraídas de metadatos EXIF</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 font-mono tabular-nums">
                {ubicacionesGPS.length} señales
              </span>
            </div>
            <div className="flex-1 relative min-h-[380px]">
              {ubicacionesGPS.length > 0 ? (
                <div className="absolute inset-0">
                  <MapViewDynamic
                    locations={ubicacionesGPS.map((loc) => ({
                      lat: loc.lat, lng: loc.lng,
                      name: loc.name, evidenceId: loc.evidenceId, elaResult: loc.elaResult,
                    }))}
                    height="100%"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                  <MapPin className="w-10 h-10 mb-3 opacity-20" />
                  <p className="font-semibold text-sm text-foreground">Sin señales GPS activas</p>
                  <p className="text-xs mt-1 max-w-xs">
                    Las evidencias con coordenadas EXIF aparecen aquí automáticamente tras el análisis.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Feed de casos recientes */}
        <motion.div variants={fadeUp} transition={spring} className="lg:col-span-1">
          <div className="rounded-2xl border border-border/50 bg-card/60 flex flex-col h-full">
            <div className="px-5 py-4 border-b border-border/30 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-foreground">Casos Recientes</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">Últimas 10 evidencias</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[420px] divide-y divide-border/30">
              {recentEvidencias.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">Sin evidencias registradas</p>
                </div>
              ) : (
                recentEvidencias.map((ev) => {
                  const st = STATUS_CONFIG[ev.status] || { label: ev.status, dot: "bg-muted", badge: "bg-muted text-muted-foreground border-border" };
                  return (
                    <Link key={ev.id} href={`/admin/evidencias/${ev.id}`}>
                      <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer group">
                        <div className="flex-shrink-0 relative">
                          <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${st.dot}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {ev.originalName}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {ev.user?.name || "Cliente"} · {new Date(ev.createdAt).toLocaleDateString("es-BO", { day: "2-digit", month: "short" })}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {ev.analysis?.elaScore !== undefined && ev.analysis.elaScore !== null ? (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border tabular-nums ${
                              ev.analysis.elaScore > 50
                                ? "bg-red-400/10 text-red-400 border-red-400/20"
                                : ev.analysis.elaScore > 18
                                ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
                                : "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                            }`}>
                              {ev.analysis.elaScore.toFixed(1)}%
                            </span>
                          ) : (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${st.badge}`}>
                              {st.label.slice(0, 4)}.
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

    </motion.div>
  );
}
