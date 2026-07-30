"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Shield, FileText, ArrowLeft, Eye, Download,
  Clock, AlertTriangle, CheckCircle2, ImageIcon, QrCode,
  MapPin, Camera, Fingerprint, Activity, BarChart3,
  Layers, Cpu, Copy, Target, Maximize2
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import MapViewDynamic from "@/components/MapViewDynamic";
import EvidenceImage from "@/components/EvidenceImage";
import { motion, AnimatePresence } from "framer-motion";
import { MagicCard } from "@/components/ui/magic-card";

export default function EvidenceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resumen");
  const [copiedHash, setCopiedHash] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showMapPreview, setShowMapPreview] = useState(false);

  useEffect(() => {
    fetchEvidence();
  }, [id]);

  const fetchEvidence = async () => {
    try {
      const res = await fetch(`/api/evidencias/${id}`);
      if (!res.ok) { router.push("/dashboard"); return; }
      const data = await res.json();
      setEvidence(data.evidence);
    } catch (err) {
      console.error(err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; bg: string; text: string; border: string }> = {
      PENDIENTE: { label: "Pendiente", bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
      REVISANDO: { label: "En Revisión", bg: "bg-sky-500/10", text: "text-sky-500", border: "border-sky-500/20" },
      TERMINADO: { label: "Completado", bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
      RECEPCIONADO: { label: "Recepcionado", bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
    };
    const c = config[status] || { label: status, bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${c.bg} ${c.text} ${c.border}`}>
        {c.label}
      </span>
    );
  };

  const getRiskLevel = (score: number) => {
    if (score > 50) return { level: "ALTO RIESGO", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
    if (score > 18) return { level: "MEDIO RIESGO", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { level: "RIESGO BAJO", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(""), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="h-16 bg-card/80 border-b border-border/50 rounded-none flex items-center px-6 gap-4">
          <div className="h-8 w-8 rounded-full bg-muted" />
          <div className="h-4 w-48 rounded-md bg-muted" />
        </div>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top info row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 rounded-3xl bg-muted/40" />
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 w-64 rounded-xl bg-muted/40" />
              <div className="h-4 w-48 rounded-md bg-muted/30" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-20 rounded-2xl bg-muted/40" />
                <div className="h-20 rounded-2xl bg-muted/40" />
                <div className="h-20 rounded-2xl bg-muted/40" />
              </div>
              <div className="h-10 w-full rounded-xl bg-muted/30" />
            </div>
          </div>
          {/* Chart skeleton */}
          <div className="h-64 rounded-3xl bg-muted/40" />
          {/* Metadata skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-muted/40" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!evidence) return null;

  const forensicReport = evidence.analysis?.forensicReport
    ? JSON.parse(evidence.analysis.forensicReport)
    : null;

  const exifData = evidence.analysis?.exifData
    ? JSON.parse(evidence.analysis.exifData)
    : null;

  const hashesData = evidence.analysis?.hashesData
    ? JSON.parse(evidence.analysis.hashesData)
    : null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 20 } }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="hover:bg-muted/50 rounded-full h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">Expediente <span className="text-muted-foreground font-mono font-normal">#{evidence.id.slice(-6)}</span></span>
            </div>
          </div>
          {getStatusBadge(evidence.status)}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Main Visual Column */}
          <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-6">
            <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 overflow-hidden shadow-xl rounded-3xl h-full">
              <div className="p-6 h-full flex flex-col">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Visualización de Evidencia
                </h3>
                <div className="flex-1 bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center p-2 relative group border border-border/50">
                  {evidence.imagePath ? (
                    <>
                      <img
                        src={evidence.imagePath || '/placeholder-image.svg'}
                        alt={evidence.originalName}
                        className="max-h-[350px] w-auto object-contain rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.svg'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <p className="text-xs text-white font-mono break-all">{evidence.originalName}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                      <span className="text-xs">Imagen no disponible</span>
                    </div>
                  )}
                </div>
              </div>
            </MagicCard>
          </motion.div>

          {/* Details & Info Column */}
          <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
              {/* Context Info */}
              <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 overflow-hidden shadow-xl rounded-3xl h-full">
                <div className="p-6 h-full flex flex-col">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-5 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Metadatos del Caso
                  </h3>
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start justify-between border-b border-border/30 pb-3">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Nombre Original</p>
                        <p className="font-medium text-sm text-foreground">{evidence.originalName}</p>
                      </div>
                    </div>
                    <div className="flex items-start justify-between border-b border-border/30 pb-3">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Estado de Solicitud</p>
                        <div className="mt-1">{getStatusBadge(evidence.status)}</div>
                      </div>
                    </div>
                    <div className="flex items-start justify-between border-b border-border/30 pb-3">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Monto de Operación</p>
                        <p className="font-mono text-sm">Bs. {evidence.amount.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Estado de Pago</p>
                        <p className={`font-bold text-xs uppercase tracking-widest ${evidence.paymentVerified ? "text-emerald-500" : "text-amber-500"}`}>
                          {evidence.paymentVerified ? "Verificado" : "Pendiente"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start justify-between pt-1">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Fecha de Registro</p>
                        <p className="font-mono text-sm">
                          {new Date(evidence.createdAt).toLocaleString("es-BO", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', '')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </MagicCard>

              {/* Veredicto Banner */}
              {evidence.analysis ? (
                <MagicCard 
                  gradientColor={evidence.analysis.elaResult === "AUTENTICA" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"} 
                  className={`border overflow-hidden shadow-xl rounded-3xl h-full transition-colors ${evidence.analysis.elaResult === "AUTENTICA" ? "border-emerald-500/30" : "border-red-500/30"}`}
                >
                  <div className="p-6 h-full flex flex-col justify-center">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className={`p-5 rounded-full ${evidence.analysis.elaResult === "AUTENTICA" ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-red-500/10 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]"}`}>
                        {evidence.analysis.elaResult === "AUTENTICA" ? (
                          <CheckCircle2 className="w-12 h-12" />
                        ) : (
                          <AlertTriangle className="w-12 h-12" />
                        )}
                      </div>
                      <div>
                        <h3 className={`text-xl font-black uppercase tracking-tight mb-2 ${evidence.analysis.elaResult === "AUTENTICA" ? "text-emerald-500" : "text-red-500"}`}>
                          {evidence.analysis.elaResult === "AUTENTICA"
                            ? "Evidencia Auténtica"
                            : "Manipulación Detectada"}
                        </h3>
                        {forensicReport && (
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {forensicReport.resumen}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </MagicCard>
              ) : (
                <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 overflow-hidden shadow-xl rounded-3xl h-full flex items-center justify-center">
                  <div className="p-6 text-center text-muted-foreground">
                    <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="font-bold text-foreground">Análisis Pendiente</p>
                    <p className="text-xs mt-1">Esperando procesamiento de motores forenses.</p>
                  </div>
                </MagicCard>
              )}
            </div>
          </motion.div>

          {/* Analysis Results Tabs */}
          {evidence.analysis && (
            <motion.div variants={itemVariants} className="lg:col-span-12 mt-4 space-y-6">
              {/* Tabs Container */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { id: "resumen", label: "Resumen Forense", icon: BarChart3 },
                  { id: "exif", label: "Metadatos EXIF", icon: Camera },
                  { id: "hashes", label: "Firmas Digitales", icon: Fingerprint },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-[1.02]"
                          : "text-muted-foreground border-border/40 hover:text-foreground bg-card/50 hover:bg-card hover:border-border"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content area */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Resumen Tab */}
                  {activeTab === "resumen" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl overflow-hidden shadow-lg p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Score ELA</p>
                            <p className="text-3xl font-black text-foreground">
                              {evidence.analysis.elaScore !== null && evidence.analysis.elaScore !== undefined 
                                ? `${Number(evidence.analysis.elaScore).toFixed(2)}%` 
                                : "N/A"}
                            </p>
                          </div>
                          <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-500 border border-cyan-500/20">
                            <Layers className="w-6 h-6" />
                          </div>
                        </div>
                      </MagicCard>
                      
                      <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl overflow-hidden shadow-lg p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Nivel Riesgo</p>
                            <p className={`text-xl font-black uppercase tracking-tight ${getRiskLevel(evidence.analysis.elaScore || 0).color}`}>
                              {getRiskLevel(evidence.analysis.elaScore || 0).level}
                            </p>
                          </div>
                          <div className={`p-3 rounded-2xl ${getRiskLevel(evidence.analysis.elaScore || 0).bg} ${getRiskLevel(evidence.analysis.elaScore || 0).color} border ${getRiskLevel(evidence.analysis.elaScore || 0).border}`}>
                            <Target className="w-6 h-6" />
                          </div>
                        </div>
                      </MagicCard>

                      <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl overflow-hidden shadow-lg p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Analizado por</p>
                            <p className="text-lg font-bold text-foreground">
                              {evidence.analysis.analyst?.name || "Motor Automático"}
                            </p>
                          </div>
                          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 border border-purple-500/20">
                            <Cpu className="w-6 h-6" />
                          </div>
                        </div>
                      </MagicCard>

                      <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl overflow-hidden shadow-lg p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Timestamp</p>
                            <p className="text-sm font-mono font-bold text-foreground">
                              {new Date(evidence.analysis.createdAt).toLocaleString("es-BO", { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace('.', '')}
                            </p>
                          </div>
                          <div className="p-3 bg-slate-500/10 rounded-2xl text-slate-400 border border-slate-500/20">
                            <Clock className="w-6 h-6" />
                          </div>
                        </div>
                      </MagicCard>
                    </div>
                  )}

                  {/* EXIF Tab */}
                  {activeTab === "exif" && exifData && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1 space-y-6">
                        {exifData.camera && (
                          <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-lg p-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4 flex items-center gap-2">
                              <Camera className="w-4 h-4" /> Datos de Cámara
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between border-b border-border/30 pb-2">
                                <span className="text-xs text-muted-foreground">Fabricante</span>
                                <span className="text-xs font-medium text-foreground">{exifData.camera.make || "Desconocido"}</span>
                              </div>
                              <div className="flex justify-between border-b border-border/30 pb-2">
                                <span className="text-xs text-muted-foreground">Modelo</span>
                                <span className="text-xs font-medium text-foreground">{exifData.camera.model || "Desconocido"}</span>
                              </div>
                              <div className="flex justify-between pt-1">
                                <span className="text-xs text-muted-foreground">Lente</span>
                                <span className="text-xs font-medium text-foreground">{exifData.camera.lens || "No detectado"}</span>
                              </div>
                            </div>
                          </MagicCard>
                        )}
                        
                        {exifData.dates && (
                          <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-lg p-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2">
                              <Clock className="w-4 h-4" /> Timestamps Internos
                            </h4>
                            <div className="space-y-3">
                              <div className="flex justify-between border-b border-border/30 pb-2">
                                <span className="text-xs text-muted-foreground">Creación</span>
                                <span className="text-xs font-mono font-medium text-foreground">{exifData.dates.create_date || "N/A"}</span>
                              </div>
                              <div className="flex justify-between pt-1">
                                <span className="text-xs text-muted-foreground">Modificación</span>
                                <span className="text-xs font-mono font-medium text-foreground">{exifData.dates.datetime_original || "N/A"}</span>
                              </div>
                            </div>
                          </MagicCard>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        {exifData.gps ? (
                          <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-lg p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Ubicación GPS Extraída
                              </h4>
                              <button
                                onClick={() => setShowMapPreview(true)}
                                className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors bg-primary/10 px-3 py-1.5 rounded-full"
                              >
                                <Maximize2 className="w-3 h-3" />
                                Ampliar Mapa
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 mb-4 bg-muted/30 p-3 rounded-2xl border border-border/50">
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Latitud</p>
                                <p className="text-xs font-mono text-foreground">{exifData.gps.latitude || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Longitud</p>
                                <p className="text-xs font-mono text-foreground">{exifData.gps.longitude || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Altitud</p>
                                <p className="text-xs font-mono text-foreground">{exifData.gps.altitude ? `${exifData.gps.altitude}m` : "N/A"}</p>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-h-[250px] w-full overflow-hidden rounded-2xl border border-border/50 shadow-inner">
                              <MapViewDynamic
                                locations={[
                                  {
                                    lat: exifData.gps.latitude,
                                    lng: exifData.gps.longitude,
                                    name: evidence.originalName,
                                    evidenceId: evidence.id,
                                    elaResult: evidence.analysis?.elaResult,
                                  },
                                ]}
                                height="100%"
                                single
                              />
                            </div>
                          </MagicCard>
                        ) : (
                          <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-lg p-6 h-full flex items-center justify-center flex-col text-muted-foreground">
                            <MapPin className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-bold text-foreground">GPS No Disponible</p>
                            <p className="text-sm mt-1">Los metadatos no contienen coordenadas geográficas válidas.</p>
                          </MagicCard>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hashes Tab */}
                  {activeTab === "hashes" && hashesData && (
                    <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-lg p-6 md:p-8">
                      <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-8">
                          <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 text-amber-500 rounded-2xl mb-4 border border-amber-500/20">
                            <Fingerprint className="w-8 h-8" />
                          </div>
                          <h3 className="text-2xl font-black text-foreground">Firmas Criptográficas</h3>
                          <p className="text-sm text-muted-foreground mt-2">Identificadores únicos generados para garantizar la cadena de custodia y no repudio.</p>
                        </div>
                        
                        {hashesData.cryptographic && (
                          <div className="space-y-4">
                            {Object.entries(hashesData.cryptographic).map(([key, value]) => (
                              <div key={key} className="bg-card/50 border border-border/60 p-4 rounded-2xl hover:border-primary/50 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-2 h-2 rounded-full bg-primary/50" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{key}</span>
                                  </div>
                                  <p className="font-mono text-sm break-all text-foreground/90 group-hover:text-primary transition-colors">{value as string}</p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(value as string, key)}
                                  className={`flex-shrink-0 border-border/50 rounded-xl transition-all ${copiedHash === key ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "hover:bg-primary hover:text-primary-foreground"}`}
                                >
                                  {copiedHash === key ? (
                                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Copiado</>
                                  ) : (
                                    <><Copy className="w-4 h-4 mr-2" /> Copiar Hash</>
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </MagicCard>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Certificate Generation Banner */}
          {evidence.certificate && (
            <motion.div variants={itemVariants} className="lg:col-span-12 mt-4">
              <MagicCard gradientColor="rgba(251, 191, 36, 0.15)" className="border-amber-500/30 rounded-3xl shadow-xl overflow-hidden bg-amber-500/5">
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
                  <div className="bg-white p-4 rounded-3xl shadow-lg border-4 border-amber-500/20 transform rotate-3 hover:rotate-0 transition-transform">
                    <QrCode className="w-32 h-32 text-black" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-amber-500/30">
                      <Shield className="w-3.5 h-3.5" /> Documento Legal
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-2">Certificado Forense Emitido</h3>
                    <p className="text-sm text-muted-foreground max-w-xl">
                      Se ha generado un documento oficial que certifica los resultados de este análisis. 
                      Hash de verificación: <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{evidence.certificate.certificateHash.substring(0, 16)}...</span>
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                      <Button size="lg" className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20" onClick={() => setShowPreview(true)}>
                        <Eye className="w-5 h-5 mr-2" />
                        Visualizar Certificado
                      </Button>
                      <a href={`/api/evidencias/${evidence.id}/certificado`} download>
                        <Button variant="outline" size="lg" className="rounded-xl font-bold border-amber-500/30 hover:bg-amber-500/10 text-amber-600">
                          <Download className="w-5 h-5 mr-2" />
                          Descargar PDF
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </MagicCard>
            </motion.div>
          )}

        </motion.div>
      </div>

      {evidence?.certificate && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-5xl w-[95vw] h-[95vh] flex flex-col p-0 overflow-hidden bg-card/95 backdrop-blur-3xl border-border/50 rounded-[2rem]">
            <DialogHeader className="p-5 border-b border-border/40 flex-shrink-0 bg-muted/30">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <QrCode className="w-5 h-5 text-amber-500" />
                Previsualización de Certificado Legal
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 w-full h-full relative p-4 bg-black/5">
              <iframe 
                src={`/api/evidencias/${evidence.id}/certificado`}
                className="w-full h-full border-0 rounded-2xl shadow-inner bg-white"
                title="Certificado PDF"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Mapa completo dialog */}
      {exifData?.gps && (
        <Dialog open={showMapPreview} onOpenChange={setShowMapPreview}>
          <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-card/95 backdrop-blur-3xl border-border/50 rounded-[2rem]">
            <DialogHeader className="p-5 border-b border-border/40 flex-shrink-0 bg-muted/30">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <MapPin className="w-5 h-5 text-emerald-500" />
                Ubicación Satelital — {evidence.originalName}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 w-full min-h-0 relative p-4 bg-black/5">
              <div className="w-full h-full rounded-2xl overflow-hidden border border-border/50 shadow-inner">
                <MapViewDynamic
                  locations={[
                    {
                      lat: exifData.gps.latitude,
                      lng: exifData.gps.longitude,
                      name: evidence.originalName,
                      evidenceId: evidence.id,
                      elaResult: evidence.analysis?.elaResult,
                    },
                  ]}
                  height="100%"
                  single
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
