"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Layers, FileCode, Lock, CheckCircle2 } from "lucide-react";

export function InteractiveScanner() {
  const [activeScanTab, setActiveScanTab] = useState<"ela" | "exif" | "hash">("ela");
  const [elaIntensity, setElaIntensity] = useState<number>(75);
  const [isScanning, setIsScanning] = useState<boolean>(true);

  return (
    <div className="relative shadow-xl shadow-primary/5 rounded-xl overflow-hidden transition-all border border-border bg-card">
      {/* Terminal Header Bar */}
      <div className="h-10 bg-muted/80 border-b border-border px-4 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-l border-border pl-4">
            afd-core-system
          </span>
        </div>

        <button
          onClick={() => setIsScanning(!isScanning)}
          className="text-[10px] font-mono px-2 py-1 rounded-md bg-accent text-primary border border-border hover:bg-primary/10 transition-colors flex items-center gap-1.5 font-bold tracking-wider focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Activity className={`w-3 h-3 ${isScanning ? "animate-spin text-primary" : ""}`} />
          {isScanning ? "PROCESANDO" : "DETENIDO"}
        </button>
      </div>

      {/* Tab Selector */}
      <div className="grid grid-cols-3 bg-muted/50 border-b border-border text-xs font-mono relative">
        {(["ela", "exif", "hash"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveScanTab(tab)}
            className={`py-3 px-3 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 font-bold tracking-wide transition-all relative z-10 ${
              activeScanTab === tab
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary`}
          >
            {tab === "ela" && <Layers className="w-4 h-4" />}
            {tab === "exif" && <FileCode className="w-4 h-4" />}
            {tab === "hash" && <Lock className="w-4 h-4" />}
            <span className="uppercase">{tab === "ela" ? "Análisis ELA" : tab === "exif" ? "Datos EXIF" : "Firma Hash"}</span>
            
            {activeScanTab === tab && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Viewer Body */}
      <div className="p-5 sm:p-6 bg-card space-y-4 min-h-[360px] flex flex-col justify-between relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          {/* ELA TAB */}
          {activeScanTab === "ela" && (
            <motion.div
              key="ela"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                  style={{
                    backgroundImage: `url('/logo/logo-afd.png')`,
                    backgroundSize: "140px",
                    backgroundRepeat: "no-repeat",
                    filter: `contrast(${100 + elaIntensity / 2}%) brightness(${90 + elaIntensity / 4}%) hue-rotate(${elaIntensity * 1.5}deg)`,
                  }}
                />

                {isScanning && (
                  <motion.div
                    initial={{ top: "0%" }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_15px_var(--primary)] z-10"
                  />
                )}

                <div className="absolute inset-0 bg-corporate-grid opacity-30 pointer-events-none" />

                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md border border-border px-3 py-1 rounded-md text-[10px] font-bold text-foreground flex items-center gap-2 shadow-sm tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  INTEGRIDAD OK
                </div>

                <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-md border border-border px-3 py-1 rounded-md text-[10px] font-bold font-mono text-foreground shadow-sm">
                  ERROR: {elaIntensity}%
                </div>
              </div>

              <div className="bg-muted p-3.5 rounded-lg border border-border flex items-center justify-between gap-4 shadow-sm">
                <span className="text-[11px] font-bold tracking-wider text-muted-foreground whitespace-nowrap uppercase">
                  Sensibilidad ELA:
                </span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={elaIntensity}
                  onChange={(e) => setElaIntensity(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 rounded-full cursor-pointer bg-slate-300 dark:bg-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-muted"
                  aria-label="Sensibilidad ELA"
                />
                <span className="text-[11px] font-mono font-bold text-primary w-8 text-right">
                  {elaIntensity}%
                </span>
              </div>
            </motion.div>
          )}

          {/* EXIF TAB */}
          {activeScanTab === "exif" && (
            <motion.div
              key="exif"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 text-xs font-mono"
            >
              <div className="bg-muted/50 p-5 rounded-lg border border-border space-y-3 shadow-inner">
                {[
                  { label: "Cámara / Dispositivo:", value: "Canon EOS R5 Forensics", primary: true },
                  { label: "Software Edición:", value: "Ninguno (RAW original)" },
                  { label: "Geolocalización GPS:", value: "-17.3895° S, -66.1568° W" },
                  { label: "Timestamp Captura:", value: "2026-07-29T10:14:22.004Z" },
                  { label: "Espacio de Color:", value: "sRGB IEC61966-2.1 Unmodified" },
                ].map((item, idx) => (
                  <div key={idx} className={`flex justify-between ${idx !== 4 ? "border-b border-border/50 pb-2" : ""}`}>
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={item.primary ? "text-primary font-semibold" : "text-foreground font-medium"}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Metadatos EXIF consistentes sin alteración.
              </p>
            </motion.div>
          )}

          {/* HASH TAB */}
          {activeScanTab === "hash" && (
            <motion.div
              key="hash"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 text-xs font-mono"
            >
              <div className="bg-muted/50 p-5 rounded-lg border border-border space-y-4 shadow-inner">
                <div>
                  <span className="text-muted-foreground block mb-1.5 font-semibold">Hash SHA-256 Inalterable:</span>
                  <div className="bg-background p-3 rounded-md border border-border text-foreground break-all select-all font-bold shadow-sm ring-1 ring-primary/20">
                    e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-background p-3 rounded-md border border-border shadow-sm">
                    <span className="text-muted-foreground block mb-0.5">Algoritmo:</span>
                    <span className="text-foreground font-bold">SHA-256 (FIPS 180-4)</span>
                  </div>
                  <div className="bg-background p-3 rounded-md border border-border shadow-sm">
                    <span className="text-muted-foreground block mb-0.5">Sello QR:</span>
                    <span className="text-primary font-bold">Verificado online</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Status */}
        <div className="pt-4 border-t border-border flex items-center justify-between text-xs mt-auto">
          <div className="flex items-center gap-2 text-primary font-bold font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>DICTAMEN: AUTÉNTICO</span>
          </div>
          <span className="text-muted-foreground font-mono font-bold bg-muted px-2 py-1 rounded-sm">
            #AFD-2026-LIVE
          </span>
        </div>
      </div>
    </div>
  );
}
