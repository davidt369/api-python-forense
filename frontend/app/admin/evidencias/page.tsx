"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import {
  Shield, Search, FileX2, Upload, Zap,
  PlusCircle, Image as ImageIcon,
  Clock, AlertTriangle, Loader2
} from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import EvidenceImage from "@/components/EvidenceImage";

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
        return <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded text-xs font-medium border border-amber-500/20">Pendiente</span>;
      case "REVISANDO":
        return <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded text-xs font-medium border border-sky-500/20">En revisión</span>;
      case "TERMINADO":
        return <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-medium border border-emerald-500/20">Completado</span>;
      case "RECEPCIONADO":
        return <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded text-xs font-medium border border-purple-500/20">Recepcionado</span>;
      default:
        return <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-medium border border-border">{status}</span>;
    }
  };

  const getRowAction = (evidence: any) => {
    switch (evidence.status) {
      case "PENDIENTE":
        return (
          <Link href={`/admin/analisis/${evidence.id}`}>
            <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
              <Clock className="w-3 h-3 mr-1" />
              Revisar
            </Button>
          </Link>
        );
      case "REVISANDO":
        return (
          <Link href={`/admin/analisis/${evidence.id}`}>
            <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
              <Zap className="w-3 h-3 mr-1" />
              Analizar
            </Button>
          </Link>
        );
      case "TERMINADO":
      case "RECEPCIONADO":
        return (
          <Link href={`/admin/analisis/${evidence.id}`}>
            <Button size="sm" variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <Search className="w-3 h-3 mr-1" />
              Ver resultados
            </Button>
          </Link>
        );
      default:
        return (
          <Link href={`/admin/analisis/${evidence.id}`}>
            <Button size="sm" variant="outline">
              <Search className="w-3 h-3 mr-1" />
              Ver
            </Button>
          </Link>
        );
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text">Centro de Análisis Forense</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona evidencias o sube una imagen para análisis rápido</p>
          </div>
        </div>
      </div>

      {/* Quick Upload Card */}
      <Card
        className={`border-2 border-dashed transition-all duration-300 cursor-pointer ${
          dragOver
            ? "border-primary bg-primary/10 scale-[1.01] shadow-lg"
            : showUploadZone
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/20"
        } ${uploading ? "pointer-events-none opacity-70" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && (showUploadZone ? null : setShowUploadZone(true))}
      >
        <CardContent className="p-6">
          {!showUploadZone && !uploading ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Análisis Rápido</h3>
                  <p className="text-sm text-muted-foreground">
                    Arrastra una imagen aquí o haz clic para subir y analizar al instante
                  </p>
                </div>
              </div>
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <PlusCircle className="w-4 h-4 mr-1" />
                Subir imagen
              </Button>
            </div>
          ) : uploadError ? (
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-500">Error al subir</p>
                <p className="text-sm text-muted-foreground">{uploadError}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setUploadError(""); setShowUploadZone(false); }}>
                Reintentar
              </Button>
            </div>
          ) : uploading ? (
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary animate-pulse">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h3 className="font-bold text-base">Subiendo y analizando...</h3>
                <p className="text-sm text-muted-foreground">
                  La imagen se está procesando con los 8 análisis forenses
                </p>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-8"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className={`p-4 rounded-2xl mb-4 transition-all ${dragOver ? "bg-primary/20 scale-110" : "bg-muted"}`}>
                <Upload className={`w-10 h-10 ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <p className="font-semibold text-sm mb-1">
                {dragOver ? "¡Suelta la imagen aquí!" : "Arrastra una imagen o haz clic para seleccionar"}
              </p>
              <p className="text-xs text-muted-foreground mb-4">JPG, PNG o WEBP • Máximo 10MB</p>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Seleccionar imagen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUploadZone(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidence List */}
      <div className="bg-card border border-border rounded-xl shadow-sm w-full overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">Listado de Evidencias</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {loading ? "..." : `${evidencias.length} registros`}
            </span>
          </div>

          <div className="flex bg-muted p-1 rounded-md overflow-x-auto max-w-full w-full lg:w-auto snap-x">
            {["TODAS", "PENDIENTE", "REVISANDO", "TERMINADO", "RECEPCIONADO"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                disabled={loading}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition whitespace-nowrap disabled:opacity-50 ${
                  statusFilter === status ? "bg-background shadow-sm text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
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
          <div className="text-center py-16 text-muted-foreground text-sm flex flex-col items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            Cargando evidencias...
          </div>
        ) : evidencias.length === 0 ? (
          <div className="text-center py-16 px-4 bg-muted/20 border border-dashed border-border flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary mb-2">
              <FileX2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-medium text-base mb-1">
                No se encontraron casos
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {statusFilter === "TODAS"
                  ? "Aún no hay evidencias registradas. Usa el panel de Análisis Rápido para subir tu primera imagen."
                  : `No hay evidencias con el estado "${statusFilter}".`}
              </p>
            </div>
            {statusFilter === "TODAS" && (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir primera imagen
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto p-4 sm:p-5 w-full">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Cliente / Caso</th>
                  <th className="px-4 py-3 font-medium">Evidencia</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Score ELA</th>
                  <th className="px-4 py-3 font-medium text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {evidencias.map((evidence) => {
                  const elaScore = evidence.analysis?.elaScore;
                  return (
                    <tr key={evidence.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {evidence.user?.name?.charAt(0) || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate max-w-[140px]">{evidence.user?.name || "Admin"}</p>
                            <p className="text-xs text-muted-foreground">CI: {evidence.user?.ci || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <EvidenceImage
                            src={evidence.imagePath}
                            alt={evidence.originalName}
                            thumbnail
                          />
                          <span className="truncate max-w-[160px] font-medium">{evidence.originalName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(evidence.createdAt).toLocaleDateString("es-BO", {
                          day: "2-digit", month: "2-digit", year: "2-digit"
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(evidence.status)}
                      </td>
                      <td className="px-4 py-3">
                        {elaScore !== null && elaScore !== undefined ? (
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              elaScore > 50 ? "bg-red-500" :
                              elaScore > 18 ? "bg-amber-500" :
                              "bg-emerald-500"
                            }`} />
                            <span className={`text-xs font-medium ${
                              elaScore > 50 ? "text-red-400" :
                              elaScore > 18 ? "text-amber-400" :
                              "text-emerald-400"
                            }`}>
                              {elaScore.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {getRowAction(evidence)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hidden file input - always mounted for access from anywhere */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
