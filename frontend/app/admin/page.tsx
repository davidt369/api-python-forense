"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, FileText, Clock, CheckCircle2, AlertTriangle,
  Users, Search, Eye, TrendingUp, BarChart3, MapPin, DollarSign,
  Activity, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  AreaChart, Area,
} from "recharts";
import MapViewDynamic from "@/components/MapViewDynamic";

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) { router.push("/auth/login"); return; }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { summary, statusDistribution, evidenciasPorMes, riesgoDistribution, topClientes, ubicacionesGPS, recentEvidencias, tiempoPromedioHoras } = data;

  const COLORS = {
    Pendiente: "#f59e0b",
    "En Revisión": "#3b82f6",
    Completado: "#10b981",
    Recepcionado: "#8b5cf6",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Dashboard analítico de la Agencia de Análisis Forense Digital
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Casos", value: summary.totalEvidencias, icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Pendientes", value: summary.pendientes, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "En Revisión", value: summary.revisando, icon: Search, color: "text-sky-400", bg: "bg-sky-500/10" },
          { label: "Completados", value: summary.terminados + summary.recepcionados, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Clientes", value: summary.totalClientes, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Ingresos", value: `Bs.${summary.ingresosTotales}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                    <p className="text-xl font-bold mt-0.5">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-2 rounded-lg ${stat.color} flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Distribución de Estados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry: any) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2 flex-wrap">
              {statusDistribution.map((entry: any) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-muted-foreground">{entry.name}: <strong>{entry.value}</strong></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Area Chart - Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Evidencias por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evidenciasPorMes}>
                  <defs>
                    <linearGradient id="colorEv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="evidencias"
                    stroke="#3b82f6"
                    fill="url(#colorEv)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart - Risk */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-primary" />
              Niveles de Riesgo ELA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riesgoDistribution}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {riesgoDistribution.map((entry: any) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Top Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClientes} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip />
                  <Bar dataKey="evidencias" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GPS Map */}
      {ubicacionesGPS?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Mapa de Ubicaciones GPS ({ubicacionesGPS.length} evidencias geolocalizadas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <MapViewDynamic
                locations={ubicacionesGPS.map((loc: any) => ({
                  lat: loc.lat,
                  lng: loc.lng,
                  name: loc.name,
                  evidenceId: loc.evidenceId,
                  elaResult: loc.elaResult,
                }))}
                height="400px"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tiempo Promedio", value: `${tiempoPromedioHoras}h`, icon: Clock, desc: "De solicitud a resultado" },
          { label: "Análisis Realizados", value: summary.totalAnalisis, icon: Zap, desc: "Total procesados" },
          { label: "Certificados", value: summary.totalCertificados, icon: Shield, desc: "Emitidos" },
          { label: "% Manipulación", value: `${riesgoDistribution[2]?.value || 0}`, icon: AlertTriangle, desc: "Alto riesgo detectado" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-xl">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Acciones rápidas */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/admin/evidencias">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            <Eye className="w-4 h-4" />
            Ver todas las evidencias
          </span>
        </Link>
        <Link href="/admin/analisis">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
            <Activity className="w-4 h-4" />
            Ver análisis forenses
          </span>
        </Link>
      </div>

      {/* Recent Evidencias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Evidencias Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvidencias?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay evidencias registradas
            </p>
          ) : (
            <div className="space-y-3">
              {recentEvidencias?.map((ev: any) => (
                <Link key={ev.id} href={`/admin/evidencias/${ev.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4 min-w-0">
                      <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{ev.originalName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {ev.user?.name || "Cliente"} • {new Date(ev.createdAt).toLocaleDateString("es-BO")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {(() => {
                        const config: Record<string, { label: string; variant: "warning" | "info" | "success" | "purple" }> = {
                          PENDIENTE: { label: "Pendiente", variant: "warning" },
                          REVISANDO: { label: "En Revisión", variant: "info" },
                          TERMINADO: { label: "Completado", variant: "success" },
                          RECEPCIONADO: { label: "Recepcionado", variant: "purple" },
                        };
                        const c = config[ev.status] || { label: ev.status, variant: "default" as const };
                        return <Badge variant={c.variant}>{c.label}</Badge>;
                      })()}
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
