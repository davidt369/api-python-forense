"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "¿Qué es el Error Level Analysis (ELA)?",
      a: "Es una técnica forense que permite detectar si una imagen ha sido manipulada (Photoshop, AI) analizando los niveles de compresión JPEG. Las áreas modificadas resaltan como 'anomalías' ya que no comparten el mismo nivel de error que la imagen original."
    },
    {
      q: "¿Tiene validez legal este certificado en Bolivia?",
      a: "Sí. Todo el proceso está diseñado en base a la Ley 1173 (Ley de Abreviación Procesal Penal), garantizando la inmutabilidad de la cadena de custodia mediante hashing SHA-256 y sellos de tiempo, haciéndolo apto para peritajes judiciales."
    },
    {
      q: "¿Por qué el certificado incluye un Código QR?",
      a: "El código QR impreso en el PDF permite a cualquier juez, fiscal o contraparte escanear el documento físico y verificar instantáneamente en nuestro servidor que el documento no ha sido alterado desde su emisión."
    },
    {
      q: "¿Qué pasa si mi evidencia es privada y confidencial?",
      a: "El sistema no almacena el archivo original permanentemente en modo público. Solo se almacena la firma criptográfica (Hash) y los metadatos esenciales en nuestra bóveda inmutable. Tu archivo físico sigue bajo tu custodia exclusiva."
    }
  ];

  return (
    <section id="faq" className="py-20 sm:py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Preguntas Frecuentes
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="border border-border bg-card rounded-xl overflow-hidden transition-all hover:border-primary/30"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus-visible:outline-none focus-visible:bg-muted"
                aria-expanded={openIndex === idx}
                aria-controls={`faq-answer-${idx}`}
                id={`faq-question-${idx}`}
              >
                <span className="font-bold text-foreground text-sm sm:text-base pr-4">
                  {faq.q}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 shrink-0 ${openIndex === idx ? "rotate-180 text-primary" : ""}`} 
                />
              </button>
              
              <AnimatePresence initial={false}>
                {openIndex === idx && (
                  <motion.div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-question-${idx}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 sm:p-6 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border/50 bg-muted/20">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
