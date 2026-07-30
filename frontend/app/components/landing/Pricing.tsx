"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Check, Zap, Sparkles } from "lucide-react";
import { buttonVariants } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";
import { MagicCard } from "@/components/ui/magic-card";

export function Pricing() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <section id="tarifas" className="py-20 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Planes y Servicios de Certificación
          </h2>
          <p className="text-muted-foreground text-base mt-3">
            Selecciona la modalidad de análisis que requiera tu caso legal o auditoría corporativa.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8 items-stretch pt-4"
        >
          {/* Plan 1 */}
          <motion.div variants={item}>
            <MagicCard className="shadow-lg hover:shadow-xl p-6 sm:p-8 rounded-2xl border border-border bg-card flex flex-col justify-between h-full space-y-6" gradientColor="rgba(var(--primary), 0.1)">
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-foreground mb-2 uppercase tracking-tight">Análisis Expres</h3>
                <p className="text-[13px] text-muted-foreground mb-6">Ideal para verificación personal rápida de imágenes y metadatos.</p>
                <div className="text-3xl font-extrabold text-foreground font-mono mb-4 border-b border-border/50 pb-4">
                  Bs. 50 <span className="text-xs font-sans text-muted-foreground font-normal tracking-wide uppercase">/ análisis</span>
                </div>
                <ul className="space-y-4 text-[13px] text-muted-foreground font-medium pt-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    Análisis ELA en tiempo real
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    Reporte de Metadatos EXIF
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    Cálculo de Hash SHA-256
                  </li>
                </ul>
              </div>
              <Link href="/auth/register" className={cn(buttonVariants({ variant: "outline" }), "w-full h-12 rounded-lg border-border text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 font-bold uppercase tracking-wider text-[11px] focus-visible:ring-2 focus-visible:ring-primary relative z-10")}>
                  Comenzar Análisis
              </Link>
            </MagicCard>
          </motion.div>

          {/* Plan 2: Recommended */}
          <motion.div variants={item} className="relative z-20">
            <MagicCard className="shadow-2xl shadow-primary/20 p-6 sm:p-8 rounded-2xl border-2 border-primary bg-background flex flex-col justify-between h-full space-y-6 relative group md:scale-105" gradientColor="rgba(var(--primary), 0.2)">
              {/* Dynamic Glow - Fixed to not need overflow-hidden on parent */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-t-2xl pointer-events-none" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md flex items-center gap-1.5 whitespace-nowrap z-30">
                <Sparkles className="w-3 h-3" />
                Certificación Oficial
              </div>

              <div className="relative z-10 mt-2">
                <h3 className="text-lg font-bold text-primary mb-2 uppercase tracking-tight">Dictamen Pericial</h3>
                <p className="text-[13px] text-muted-foreground mb-6">Para presentación de evidencia en procesos judiciales.</p>
                <div className="text-3xl font-extrabold text-foreground font-mono mb-4 border-b border-border/50 pb-4">
                  Bs. 250 <span className="text-xs font-sans text-muted-foreground font-normal tracking-wide uppercase">/ documento</span>
                </div>
                <ul className="space-y-4 text-[13px] text-foreground font-semibold pt-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    Todo lo de Análisis Expres
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    Revisión Manual por Perito
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    Sello Criptográfico QR
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    PDF Firmado Digitalmente
                  </li>
                </ul>
              </div>
              <Link href="/auth/register" className={cn(buttonVariants(), "w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-[11px] shadow-lg shadow-primary/30 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary relative z-10")}>
                  <Zap className="w-3.5 h-3.5 mr-2 inline" />
                  Solicitar Dictamen
              </Link>
            </MagicCard>
          </motion.div>

          {/* Plan 3 */}
          <motion.div variants={item}>
            <MagicCard className="shadow-lg hover:shadow-xl p-6 sm:p-8 rounded-2xl border border-border bg-card flex flex-col justify-between h-full space-y-6" gradientColor="rgba(var(--primary), 0.1)">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2 uppercase tracking-tight">Enterprise / B2B</h3>
                <p className="text-[13px] text-muted-foreground mb-6">Para bufetes, fiscalías e instituciones con alto volumen.</p>
                <div className="text-3xl font-extrabold text-foreground font-mono mb-4 border-b border-border/50 pb-4">
                  Custom
                </div>
                <ul className="space-y-4 text-[13px] text-muted-foreground font-medium pt-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    Volumen de certificaciones
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    Acceso a API de validación
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    Soporte prioritario 24/7
                  </li>
                </ul>
              </div>
              <Link href="/contacto" className={cn(buttonVariants({ variant: "ghost" }), "w-full h-12 rounded-lg bg-muted hover:bg-slate-200 dark:hover:bg-slate-800 text-foreground font-bold uppercase tracking-wider text-[11px] focus-visible:ring-2 focus-visible:ring-primary")}>
                  Contactar Ventas
              </Link>
            </MagicCard>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
