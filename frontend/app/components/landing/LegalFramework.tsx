"use client";

import { motion } from "framer-motion";
import { Scale, CheckCircle2, Building2 } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";

export function LegalFramework() {
  return (
    <section id="ley-1173" className="py-20 bg-muted/30 border-y border-border relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, type: "spring" }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border border-border text-[11px] font-mono text-foreground font-bold tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              VALIDEZ JURÍDICA EN BOLIVIA Y SUDAMÉRICA
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Acreditado Bajo la <br />
              <span className="text-primary">Ley 1173 de Bolivia</span>
            </h2>

            <p className="text-muted-foreground text-base leading-relaxed">
              Los informes técnicos y certificados expedidos cumplen rigurosamente los estándares procesales para ser incorporados como prueba pericial en procesos judiciales, civiles, laborales y penales.
            </p>

            <div className="space-y-4 pt-2 font-medium text-sm text-foreground">
              {[
                "Preservación estricta de la Cadena de Custodia Digital bajo normativas vigentes.",
                "Dictámenes periciales refrendados por Peritos Informáticos Certificados.",
                "Cumplimiento del estándar ISO/IEC 27037 sobre manejo de evidencia digital."
              ].map((text, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
            className="lg:col-span-6 perspective-1000"
          >
            <div className="shadow-2xl shadow-primary/5 p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-6 relative overflow-hidden">
              {/* Card glow effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              
              <div className="flex items-center justify-between border-b border-border/50 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-muted rounded-lg border border-border/50">
                    <Building2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground uppercase tracking-tight">Agencia Forense Digital Bolivia</h4>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">Cochabamba &bull; Cobertura Nacional</p>
                  </div>
                </div>
                <Badge variant="info" className="px-3 py-1.5 rounded-md bg-primary/10 text-primary font-mono text-[10px] font-bold tracking-widest border-primary/20">
                  REG-2026-BOL
                </Badge>
              </div>

              <div className="bg-muted/40 p-5 rounded-lg border border-border/50 space-y-3 text-xs font-mono text-muted-foreground relative z-10 shadow-inner">
                <div className="flex justify-between border-b border-border/50 pb-2.5">
                  <span className="text-muted-foreground">Formato Documental:</span>
                  <span className="text-foreground font-semibold">PDF con Hash Embed</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2.5">
                  <span className="text-muted-foreground">Sello Criptográfico:</span>
                  <span className="text-primary font-bold">Inviolable SHA-256</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Repositorio Custodia:</span>
                  <span className="text-foreground font-semibold">Bóveda Inmutable (Turso)</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
