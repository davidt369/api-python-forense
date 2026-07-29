"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface DynamicUploaderProps {
  onImageChange: (imageUrl: string) => void;
  currentImage: string;
}

export function DynamicUploader({ onImageChange, currentImage }: DynamicUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsProcessing(true);
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageChange(e.target.result as string);
          setIsProcessing(false);
        }
      };
      
      reader.readAsDataURL(file);
    }
  }, [onImageChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1
  });

  const isDefaultImage = currentImage === "/poc-assets/original.jpg";

  return (
    <div className="w-full mb-8">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6
          ${isDragActive ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-500'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex-1 flex flex-col items-center md:items-start text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-full ${isDragActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-blue-400'}`}>
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Análisis Dinámico de Evidencias</h3>
              <p className="text-sm text-slate-400">Next.js Drag & Drop Engine</p>
            </div>
          </div>
          <p className="text-slate-300 max-w-md mt-2 text-center md:text-left">
            Arrastra cualquier imagen de tu computadora aquí para cargarla y analizarla dinámicamente en todas las herramientas periciales.
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800 shadow-inner">
          <div className="flex flex-col items-end justify-center">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Evidencia Activa</span>
            {isProcessing ? (
              <span className="text-sm text-blue-400 animate-pulse font-medium">Procesando...</span>
            ) : isDefaultImage ? (
              <span className="text-sm text-amber-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Demo Cargada</span>
            ) : (
              <span className="text-sm text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Imagen Personalizada</span>
            )}
          </div>
          
          <div className="w-16 h-16 relative rounded-md overflow-hidden bg-slate-800 border border-slate-700">
            {currentImage && (
              <Image 
                src={currentImage} 
                alt="Active Evidence Preview"
                fill
                className="object-cover"
                sizes="64px"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
