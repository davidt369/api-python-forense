"use client";

import React, { useState, useRef, MouseEvent, TouchEvent } from "react";
import { Card } from "@/components/ui/card";
import { MoveHorizontal } from "lucide-react";

interface ImageComparatorProps {
  image1: string;
  image2: string;
  label1?: string;
  label2?: string;
}

export function ImageComparator({ image1, image2, label1 = "Original", label2 = "ELA" }: ImageComparatorProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  return (
    <Card className="w-full relative overflow-hidden bg-slate-900 border-slate-800 rounded-xl h-[400px] md:h-[500px] shadow-2xl select-none group">
      <div 
        ref={containerRef}
        className="w-full h-full relative cursor-ew-resize"
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchEnd={() => setIsDragging(false)}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        {/* Imagen 1 (Original - Fondo) */}
        <div className="absolute inset-0 w-full h-full">
          <img src={image1} alt={label1} className="w-full h-full object-cover object-center pointer-events-none" draggable={false} />
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-md text-sm font-medium border border-white/10 shadow-lg">
            {label1}
          </div>
        </div>

        {/* Imagen 2 (ELA - Recortada con clip-path para escalado perfecto) */}
        <div 
          className="absolute inset-0 w-full h-full" 
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img src={image2} alt={label2} className="w-full h-full object-cover object-center pointer-events-none" draggable={false} />
          <div className="absolute top-4 right-4 bg-blue-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-md text-sm font-medium border border-blue-400/30 shadow-lg transition-opacity duration-200"
               style={{ opacity: sliderPosition > 10 ? 1 : 0 }}>
            {label2}
          </div>
        </div>

        {/* Línea Divisoria y Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ left: `calc(${sliderPosition}% - 2px)` }}
        >
          <div className="w-8 h-8 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 group-hover:ring-4 ring-white/30">
            <MoveHorizontal className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Card>
  );
}
