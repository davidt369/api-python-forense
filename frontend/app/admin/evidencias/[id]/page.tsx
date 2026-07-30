"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Shield, FileText, Eye, Activity,
  CheckCircle2, AlertTriangle, QrCode, Download,
  ImageIcon, Zap, Clock, Search, Lock, User, 
  CreditCard, FileDigit, Calendar, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MagicCard } from "@/components/ui/magic-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminEvidenceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("resumen");

  let reportData: any = null;
  let objectsData: any = null;
  let steganographyData: any = null;

  if (evidence?.analysis) {
    if (evidence.analysis.forensicReport) {
      try {
        reportData = typeof evidence.analysis.forensicReport === "string"
          ? JSON.parse(evidence.analysis.forensicReport)
          : evidence.analysis.forensicReport;
      } catch (e) {
        console.error("Error parsing forensic report:", e);
      }
    }
    
    if (evidence.analysis.objectsData) {
      try {
        objectsData = typeof evidence.analysis.objectsData === "string"
          ? JSON.parse(evidence.analysis.objectsData)
          : evidence.analysis.objectsData;
      } catch (e) {
        console.error("Error parsing objects data:", e);
      }
    }

    if (evidence.analysis.steganographyData) {
      try {
        steganographyData = typeof evidence.analysis.steganographyData === "string"
          ? JSON.parse(evidence.analysis.steganographyData)
          : evidence.analysis.steganographyData;
      } catch (e) {
        console.error("Error parsing steganography data:", e);
      }
    }
  }

  useEffect(() => {
    fetchEvidence();
  }, [id]);

  const fetchEvidence = async () => {
    try {
      const res = await fetch(`/api/evidencias/${id}`);
      if (!res.ok) { router.push("/admin/evidencias"); return; }
      const data = await res.json();
      setEvidence(data.evidence);
    } catch (err) {
      console.error(err);
      router.push("/admin/evidencias");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const res = await fetch(`/api/evidencias/${id}/analizar`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        fetchEvidence();
      } else {
        alert(data.error || "Error al analizar");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor de análisis");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      const res = await fetch(`/api/evidencias/${id}/certificado`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        fetchEvidence();
      } else {
        alert(data.error || "Error al generar certificado");
      }
    } catch (err) {
      console.error(err);
      alert("Error al generar certificado");
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      const res = await fetch(`/api/evidencias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchEvidence();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; colorClass: string; bgClass: string }> = {
      PENDIENTE: { label: "Pendiente", colorClass: "text-amber-500", bgClass: "bg-amber-500/10 border-amber-500/20" },
      REVISANDO: { label: "En Revisión", colorClass: "text-blue-500", bgClass: "bg-blue-500/10 border-blue-500/20" },
      TERMINADO: { label: "Completado", colorClass: "text-emerald-500", bgClass: "bg-emerald-500/10 border-emerald-500/20" },
      RECEPCIONADO: { label: "Recepcionado", colorClass: "text-purple-500", bgClass: "bg-purple-500/10 border-purple-500/20" },
    };
    const c = config[status] || { label: status, colorClass: "text-foreground", bgClass: "bg-muted border-border" };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${c.bgClass} ${c.colorClass}`}>
        {c.label}
      </span>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 20 } }
  };

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6 w-full animate-pulse px-4 sm:px-6 py-6">
        <Skeleton className="h-24 w-full rounded-[2rem] bg-muted/40" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-1 h-[400px] rounded-[2rem] bg-muted/40" />
          <Skeleton className="lg:col-span-2 h-[400px] rounded-[2rem] bg-muted/40" />
        </div>
      </div>
    );
  }

  if (!evidence) return null;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-[1400px] mx-auto flex flex-col gap-6 w-full"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl overflow-hidden shadow-lg bg-card/40 backdrop-blur-xl">
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Link href="/admin/evidencias" className="p-4 bg-muted/50 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors group">
                <ArrowLeft className="size-6 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div className="flex flex-col gap-1.5">
                <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                  Revisión de Evidencia
                </h1>
                <p className="text-sm font-mono text-muted-foreground break-all max-w-xl">
                  {evidence.originalName}
                </p>
              </div>
            </div>
            <div className="shrink-0 flex gap-3 items-center">
              {getStatusBadge(evidence.status)}
            </div>
          </div>
        </MagicCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Image */}
        <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-6">
          <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl overflow-hidden shadow-xl flex flex-col h-full">
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Previsualización
              </h3>
              
              <div className="flex-1 bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center p-2 border border-border/50 relative group min-h-[300px]">
                <img
                  src={evidence.imagePath || '/placeholder-image.svg'}
                  alt={evidence.originalName}
                  className="max-w-full max-h-[400px] object-contain rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.svg'; }}
                />
              </div>
            </div>
          </MagicCard>
        </motion.div>

        {/* Right Column - Client Info & Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col gap-6">
          <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl overflow-hidden shadow-lg">
            <div className="p-6 md:p-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                <User className="w-4 h-4" /> Información del Cliente
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><User className="size-3" /> Nombre Completo</span>
                  <span className="font-medium text-foreground">{evidence.user?.name}</span>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><FileDigit className="size-3" /> Documento (CI)</span>
                  <span className="font-mono text-sm text-foreground bg-muted/50 w-fit px-2 py-0.5 rounded">{evidence.user?.ci}</span>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Activity className="size-3" /> Email</span>
                  <span className="text-sm text-foreground">{evidence.user?.email}</span>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Activity className="size-3" /> Teléfono</span>
                  <span className="text-sm text-foreground">{evidence.user?.phone || "—"}</span>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Calendar className="size-3" /> Fecha Solicitud</span>
                  <span className="font-mono text-sm text-foreground">{new Date(evidence.createdAt).toLocaleDateString("es-BO")}</span>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><CreditCard className="size-3" /> Estado del Pago</span>
                  <div>
                    {evidence.paymentVerified ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="size-3 mr-1" /> Verificado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <AlertTriangle className="size-3 mr-1" /> Pendiente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </MagicCard>

          {/* Actions */}
          <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl overflow-hidden shadow-lg">
            <div className="p-6 md:p-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Acciones Operativas
              </h3>
              
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="h-12 rounded-2xl font-bold px-6 shadow-lg shadow-primary/20"
                >
                  {analyzing ? (
                    <><Activity className="size-4 mr-2 animate-pulse" /> Procesando Motor Forense...</>
                  ) : (
                    <><Activity className="size-4 mr-2" /> Realizar Análisis Forense</>
                  )}
                </Button>

                {evidence.analysis && (
                  <Button
                    variant="outline"
                    onClick={handleGenerateCertificate}
                    className="h-12 rounded-2xl font-bold px-6 border-border/50 hover:bg-card"
                  >
                    <QrCode className="size-4 mr-2" />
                    Generar Certificado
                  </Button>
                )}

                {evidence.status === "PENDIENTE" && (
                  <Button variant="secondary" onClick={() => handleStatusChange("REVISANDO")} className="h-12 rounded-2xl font-bold px-6 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                    <Clock className="size-4 mr-2" />
                    Marcar en Revisión
                  </Button>
                )}

                {evidence.status === "TERMINADO" && (
                  <Button variant="secondary" onClick={() => handleStatusChange("RECEPCIONADO")} className="h-12 rounded-2xl font-bold px-6 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20">
                    <CheckCircle2 className="size-4 mr-2" />
                    Marcar Recepcionado
                  </Button>
                )}
              </div>
            </div>
          </MagicCard>
        </motion.div>
      </div>

      {/* Analysis Results */}
      {evidence.analysis && (
        <motion.div variants={itemVariants}>
          <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                  <Shield className="size-6" />
                </div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">
                  Resultados del Análisis Forense
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-card/50 border border-border/50 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Score ELA</p>
                  <p className="text-3xl font-black text-foreground">
                    {evidence.analysis.elaScore !== null && evidence.analysis.elaScore !== undefined
                      ? `${Number(evidence.analysis.elaScore).toFixed(2)}%`
                      : "N/A"}
                  </p>
                </div>
                
                <div className={`bg-card/50 border border-border/50 p-5 rounded-2xl flex flex-col justify-between shadow-sm`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Veredicto</p>
                  <p className={`text-xl sm:text-2xl font-black ${evidence.analysis.elaResult === "AUTENTICA" ? "text-emerald-500" : "text-red-500"}`}>
                    {evidence.analysis.elaResult === "AUTENTICA" ? "Auténtica" : "Manipulada"}
                  </p>
                </div>
                
                <div className="bg-card/50 border border-border/50 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Analista Designado</p>
                  <p className="text-lg font-bold text-foreground truncate" title={evidence.analysis.analyst?.name || "Motor Forense Automático"}>
                    {evidence.analysis.analyst?.name || "Motor Automático"}
                  </p>
                </div>
                
                <div className="bg-card/50 border border-border/50 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Fecha Reporte</p>
                  <p className="text-lg font-bold text-foreground font-mono">
                    {new Date(evidence.analysis.createdAt).toLocaleDateString("es-BO")}
                  </p>
                </div>
              </div>

              {reportData && (
                <div className="flex flex-col gap-6">
                  {/* Tab Navigation */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                      { id: "resumen", label: "Resumen Técnico", icon: FileText },
                      { id: "parametros", label: "Parámetros y Metadatos", icon: Zap },
                      { id: "explicacion", label: "Explicación de Evaluación", icon: Info },
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

                  {/* Tab Content Container */}
                  <div className="bg-card/20 backdrop-blur-sm rounded-3xl pt-2">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {activeTab === "resumen" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-muted/30 p-6 rounded-3xl border border-border/50">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
                                <FileText className="size-4" /> Dictamen
                              </h3>
                              <p className="text-sm text-foreground/80 leading-relaxed font-medium">{reportData.resumen}</p>
                            </div>
                            
                            <div className="bg-amber-500/5 p-6 rounded-3xl border border-amber-500/20">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2 mb-4">
                                <AlertTriangle className="size-4" /> Recomendación
                              </h3>
                              <p className="text-sm text-amber-500/80 leading-relaxed font-medium">{reportData.recomendacion}</p>
                            </div>
                            
                            <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 md:col-span-2">
                               <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-6">
                                <Shield className="size-4" /> Huellas Digitales (Hashes)
                               </h3>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {Object.entries(reportData.hashes || {}).map(([key, val]) => val ? (
                                   <div key={key} className="bg-card/50 p-4 rounded-2xl border border-border/40 flex flex-col gap-1.5">
                                     <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{key}</span>
                                     <span className="font-mono text-sm text-foreground truncate" title={val as string}>{val as string}</span>
                                   </div>
                                 ) : null)}
                               </div>
                            </div>

                            {objectsData && (
                              <div className="bg-muted/30 p-6 rounded-3xl border border-border/50">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
                                  <Search className="size-4" /> Detección de Objetos
                                </h3>
                                <p className="text-sm text-foreground/80 leading-relaxed font-medium">{objectsData.summary || "Sin objetos detectados"}</p>
                              </div>
                            )}

                            {steganographyData && (
                              <div className="bg-muted/30 p-6 rounded-3xl border border-border/50">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
                                  <Lock className="size-4" /> Esteganografía
                                </h3>
                                <p className="text-sm text-foreground/80 leading-relaxed font-medium">{steganographyData.summary || "No se detectó información oculta"}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === "parametros" && (
                          <div className="bg-muted/30 p-6 rounded-3xl border border-border/50">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-6">
                              <Zap className="size-4" /> Detalles Técnicos Extraídos
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                              {Object.entries(reportData.detalles || {}).map(([key, val]) => (
                                <div key={key} className="bg-card/50 p-4 rounded-2xl border border-border/40 flex flex-col gap-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <span className="font-mono text-sm text-foreground truncate" title={val as string}>{val as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeTab === "explicacion" && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 flex flex-col gap-4">
                              <div className="p-3 bg-primary/10 w-fit rounded-xl text-primary">
                                <Activity className="size-5" />
                              </div>
                              <h4 className="font-bold text-foreground">Análisis ELA</h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                El <strong>Error Level Analysis (ELA)</strong> es una técnica de análisis forense digital que identifica áreas dentro de una imagen que se encuentran en diferentes niveles de compresión. En las imágenes JPEG, toda la imagen debería estar aproximadamente al mismo nivel de error.
                              </p>
                              <div className="bg-card/50 p-4 rounded-xl border border-border/40 text-xs text-foreground/80 space-y-2 mt-auto">
                                <p><strong className="text-primary">Score &lt; 18%:</strong> Normal. Compresión uniforme.</p>
                                <p><strong className="text-amber-500">Score 18% - 50%:</strong> Medio. Posibles alteraciones.</p>
                                <p><strong className="text-red-500">Score &gt; 50%:</strong> Alto. Manipulación probable.</p>
                              </div>
                            </div>

                            <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 flex flex-col gap-4">
                              <div className="p-3 bg-emerald-500/10 w-fit rounded-xl text-emerald-500">
                                <ImageIcon className="size-5" />
                              </div>
                              <h4 className="font-bold text-foreground">Metadatos EXIF</h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Los metadatos <strong>EXIF (Exchangeable Image File Format)</strong> proveen información sobre el dispositivo, exposición, fecha y software utilizado. Su ausencia total (stripping) a menudo indica que la imagen pasó por redes sociales o fue modificada maliciosamente.
                              </p>
                            </div>

                            <div className="bg-muted/30 p-6 rounded-3xl border border-border/50 flex flex-col gap-4">
                              <div className="p-3 bg-purple-500/10 w-fit rounded-xl text-purple-500">
                                <FileText className="size-5" />
                              </div>
                              <h4 className="font-bold text-foreground">Hashes Digitales</h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                Los <strong>hashes criptográficos</strong> (como SHA-256) garantizan que el archivo exacto no ha cambiado (cadena de custodia). Los <strong>hashes perceptuales</strong> (como pHash) analizan la estructura visual para encontrar imágenes similares aunque hayan sido ligeramente editadas.
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Certificate Banner */}
              {evidence.certificate && (
                <div className="mt-8 bg-[#1B180F] border border-amber-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <QrCode className="size-32 text-amber-500" />
                  </div>
                  
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="p-4 bg-amber-500/20 text-amber-500 rounded-2xl shadow-inner border border-amber-500/30">
                      <QrCode className="size-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-amber-500">Certificado Criptográfico Emitido</h3>
                      <p className="text-xs font-mono text-amber-500/70 mt-1">
                        Hash: {evidence.certificate.certificateHash.substring(0, 32)}...
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 relative z-10 w-full md:w-auto">
                    <a href={`/api/evidencias/${evidence.id}/certificado`} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-auto">
                      <Button className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-6">
                        <Eye className="size-4 mr-2" /> Visualizar Documento
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </MagicCard>
        </motion.div>
      )}
    </motion.div>
  );
}
