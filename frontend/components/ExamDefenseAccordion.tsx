"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqData = [
  {
    question: "¿Cuál fue la necesidad identificada?",
    answer: "Durante el análisis forense tradicional, los peritos sufren de fatiga visual y falta de ergonomía al comparar imágenes en interfaces 2D estáticas. Era necesario un entorno libre de distracciones que permitiera manipular (rotar, hacer zoom) la evidencia de forma natural y contrastar los metadatos visuales (ELA) de forma interactiva."
  },
  {
    question: "¿Por qué decidió desarrollar esta funcionalidad?",
    answer: "Porque las tecnologías emergentes (WebGL, 3D) y la interactividad (Sliders, Lupa Inteligente) elevan drásticamente la UX. Permiten identificar alteraciones digitales con mayor precisión al combinar modelos 3D y componentes de comparación directa, cumpliendo con los estándares modernos de software forense."
  },
  {
    question: "¿Qué tecnologías utilizó?",
    answer: "Se utilizó Next.js 14 y React 19 para la arquitectura frontend. Three.js y @react-three/fiber para el motor gráfico 3D WebGL de alto rendimiento. Para la interfaz y accesibilidad se empleó Shadcn UI, Tailwind CSS y Lucide Icons, garantizando un Responsive avanzado."
  },
  {
    question: "¿Qué dificultades encontró y cómo las resolvió?",
    answer: "El principal reto fue el colapso del 'Canvas' 3D en dispositivos móviles debido a flexbox, lo que causaba un renderizado entrecortado. Lo resolví aplicando CSS absoluto ('absolute inset-0') para forzar la ocupación total del contenedor. Además, ajusté la resolución del ShadowMap a 2048x2048 para eliminar sombras pixeladas."
  },
  {
    question: "¿Cómo se integraría al proyecto del equipo?",
    answer: "Está diseñado como un micro-frontend totalmente atomizado. Simplemente se importa el componente <VisorEvidencia3D /> dentro del Dashboard actual de revisión (ruta dinámica [id]), inyectándole por 'props' las URLs de las imágenes generadas por nuestra API en Python (FastAPI)."
  }
];

export function ExamDefenseAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full space-y-4">
      {faqData.map((item, index) => (
        <div 
          key={index} 
          className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <button
            className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none"
            onClick={() => toggle(index)}
          >
            <span className="font-semibold text-slate-200 text-sm md:text-base pr-4">
              {item.question}
            </span>
            <ChevronDown 
              className={`w-5 h-5 text-blue-500 transition-transform duration-300 ${
                openIndex === index ? "rotate-180" : ""
              }`} 
            />
          </button>
          
          <div 
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-6 pb-5 text-sm md:text-base text-slate-400 leading-relaxed border-t border-slate-800/50 pt-4">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
