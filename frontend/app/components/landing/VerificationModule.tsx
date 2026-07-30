"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Activity, Shield, AlertTriangle, HelpCircle, Check, Copy } from "lucide-react";
import { Button } from "@/app/components/ui/button";

const sampleHashes = [
  {
    code: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    label: "Certificado #AFD-8921 (VÁLIDO)",
    status: "VALID",
    file: "evidencia_fotografica_escena_001.png",
    date: "2026-07-28 14:32:05 UTC",
    elaScore: "99.8% Integridad",
    perito: "Lic. Carlos Mendoza (Perito Informático #482)"
  },
  {
    code: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    label: "Certificado #AFD-7734 (ALERTA COMPROBADA)",
    status: "WARNING",
    file: "contrato_firmado_scan_v2.pdf",
    date: "2026-07-15 09:12:44 UTC",
    elaScore: "64.2% Anormalidad ELA detectada",
    perito: "Detección Automática de Resaltado"
  }
];

export function VerificationModule() {
  const [searchHash, setSearchHash] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const handleVerify = (hashCodeToTest?: string) => {
    const code = hashCodeToTest || searchHash;
    if (!code.trim()) return;
    setVerifying(true);
    setVerifyResult(null);

    setTimeout(() => {
      setVerifying(false);
      const match = sampleHashes.find((s) => s.code === code.trim());
      if (match) {
        setVerifyResult(match);
      } else {
        setVerifyResult({
          code: code.trim(),
          status: "NOT_FOUND",
          label: "Hash No Registrado o Inexistente",
          file: "Documento Desconocido",
          date: "N/A",
          elaScore: "Desconocido",
          perito: "Sin certificación en servidor"
        });
      }
    }, 800);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <section id="validar-hash" className="py-16 sm:py-24 bg-background/80 border-y border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-mono text-primary mb-3 font-medium shadow-sm shadow-primary/5">
            <Search className="w-3.5 h-3.5" />
            VERIFICADOR PÚBLICO DE CERTIFICADOS
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Comprueba la Autenticidad de un Documento
          </h2>
          <p className="text-muted-foreground text-sm mt-3">
            Ingresa el código Hash SHA-256 del certificado para validar su registro oficial e inviolabilidad en nuestro servidor.
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="shadow-xl shadow-primary/5 p-5 sm:p-8 rounded-xl bg-card border border-border space-y-5"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow group">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
                placeholder="Pega el hash SHA-256 o código QR (ej. e3b0c442...)"
                className="w-full bg-muted/50 border border-border rounded-lg pl-12 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono transition-all"
                aria-label="Código Hash a verificar"
              />
            </div>
            <Button
              onClick={() => handleVerify()}
              disabled={verifying}
              className="h-14 px-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition-all whitespace-nowrap shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              {verifying ? (
                <span className="flex items-center gap-2 font-mono uppercase tracking-wider text-xs">
                  <Activity className="w-4 h-4 animate-spin" /> Consultando...
                </span>
              ) : (
                <span className="uppercase tracking-wider text-[13px]">Validar Hash</span>
              )}
            </Button>
          </div>

          {/* Sample Quick-Test Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/50">
            <span className="text-xs font-mono text-muted-foreground">Probar ejemplo:</span>
            {sampleHashes.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchHash(s.code);
                  handleVerify(s.code);
                }}
                className="text-xs font-mono px-3 py-1.5 rounded-md bg-muted/50 hover:bg-primary/10 hover:text-primary text-muted-foreground border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Verification Result Display */}
          <AnimatePresence mode="wait">
            {verifyResult && (
              <motion.div
                key={verifyResult.code}
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 overflow-hidden"
              >
                <div className="pt-6 border-t border-border">
                  {verifyResult.status === "VALID" && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 sm:p-6 rounded-lg space-y-4 shadow-lg shadow-emerald-500/5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-500/20 pb-4 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            <Shield className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-base uppercase tracking-tight">CERTIFICADO AUTÉNTICO & VERIFICADO</h4>
                            <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-mono uppercase tracking-wider mt-0.5">Cadena de custodia ininterrumpida</p>
                          </div>
                        </div>
                        <span className="self-start sm:self-auto px-3 py-1.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] font-bold tracking-widest">
                          ESTADO: 100% VÁLIDO
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-muted-foreground">
                        <div className="bg-background/50 p-4 rounded-md border border-emerald-500/20">
                          <span className="text-muted-foreground block mb-1">Archivo Certificado:</span>
                          <span className="text-foreground font-semibold">{verifyResult.file}</span>
                        </div>
                        <div className="bg-background/50 p-4 rounded-md border border-emerald-500/20">
                          <span className="text-muted-foreground block mb-1">Timestamp Registro:</span>
                          <span className="text-foreground">{verifyResult.date}</span>
                        </div>
                        <div className="bg-background/50 p-4 rounded-md border border-emerald-500/20">
                          <span className="text-muted-foreground block mb-1">Examen de Integridad ELA:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{verifyResult.elaScore}</span>
                        </div>
                        <div className="bg-background/50 p-4 rounded-md border border-emerald-500/20">
                          <span className="text-muted-foreground block mb-1">Perito Responsable:</span>
                          <span className="text-foreground font-semibold">{verifyResult.perito}</span>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <span className="text-[11px] font-mono text-emerald-700/80 dark:text-emerald-400/80 break-all bg-emerald-500/10 px-2 py-1 rounded">
                          Hash: {verifyResult.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(verifyResult.code)}
                          className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-md font-mono shrink-0 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          {copiedHash ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copiedHash ? "Copiado" : "Copiar Hash"}
                        </button>
                      </div>
                    </div>
                  )}

                  {verifyResult.status === "WARNING" && (
                    <motion.div 
                      initial={{ x: [-10, 10, -10, 10, 0] }} 
                      transition={{ duration: 0.4 }}
                      className="bg-destructive/10 border border-destructive/30 p-5 sm:p-6 rounded-lg space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                        <div>
                          <h4 className="font-bold text-destructive text-base">ALERTA: ANOMALÍA EN EL ARCHIVO</h4>
                          <p className="text-xs text-destructive/80 font-mono mt-1">{verifyResult.elaScore}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {verifyResult.status === "NOT_FOUND" && (
                    <motion.div 
                      initial={{ x: [-10, 10, -10, 10, 0] }} 
                      transition={{ duration: 0.4 }}
                      className="bg-muted/50 border border-border p-8 rounded-lg text-center space-y-3"
                    >
                      <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto" />
                      <h4 className="font-bold text-foreground text-lg">Hash No Encontrado</h4>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        El código ingresado no corresponde a ningún certificado emitido por nuestra plataforma. Asegúrate de haberlo copiado correctamente.
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </section>
  );
}
