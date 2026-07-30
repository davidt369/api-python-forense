"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { buttonVariants } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";
import { InteractiveScanner } from "./InteractiveScanner";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BorderBeam } from "@/components/ui/border-beam";

export function HeroSection({ user, dashboardPath }: { user: any; dashboardPath: string }) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 20 } }
  };

  return (
    <section className="relative pt-12 pb-16 lg:pt-28 lg:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-6 space-y-6 text-left"
          >
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span>MOTOR FORENSE ACTIVO &bull; SHA-256 / ELA EN TIEMPO REAL</span>
              </div>
            </motion.div>

            <motion.h1 
              variants={itemVariants} 
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-foreground font-sans"
            >
              Certificación Forense Digital{" "}
              <span className="bg-gradient-to-r from-primary via-sky-400 to-emerald-400 bg-clip-text text-transparent block sm:inline">
                de Alta Precisión
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl font-normal">
              Garantiza la autenticidad e integridad de pruebas digitales con algoritmos ELA (Error Level Analysis), extracción de metadatos EXIF y firma criptográfica inalterable con validez jurídica plena.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 pt-2 w-full">
              <Link href={user ? dashboardPath : "/auth/register"} className="w-full sm:w-auto">
                <ShimmerButton className="shadow-lg h-12 px-7 w-full sm:w-auto rounded-xl" background="hsl(var(--primary))">
                  <span className="text-center text-sm font-bold leading-none tracking-tight text-primary-foreground flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Certificar Evidencia Digital
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </ShimmerButton>
              </Link>
              <a 
                href="#validar-hash" 
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }), 
                  "w-full sm:w-auto h-12 px-6 rounded-xl border-border/80 bg-card/60 hover:bg-muted text-foreground font-semibold text-sm transition-all"
                )}
              >
                <Search className="w-4 h-4 mr-2 text-primary" />
                Validar Código Hash
              </a>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-6 border-t border-border/60 grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono tracking-tight">100%</div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Validez Legal</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-primary font-mono tracking-tight">&lt; 0.05s</div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Hash SHA-256</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono tracking-tight">99.9%</div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Precisión ELA</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-card/40"
            id="demostracion-live"
          >
            <InteractiveScanner />
            <BorderBeam size={220} duration={12} delay={9} />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
