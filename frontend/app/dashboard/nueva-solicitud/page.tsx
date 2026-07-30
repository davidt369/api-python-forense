"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PortalLayout from "@/app/components/PortalLayout";
import { Button } from "@/app/components/ui/button";

import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileImage, AlertCircle, Send, X, Camera } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";

export default function NuevaSolicitud() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSetFile = (selectedFile: File) => {
    setError("");
    
    // Validar tipo
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Formato inválido. Solo se aceptan imágenes JPG, PNG o WEBP.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    
    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(`La imagen pesa demasiado (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB). El límite es de 10MB.`);
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    
    setFile(selectedFile);
    
    // Generar vista previa
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, [previewUrl]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor, selecciona una imagen.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);

    try {
      const res = await fetch("/api/evidencias", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Ocurrió un error al subir la solicitud.");
      }
    } catch (err) {
      setError("Error de red al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Limpiar memoria de la vista previa al desmontar
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <PortalLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-3xl mx-auto space-y-8 mt-4"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
            <Camera className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Nueva Solicitud de Análisis</h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Inicia el proceso de peritaje forense subiendo la evidencia original sin alteraciones.
          </p>
        </div>

        <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm mb-6 border border-destructive/20 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleUpload} className="space-y-8">
              {/* Drag & Drop Zone */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-primary" /> 
                  Evidencia Fotográfica
                </label>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    relative group border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center overflow-hidden
                    ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border/60 hover:border-primary/50 hover:bg-muted/20'}
                    ${previewUrl ? 'min-h-[300px]' : 'min-h-[250px]'}
                  `}
                  onClick={() => document.getElementById("fileUpload")?.click()}
                >
                  <AnimatePresence mode="wait">
                    {previewUrl ? (
                      <motion.div 
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-2xl ring-4 ring-primary/20"
                      >
                        <img src={previewUrl} alt="Vista previa" className="w-full h-auto object-cover max-h-[300px]" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity backdrop-blur-sm duration-300">
                          <UploadCloud className="w-8 h-8 text-white mb-2" />
                          <span className="text-white text-sm font-semibold">Haz clic para cambiar imagen</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center pointer-events-none"
                      >
                        <div className={`
                          w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300
                          ${isDragging ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}
                        `}>
                          <UploadCloud className={`w-8 h-8 ${isDragging ? 'animate-bounce' : ''}`} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">
                          {isDragging ? 'Suelta el archivo aquí' : 'Haz clic o arrastra tu archivo'}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                          Soporte para formatos de alta calidad: JPG, PNG, WEBP (Max. 10MB)
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Metadatos Flotantes (si hay archivo) */}
                  {file && previewUrl && (
                    <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/50 text-xs font-mono font-medium flex items-center gap-2 shadow-sm pointer-events-none">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  )}
                  {file && previewUrl && (
                     <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-4 right-4 bg-destructive/80 hover:bg-destructive text-white p-1.5 rounded-lg transition-colors shadow-sm"
                     >
                       <X className="w-4 h-4" />
                     </button>
                  )}
                </div>
                <input 
                  id="fileUpload" 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      validateAndSetFile(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Descripcion */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  Descripción del caso <span className="text-muted-foreground/50 font-normal capitalize">(Opcional)</span>
                </label>
                <textarea 
                  className="w-full bg-muted/20 border border-border/50 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none shadow-inner" 
                  rows={4} 
                  placeholder="Proporciona contexto relevante sobre la captura de esta evidencia..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border/30">
                <Button 
                  type="button" 
                  variant="ghost"
                  className="w-full sm:w-auto rounded-xl hover:bg-muted/50"
                  onClick={() => router.push("/dashboard")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !file}
                  className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-semibold"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Enviar Solicitud
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </PortalLayout>
  );
}
