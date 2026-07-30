"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { buttonVariants } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";
import { InteractiveScanner } from "./InteractiveScanner";

export function HeroSection({ user, dashboardPath }: { user: any; dashboardPath: string }) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
  };

  return (
    <section className="relative pt-10 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-6 space-y-7 text-left"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="info" className="gap-2.5 px-3 py-1.5 rounded-md bg-primary/10 border-primary/20 text-[11px] font-mono text-primary shadow-sm font-semibold tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                MOTOR FORENSE ACTIVO &bull; SHA-256 / ELA EN TIEMPO REAL
              </Badge>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-foreground font-sans">
              Certificación <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Forense Digital
              </span> <br />
              de Alta Precisión
            </motion.h1>

            <motion.p variants={itemVariants} className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl font-medium">
              Garantiza la autenticidad e integridad de pruebas digitales con algoritmos ELA (Error Level Analysis), extracción EXIF y firma criptográfica inalterable con validez jurídica plena.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href={user ? dashboardPath : "/auth/register"} className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto h-12 px-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-[15px] shadow-lg shadow-primary/25 transition-all group focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary")}>
                  Certificar Evidencia Digital
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform inline" />
              </Link>
              <a href="#validar-hash" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto h-12 px-8 rounded-md border-border bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-foreground font-semibold text-[15px] shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary")}>
                  <Search className="w-4 h-4 mr-2 text-primary inline" />
                  Validar Código Hash
              </a>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-6 border-t border-border grid grid-cols-3 gap-4 sm:gap-6">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground font-mono tracking-tight">100%</div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Validez Ley 1173</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary font-mono tracking-tight">&lt; 0.05s</div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Hash SHA-256</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground font-mono tracking-tight">99.9%</div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Precisión ELA</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="lg:col-span-6 relative perspective-1000"
            id="demostracion-live"
          >
            <InteractiveScanner />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
