"use client";

import React, { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Layers, Image as ImageIcon } from "lucide-react";

interface RgbSplitterProps {
  imageUrl: string;
}

export function RgbSplitter({ imageUrl }: RgbSplitterProps) {
  const sourceImgRef = useRef<HTMLImageElement>(null);
  const redCanvasRef = useRef<HTMLCanvasElement>(null);
  const greenCanvasRef = useRef<HTMLCanvasElement>(null);
  const blueCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      if (sourceImgRef.current) {
        sourceImgRef.current.src = img.src;
      }
      processChannels(img);
      setIsLoaded(true);
    };
  }, [imageUrl]);

  const processChannels = (img: HTMLImageElement) => {
    const canvases = [
      { ref: redCanvasRef, channel: 0 },   // Red
      { ref: greenCanvasRef, channel: 1 }, // Green
      { ref: blueCanvasRef, channel: 2 }   // Blue
    ];

    canvases.forEach(({ ref, channel }) => {
      const canvas = ref.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = img.naturalWidth || img.width || 800;
      canvas.height = img.naturalHeight || img.height || 600;
      
      if (canvas.width > 0 && canvas.height > 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        return;
      }

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Keep only the target channel, zero out the others
      for (let i = 0; i < data.length; i += 4) {
        if (channel === 0) {
          data[i + 1] = 0; // G
          data[i + 2] = 0; // B
        } else if (channel === 1) {
          data[i] = 0;     // R
          data[i + 2] = 0; // B
        } else if (channel === 2) {
          data[i] = 0;     // R
          data[i + 1] = 0; // G
        }
      }

      ctx.putImageData(imgData, 0, 0);
    });
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <Layers className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="font-bold text-white text-lg">Separación Espectral RGB</h2>
          <p className="text-slate-400 text-sm">
            Técnica forense real para aislar los canales Rojo, Verde y Azul. 
            Permite descubrir artefactos, manchas o firmas ocultas que no son visibles a simple vista en la imagen combinada.
          </p>
        </div>
      </div>

      {!isLoaded && (
        <div className="h-64 flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800 animate-pulse">
          <p className="text-slate-500 font-medium">Procesando canales...</p>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Original */}
        <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-xl p-3 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-200 font-medium text-sm border-b border-slate-800 pb-2">
            <ImageIcon className="w-4 h-4 text-slate-400" />
            Imagen Original
          </div>
          <div className="bg-[url('/checkerboard.png')] rounded-lg flex-1 overflow-hidden flex items-center justify-center">
             <img ref={sourceImgRef} alt="Original" className="max-w-full max-h-[300px] object-contain shadow-lg" />
          </div>
        </Card>

        {/* Canal Rojo */}
        <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-xl p-3 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-200 font-medium text-sm border-b border-slate-800 pb-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            Canal Rojo (R)
          </div>
          <div className="bg-[url('/checkerboard.png')] rounded-lg flex-1 overflow-hidden flex items-center justify-center">
             <canvas ref={redCanvasRef} className="max-w-full max-h-[300px] object-contain shadow-lg" />
          </div>
        </Card>

        {/* Canal Verde */}
        <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-xl p-3 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-200 font-medium text-sm border-b border-slate-800 pb-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            Canal Verde (G)
          </div>
          <div className="bg-[url('/checkerboard.png')] rounded-lg flex-1 overflow-hidden flex items-center justify-center">
             <canvas ref={greenCanvasRef} className="max-w-full max-h-[300px] object-contain shadow-lg" />
          </div>
        </Card>

        {/* Canal Azul */}
        <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-xl p-3 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-200 font-medium text-sm border-b border-slate-800 pb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
            Canal Azul (B)
          </div>
          <div className="bg-[url('/checkerboard.png')] rounded-lg flex-1 overflow-hidden flex items-center justify-center">
             <canvas ref={blueCanvasRef} className="max-w-full max-h-[300px] object-contain shadow-lg" />
          </div>
        </Card>

      </div>
    </div>
  );
}
