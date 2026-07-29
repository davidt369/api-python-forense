"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ScanEye, RefreshCw, Info } from "lucide-react";

interface ElaGeneratorProps {
  imageUrl: string;
}

export function ElaGenerator({ imageUrl }: ElaGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImgRef = useRef<HTMLImageElement>(null);
  
  const [quality, setQuality] = useState(90);
  const [multiplier, setMultiplier] = useState(15);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      if (originalImgRef.current) {
        originalImgRef.current.src = img.src;
      }
      setTimeout(() => computeELA(img, quality, multiplier), 50);
    };
  }, [imageUrl]);

  // Si cambia la calidad o el multiplicador, recalculamos
  useEffect(() => {
    if (originalImgRef.current && originalImgRef.current.complete) {
      setIsProcessing(true);
      setTimeout(() => computeELA(originalImgRef.current!, quality, multiplier), 50);
    }
  }, [quality, multiplier]);

  const computeELA = (sourceImg: HTMLImageElement, jpegQuality: number, errorMultiplier: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // 1. Dibujar imagen original
    canvas.width = sourceImg.naturalWidth || sourceImg.width || 800;
    canvas.height = sourceImg.naturalHeight || sourceImg.height || 600;
    
    if (canvas.width === 0 || canvas.height === 0) {
      console.error("Image has 0 width or height");
      return;
    }
    
    ctx.drawImage(sourceImg, 0, 0, canvas.width, canvas.height);

    // Obtener datos originales
    const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    // 2. Comprimir a JPEG usando la calidad especificada (simulación de resave)
    const compressedDataUrl = canvas.toDataURL("image/jpeg", jpegQuality / 100);

    // 3. Cargar la imagen comprimida y compararla
    const compressedImg = new Image();
    compressedImg.onload = () => {
      // Dibujar imagen comprimida para leer sus píxeles
      ctx.drawImage(compressedImg, 0, 0);
      const newImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newData = newImgData.data;

      // 4. Calcular el Diff (Error absoluto) y multiplicar
      for (let i = 0; i < originalData.length; i += 4) {
        newData[i] = Math.abs(originalData[i] - newData[i]) * errorMultiplier;         // R
        newData[i + 1] = Math.abs(originalData[i + 1] - newData[i + 1]) * errorMultiplier; // G
        newData[i + 2] = Math.abs(originalData[i + 2] - newData[i + 2]) * errorMultiplier; // B
        newData[i + 3] = 255; // Alpha sólido
      }

      // Dibujar el resultado final ELA en el canvas
      ctx.putImageData(newImgData, 0, 0);
      setIsProcessing(false);
    };
    compressedImg.src = compressedDataUrl;
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 h-[500px] md:h-[600px]">
      
      {/* Panel Izquierdo: Controles Matemáticos */}
      <div className="w-full md:w-80 flex flex-col gap-4 shrink-0">
        <Card className="p-5 bg-slate-900 border-slate-800 shadow-xl flex-1 flex flex-col space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <ScanEye className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-white leading-tight">Motor ELA Real</h3>
              <p className="text-xs text-blue-400 font-mono">Error Level Analysis</p>
            </div>
          </div>
          
          <div className="space-y-6 flex-1">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">Calidad JPEG Base</label>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">{quality}%</span>
              </div>
              <Slider 
                value={[quality]} 
                min={50} max={99} step={1}
                onValueChange={(v) => setQuality(Array.isArray(v) ? v[0] : v as number)}
                className="py-2"
              />
              <p className="text-xs text-slate-500">Define el nivel de compresión de la re-evaluación. Típicamente 90-95%.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">Multiplicador de Error</label>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">x{multiplier}</span>
              </div>
              <Slider 
                value={[multiplier]} 
                min={5} max={50} step={1}
                onValueChange={(v) => setMultiplier(Array.isArray(v) ? v[0] : v as number)}
                className="py-2"
              />
              <p className="text-xs text-slate-500">Amplifica los artefactos diferenciales para hacerlos visibles al ojo humano.</p>
            </div>
          </div>

          <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/50 flex gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-xs text-blue-300/80 leading-relaxed">
              Esta herramienta **procesa algoritmos reales**. Toma tu imagen original, la recomprime temporalmente y resalta con colores brillantes los píxeles que sufrieron más error. Las áreas alteradas (pegadas) suelen brillar de forma distinta al resto.
            </p>
          </div>
        </Card>
      </div>

      {/* Panel Derecho: Visualizador Canvas Dinámico */}
      <div className="flex-1 relative rounded-xl overflow-hidden bg-[url('/checkerboard.png')] border border-slate-800 shadow-2xl flex items-center justify-center">
        {/* Imagen fuente escondida (memoria) */}
        <img ref={originalImgRef} style={{ display: "none" }} alt="source" />

        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-blue-400 font-medium">Calculando ELA en tiempo real...</p>
            <p className="text-xs text-slate-500 mt-2">Diferenciando píxeles...</p>
          </div>
        )}

        <canvas 
          ref={canvasRef} 
          className="max-w-full max-h-full object-contain shadow-2xl transition-opacity duration-300"
          style={{ opacity: isProcessing ? 0 : 1 }}
        />
      </div>

    </div>
  );
}
