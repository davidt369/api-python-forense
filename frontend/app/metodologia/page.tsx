"use client";

import { useEffect, useState } from "react";
import {
  Shield, Eye, Camera, BarChart3, Layers, Target, Lock, Fingerprint,
  Activity, Zap, FileText, Download, ChevronDown, CheckCircle2, AlertTriangle, Info, BookOpen, Scale, ArrowRight
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/app/lib/utils";

const metricsData = [
  {
    id: "ela",
    icon: Eye,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    title: "Error Level Analysis (ELA)",
    subtitle: "Detección de manipulación por niveles de compresión JPEG",
    description: "El ELA analiza los niveles de error de compresión JPEG en toda la imagen. Cuando una imagen se guarda en JPEG, se comprime en bloques uniformes. Si una sección ha sido editada posteriormente, su nivel de compresión será diferente al del resto, creando un contraste visible en el análisis ELA.",
    whyUsed: "Porque las manipulaciones digitales (como añadir un objeto, clonar áreas o superponer texto) alteran los patrones de compresión originales de la imagen, generando diferencias detectables que son invisibles al ojo humano pero cuantificables por este análisis.",
    standards: [
      { label: "Rango Normal (Auténtico)", range: "0% – 18%", color: "text-emerald-400", badge: "success", desc: "La compresión es uniforme en toda la imagen. No hay evidencia de manipulación detectada por ELA." },
      { label: "Rango Medio (Sospechoso)", range: "18% – 50%", color: "text-amber-400", badge: "warning", desc: "Se detectan variaciones moderadas en los niveles de compresión. Podría indicar ediciones locales, múltiples guardados o remuestreo de la imagen." },
      { label: "Rango Alto (Alterado)", range: "50% – 100%", color: "text-red-400", badge: "danger", desc: "Alta probabilidad de manipulación. Las diferencias en los niveles de error indican que la imagen ha sido alterada o ensamblada a partir de múltiples fuentes." },
    ],
    interpretation: "Si el score ELA supera el 18%, la imagen es sospechosa de haber sido manipulada. Cuanto mayor sea el porcentaje, mayor será la probabilidad y extensión de la manipulación. Un score superior al 50% es una señal inequívoca de alteración digital.",
    disclaimer: "El ELA funciona mejor en imágenes JPEG originales. Imágenes PNG, GIF o formatos sin pérdida pueden mostrar scores elevados simplemente por su naturaleza, sin implicar manipulación.",
  },
  {
    id: "exif",
    icon: Camera,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    title: "Metadatos EXIF",
    subtitle: "Información incrustada por el dispositivo de captura",
    description: "Los metadatos EXIF (Exchangeable Image File Format) son datos que la cámara o dispositivo móvil incrusta automáticamente en la imagen al momento de capturarla. Incluyen información como el fabricante, modelo, fecha, configuración de la cámara e incluso coordenadas GPS.",
    whyUsed: "Porque los metadatos permiten verificar el origen de la imagen y detectar inconsistencias. Una foto que afirma ser de un iPhone pero cuyos metadatos muestran un editor de escritorio como Photoshop es sospechosa. La ausencia total de EXIF en imágenes que aparentan ser capturas originales también es indicativa de manipulación o procesamiento.",
    standards: [
      { label: "EXIF Completo", range: "Normal / Auténtico", color: "text-emerald-400", badge: "success", desc: "La imagen contiene metadatos completos: fabricante, modelo, fecha, parámetros de captura y posiblemente GPS. Consistente con una foto original." },
      { label: "EXIF Parcial", range: "Sospechoso", color: "text-amber-400", badge: "warning", desc: "La imagen conserva algunos metadatos pero carece de otros. Podría haber sido procesada por software que eliminó parcialmente los datos EXIF." },
      { label: "Sin EXIF", range: "Altamente Sospechoso", color: "text-red-400", badge: "danger", desc: "La imagen no contiene ningún metadato EXIF. Esto puede indicar que fue generada por IA, descargada de redes sociales (que eliminan EXIF), o procesada por software de edición." },
      { label: "Software de Edición Detectado", range: "Alerta Crítica", color: "text-red-400", badge: "danger", desc: "Si los metadatos muestran programas como 'Adobe Photoshop', 'GIMP', 'Affinity Photo' u otros editores, la imagen fue modificada después de su captura." },
    ],
    interpretation: "Los metadatos EXIF por sí solos no confirman manipulación, pero su ausencia o inconsistencia son fuertes indicadores de que la imagen ha sido procesada. La presencia de software de edición en los metadatos es una confirmación directa de modificación post-captura.",
    disclaimer: "Las redes sociales y aplicaciones de mensajería (WhatsApp, Telegram, Instagram) eliminan los metadatos EXIF al comprimir las imágenes. Una foto sin EXIF no necesariamente es manipulada, pero sí ha pasado por un proceso de re-compresión.",
  },
  {
    id: "hashes",
    icon: Fingerprint,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    title: "Hashes Criptográficos",
    subtitle: "Firmas digitales únicas para verificar integridad",
    description: "Los hashes son algoritmos que producen una huella digital única (un código hexadecimal) a partir de los datos de la imagen. Cualquier cambio, por mínimo que sea, altera completamente el hash. Existen dos tipos: criptográficos (MD5, SHA-256) que cambian con cualquier modificación de píxel, y perceptuales (pHash, dHash) que comparan la estructura visual.",
    whyUsed: "Los hashes criptográficos garantizan la integridad absoluta del archivo: si un solo píxel cambia, el hash es completamente diferente. Los perceptuales permiten encontrar imágenes visualmente similares aunque hayan sido redimensionadas, comprimidas o ajustadas en brillo/contraste.",
    standards: [
      { label: "SHA-256 Coincide", range: "Integridad Confirmada", color: "text-emerald-400", badge: "success", desc: "El hash SHA-256 del archivo coincide con el registrado originalmente. La imagen no ha sido modificada en absoluto." },
      { label: "MD5 / SHA-1 Coinciden", range: "Verificación Adicional", color: "text-emerald-400", badge: "success", desc: "Múltiples algoritmos confirman que el archivo está intacto. Mayor nivel de certeza." },
      { label: "Hash No Coincide", range: "Archivo Alterado", color: "text-red-400", badge: "danger", desc: "El hash calculado no coincide con el original. El archivo ha sido modificado, aunque sea mínimamente (un solo píxel)." },
      { label: "pHash Similar (≥90%)", range: "Visualmente Similar", color: "text-amber-400", badge: "warning", desc: "Los hashes perceptuales indican alta similitud visual pero el archivo ha sido modificado (redimensionado, re-comprimido, etc.)." },
    ],
    interpretation: "Si el SHA-256 coincide al 100%, el archivo es exactamente el mismo. Si cualquier hash criptográfico difiere, el archivo ha sido alterado. Los perceptuales son útiles para encontrar versiones modificadas de una misma imagen (diferente tamaño, formato o compresión).",
    disclaimer: "Los hashes perceptuales no son pruebas de manipulación per se. Una imagen redimensionada legítimamente tendrá un hash perceptual similar pero hash criptográfico diferente.",
  },
  {
    id: "histograma",
    icon: BarChart3,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    title: "Análisis de Histograma",
    subtitle: "Distribución de color y exposición",
    description: "El histograma muestra la distribución de los valores de píxeles en los canales Rojo, Verde y Azul (RGB). Una imagen auténtica suele tener una distribución natural y continua. Las manipulaciones como ajustes de color, saturación o clonado pueden crear picos anómalos, cortes abruptos o distribuciones irreales.",
    whyUsed: "Porque las manipulaciones digitales alteran la distribución estadística de colores. Un histograma con huecos (valores faltantes) o picos extremadamente altos en ciertos tonos puede indicar edición. El brillo y contraste medios también proporcionan pistas sobre la naturalidad de la imagen.",
    standards: [
      { label: "Distribución Continua", range: "Normal", color: "text-emerald-400", badge: "success", desc: "Los canales RGB muestran una distribución suave y continua, sin cortes abruptos ni picos artificiales. Imagen probablemente auténtica." },
      { label: "Picos Extremos o Huecos", range: "Anomalía", color: "text-amber-400", badge: "warning", desc: "Presencia de picos inusualmente altos o valores faltantes en ciertos rangos de color. Podría indicar edición selectiva o ajustes de color post-procesamiento." },
      { label: "Distribución no Natural", range: "Sospechoso", color: "text-red-400", badge: "danger", desc: "La distribución de colores no corresponde a una fotografía natural (demasiado perfecta o con patrones repetitivos). Común en imágenes generadas por IA o manipuladas digitalmente." },
    ],
    interpretation: "Un histograma con distribución natural y sin anomalías respalda la autenticidad de la imagen. Picos artificiales, huecos en la distribución o valores truncados son indicadores de edición digital.",
    disclaimer: "Algunas escenas naturales (atardeceres, cielos uniformes, fondos monocromáticos) pueden producir histogramas con picos naturales que no implican manipulación.",
  },
  {
    id: "ruido",
    icon: Activity,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    title: "Patrón de Ruido",
    subtitle: "Consistencia del ruido del sensor",
    description: "Toda cámara digital genera un patrón de ruido único y uniforme en cada fotografía. Cuando una imagen es manipulada (clonando áreas, añadiendo objetos), las regiones editadas suelen tener un patrón de ruido diferente al resto, ya que provienen de otra fuente o han sido suavizadas artificialmente.",
    whyUsed: "Porque el ruido del sensor es inherente a la captura fotográfica y es prácticamente imposible de replicar de manera idéntica en todas las áreas de una imagen compuesta. Las zonas con ruido anormalmente bajo (suavizadas) o alto (textura diferente) delatan la manipulación.",
    standards: [
      { label: "Ruido Uniforme", range: "Normal", color: "text-emerald-400", badge: "success", desc: "El nivel de ruido es consistente en toda la imagen. No se detectan zonas con patrones de ruido anómalos." },
      { label: "Ruido Variable (+-20%)", range: "Sospechoso", color: "text-amber-400", badge: "warning", desc: "Algunas áreas muestran niveles de ruido significativamente diferentes. Podría indicar clonado o inserción de elementos de otras imágenes." },
      { label: "Anomalías de Nitidez", range: "Alerta Crítica", color: "text-red-400", badge: "danger", desc: "Zonas demasiado nítidas (sobre-agudizadas) o demasiado suaves (desenfocadas artificialmente) en comparación con el resto de la imagen. Técnica común para ocultar manipulaciones." },
    ],
    interpretation: "El análisis de ruido busca inconsistencias en el patrón de ruido natural. Zonas con ruido muy diferente al promedio de la imagen son fuertes candidatas a haber sido modificadas.",
    disclaimer: "Imágenes con ISO muy alto pueden tener ruido elevado en toda la imagen, lo que es normal. El análisis compara diferencias relativas dentro de la misma imagen, no valores absolutos.",
  },
  {
    id: "compresion",
    icon: Layers,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    title: "Modos de Compresión",
    subtitle: "Formato, modo de color y optimización",
    description: "El análisis de compresión examina el formato real del archivo, el modo de color (RGB, CMYK, escala de grises), y si la imagen ha sido optimizada o guardada de forma progresiva. Las discrepancias entre la extensión del archivo y el formato real pueden indicar manipulación.",
    whyUsed: "Porque los formatos de archivo revelan información sobre el historial de la imagen. Un archivo con extensión .jpg pero que internamente es un PNG re-comprimido ha pasado por un proceso de conversión. Los modos de color inusuales (CMYK en una foto web) también son sospechosos.",
    standards: [
      { label: "Formato Coherente", range: "Normal", color: "text-emerald-400", badge: "success", desc: "El formato real del archivo coincide con su extensión. No hay evidencia de re-compresión o conversión." },
      { label: "Formato Incoherente", range: "Sospechoso", color: "text-amber-400", badge: "warning", desc: "El formato interno no coincide con la extensión. Ejemplo: archivo .jpg que en realidad es PNG. Indica conversión." },
      { label: "Múltiples Capas", range: "Posible Edición", color: "text-red-400", badge: "danger", desc: "La imagen contiene información de capas o canales adicionales (alfa, CMYK). Típico de imágenes editadas en programas profesionales." },
    ],
    interpretation: "La coherencia entre formato declarado y real es un indicador de integridad. Conversiones de formato, capas adicionales o modos de color inusuales son señales de que la imagen ha sido procesada.",
    disclaimer: "La conversión de formatos no siempre implica manipulación maliciosa. Puede deberse a optimización web legítima.",
  },
  {
    id: "objetos",
    icon: Target,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    title: "Detección Neuronal (YOLOv8)",
    subtitle: "Identificación de elementos en la imagen",
    description: "Mediante redes neuronales (YOLOv8), el sistema detecta y clasifica objetos en la imagen: personas, vehículos, animales, documentos, etc. Esto permite verificar si el contenido de la imagen corresponde con lo esperado y detectar inconsistencias.",
    whyUsed: "Porque la detección de objetos ayuda a validar si el contenido de la imagen es coherente con la descripción proporcionada. También puede revelar elementos inesperados o detectar si la imagen carece de elementos que debería contener (como rostros en una foto grupal).",
    standards: [
      { label: "Objetos Detectados", range: "Coherente", color: "text-emerald-400", badge: "success", desc: "Los objetos detectados corresponden con el contenido esperado de la imagen." },
      { label: "Sin Detecciones", range: "Posible Anomalía", color: "text-amber-400", badge: "warning", desc: "El sistema no pudo identificar objetos claros en la imagen. Podría tratarse de una imagen generada por IA, muy comprimida o de baja calidad." },
      { label: "Inconsistencias", range: "Sospechoso", color: "text-red-400", badge: "danger", desc: "Los objetos detectados no corresponden con la descripción de la imagen o hay elementos incongruentes." },
    ],
    interpretation: "La detección de objetos complementa el análisis visual y permite verificar la coherencia del contenido. La ausencia de objetos detectables en imágenes que deberían contenerlos es un indicador adicional de posible manipulación o generación artificial.",
    disclaimer: "La detección de objetos tiene limitaciones. Factores como la resolución, iluminación y ángulo pueden afectar la precisión del modelo YOLOv8.",
  },
  {
    id: "esteganografia",
    icon: Lock,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    title: "Esteganografía LSB",
    subtitle: "Búsqueda de información oculta en la imagen",
    description: "La esteganografía es la práctica de ocultar información dentro de una imagen digital, modificando los bits menos significativos (LSB) de los píxeles. El análisis LSB examina si existen patrones anómalos en estos bits que indiquen la presencia de datos ocultos (texto, otros archivos, o marcas de agua).",
    whyUsed: "Porque las imágenes pueden contener información oculta que no es perceptible visualmente. La detección de esteganografía es crucial en investigaciones forenses donde se sospecha que la imagen se utilizó como canal de comunicación encubierto.",
    standards: [
      { label: "Sin Anomalías LSB", range: "Normal", color: "text-emerald-400", badge: "success", desc: "No se detectaron patrones anómalos en los bits menos significativos. No hay evidencia de datos ocultos." },
      { label: "Patrón Sospechoso", range: "Alerta Leve", color: "text-amber-400", badge: "warning", desc: "Se detectan patrones inusuales en los canales de color que podrían indicar información incrustada, aunque también podrían deberse a compresión o ruido natural." },
      { label: "Datos Ocultos Detectados", range: "Alerta Crítica", color: "text-red-400", badge: "danger", desc: "Se ha identificado y extraído información oculta en la imagen. Esto indica que la imagen fue utilizada como portadora de datos encubiertos." },
    ],
    interpretation: "La presencia de datos ocultos en una imagen es un hallazgo forense significativo, independientemente del resultado del análisis de manipulación. No implica necesariamente que la imagen esté manipulada visualmente, pero sí que contiene información encubierta.",
    disclaimer: "La compresión JPEG puede destruir los datos LSB ocultos. Por lo tanto, la esteganografía es más común en imágenes PNG, BMP o TIFF que en JPEG.",
  },
];

export default function MetodologiaPage() {
  const [activeId, setActiveId] = useState<string>("ela");
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Intersection Observer to update activeId
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" } // Adjust these margins to trigger earlier/later
    );

    metricsData.forEach((m) => {
      const el = document.getElementById(`section-${m.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-slate-100 selection:bg-primary/20 selection:text-primary font-sans">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX }}
      />
      
      {/* Background Decorators */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[40%] -left-[10%] w-[30%] h-[30%] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-border/10 bg-[#020817]/80 backdrop-blur-xl sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <ArrowRight className="w-5 h-5 rotate-180" />
              </Button>
            </Link>
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-border/20 shadow-inner">
              <Image src="/logo/logo-afd.png" alt="AFD" width={24} height={24} className="w-6 h-6 object-contain" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight">Manual Operativo</span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Motor de Inferencia V1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/register">
              <Button size="sm" className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-[0_0_20px_-5px_rgba(var(--primary),0.5)]">
                Empezar Auditoría
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 border-b border-border/10">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary mb-8 tracking-widest uppercase"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Especificación Técnica
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 leading-[1.1]"
            >
              Anatomía de una <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Verdad Digital</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
            >
              Nuestro motor aplica 8 vectores de ataque algorítmico sobre cada archivo. 
              Extraemos la entropía matemática y las anomalías estructurales que escapan al ojo humano, 
              entregando una certeza criptográfica inmutable.
            </motion.p>
          </div>
        </section>

        {/* Dual Pane Layout */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 relative">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 relative items-start">
            
            {/* Left Pane - Sticky Navigation */}
            <aside className="w-full lg:w-72 lg:sticky lg:top-32 lg:h-[calc(100vh-10rem)] hidden lg:flex flex-col gap-2 shrink-0 overflow-y-auto pb-8 scrollbar-none">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4 px-3">Vectores de Análisis</h3>
              {metricsData.map((m) => {
                const Icon = m.icon;
                const isActive = activeId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => scrollTo(m.id)}
                    className={cn(
                      "flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all duration-300",
                      isActive 
                        ? `bg-slate-800/80 shadow-lg border border-slate-700` 
                        : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg transition-colors", isActive ? m.bg + " " + m.color : "bg-slate-800 text-slate-500")}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={cn("text-sm font-semibold", isActive ? "text-slate-100" : "")}>{m.title}</span>
                  </button>
                );
              })}
            </aside>

            {/* Right Pane - Content */}
            <div className="flex-1 space-y-24 md:space-y-32">
              {metricsData.map((m, index) => {
                const Icon = m.icon;
                return (
                  <div key={m.id} id={`section-${m.id}`} className="scroll-mt-32">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={cn("p-4 rounded-2xl border", m.bg, m.border, m.color)}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">Vector 0{index + 1}</div>
                        <h2 className="text-3xl font-bold tracking-tight">{m.title}</h2>
                      </div>
                    </div>
                    
                    <p className="text-xl text-slate-300 leading-relaxed mb-8 font-medium">
                      {m.subtitle}
                    </p>

                    <div className="grid gap-6">
                      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 md:p-8">
                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-4 text-slate-200 uppercase tracking-wider font-mono">
                          <Info className="w-4 h-4 text-primary" />
                          Mecanismo Operativo
                        </h4>
                        <p className="text-base text-slate-400 leading-relaxed">{m.description}</p>
                      </div>

                      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 md:p-8">
                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-4 text-slate-200 uppercase tracking-wider font-mono">
                          <Zap className="w-4 h-4 text-amber-400" />
                          Justificación Forense
                        </h4>
                        <p className="text-base text-slate-400 leading-relaxed">{m.whyUsed}</p>
                      </div>

                      <div className="mt-8">
                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-6 text-slate-200 uppercase tracking-wider font-mono">
                          <Scale className="w-4 h-4 text-primary" />
                          Matriz de Evaluación
                        </h4>
                        <div className="space-y-3">
                          {m.standards.map((s, i) => (
                            <div
                              key={i}
                              className="group flex flex-col md:flex-row md:items-start gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/30 hover:bg-slate-800/50 transition-colors"
                            >
                              <div className="flex flex-col items-start gap-2 min-w-[220px] shrink-0">
                                <Badge variant={s.badge as any} className="font-mono text-[10px] px-2 py-0.5 tracking-widest uppercase">
                                  {s.range}
                                </Badge>
                                <span className={cn("text-sm font-bold", s.color)}>{s.label}</span>
                              </div>
                              <p className="text-sm text-slate-400 leading-relaxed mt-1">{s.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-8">
                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                          <h4 className="font-semibold text-xs flex items-center gap-2 mb-3 text-emerald-400 uppercase tracking-wider font-mono">
                            <CheckCircle2 className="w-4 h-4" />
                            Dictamen Final
                          </h4>
                          <p className="text-sm text-slate-300 leading-relaxed">{m.interpretation}</p>
                        </div>

                        <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/20">
                          <h4 className="font-semibold text-xs flex items-center gap-2 mb-3 text-amber-500 uppercase tracking-wider font-mono">
                            <AlertTriangle className="w-4 h-4" />
                            Límites de Confianza
                          </h4>
                          <p className="text-sm text-slate-400 leading-relaxed">{m.disclaimer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Synthesis Section */}
        <section className="py-24 bg-slate-900/50 border-t border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-12 text-center tracking-tight">Síntesis Criptográfica</h2>
            <div className="p-1 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl">
              <Card className="border-none bg-slate-950/50 backdrop-blur-xl rounded-[22px]">
                <div className="p-8 md:p-12 space-y-12">
                  <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium text-center max-w-2xl mx-auto">
                    La verdad pericial no reside en un solo vector. Nuestro algoritmo pondera los 8 análisis para emitir un veredicto definitivo.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-sm font-bold shrink-0 border border-slate-700">01</div>
                        <div>
                          <p className="font-bold text-slate-200 mb-1">Cálculo ELA Principal</p>
                          <p className="text-sm text-slate-400">Pivote central de la decisión. &gt;18% gatilla alertas críticas.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-sm font-bold shrink-0 border border-slate-700">02</div>
                        <div>
                          <p className="font-bold text-slate-200 mb-1">Verificación EXIF</p>
                          <p className="text-sm text-slate-400">Ausencia o software detectado sella la confirmación de alteración.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-sm font-bold shrink-0 border border-slate-700">03</div>
                        <div>
                          <p className="font-bold text-slate-200 mb-1">Chequeo Estructural</p>
                          <p className="text-sm text-slate-400">Ruido y compresión aportan evidencia circunstancial robusta.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-sm font-bold shrink-0 border border-slate-700">04</div>
                        <div>
                          <p className="font-bold text-slate-200 mb-1">Integridad Criptográfica</p>
                          <p className="text-sm text-slate-400">Hashes SHA-256 aseguran que el archivo evaluado es inmutable.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center">
                    <div className="p-4 bg-emerald-500/20 rounded-xl shrink-0">
                      <Shield className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-emerald-400 mb-2">Certificado de Autenticidad Emitido</h4>
                      <p className="text-sm text-slate-300">Si el score ELA es inferior al 18% y las firmas EXIF y estructurales son consistentes, se emite un certificado digital PDF infalsificable, verificado mediante un código QR anclado a nuestra base de datos.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 bg-[#020817] relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo/logo-afd.png" alt="AFD Logo" width={24} height={24} className="w-6 h-6 object-contain grayscale opacity-50" />
            <span className="text-sm text-slate-500 font-medium tracking-wide">Agencia de Análisis Forense Digital</span>
          </div>
          <p className="text-xs text-slate-600 font-mono tracking-widest uppercase">© {new Date().getFullYear()} SISTEMA CORE</p>
        </div>
      </footer>
    </div>
  );
}
