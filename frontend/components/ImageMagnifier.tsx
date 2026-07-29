"use client";

import React, { useState, MouseEvent } from "react";
import { Card } from "@/components/ui/card";

interface ImageMagnifierProps {
  src: string;
  magnifierHeight?: number;
  magnifierWidth?: number;
  zoomLevel?: number;
}

export function ImageMagnifier({
  src,
  magnifierHeight = 150,
  magnifierWidth = 150,
  zoomLevel = 2.5
}: ImageMagnifierProps) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);

  return (
    <div
      className="relative w-full h-[400px] md:h-[500px] flex justify-center items-center overflow-hidden bg-slate-900 rounded-xl shadow-2xl border border-slate-800"
      onMouseEnter={(e) => {
        const elem = e.currentTarget;
        const { width, height } = elem.getBoundingClientRect();
        setSize([width, height]);
        setShowMagnifier(true);
      }}
      onMouseMove={(e) => {
        const elem = e.currentTarget;
        const { top, left } = elem.getBoundingClientRect();
        const x = e.pageX - left - window.scrollX;
        const y = e.pageY - top - window.scrollY;
        setXY([x, y]);
      }}
      onMouseLeave={() => {
        setShowMagnifier(false);
      }}
    >
      <img
        src={src}
        className="w-full h-full object-cover pointer-events-none"
        alt="Original Evidence"
      />
      
      {/* Etiqueta */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-md text-sm font-medium border border-white/10 shadow-lg z-10">
        Zoom Inteligente (Pasa el cursor)
      </div>

      <div
        className="pointer-events-none absolute border-2 border-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] z-20 bg-slate-900 transition-opacity duration-200"
        style={{
          display: showMagnifier ? "" : "none",
          position: "absolute",
          left: `${x - magnifierWidth / 2}px`,
          top: `${y - magnifierHeight / 2}px`,
          width: `${magnifierWidth}px`,
          height: `${magnifierHeight}px`,
          opacity: showMagnifier ? 1 : 0,
          backgroundImage: `url('${src}')`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
          backgroundPositionX: `${-x * zoomLevel + magnifierWidth / 2}px`,
          backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`,
          boxShadow: "0 0 0 4px rgba(255,255,255,0.1), 0 10px 25px -5px rgba(0,0,0,0.5)"
        }}
      >
        <div className="absolute inset-0 rounded-full border border-white/20 inset-shadow"></div>
      </div>
    </div>
  );
}
