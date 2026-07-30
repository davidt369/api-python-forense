"use client";

import {
  Shield, Eye, Camera, BarChart3, Layers, Target, Lock, Fingerprint,
  Activity, Zap, FileText, Download, ChevronDown, ChevronUp, Search,
  CheckCircle2, AlertTriangle, Info, BookOpen, Scale
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export default function MetodologiaPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>("ela");

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

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
        { label: "Rango Alto (Alterado)", range: "50% – 100%", color: "text-red-400", badge: "destructive", desc: "Alta probabilidad de manipulación. Las diferencias en los niveles de error indican que la imagen ha sido alterada o ensamblada a partir de múltiples fuentes." },
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
        { label: "Sin EXIF", range: "Altamente Sospechoso", color: "text-red-400", badge: "destructive", desc: "La imagen no contiene ningún metadato EXIF. Esto puede indicar que fue generada por IA, descargada de redes sociales (que eliminan EXIF), o procesada por software de edición." },
        { label: "Software de Edición Detectado", range: "Alerta de Manipulación", color: "text-red-400", badge: "destructive", desc: "Si los metadatos muestran programas como 'Adobe Photoshop', 'GIMP', 'Affinity Photo' u otros editores, la imagen fue modificada después de su captura." },
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
      title: "Hashes Criptográficos y Perceptuales",
      subtitle: "Firmas digitales únicas para verificar integridad",
      description: "Los hashes son algoritmos que producen una huella digital única (un código hexadecimal) a partir de los datos de la imagen. Cualquier cambio, por mínimo que sea, altera completamente el hash. Existen dos tipos: criptográficos (MD5, SHA-256) que cambian con cualquier modificación de píxel, y perceptuales (pHash, dHash) que comparan la estructura visual.",
      whyUsed: "Los hashes criptográficos garantizan la integridad absoluta del archivo: si un solo píxel cambia, el hash es completamente diferente. Los perceptuales permiten encontrar imágenes visualmente similares aunque hayan sido redimensionadas, comprimidas o ajustadas en brillo/contraste.",
      standards: [
        { label: "SHA-256 Coincide", range: "Integridad Confirmada", color: "text-emerald-400", badge: "success", desc: "El hash SHA-256 del archivo coincide con el registrado originalmente. La imagen no ha sido modificada en absoluto." },
        { label: "MD5 / SHA-1 Coinciden", range: "Verificación Adicional", color: "text-emerald-400", badge: "success", desc: "Múltiples algoritmos confirman que el archivo está intacto. Mayor nivel de certeza." },
        { label: "Hash No Coincide", range: "Archivo Alterado", color: "text-red-400", badge: "destructive", desc: "El hash calculado no coincide con el original. El archivo ha sido modificado, aunque sea mínimamente (un solo píxel)." },
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
      title: "Análisis de Histograma RGB",
      subtitle: "Distribución de color y exposición",
      description: "El histograma muestra la distribución de los valores de píxeles en los canales Rojo, Verde y Azul (RGB). Una imagen auténtica suele tener una distribución natural y continua. Las manipulaciones como ajustes de color, saturación o clonado pueden crear picos anómalos, cortes abruptos o distribuciones irreales.",
      whyUsed: "Porque las manipulaciones digitales alteran la distribución estadística de colores. Un histograma con huecos (valores faltantes) o picos extremadamente altos en ciertos tonos puede indicar edición. El brillo y contraste medios también proporcionan pistas sobre la naturalidad de la imagen.",
      standards: [
        { label: "Distribución Continua", range: "Normal", color: "text-emerald-400", badge: "success", desc: "Los canales RGB muestran una distribución suave y continua, sin cortes abruptos ni picos artificiales. Imagen probablemente auténtica." },
        { label: "Picos Extremos o Huecos", range: "Anomalía", color: "text-amber-400", badge: "warning", desc: "Presencia de picos inusualmente altos o valores faltantes en ciertos rangos de color. Podría indicar edición selectiva o ajustes de color post-procesamiento." },
        { label: "Distribución no Natural", range: "Sospechoso", color: "text-red-400", badge: "destructive", desc: "La distribución de colores no corresponde a una fotografía natural (demasiado perfecta o con patrones repetitivos). Común en imágenes generadas por IA o manipuladas digitalmente." },
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
      title: "Análisis de Ruido y Nitidez",
      subtitle: "Consistencia del patrón de ruido del sensor",
      description: "Toda cámara digital genera un patrón de ruido único y uniforme en cada fotografía. Cuando una imagen es manipulada (clonando áreas, añadiendo objetos), las regiones editadas suelen tener un patrón de ruido diferente al resto, ya que provienen de otra fuente o han sido suavizadas artificialmente.",
      whyUsed: "Porque el ruido del sensor es inherente a la captura fotográfica y es prácticamente imposible de replicar de manera idéntica en todas las áreas de una imagen compuesta. Las zonas con ruido anormalmente bajo (suavizadas) o alto (textura diferente) delatan la manipulación.",
      standards: [
        { label: "Ruido Uniforme", range: "Normal", color: "text-emerald-400", badge: "success", desc: "El nivel de ruido es consistente en toda la imagen. No se detectan zonas con patrones de ruido anómalos." },
        { label: "Ruido Variable (+-20%)", range: "Sospechoso", color: "text-amber-400", badge: "warning", desc: "Algunas áreas muestran niveles de ruido significativamente diferentes. Podría indicar clonado o inserción de elementos de otras imágenes." },
        { label: "Anomalías de Nitidez", range: "Alerta", color: "text-red-400", badge: "destructive", desc: "Zonas demasiado nítidas (sobre-agudizadas) o demasiado suaves (desenfocadas artificialmente) en comparación con el resto de la imagen. Técnica común para ocultar manipulaciones." },
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
      title: "Análisis de Compresión",
      subtitle: "Formato, modo de color y optimización",
      description: "El análisis de compresión examina el formato real del archivo, el modo de color (RGB, CMYK, escala de grises), y si la imagen ha sido optimizada o guardada de forma progresiva. Las discrepancias entre la extensión del archivo y el formato real pueden indicar manipulación.",
      whyUsed: "Porque los formatos de archivo revelan información sobre el historial de la imagen. Un archivo con extensión .jpg pero que internamente es un PNG re-comprimido ha pasado por un proceso de conversión. Los modos de color inusuales (CMYK en una foto web) también son sospechosos.",
      standards: [
        { label: "Formato Coherente", range: "Normal", color: "text-emerald-400", badge: "success", desc: "El formato real del archivo coincide con su extensión. No hay evidencia de re-compresión o conversión." },
        { label: "Formato Incoherente", range: "Sospechoso", color: "text-amber-400", badge: "warning", desc: "El formato interno no coincide con la extensión. Ejemplo: archivo .jpg que en realidad es PNG. Indica conversión." },
        { label: "Múltiples Capas", range: "Posible Edición", color: "text-red-400", badge: "destructive", desc: "La imagen contiene información de capas o canales adicionales (alfa, CMYK). Típico de imágenes editadas en programas profesionales." },
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
      title: "Detección de Objetos (YOLOv8)",
      subtitle: "Identificación de elementos en la imagen",
      description: "Mediante redes neuronales (YOLOv8), el sistema detecta y clasifica objetos en la imagen: personas, vehículos, animales, documentos, etc. Esto permite verificar si el contenido de la imagen corresponde con lo esperado y detectar inconsistencias.",
      whyUsed: "Porque la detección de objetos ayuda a validar si el contenido de la imagen es coherente con la descripción proporcionada. También puede revelar elementos inesperados o detectar si la imagen carece de elementos que debería contener (como rostros en una foto grupal).",
      standards: [
        { label: "Objetos Detectados", range: "Coherente", color: "text-emerald-400", badge: "success", desc: "Los objetos detectados corresponden con el contenido esperado de la imagen." },
        { label: "Sin Detecciones", range: "Posible Anomalía", color: "text-amber-400", badge: "warning", desc: "El sistema no pudo identificar objetos claros en la imagen. Podría tratarse de una imagen generada por IA, muy comprimida o de baja calidad." },
        { label: "Inconsistencias", range: "Sospechoso", color: "text-red-400", badge: "destructive", desc: "Los objetos detectados no corresponden con la descripción de la imagen o hay elementos incongruentes." },
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
      title: "Detección de Esteganografía LSB",
      subtitle: "Búsqueda de información oculta en la imagen",
      description: "La esteganografía es la práctica de ocultar información dentro de una imagen digital, modificando los bits menos significativos (LSB) de los píxeles. El análisis LSB examina si existen patrones anómalos en estos bits que indiquen la presencia de datos ocultos (texto, otros archivos, o marcas de agua).",
      whyUsed: "Porque las imágenes pueden contener información oculta que no es perceptible visualmente. La detección de esteganografía es crucial en investigaciones forenses donde se sospecha que la imagen se utilizó como canal de comunicación encubierto.",
      standards: [
        { label: "Sin Anomalías LSB", range: "Normal", color: "text-emerald-400", badge: "success", desc: "No se detectaron patrones anómalos en los bits menos significativos. No hay evidencia de datos ocultos." },
        { label: "Patrón Sospechoso", range: "Alerta Leve", color: "text-amber-400", badge: "warning", desc: "Se detectan patrones inusuales en los canales de color que podrían indicar información incrustada, aunque también podrían deberse a compresión o ruido natural." },
        { label: "Datos Ocultos Detectados", range: "Alerta Crítica", color: "text-red-400", badge: "destructive", desc: "Se ha identificado y extraído información oculta en la imagen. Esto indica que la imagen fue utilizada como portadora de datos encubiertos." },
      ],
      interpretation: "La presencia de datos ocultos en una imagen es un hallazgo forense significativo, independientemente del resultado del análisis de manipulación. No implica necesariamente que la imagen esté manipulada visualmente, pero sí que contiene información encubierta.",
      disclaimer: "La compresión JPEG puede destruir los datos LSB ocultos. Por lo tanto, la esteganografía es más común en imágenes PNG, BMP o TIFF que en JPEG.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ChevronDown className="w-4 h-4 rotate-90" />
              </Button>
            </Link>
            <div className="p-1 rounded-lg bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 border border-border/50">
              <Image src="/logo/logo-afd.png" alt="AFD" width={28} height={28} className="w-7 h-7 object-contain" />
            </div>
            <div>
              <span className="font-bold text-sm">Metodología Forense</span>
              <p className="text-xs text-muted-foreground">Estándares, métricas e interpretación de resultados</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Comenzar</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="pt-16 pb-12 md:pt-24 md:pb-16 bg-gradient-to-b from-muted/30 to-background border-b border-border/30">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4 text-primary" />
              Guía Técnica Completa
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              ¿Cómo se determina si una imagen ha sido manipulada?
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Nuestro sistema aplica <strong>8 análisis forenses distintos</strong> sobre cada imagen.
              Cada uno examina un aspecto diferente y genera métricas cuantificables.
              La combinación de todos ellos permite emitir un dictamen técnico preciso.
              A continuación, explicamos cada análisis, sus rangos y cómo interpretar los resultados.
            </p>
          </div>
        </section>

        {/* Resumen visual de métricas */}
        <section className="py-12 border-b border-border/20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-8 text-center">Las 8 métricas forenses del sistema</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {metricsData.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleSection(m.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all hover:scale-105 ${m.bg} ${m.border} ${expandedSection === m.id ? 'ring-2 ring-primary' : ''}`}
                  >
                    <Icon className={`w-6 h-6 ${m.color}`} />
                    <span className="text-xs font-semibold leading-tight">{m.title.split('(')[0].trim()}</span>
                    <span className="text-[10px] text-muted-foreground">{m.subtitle}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Detalle de cada métrica */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-6 space-y-8">
            {metricsData.map((m) => {
              const Icon = m.icon;
              const isExpanded = expandedSection === m.id;
              return (
                <Card
                  key={m.id}
                  id={m.id}
                  className={`border overflow-hidden transition-all duration-300 ${m.border} ${isExpanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}`}
                >
                  <button
                    onClick={() => toggleSection(m.id)}
                    className="w-full text-left p-6 flex items-start gap-4"
                  >
                    <div className={`p-3 rounded-xl ${m.bg} ${m.color} flex-shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold">{m.title}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{m.subtitle}</p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" /> : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-6 animate-fade-in">
                      {/* Description */}
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-primary" />
                          ¿En qué consiste?
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                      </div>

                      {/* Why used */}
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-amber-400" />
                          ¿Por qué se utiliza?
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{m.whyUsed}</p>
                      </div>

                      {/* Standards Table */}
                      <div>
                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                          <Scale className="w-4 h-4 text-primary" />
                          Rangos y Estándares de Interpretación
                        </h4>
                        <div className="space-y-2">
                          {m.standards.map((s, i) => (
                            <div
                              key={i}
                              className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20"
                            >
                              <div className="flex items-center gap-2 min-w-[180px]">
                                <Badge variant={s.badge as any} className="whitespace-nowrap text-[10px] px-2 py-0.5">
                                  {s.range}
                                </Badge>
                                <span className={`text-xs font-bold ${s.color} whitespace-nowrap`}>{s.label}</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Interpretation */}
                      <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                        <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Interpretación para el dictamen final
                        </h4>
                        <p className="text-sm leading-relaxed">{m.interpretation}</p>
                      </div>

                      {/* Disclaimer */}
                      <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
                        <h4 className="font-semibold text-xs flex items-center gap-2 mb-1 text-amber-500">
                          <AlertTriangle className="w-3 h-3" />
                          Limitación técnica
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{m.disclaimer}</p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        {/* Cómo se combinan los resultados */}
        <section className="py-16 bg-muted/20 border-y border-border/30">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">¿Cómo se combinan todos estos análisis?</h2>
            <Card className="border-primary/20 shadow-lg">
              <CardContent className="p-6 space-y-4">
                <p className="text-sm leading-relaxed">
                  El dictamen final no se basa en una sola métrica, sino en la <strong>evaluación ponderada de todos los análisis</strong>:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="font-semibold text-sm">Score ELA</p>
                      <p className="text-xs text-muted-foreground">Es el indicador principal. Si supera el 18%, se activa la alerta de posible manipulación.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="font-semibold text-sm">Metadatos EXIF</p>
                      <p className="text-xs text-muted-foreground">Confirma o refuerza las sospechas. La ausencia de EXIF o presencia de software de edición respalda la alerta.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="font-semibold text-sm">Ruido, Histograma y Compresión</p>
                      <p className="text-xs text-muted-foreground">Anomalías en estas métricas aportan evidencia adicional de alteración digital.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</div>
                    <div>
                      <p className="font-semibold text-sm">Hashes, Objetos y Esteganografía</p>
                      <p className="text-xs text-muted-foreground">Complementan el análisis: verifican integridad, coherencia del contenido y detección de datos ocultos.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Decisión final del dictamen
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    El sistema clasifica la imagen como <strong>"IMAGEN APARENTEMENTE AUTÉNTICA"</strong> si el score ELA está por debajo del 18% y las demás métricas no presentan anomalías significativas. Se clasifica como <strong>"POSIBLE MANIPULACIÓN DETECTADA"</strong> si el score ELA supera el 18% y al menos dos métricas adicionales confirman irregularidades. Esta decisión se basa <strong>exclusivamente</strong> en los análisis automatizados del sistema, sin requerir herramientas externas.
                  </p>
                </div>

                <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <Download className="w-4 h-4 text-blue-400" />
                    ¿Qué contiene el certificado PDF?
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    El certificado digital incluye: datos del solicitante, identificación de la evidencia, el veredicto del análisis técnico con el score ELA y nivel de riesgo, las huellas digitales criptográficas (MD5, SHA-1, SHA-256), el resumen del dictamen pericial explicando los hallazgos, y un código QR para verificación en línea.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Preguntas frecuentes */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Preguntas Frecuentes</h2>
            <div className="space-y-4">
              {[
                {
                  q: "¿Qué tan preciso es el análisis ELA?",
                  a: "El ELA tiene una alta tasa de detección para manipulaciones que involucran copiar y pegar áreas, clonado de objetos, o superposición de texto en imágenes JPEG. Sin embargo, su precisión depende de la calidad y formato original de la imagen. Por eso se complementa siempre con las otras 7 métricas del sistema."
                },
                {
                  q: "¿Una imagen sin metadatos EXIF siempre es manipulada?",
                  a: "No necesariamente. Las redes sociales y aplicaciones de mensajería eliminan los metadatos EXIF al comprimir imágenes. Sin embargo, la ausencia de EXIF combinada con un score ELA elevado sí es un fuerte indicador de manipulación."
                },
                {
                  q: "¿El sistema puede analizar cualquier formato de imagen?",
                  a: "El sistema está optimizado para los formatos más comunes: JPEG, PNG y WEBP. Para otros formatos (BMP, TIFF, GIF), el análisis ELA puede ser menos preciso debido a las diferencias en los algoritmos de compresión."
                },
                {
                  q: "¿Qué significa que se detecte esteganografía pero no manipulación visual?",
                  a: "Significa que la imagen contiene información oculta pero la imagen en sí misma no ha sido manipulada visualmente. Esto es común en imágenes utilizadas como canales de comunicación encubiertos, donde el contenido visual es legítimo pero hay datos incrustados."
                },
                {
                  q: "¿Los hashes perceptuales pueden determinar si dos imágenes son iguales?",
                  a: "Los hashes perceptuales (pHash, dHash) determinan similitud visual, no identidad exacta. Dos imágenes con el mismo pHash pueden tener diferente resolución, formato o compresión, pero ser visualmente idénticas. Para verificar identidad exacta se usan los hashes criptográficos (SHA-256)."
                },
              ].map((faq, i) => (
                <Card key={i} className="border-border/40">
                  <CardContent className="p-4">
                    <details className="group">
                      <summary className="flex items-center justify-between cursor-pointer list-none">
                        <h3 className="font-semibold text-sm pr-4">{faq.q}</h3>
                        <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform flex-shrink-0" />
                      </summary>
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{faq.a}</p>
                    </details>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo/logo-afd.png" alt="AFD Logo" width={20} height={20} className="w-5 h-5 object-contain grayscale opacity-70" />
            <span className="text-sm text-muted-foreground">Agencia de Análisis Forense Digital</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <Link href="/metodologia" className="hover:text-foreground transition-colors font-medium text-foreground">Metodología</Link>
            <Link href="/auth/login" className="hover:text-foreground transition-colors">Acceder</Link>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Cochabamba, Bolivia</p>
        </div>
      </footer>
    </div>
  );
}
