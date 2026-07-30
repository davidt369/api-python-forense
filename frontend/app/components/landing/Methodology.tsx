"use client";

import { motion, Variants } from "framer-motion";
import { Layers, FileCode, QrCode, Check } from "lucide-react";
import { Card } from "@/app/components/ui/card";

export function Methodology() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <section id="metodologia" className="py-20 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Metodología Forense Multicapa
          </h2>
          <p className="text-muted-foreground text-base mt-3 leading-relaxed">
            Cada archivo procesado pasa por rigurosas pruebas matemáticas e insumos periciales para descartar alteraciones por edición, compresión o inteligencia artificial.
          </p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          
          <motion.div variants={item}>
            <Card className="h-full p-6 sm:p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group border-border bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:bg-primary/20">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3 uppercase tracking-tight">Error Level Analysis (ELA)</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Recomprime la imagen a un nivel de error conocido para resaltar variaciones de compresión en parches modificados a nivel de píxel.
              </p>
              <div className="text-[11px] font-mono text-primary flex items-center gap-1.5 font-bold uppercase tracking-wider mt-auto pt-4 border-t border-border/50">
                <Check className="w-4 h-4" /> Detección de Photoshop/AI
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="h-full p-6 sm:p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group border-border bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:bg-primary/20">
                <FileCode className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3 uppercase tracking-tight">Extracción EXIF Profunda</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Audita las cabeceras binarias de la imagen buscando firmas de software, fecha/hora original del sensor y coordenadas de geolocalización.
              </p>
              <div className="text-[11px] font-mono text-primary flex items-center gap-1.5 font-bold uppercase tracking-wider mt-auto pt-4 border-t border-border/50">
                <Check className="w-4 h-4" /> Inspección de Metadatos
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="h-full p-6 sm:p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group border-border bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:bg-primary/20">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3 uppercase tracking-tight">Firma PDF + Código QR</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Genera automáticamente un documento PDF oficial firmado digitalmente, con código QR escaneable que redirige al registro inmutable.
              </p>
              <div className="text-[11px] font-mono text-primary flex items-center gap-1.5 font-bold uppercase tracking-wider mt-auto pt-4 border-t border-border/50">
                <Check className="w-4 h-4" /> Código de Verificación
              </div>
            </Card>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
