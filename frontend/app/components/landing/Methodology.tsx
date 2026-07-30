"use client";

import { motion, Variants } from "framer-motion";
import { Layers, Camera, Fingerprint, BarChart3, Activity, Target, Lock, ArrowRight, ScanLine } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

export function Methodology() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 80, damping: 20 } }
  };

  return (
    <section id="metodologia" className="py-24 relative overflow-hidden bg-background">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row gap-6 md:gap-10 items-end justify-between mb-16"
        >
          <div className="max-w-2xl">
            <Badge variant="info" className="border-primary/30 text-primary mb-4 px-3 py-1 font-mono text-xs uppercase tracking-widest bg-primary/5">
              <ScanLine className="w-3 h-3 mr-2 inline" /> Motor de Análisis
            </Badge>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Auditoría Forense en <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">8 Capas</span>
            </h2>
            <p className="text-muted-foreground text-lg mt-4 leading-relaxed max-w-xl">
              Nuestra tecnología no se basa en conjeturas. Aplicamos matemáticas, criptografía y redes neuronales para desmantelar cualquier alteración digital a nivel de píxel.
            </p>
          </div>
          
          <Link href="/metodologia">
            <Button className="group relative overflow-hidden bg-primary text-primary-foreground font-semibold px-6 py-6 rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)]">
              <span className="relative z-10 flex items-center gap-2">
                Ver Guía Técnica <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </Button>
          </Link>
        </motion.div>

        {/* Bento Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 auto-rows-[minmax(180px,auto)]"
        >
          {/* ELA - Large Panel */}
          <motion.div variants={item} className="md:col-span-2 md:row-span-2 group relative rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 overflow-hidden hover:border-primary/40 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] transition-all duration-300">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">Error Level Analysis (ELA)</h3>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-sm">
              Recomprime la imagen a un nivel de error conocido. Las secciones alteradas resaltan al revelar un contraste térmico de compresión, delatando inserciones como IA o Photoshop.
            </p>
            
            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground uppercase tracking-wider">Umbral Crítico</span>
                <span className="text-red-400 font-bold">&gt; 18% SOSPECHOSO</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: '18%' }} />
                <div className="h-full bg-amber-500" style={{ width: '32%' }} />
                <div className="h-full bg-red-500" style={{ width: '50%' }} />
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
          </motion.div>

          {/* EXIF */}
          <motion.div variants={item} className="md:col-span-1 md:row-span-1 group relative rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 overflow-hidden hover:border-sky-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4 text-sky-400">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Metadatos EXIF</h3>
            <p className="text-sm text-muted-foreground">Extrae trazas binarias de cámara, GPS y detecta firmas de software de edición incrustadas.</p>
          </motion.div>

          {/* Hashes */}
          <motion.div variants={item} className="md:col-span-1 md:row-span-1 group relative rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 overflow-hidden hover:border-purple-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Firmas Hash</h3>
            <p className="text-sm text-muted-foreground">Generación de SHA-256 criptográfico y pHash perceptual para verificar identidad 1:1.</p>
          </motion.div>

          {/* YOLOv8 AI */}
          <motion.div variants={item} className="md:col-span-1 md:row-span-1 group relative rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 overflow-hidden hover:border-rose-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Neuronal YOLOv8</h3>
            <p className="text-sm text-muted-foreground">Redes neuronales que auditan la coherencia del contenido y objetos detectados.</p>
          </motion.div>

          {/* Others */}
          <motion.div variants={item} className="md:col-span-1 md:row-span-1 group relative rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-6 overflow-hidden hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><BarChart3 className="w-4 h-4" /></div>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center"><Activity className="w-4 h-4" /></div>
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center"><Lock className="w-4 h-4" /></div>
              </div>
              <h3 className="text-base font-bold mb-1">Análisis Estructural</h3>
              <p className="text-xs text-muted-foreground">Ruido, Histogramas RGB, Compresión y detección de Esteganografía oculta.</p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
