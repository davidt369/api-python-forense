"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import {
  Shield, Search, FileX2, Upload, Zap,
  PlusCircle, Image as ImageIcon,
  Clock, AlertTriangle, Loader2, ArrowRight, ChevronLeft, ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import EvidenceImage from "@/components/EvidenceImage";
import { motion, AnimatePresence } from "framer-motion";
import { MagicCard } from "@/components/ui/magic-card";

export default function AdminEvidenciasPage() {
  const router = useRouter();
  const [evidencias, setEvidencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("TODAS");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, itemsPerPage]);

  useEffect(() => {
    fetchEvidencias();
  }, [statusFilter]);

  const fetchEvidencias = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter !== "TODAS") {
        params.set("status", statusFilter);
      }

      const res = await fetch(`/api/evidencias?${params}`);

      if (res.ok) {
        const data = await res.json();
        setEvidencias(data.evidencias || []);
      } else {
        setEvidencias([]);
      }
    } catch (err) {
      console.error("Error fetching evidencias:", err);
      setEvidencias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Solo se permiten imágenes (JPG, PNG, WEBP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("La imagen es demasiado grande. Máximo 10MB.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", "Análisis rápido - Admin");

      const res = await fetch("/api/evidencias", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al subir");
      }

      const data = await res.json();
      const newId = data.evidence.id;

      // Auto-analizar inmediatamente
      const analyzeRes = await fetch(`/api/evidencias/${newId}/analizar`, {
        method: "POST",
      });

      if (analyzeRes.ok) {
        // Redirigir al análisis completo
        router.push(`/admin/analisis/${newId}`);
      } else {
        router.push(`/admin/analisis/${newId}`);
      }
    } catch (err: any) {
      setUploadError(err.message || "Error al subir la imagen");
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleQuickUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleQuickUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDIENTE":
        return <span className="bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-amber-500/20 shadow-sm">Pendiente</span>;
      case "REVISANDO":
        return <span className="bg-sky-500/10 text-sky-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-sky-500/20 shadow-sm">En Revisión</span>;
      case "TERMINADO":
        return <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 shadow-sm">Completado</span>;
      case "RECEPCIONADO":
        return <span className="bg-purple-500/10 text-purple-500 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-purple-500/20 shadow-sm">Recepcionado</span>;
      default:
        return <span className="bg-muted text-muted-foreground px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-border shadow-sm">{status}</span>;
    }
  };

  const getRowAction = (evidence: any) => {
    switch (evidence.status) {
      case "PENDIENTE":
        return (
          <Link href={`/admin/analisis/${evidence.id}`}>
            <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 group">
              <Clock className="w-3 h-3 mr-2" />
              Revisar
              <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </Button>
          </Link>
        );
      case "REVISANDO":
        return (
          <Link href={`/admin/analisis/${evidence.id}`}>
            <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20 group">
              <Zap className="w-3 h-3 mr-2" />
              Analizar
              <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </Button>
          </Link>
        );
      case "TERMINADO":
      case "RECEPCIONADO":
        return (
          <Link href={`/admin/analisis/${evidence.id}`}>
            <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 group">
              <Search className="w-3 h-3 mr-2" />
              Ver resultados
              <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </Button>
          </Link>
        );
      default:
        return (
          <Link href={`/admin/analisis/${evidence.id}`}>
            <Button size="sm" variant="outline" className="group border-border/50 hover:bg-muted/50">
              <Search className="w-3 h-3 mr-2 text-muted-foreground group-hover:text-foreground transition-colors" />
              Ver
            </Button>
          </Link>
        );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
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
      className="w-full max-w-full space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary flex items-center justify-center shadow-inner border border-primary/20">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Centro de Análisis Forense</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona evidencias o sube una imagen para análisis rápido</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Upload Card */}
      <motion.div variants={itemVariants}>
        <MagicCard 
          gradientColor="rgba(var(--primary), 0.15)"
          className={`
            border-2 transition-all duration-300 overflow-hidden
            ${dragOver ? "border-primary border-dashed bg-primary/5 scale-[1.01] shadow-2xl" : showUploadZone ? "border-primary border-dashed bg-card/40" : "border-border/40 bg-card/40 hover:border-primary/50"}
            ${uploading ? "pointer-events-none opacity-80 blur-[1px]" : ""}
          `}
        >
          <div 
            className="p-6 cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !uploading && (showUploadZone ? null : setShowUploadZone(true))}
          >
            <AnimatePresence mode="wait">
              {!showUploadZone && !uploading ? (
                <motion.div 
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500 shadow-inner flex-shrink-0">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg">Análisis Rápido</h3>
                      <p className="text-sm text-muted-foreground hidden sm:block">
                        Arrastra una imagen aquí o haz clic para subir y analizar al instante
                      </p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 w-full sm:w-auto font-semibold py-5">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Subir imagen para análisis
                  </Button>
                </motion.div>
              ) : uploadError ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-4 bg-red-500/5 p-4 rounded-xl border border-red-500/20"
                >
                  <div className="p-3 rounded-xl bg-red-500/10 text-red-500 flex-shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-red-500 text-base">Error al procesar</p>
                    <p className="text-sm text-red-500/70">{uploadError}</p>
                  </div>
                  <Button variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); setUploadError(""); setShowUploadZone(false); }}>
                    Reintentar
                  </Button>
                </motion.div>
              ) : uploading ? (
                <motion.div 
                  key="uploading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-6 p-4"
                >
                  <div className="p-4 rounded-2xl bg-primary/10 text-primary relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl animate-ping opacity-20" />
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-primary mb-1">Subiendo y analizando evidencia...</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ejecutando motores forenses (ELA, Metadatos, Noise)
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5 transition-colors group hover:bg-primary/10 hover:border-primary/50"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className={`p-5 rounded-full mb-6 transition-all duration-500 ${dragOver ? "bg-primary text-primary-foreground shadow-[0_0_30px_rgba(var(--primary),0.5)] scale-110" : "bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground"}`}>
                    <Upload className="w-10 h-10" />
                  </div>
                  <h3 className="font-extrabold text-xl mb-2 text-foreground">
                    {dragOver ? "¡Suelta la imagen para analizar!" : "Arrastra la evidencia aquí"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center">
                    Soportamos formatos originales JPG, PNG o WEBP para garantizar la integridad del análisis (Max. 10MB).
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="border-border/50 hover:bg-muted/50 font-medium px-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUploadZone(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 shadow-lg shadow-primary/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Examinar archivos
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </MagicCard>
      </motion.div>

      {/* Evidence List */}
      <motion.div variants={itemVariants} className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl w-full overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border/40 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Registro de Evidencias
              <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                {loading ? "..." : `${evidencias.length} totales`}
              </span>
            </h2>
          </div>

          <div className="flex bg-muted/40 p-1.5 rounded-xl overflow-x-auto max-w-full w-full lg:w-auto snap-x border border-border/30">
            {["TODAS", "PENDIENTE", "REVISANDO", "TERMINADO", "RECEPCIONADO"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                disabled={loading}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap disabled:opacity-50 relative ${
                  statusFilter === status 
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {status === "TODAS" ? "Todas" :
                 status === "PENDIENTE" ? "Pendientes" :
                 status === "REVISANDO" ? "En Proceso" :
                 status === "TERMINADO" ? "Completadas" : "Recepcionadas"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-border/40">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-44 rounded-md bg-muted" />
                  <div className="h-3 w-32 rounded-md bg-muted/60" />
                </div>
                <div className="h-6 w-20 rounded-md bg-muted" />
                <div className="h-6 w-16 rounded-md bg-muted/60" />
              </div>
            ))}
          </div>
        ) : evidencias.length === 0 ? (
          <div className="text-center py-24 px-4 bg-muted/10 flex flex-col items-center justify-center gap-4">
            <div className="p-5 bg-primary/5 rounded-3xl text-primary/40 mb-2 border border-primary/10">
              <FileX2 className="w-12 h-12" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl mb-2 text-foreground">
                Base de datos vacía
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {statusFilter === "TODAS"
                  ? "El registro está en blanco. Utiliza el panel superior para realizar el primer análisis forense."
                  : `No hay evidencias marcadas como "${statusFilter}".`}
              </p>
            </div>
            {statusFilter === "TODAS" && (
              <Button
                className="mt-4 bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-xl"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir Evidencia Inicial
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto p-0 w-full">
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Cliente / Caso</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Evidencia</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Fecha Registro</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Nivel Riesgo ELA</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Panel Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {evidencias.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((evidence) => {
                  const elaScore = evidence.analysis?.elaScore;
                  return (
                    <tr key={evidence.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-bold text-primary shadow-inner border border-primary/10">
                            {evidence.user?.name?.charAt(0) || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate max-w-[150px] group-hover:text-primary transition-colors">{evidence.user?.name || "Admin Local"}</p>
                            <p className="text-[11px] font-mono text-muted-foreground">ID: {evidence.user?.ci || "000000"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative rounded-lg overflow-hidden border border-border shadow-sm group-hover:border-primary/30 transition-colors">
                            <EvidenceImage
                              src={evidence.imagePath}
                              alt={evidence.originalName}
                              thumbnail
                            />
                          </div>
                          <span className="truncate max-w-[180px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{evidence.originalName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-muted-foreground font-mono text-xs">
                          {new Date(evidence.createdAt).toLocaleDateString("es-BO", {
                            day: "2-digit", month: "short", year: "numeric"
                          }).replace('.', '')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(evidence.status)}
                      </td>
                      <td className="px-6 py-4">
                        {elaScore !== null && elaScore !== undefined ? (
                          <div className="flex items-center gap-2">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                              elaScore > 50 ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                              elaScore > 18 ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                              "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            }`}>
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <span className={`text-sm font-extrabold ${
                              elaScore > 50 ? "text-red-500" :
                              elaScore > 18 ? "text-amber-500" :
                              "text-emerald-500"
                            }`}>
                              {elaScore.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground opacity-50">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                              <Shield className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold">---</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {getRowAction(evidence)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && evidencias.length > 0 && (
          <div className="p-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/20">
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground">
                Mostrando <span className="font-bold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-bold text-foreground">{Math.min(currentPage * itemsPerPage, evidencias.length)}</span> de <span className="font-bold text-foreground">{evidencias.length}</span>
              </p>
              <select
                value={itemsPerPage === evidencias.length && evidencias.length > 10 ? "all" : itemsPerPage}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "all") setItemsPerPage(evidencias.length);
                  else setItemsPerPage(Number(val));
                }}
                className="h-7 text-xs rounded-md border border-border/50 bg-background px-2 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value={3}>3 por pág.</option>
                <option value={5}>5 por pág.</option>
                <option value={10}>10 por pág.</option>
                <option value="all">Todos</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-foreground bg-muted/50 px-3 py-1 rounded-md border border-border/50">
                {currentPage} / {Math.ceil(evidencias.length / itemsPerPage) || 1}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(evidencias.length / itemsPerPage) || 1))}
                disabled={currentPage === (Math.ceil(evidencias.length / itemsPerPage) || 1)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Hidden file input - always mounted for access from anywhere */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
    </motion.div>
  );
}
