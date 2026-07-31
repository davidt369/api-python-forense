"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { MagicCard } from "@/components/ui/magic-card";
import {
  Shield, CheckCircle2, Camera, Hash, Eye, BarChart3, FileText, Fingerprint, Zap, Layers,
  Target, Copy, Activity, Info, AlertCircle, Image as ImageIcon, QrCode, Lock
} from "lucide-react";
import EvidenceImage from "@/components/EvidenceImage";

export default function AnalysisView() {
  const { id } = useParams();
  const router = useRouter();
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [copiedHash, setCopiedHash] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState("resumen");

  useEffect(() => {
    fetchEvidence();
  }, [id]);

  const fetchEvidence = async () => {
    try {
      const res = await fetch(`/api/evidencias/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEvidence(data.evidence);
      } else {
        router.push("/admin/evidencias");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const res = await fetch(`/api/evidencias/${id}/analizar`, { method: "POST" });
      if (res.ok) {
        fetchEvidence();
      } else {
        const data = await res.json();
        alert(data.error || "Error al analizar");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red al analizar");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleVerifyPayment = async () => {
    try {
      setVerifying(true);
      const res = await fetch(`/api/admin/evidencias/${id}/verificar-pago`, { method: "POST" });
      if (res.ok) {
        fetchEvidence();
      } else {
        alert("Error al verificar el pago");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red");
    } finally {
      setVerifying(false);
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      setGeneratingCert(true);
      const res = await fetch(`/api/evidencias/${id}/certificado`, { method: "POST" });
      if (res.ok) {
        fetchEvidence();
        window.open(`/api/evidencias/${id}/certificado`, '_blank');
      } else {
        const data = await res.json();
        alert(data.error || "Error al generar certificado");
      }
    } catch (err) {
      console.error(err);
      alert("Error al generar certificado");
    } finally {
      setGeneratingCert(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(""), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col gap-6 w-full animate-pulse px-4 sm:px-6">
        <Skeleton className="h-32 w-full rounded-[2rem] bg-muted/40" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-4 h-[500px] rounded-[2rem] bg-muted/40" />
          <Skeleton className="lg:col-span-8 h-[500px] rounded-[2rem] bg-muted/40" />
        </div>
      </div>
    );
  }

  if (!evidence) return null;

  const hasAnalysis = !!evidence.analysis;
  let exifData: any = null;
  let hashesData: any = null;
  let histogramData: any = null;
  let compressionData: any = null;
  let objectsData: any = null;
  let steganographyData: any = null;

  if (hasAnalysis) {
    try { exifData = JSON.parse(evidence.analysis.exifData); } catch (e) { }
    try { hashesData = JSON.parse(evidence.analysis.hashesData); } catch (e) { }
    try { histogramData = JSON.parse(evidence.analysis.histogramData); } catch (e) { }
    try { compressionData = JSON.parse(evidence.analysis.compressionData); } catch (e) { }
    try { objectsData = JSON.parse(evidence.analysis.objectsData); } catch (e) { }
    try { steganographyData = JSON.parse(evidence.analysis.steganographyData); } catch (e) { }
  }

  const getRiskLevel = (score: number) => {
    if (score > 50) return { level: "ALTO RIESGO", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
    if (score > 18) return { level: "MEDIO RIESGO", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { level: "RIESGO BAJO", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
  };

  const getManipulationVerdict = () => {
    if (!hasAnalysis) return { verdict: "NO DISPONIBLE", color: "text-muted-foreground", bg: "bg-muted/50" };
    if (evidence.analysis.elaResult !== 'AUTENTICA') {
      return { verdict: "POSIBLE MANIPULACIÓN DETECTADA", color: "text-red-500", bg: "bg-red-500/10" };
    }
    return { verdict: "SIN EVIDENCIA DE MANIPULACIÓN", color: "text-emerald-500", bg: "bg-emerald-500/10" };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 20 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-[1400px] mx-auto flex flex-col gap-6 w-full"
    >
      {/* Payment Verification Banner */}
      {evidence.paymentProofPath && !evidence.paymentVerified && (
        <motion.div variants={itemVariants}>
          <MagicCard gradientColor="rgba(245, 158, 11, 0.15)" className="border-amber-500/30 rounded-3xl overflow-hidden bg-amber-500/5 shadow-xl">
            <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex gap-4 items-center">
                <div className="p-4 bg-amber-500/20 rounded-2xl text-amber-500">
                  <AlertCircle className="size-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-500 mb-1">Verificación de Pago Pendiente</h3>
                  <p className="text-sm text-foreground/80 max-w-xl">
                    Comprobante subido por <span className="font-mono bg-muted/50 px-1 rounded">Bs. {evidence.amount?.toFixed(2) || '50.00'}</span>. Valida el pago para habilitar el análisis oficial.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <a href={evidence.paymentProofPath} target="_blank" rel="noreferrer" className="flex-1 md:flex-auto">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-amber-500/30 text-amber-500 hover:bg-amber-500/10 font-bold">
                    Ver Comprobante
                  </Button>
                </a>
                <Button onClick={handleVerifyPayment} disabled={verifying} className="flex-1 md:flex-auto h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/20">
                  {verifying ? "Validando..." : "Marcar como Validado"}
                </Button>
              </div>
            </div>
          </MagicCard>
        </motion.div>
      )}

      {/* Main Header */}
      <motion.div variants={itemVariants}>
        <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl overflow-hidden shadow-lg bg-card/40 backdrop-blur-xl">
          <div className="p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="bg-primary/10 p-4 rounded-2xl text-primary border border-primary/20 shadow-inner">
                <Shield className="size-8" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Link href="/admin/evidencias" className="text-primary/70 hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  &larr; Volver al Panel
                </Link>
                <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                  Expediente <span className="text-primary font-mono font-normal bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">#{evidence.id.slice(-6)}</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Ingresado el <span className="font-mono text-foreground/80">{new Date(evidence.createdAt).toLocaleDateString("es-BO")}</span> por <span className="font-bold text-foreground/80">{evidence.user?.name}</span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              {!hasAnalysis ? (
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing || (!evidence.paymentVerified && evidence.amount > 0)}
                  size="lg"
                  className="w-full lg:w-auto h-14 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 text-base px-8"
                >
                  {analyzing ? (
                    <><Activity className="size-5 mr-2 animate-pulse" /> Procesando Motor Forense...</>
                  ) : (
                    <><Zap className="size-5 mr-2" /> Ejecutar Análisis Profundo</>
                  )}
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <div className="inline-flex items-center justify-center px-6 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold text-sm">
                    <CheckCircle2 className="size-5 mr-2" />
                    Análisis Completado
                  </div>
                  {evidence.certificate ? (
                    <a href={`/api/evidencias/${id}/certificado`} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                      <Button size="lg" className="w-full h-14 rounded-2xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20 text-base px-8">
                        <QrCode className="size-5 mr-2" />
                        Ver Certificado Oficial
                      </Button>
                    </a>
                  ) : (
                    <Button
                      onClick={handleGenerateCertificate}
                      disabled={generatingCert}
                      size="lg"
                      className="w-full sm:w-auto h-14 rounded-2xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20 text-base px-8"
                    >
                      {generatingCert ? (
                        <><Activity className="size-5 mr-2 animate-pulse" /> Generando Documento...</>
                      ) : (
                        <><QrCode className="size-5 mr-2" /> Emitir Certificado Legal</>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </MagicCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Image & Context */}
        <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-6">
          <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl overflow-hidden shadow-xl flex flex-col">
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Material Probatorio
              </h3>
              
              <div className="flex-1 bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center p-2 border border-border/50 relative group mb-6 min-h-[300px]">
                <img 
                  src={evidence.imagePath || '/placeholder-image.svg'} 
                  alt="Evidencia original" 
                  className="max-w-full max-h-[400px] object-contain rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-image.svg'; }}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border/30 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Archivo Original</span>
                  <span className="font-mono text-xs text-foreground truncate max-w-[150px]" title={evidence.originalName}>{evidence.originalName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/30 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estado Flujo</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {evidence.status}
                  </span>
                </div>
                {hasAnalysis && (
                  <div className="flex justify-between items-center border-b border-border/30 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo MIME</span>
                    <span className="font-mono text-xs text-foreground bg-muted/50 px-1.5 rounded">{exifData?.file?.mime_type || "N/A"}</span>
                  </div>
                )}
                {hasAnalysis && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tamaño Fisico</span>
                    <span className="font-mono text-xs text-foreground">{compressionData?.size_bytes ? (compressionData.size_bytes / 1024).toFixed(2) + " KB" : "N/A"}</span>
                  </div>
                )}
              </div>
            </div>
          </MagicCard>
        </motion.div>

        {/* Right Column - Analysis Engine */}
        <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
          {!hasAnalysis ? (
            <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl overflow-hidden shadow-xl h-full flex items-center justify-center border-dashed">
              <div className="p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto">
                <div className="p-6 bg-primary/5 rounded-full mb-6 border border-primary/10">
                  <Activity className="size-16 text-primary/40" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-3">Motor Inactivo</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  El expediente no cuenta con un informe forense generado. Inicializa el motor de análisis para extraer vectores de características, huellas digitales y evaluar alteraciones estructurales.
                </p>
              </div>
            </MagicCard>
          ) : (
            <div className="flex flex-col gap-6 h-full">
              {/* Tab Navigation */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { id: "resumen", label: "Dashboard", icon: Shield },
                  { id: "ela", label: "Análisis ELA", icon: Eye },
                  { id: "histograma", label: "Colorimetría", icon: BarChart3 },
                  { id: "exif", label: "Metadata EXIF", icon: Camera },
                  { id: "hashes", label: "Hashes", icon: Fingerprint },
                  { id: "compresion", label: "Estructura", icon: Layers },
                  { id: "objetos", label: "Visión Art.", icon: Target },
                  { id: "esteganografia", label: "Esteganografía", icon: Lock },
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
              <div className="flex-1 bg-card/20 backdrop-blur-sm rounded-3xl p-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    
                    {/* RESUMEN TAB */}
                    {activeTab === "resumen" && (
                      <div className="flex flex-col gap-6">
                        <MagicCard gradientColor={evidence.analysis.elaResult === "AUTENTICA" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"} className={`border-border/40 rounded-3xl overflow-hidden shadow-lg border-2 ${evidence.analysis.elaResult === "AUTENTICA" ? "border-emerald-500/30" : "border-red-500/30"}`}>
                          <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Dictamen del Motor ELA</p>
                              <h3 className={`text-2xl font-black ${getManipulationVerdict().color}`}>
                                {getManipulationVerdict().verdict}
                              </h3>
                            </div>
                            <div className={`p-4 rounded-2xl flex items-center justify-center ${getManipulationVerdict().bg} ${getManipulationVerdict().color}`}>
                              {evidence.analysis.elaResult === "AUTENTICA" ? <CheckCircle2 className="size-10" /> : <AlertCircle className="size-10" />}
                            </div>
                          </div>
                        </MagicCard>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-md p-5 flex flex-col justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Clasificación Riesgo</p>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-black w-fit ${getRiskLevel(evidence.analysis.elaScore || 0).bg} ${getRiskLevel(evidence.analysis.elaScore || 0).color}`}>
                              {getRiskLevel(evidence.analysis.elaScore || 0).level}
                            </span>
                          </MagicCard>
                          
                          <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-md p-5 flex flex-col justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Prob. de Manipulación</p>
                            <p className="text-3xl font-black text-foreground">{(evidence.analysis.elaScore || 0).toFixed(2)}%</p>
                          </MagicCard>
                          
                          <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-md p-5 flex flex-col justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Brillo Global</p>
                            <p className="text-3xl font-black text-foreground">{histogramData?.brightness?.toFixed(2) || "N/A"}</p>
                          </MagicCard>

                          <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-md p-5 flex flex-col justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Densidad Píxeles</p>
                            <p className="text-xl sm:text-2xl font-black text-foreground font-mono">{histogramData?.image?.pixels ? (histogramData.image.pixels / 1000000).toFixed(2) + "M" : "N/A"}</p>
                          </MagicCard>
                        </div>

                        <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-md overflow-hidden">
                          <div className="p-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-6">
                              <Layers className="size-4" /> Propiedades Estructurales
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Codificador</p>
                                <p className="font-mono text-sm text-foreground">{exifData?.file?.file_type || compressionData?.format || "Desconocido"}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Dimensiones</p>
                                <p className="font-mono text-sm text-foreground">
                                  {exifData?.file?.image_width || histogramData?.image?.width || "—"} × {exifData?.file?.image_height || histogramData?.image?.height || "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Profundidad Bits</p>
                                <p className="font-mono text-sm text-foreground">
                                  {exifData?.file?.bits_per_sample ? `${exifData.file.bits_per_sample} bits` : compressionData?.mode || "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Espacio Color</p>
                                <p className="font-mono text-sm text-foreground">
                                  {exifData?.file?.color_components ? `${exifData.file.color_components} canales` : "RGB"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </MagicCard>
                      </div>
                    )}

                    {/* ELA TAB */}
                    {activeTab === "ela" && (
                      <div className="flex flex-col gap-6">
                        <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl overflow-hidden shadow-xl">
                          <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-8">
                              <div className="flex-1 max-w-2xl bg-black/50 rounded-2xl overflow-hidden border border-border/50 p-2 relative group">
                                {evidence.analysis.elaImagePath ? (
                                  <>
                                    <img
                                      src={evidence.analysis.elaImagePath.startsWith('http') ? evidence.analysis.elaImagePath : `${(process.env.NEXT_PUBLIC_FORENSIC_API_URL || "").replace(/\/$/, "")}/temp/${evidence.analysis.elaImagePath.split(/[/\\\\]/).pop()}`}
                                      alt="ELA Analysis"
                                      className="w-full h-auto rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none"></div>
                                  </>
                                ) : (
                                  <div className="h-64 flex items-center justify-center text-muted-foreground">Mapa ELA no disponible</div>
                                )}
                              </div>
                              
                              <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
                                <div className="p-5 bg-muted/40 rounded-2xl border border-border/50">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Score Diferencial ELA</p>
                                  <p className="text-3xl font-black text-foreground">{(evidence.analysis.elaScore || 0).toFixed(2)}%</p>
                                </div>
                                
                                <div className="p-5 bg-muted/40 rounded-2xl border border-border/50">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Compresión de Base</p>
                                  <p className="text-3xl font-black text-foreground">90<span className="text-xl text-muted-foreground font-normal">/100</span></p>
                                </div>

                                <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl mt-auto">
                                  <p className="text-xs text-blue-400 font-medium leading-relaxed">
                                    Las áreas que resaltan (píxeles blancos/brillantes) indican secciones con un nivel de compresión diferente al del fondo, un indicador fuerte de inserción o manipulación digital.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </MagicCard>
                      </div>
                    )}

                    {/* HISTOGRAMA TAB */}
                    {activeTab === "histograma" && histogramData && (
                      <div className="flex flex-col gap-6">
                        <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl overflow-hidden shadow-xl p-6">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                            <BarChart3 className="size-4" /> Distribución de Intensidad (RGB)
                          </h4>
                          <div className="flex flex-col gap-6">
                            {["red", "green", "blue"].map((channel) => {
                              const stats = histogramData.channels[channel]?.statistics;
                              const bgMap: Record<string, string> = { red: "bg-red-500", green: "bg-green-500", blue: "bg-blue-500" };
                              const textMap: Record<string, string> = { red: "text-red-500", green: "text-green-500", blue: "text-blue-500" };
                              if (!stats) return null;

                              return (
                                <div key={channel} className="bg-card/50 border border-border/60 p-5 rounded-2xl flex flex-col gap-4">
                                  <div className="flex items-center justify-between">
                                    <h3 className={`font-black uppercase tracking-wider text-sm ${textMap[channel]}`}>
                                      Canal {channel}
                                    </h3>
                                    <span className="font-mono text-xs text-muted-foreground">Mean: {stats.mean?.toFixed(2)}</span>
                                  </div>
                                  
                                  <div className="grid grid-cols-4 gap-4 text-center">
                                    <div className="bg-muted/30 py-2 rounded-xl border border-border/50">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Min</p>
                                      <p className="font-mono text-sm">{stats.min}</p>
                                    </div>
                                    <div className="bg-muted/30 py-2 rounded-xl border border-border/50">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Max</p>
                                      <p className="font-mono text-sm">{stats.max}</p>
                                    </div>
                                    <div className="bg-muted/30 py-2 rounded-xl border border-border/50">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Mediana</p>
                                      <p className="font-mono text-sm">{stats.median}</p>
                                    </div>
                                    <div className="bg-muted/30 py-2 rounded-xl border border-border/50">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Desviación</p>
                                      <p className="font-mono text-sm">{stats.std?.toFixed(2)}</p>
                                    </div>
                                  </div>

                                  <div className="h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner border border-border/50 p-0.5">
                                    <div className={`h-full rounded-full ${bgMap[channel]} shadow-[0_0_10px_currentColor]`} style={{ width: `${(stats.mean / 255) * 100}%` }}></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </MagicCard>
                      </div>
                    )}

                    {/* EXIF TAB */}
                    {activeTab === "exif" && exifData && (
                      <div className="flex flex-col gap-6">
                        {(!exifData.camera?.make && !exifData.photo?.iso) && (
                          <div className="bg-sky-500/10 border border-sky-500/20 p-5 rounded-3xl flex items-start gap-4">
                            <div className="p-3 bg-sky-500/20 rounded-xl text-sky-500 shrink-0">
                              <Info className="size-6" />
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-sky-500 mb-1">Ausencia de Metadatos Fotográficos Nativos</h4>
                              <p className="text-sm text-sky-500/80 leading-relaxed">
                                El archivo no contiene la firma EXIF que inyectan los sensores CMOS/CCD de cámaras y smartphones. 
                                Desde la óptica forense, esto implica un alto grado de certeza de que el archivo pasó por <strong>redes sociales, software de edición gráfica (Photoshop/GIMP) o fue sintetizado por IA</strong>.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-lg p-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2 mb-6">
                              <Camera className="size-4" /> Hardware de Captura
                            </h4>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center border-b border-border/30 pb-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fabricante</span>
                                <span className="font-mono text-sm text-foreground bg-muted/50 px-2 py-0.5 rounded">{exifData.camera?.make || "Desconocido"}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-border/30 pb-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Modelo</span>
                                <span className="font-mono text-sm text-foreground bg-muted/50 px-2 py-0.5 rounded">{exifData.camera?.model || "Desconocido"}</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-border/30 pb-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Software Editor</span>
                                <span className="font-mono text-sm text-foreground bg-muted/50 px-2 py-0.5 rounded max-w-[200px] truncate" title={exifData.software?.software}>{exifData.software?.software || "Ninguno"}</span>
                              </div>
                              <div className="flex justify-between items-center pt-1">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Timestamp Original</span>
                                <span className="font-mono text-xs text-foreground">{exifData.dates?.datetime_original || "N/A"}</span>
                              </div>
                            </div>
                          </MagicCard>

                          <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-lg p-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-2 mb-6">
                              <Target className="size-4" /> Configuración Óptica
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-muted/30 border border-border/50 p-4 rounded-xl text-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Apertura (f)</p>
                                <p className="font-mono text-xl">{exifData.photo?.f_number ? `f/${exifData.photo.f_number}` : "N/D"}</p>
                              </div>
                              <div className="bg-muted/30 border border-border/50 p-4 rounded-xl text-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Sensibilidad</p>
                                <p className="font-mono text-xl">ISO {exifData.photo?.iso || "N/D"}</p>
                              </div>
                              <div className="bg-muted/30 border border-border/50 p-4 rounded-xl text-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Exposición</p>
                                <p className="font-mono text-xl">{exifData.photo?.exposure_time ? `${exifData.photo.exposure_time}s` : "N/D"}</p>
                              </div>
                              <div className="bg-muted/30 border border-border/50 p-4 rounded-xl text-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Focal</p>
                                <p className="font-mono text-xl">{exifData.photo?.focal_length ? `${exifData.photo.focal_length}mm` : "N/D"}</p>
                              </div>
                            </div>
                          </MagicCard>
                        </div>
                      </div>
                    )}

                    {/* HASHES TAB */}
                    {activeTab === "hashes" && hashesData && (
                      <div className="flex flex-col gap-6">
                        <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-xl overflow-hidden">
                          <div className="p-6 md:p-8">
                            <div className="flex items-center gap-4 mb-8">
                              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
                                <Hash className="size-6" />
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-foreground">Integridad Criptográfica</h3>
                                <p className="text-sm text-muted-foreground mt-1">Garantía de no repudio y cadena de custodia.</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {Object.entries(hashesData.cryptographic || {}).map(([key, value]) => (
                                <div key={key} className="bg-card/50 border border-border/60 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors group">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{key}</span>
                                    </div>
                                    <p className="font-mono text-sm break-all text-foreground/90 group-hover:text-primary transition-colors">{String(value)}</p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(String(value), key)}
                                    className={`shrink-0 border-border/50 rounded-xl h-10 px-4 transition-all ${copiedHash === key ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "hover:bg-primary hover:text-primary-foreground"}`}
                                  >
                                    {copiedHash === key ? <><CheckCircle2 className="size-4 mr-2" /> Copiado</> : <><Copy className="size-4 mr-2" /> Copiar Hash</>}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </MagicCard>

                        <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-xl overflow-hidden">
                          <div className="p-6 md:p-8">
                            <div className="flex items-center gap-4 mb-8">
                              <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl border border-purple-500/20">
                                <Fingerprint className="size-6" />
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-foreground">Firmas Perceptuales (pHash)</h3>
                                <p className="text-sm text-muted-foreground mt-1">Identificadores estructurales resistentes a alteraciones visuales leves.</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {Object.entries(hashesData.perceptual || {}).map(([key, value]) => (
                                <div key={key} className="bg-card/50 border border-border/60 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors group">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
                                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{key}</span>
                                    </div>
                                    <p className="font-mono text-sm break-all text-foreground/90 group-hover:text-primary transition-colors">{String(value)}</p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(String(value), key)}
                                    className={`shrink-0 border-border/50 rounded-xl h-10 px-4 transition-all ${copiedHash === key ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "hover:bg-primary hover:text-primary-foreground"}`}
                                  >
                                    {copiedHash === key ? <><CheckCircle2 className="size-4 mr-2" /> Copiado</> : <><Copy className="size-4 mr-2" /> Copiar Hash</>}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </MagicCard>
                      </div>
                    )}

                    {/* OBJETOS TAB */}
                    {activeTab === "objetos" && objectsData && (
                      <div className="flex flex-col gap-6">
                        <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-xl overflow-hidden p-6 md:p-8">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                            <Target className="size-4" /> Inferencia de Red Neuronal (YOLOv8)
                          </h4>
                          
                          <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl mb-8">
                            <p className="font-medium text-primary/80 leading-relaxed text-sm">
                              {objectsData.summary}
                            </p>
                          </div>
                          
                          {objectsData.counts && Object.keys(objectsData.counts).length > 0 ? (
                            <div>
                              <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Clases Identificadas</h5>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {Object.entries(objectsData.counts).map(([obj, count]) => (
                                  <div key={obj} className="bg-card/50 border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 shadow-sm hover:border-primary/30 transition-colors">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{obj}</p>
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-lg border border-primary/20">
                                      {String(count)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center p-8 bg-muted/20 border border-border/40 rounded-2xl border-dashed">
                              <Target className="size-10 mx-auto text-muted-foreground/30 mb-3" />
                              <p className="text-sm font-medium text-muted-foreground">No se detectaron objetos de interés (clases COCO) con alta confianza.</p>
                            </div>
                          )}
                        </MagicCard>
                      </div>
                    )}

                    {/* ESTEGANOGRAFÍA TAB */}
                    {activeTab === "esteganografia" && steganographyData && (
                      <div className="flex flex-col gap-6">
                        <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-xl overflow-hidden p-6 md:p-8">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                            <Lock className="size-4" /> Inspección de Payload (LSB)
                          </h4>
                          
                          <div className={`p-5 rounded-2xl border flex items-start gap-4 mb-8 ${steganographyData.lsb?.anomalies ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'}`}>
                            {steganographyData.lsb?.anomalies ? <AlertCircle className="size-6 shrink-0" /> : <CheckCircle2 className="size-6 shrink-0" />}
                            <div>
                              <h5 className="font-bold mb-1">Resultado de la Búsqueda</h5>
                              <p className="text-sm opacity-90 leading-relaxed">
                                {steganographyData.summary || (steganographyData.lsb?.anomalies ? "Se detectó entropía anómala en los bits menos significativos que sugiere datos ocultos." : "Distribución estadística normal. No hay firmas evidentes de esteganografía LSB en texto plano.")}
                              </p>
                            </div>
                          </div>

                          {steganographyData.text?.extracted && steganographyData.text.extracted.length > 0 && (
                            <div>
                              <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                <FileText className="size-3" /> Dump de Strings (ASCII Extraído)
                              </h5>
                              <div className="bg-[#0D1117] border border-border/50 p-4 rounded-2xl max-h-64 overflow-y-auto shadow-inner">
                                <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap break-all leading-relaxed">
                                  {steganographyData.text.extracted.join("\n")}
                                </pre>
                              </div>
                            </div>
                          )}
                        </MagicCard>
                      </div>
                    )}
                    
                    {/* COMPRESIÓN TAB */}
                    {activeTab === "compresion" && compressionData && (
                      <div className="flex flex-col gap-6">
                        <MagicCard gradientColor="rgba(var(--primary), 0.1)" className="border-border/40 rounded-3xl shadow-xl overflow-hidden p-6 md:p-8">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                            <Layers className="size-4" /> Topología y Formato
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-card/50 border border-border/50 p-5 rounded-2xl flex flex-col gap-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Codec</p>
                              <p className="text-lg font-black uppercase text-foreground">{compressionData.format || "N/D"}</p>
                            </div>
                            <div className="bg-card/50 border border-border/50 p-5 rounded-2xl flex flex-col gap-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Modo Color</p>
                              <p className="text-lg font-black uppercase text-foreground">{compressionData.mode || "N/D"}</p>
                            </div>
                            <div className="bg-card/50 border border-border/50 p-5 rounded-2xl flex flex-col gap-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Optimizado</p>
                              <p className="text-lg font-black text-foreground flex items-center gap-2">
                                {compressionData.compression?.optimize ? <><CheckCircle2 className="size-4 text-emerald-500" /> Sí</> : "No"}
                              </p>
                            </div>
                            <div className="bg-card/50 border border-border/50 p-5 rounded-2xl flex flex-col gap-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Progresivo</p>
                              <p className="text-lg font-black text-foreground flex items-center gap-2">
                                {compressionData.compression?.progressive ? <><CheckCircle2 className="size-4 text-emerald-500" /> Sí</> : "No"}
                              </p>
                            </div>
                          </div>
                        </MagicCard>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
