"use client";

import React, { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Layers, Eye } from "lucide-react";
import jsPDF from "jspdf";

interface CanvasFilterLabProps {
  imageUrl: string;
}

export function CanvasFilterLab({ imageUrl }: CanvasFilterLabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImgRef = useRef<HTMLImageElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("none");

  // Al cargar, dibujar la imagen original en el canvas
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      if (sourceImgRef.current) {
        sourceImgRef.current.src = img.src;
      }
      resetCanvas(img);
    };
  }, [imageUrl]);

  const resetCanvas = (img: HTMLImageElement | null = sourceImgRef.current) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    
    // Set canvas dimensions to match image
    canvas.width = img.naturalWidth || img.width || 800;
    canvas.height = img.naturalHeight || img.height || 600;
    
    // Draw original image
    if (canvas.width > 0 && canvas.height > 0) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    setActiveFilter("none");
  };

  // Función matemática compleja: Convolución de Píxeles
  const applyConvolutionFilter = (matrix: number[], opaque = true) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // Reset first to avoid compounding filters
      if (sourceImgRef.current) {
        ctx.drawImage(sourceImgRef.current, 0, 0);
      }

      const width = canvas.width;
      const height = canvas.height;
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      
      const side = Math.round(Math.sqrt(matrix.length));
      const halfSide = Math.floor(side / 2);
      const src = data;
      const sw = width;
      const sh = height;
      const w = sw;
      const h = sh;
      
      const output = ctx.createImageData(w, h);
      const dst = output.data;

      // Aplicar matriz de convolución (Algoritmo de procesamiento matemático de imágenes)
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const dstOff = (y * w + x) * 4;
          let r = 0, g = 0, b = 0, a = 0;
          
          for (let cy = 0; cy < side; cy++) {
            for (let cx = 0; cx < side; cx++) {
              const scy = Math.min(Math.max(y + cy - halfSide, 0), sh - 1);
              const scx = Math.min(Math.max(x + cx - halfSide, 0), sw - 1);
              const srcOff = (scy * sw + scx) * 4;
              const wt = matrix[cy * side + cx];
              r += src[srcOff] * wt;
              g += src[srcOff + 1] * wt;
              b += src[srcOff + 2] * wt;
              a += src[srcOff + 3] * wt;
            }
          }
          
          dst[dstOff] = r;
          dst[dstOff + 1] = g;
          dst[dstOff + 2] = b;
          dst[dstOff + 3] = a + (opaque ? (255 - a) : 0);
        }
      }
      
      ctx.putImageData(output, 0, 0);
      setIsProcessing(false);
    }, 50); // Pequeño timeout para permitir que React actualice la UI (mostrar loader)
  };

  const applyInvert = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      if (sourceImgRef.current) ctx.drawImage(sourceImgRef.current, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];     // red
        data[i + 1] = 255 - data[i + 1]; // green
        data[i + 2] = 255 - data[i + 2]; // blue
      }
      ctx.putImageData(imgData, 0, 0);
      setActiveFilter("invert");
      setIsProcessing(false);
    }, 50);
  };

  const applySobel = () => {
    // Matriz de detección de bordes (Filtro espacial frecuentemente usado en forense)
    const sobelMatrix = [
      -1, -1, -1,
      -1,  8, -1,
      -1, -1, -1
    ];
    applyConvolutionFilter(sobelMatrix);
    setActiveFilter("sobel");
  };

  const applyEmboss = () => {
    // Matriz de relieve (Resalta texturas)
    const embossMatrix = [
      -2, -1,  0,
      -1,  1,  1,
       0,  1,  2
    ];
    applyConvolutionFilter(embossMatrix);
    setActiveFilter("emboss");
  };

  const generatePDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Obtener la imagen procesada
    const imgDataUrl = canvas.toDataURL("image/jpeg", 0.95);
    
    // Crear PDF (Formato Carta)
    const pdf = new jsPDF("p", "mm", "letter");
    
    // Colores corporativos
    const primaryColor = [15, 23, 42]; // slate-950
    const accentColor = [59, 130, 246]; // blue-500
    const textColor = [51, 65, 85]; // slate-700
    
    // ---------------- PÁGINA 1: PORTADA Y METADATOS ----------------
    // Barra superior
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, 216, 40, "F");
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.text("REPORTE PERICIAL DIGITAL", 20, 22);
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Suite Forense Multimedia - Next.js Enterprise", 20, 30);
    
    // Información del Caso
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("1. DATOS DEL ANÁLISIS", 20, 55);
    pdf.line(20, 57, 196, 57);
    
    pdf.setFontSize(10);
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    
    const metaData = [
      ["ID del Caso:", `CASO-${Math.floor(Math.random() * 9000) + 1000}`],
      ["Fecha de Análisis:", new Date().toLocaleString()],
      ["Perito a cargo:", "David Tola (Prueba de Concepto)"],
      ["Filtro Algorítmico:", activeFilter.toUpperCase()],
      ["Motor de Procesado:", "HTML5 Canvas - Cliente Web"],
    ];
    
    let yPos = 65;
    metaData.forEach((row) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(row[0], 20, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(row[1], 60, yPos);
      yPos += 8;
    });

    // Descripción Técnica
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text("2. METODOLOGÍA TÉCNICA", 20, 115);
    pdf.line(20, 117, 196, 117);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    
    const descripcion = "El presente reporte ha sido generado automáticamente mediante algoritmos de \n" +
                        "convolución procesados en tiempo real. La manipulación de la matriz de píxeles \n" +
                        "(ImagenData) permite aislar frecuencias, detectar bordes matemáticos y revelar \n" +
                        "alteraciones que no son visibles al ojo humano, manteniendo intacta la \n" +
                        "cadena de custodia ya que los datos no abandonan el dispositivo del analista.";
    pdf.text(descripcion, 20, 125);

    // ---------------- PÁGINA 2: EVIDENCIA VISUAL ----------------
    pdf.addPage();
    
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, 216, 25, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("ANEXO VISUAL: EVIDENCIA PROCESADA", 20, 16);
    
    // Insertar la imagen procesada
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxImgWidth = pageWidth - margin * 2;
    const ratio = canvas.height / canvas.width;
    const imgHeight = maxImgWidth * ratio;
    
    // Marco para la imagen
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(margin - 2, 40 - 2, maxImgWidth + 4, imgHeight + 4);
    
    pdf.addImage(imgDataUrl, "JPEG", margin, 40, maxImgWidth, imgHeight);
    
    // Firmas
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    
    pdf.line(40, 240, 90, 240);
    pdf.text("Firma del Perito", 50, 245);
    
    pdf.line(125, 240, 175, 240);
    pdf.text("Sello de Autorización", 132, 245);
    
    // Guardar el PDF
    pdf.save(`Reporte_Forense_${activeFilter}_${Date.now()}.pdf`);
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6">
      
      {/* Controles del Laboratorio */}
      <div className="md:col-span-1 space-y-4">
        <Card className="p-4 bg-slate-900 border-slate-800 shadow-xl space-y-4">
          <h3 className="font-semibold text-slate-200 border-b border-slate-700 pb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Filtros Matemáticos
          </h3>
          
          <div className="flex flex-col gap-3">
            <Button 
              variant={activeFilter === "none" ? "default" : "secondary"} 
              onClick={() => resetCanvas()}
              disabled={isProcessing}
              className="justify-start"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
              Restaurar Original
            </Button>
            
            <Button 
              variant={activeFilter === "sobel" ? "default" : "secondary"} 
              onClick={applySobel}
              disabled={isProcessing}
              className="justify-start"
            >
              <Eye className="w-4 h-4 mr-2" />
              Detección de Bordes
            </Button>
            
            <Button 
              variant={activeFilter === "emboss" ? "default" : "secondary"} 
              onClick={applyEmboss}
              disabled={isProcessing}
              className="justify-start"
            >
              <Layers className="w-4 h-4 mr-2" />
              Filtro de Relieve (Emboss)
            </Button>

            <Button 
              variant={activeFilter === "invert" ? "default" : "secondary"} 
              onClick={applyInvert}
              disabled={isProcessing}
              className="justify-start"
            >
              <Eye className="w-4 h-4 mr-2" />
              Inversión Espectral
            </Button>
          </div>
        </Card>

        <Card className="p-4 bg-blue-900/20 border-blue-800/50 shadow-xl space-y-4">
          <h3 className="font-semibold text-blue-200 text-sm">
            Exportación Forense
          </h3>
          <p className="text-xs text-blue-300/80 leading-relaxed mb-2">
            Genera un reporte PDF con la matriz de píxeles resultante.
          </p>
          <Button 
            onClick={generatePDF}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Reporte PDF
          </Button>
        </Card>
      </div>

      {/* Visualizador del Canvas */}
      <div className="md:col-span-3">
        <Card className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-950 border-slate-800 rounded-xl overflow-hidden relative shadow-2xl p-4">
          
          {/* Elemento imagen oculto usado como fuente de datos */}
          <img ref={sourceImgRef} style={{ display: 'none' }} alt="source" />

          {isProcessing && (
            <div className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
              <p className="text-blue-400 font-medium">Procesando matriz de píxeles...</p>
            </div>
          )}

          <div className="w-full h-full flex justify-center items-center overflow-auto rounded-lg bg-[url('/checkerboard.png')] bg-repeat">
             {/* El elemento canvas donde se dibujan y manipulan los píxeles */}
             <canvas 
               ref={canvasRef} 
               className="max-w-full max-h-full object-contain shadow-2xl rounded-md transition-opacity duration-300"
               style={{ opacity: isProcessing ? 0.3 : 1 }}
             />
          </div>

        </Card>
      </div>

    </div>
  );
}
