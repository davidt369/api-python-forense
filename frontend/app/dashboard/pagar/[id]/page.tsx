"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import PortalLayout from "@/app/components/PortalLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UploadCloud, CheckCircle2, AlertCircle, ArrowLeft, Receipt, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "boneyard-js/react";
import { MagicCard } from "@/components/ui/magic-card";

export default function PagoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchEvidence();
  }, [id]);

  const fetchEvidence = async () => {
    try {
      const res = await fetch(`/api/evidencias/${id}/pago`);
      if (res.ok) {
        const data = await res.json();
        setEvidence(data.payment);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError("");
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Formato inválido. Sube una captura en JPG, PNG o WEBP.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    
    setFile(selectedFile);
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
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      const formData = new FormData();
      formData.append("paymentProof", file);

      const res = await fetch(`/api/evidencias/${id}/pago`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Error al subir comprobante");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground font-mono animate-pulse">Verificando estado de pago...</p>
        </div>
      </PortalLayout>
    );
  }

  if (!evidence) {
    return (
      <PortalLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Solicitud no encontrada</h2>
          <p className="text-muted-foreground mb-6">No pudimos encontrar la solicitud o el comprobante de pago.</p>
          <Link href="/dashboard"><Button>Volver al inicio</Button></Link>
        </div>
      </PortalLayout>
    );
  }

  if (evidence.status !== "PENDIENTE") {
    return (
      <PortalLayout>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto mt-16"
        >
          <MagicCard className="border-border/40 bg-card/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden text-center p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            >
              <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
            </motion.div>
            <h2 className="text-2xl font-extrabold mb-2">Pago Registrado</h2>
            <p className="text-muted-foreground mb-8">Esta solicitud ya no está pendiente de pago. Nos encontramos procesando la evidencia.</p>
            <Link href="/dashboard">
              <Button className="w-full rounded-xl" size="lg">Volver al Panel de Control</Button>
            </Link>
          </MagicCard>
        </motion.div>
      </PortalLayout>
    );
  }

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
    <PortalLayout>
      <Skeleton name="pago-main" loading={false}>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto space-y-8 mt-4"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-2">
                <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Dashboard
              </Link>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Procesamiento de Pago</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <span className="font-mono text-primary/80 bg-primary/10 px-2 py-0.5 rounded text-xs border border-primary/20">
                  ID: {id}
                </span>
              </p>
            </div>
            
            <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <div className="text-sm">
                <p className="font-semibold text-primary">Transacción Segura</p>
                <p className="text-xs text-primary/70">Cifrado de extremo a extremo</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Instrucciones y QR */}
            <motion.div variants={itemVariants} className="lg:col-span-5">
              <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-xl rounded-3xl h-full flex flex-col">
                <CardContent className="p-6 sm:p-8 flex flex-col items-center flex-1">
                  <div className="w-full self-start mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-emerald-500" />
                      Detalles del Cobro
                    </h2>
                    <p className="text-sm text-muted-foreground">Escanea el QR con tu aplicación bancaria</p>
                  </div>

                  <div className="w-full bg-background/50 border border-border/50 rounded-2xl p-5 mb-8 shadow-inner">
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">Servicio Forense</span>
                      <span className="font-semibold text-foreground text-sm text-right">Análisis ELA & Certificación</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-muted-foreground font-medium">Total a Pagar</span>
                      <span className="font-black text-3xl bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                        Bs. {evidence.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="relative w-64 h-64 bg-white border-4 border-slate-200/50 rounded-3xl p-4 flex items-center justify-center shadow-lg group hover:border-emerald-500/30 transition-colors">
                    <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Image src="/qr-pago/qr-pago.png" alt="QR de Pago" width={224} height={224} className="w-full h-full object-contain rounded-xl relative z-10 mix-blend-multiply" />
                  </div>
                  
                  <div className="mt-8 flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 px-4 py-2 rounded-full border border-border/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    QR Estático · Banco Unión · Cuenta Oficial AFD
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Subir comprobante */}
            <motion.div variants={itemVariants} className="lg:col-span-7">
              <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-xl rounded-3xl h-full">
                <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-primary" />
                      Comprobante de Transferencia
                    </h2>
                    <p className="text-sm text-muted-foreground">Adjunta la captura de pantalla o foto nítida del pago realizado.</p>
                  </div>

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

                  <form onSubmit={handleUpload} className="space-y-6 flex-1 flex flex-col">
                    <div className="flex-1 min-h-[300px]">
                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                          relative group h-full border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center overflow-hidden
                          ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border/60 hover:border-primary/50 hover:bg-muted/20'}
                        `}
                        onClick={() => document.getElementById("receipt")?.click()}
                      >
                        <AnimatePresence mode="wait">
                          {previewUrl ? (
                            <motion.div 
                              key="preview"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="relative w-full max-w-sm mx-auto rounded-xl overflow-hidden shadow-xl ring-2 ring-primary/20 h-full flex flex-col"
                            >
                              <div className="flex-1 bg-black/5 flex items-center justify-center p-2">
                                <img src={previewUrl} alt="Vista previa" className="max-h-56 object-contain" />
                              </div>
                              <div className="bg-background/90 backdrop-blur-md p-3 border-t border-border flex justify-between items-center">
                                <span className="text-xs font-mono truncate max-w-[200px] text-foreground font-medium">{file?.name}</span>
                                <span className="text-xs font-bold text-primary hover:underline cursor-pointer">Cambiar</span>
                              </div>
                              
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
                                <UploadCloud className="w-8 h-8 text-white" />
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
                              <h3 className="text-lg font-bold text-foreground mb-1">
                                {isDragging ? 'Suelta el comprobante' : 'Haz clic o arrastra tu captura'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Solo formatos JPG o PNG permitidos
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {file && previewUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              setPreviewUrl(null);
                            }}
                            className="absolute top-4 right-4 bg-destructive/80 hover:bg-destructive text-white p-1.5 rounded-lg transition-colors shadow-sm z-20"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <Input
                        id="receipt"
                        type="file"
                        className="hidden"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={(e) => {
                          const selected = e.target.files?.[0];
                          if (selected) validateAndSetFile(selected);
                        }}
                      />
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-sm text-amber-600 dark:text-amber-400">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Una vez enviado el comprobante, tu solicitud pasará a estado <strong className="font-bold">En Revisión</strong>. Nuestro equipo verificará el pago e iniciará el peritaje digital inmediatamente.
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={!file || uploading} 
                      className="w-full rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all text-base py-6 font-bold"
                    >
                      {uploading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Procesando Envío...
                        </span>
                      ) : (
                        "Confirmar y Enviar Comprobante"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </Skeleton>
    </PortalLayout>
  );
}
