"use client";

import React, { useState } from "react";
import VisorEvidencia3D from "@/components/VisorEvidencia3D";
import { ArrowLeft, Beaker, ShieldCheck, Zap, GraduationCap, Cpu } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ElaGenerator } from "@/components/ElaGenerator";
import { ImageMagnifier } from "@/components/ImageMagnifier";
import { CanvasFilterLab } from "@/components/CanvasFilterLab";
import { RgbSplitter } from "@/components/RgbSplitter";
import { DynamicUploader } from "@/components/DynamicUploader";



export default function PagePoc3D() {
  const [activeImage, setActiveImage] = useState<string>("/poc-assets/original.jpg");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
        
        {/* Encabezado */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-400 mb-6 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Suite Forense <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500">Multimedia</span>
              </h1>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-sm hidden sm:inline-flex">
                PoC Experimental
              </Badge>
            </div>
            <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
              Prueba de Concepto (PoC) integral con múltiples recursos multimedia interactivos: 
              Modelos 3D, Comparadores de imágenes, Filtros Matemáticos y Asistentes IA.
            </p>
          </div>
        </header>

        {/* Dynamic Drag & Drop Uploader */}
        <DynamicUploader onImageChange={setActiveImage} currentImage={activeImage} />

        {/* Múltiples Funcionalidades Multimedia (Tabs) */}
        <section className="w-full">
          <Tabs defaultValue="visor3d" className="w-full">
            <div className="flex flex-wrap justify-center mb-6 gap-2">
              <TabsList className="bg-slate-900 border border-slate-800 h-auto p-1 flex-wrap justify-center">
                <TabsTrigger value="visor3d" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-2 px-4">
                  Visor 3D (WebGL)
                </TabsTrigger>
                <TabsTrigger value="ela-generator" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-2 px-4">
                  Motor ELA Real
                </TabsTrigger>
                <TabsTrigger value="magnifier" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-2 px-4">
                  Zoom Inteligente (Lupa)
                </TabsTrigger>
                <TabsTrigger value="filters" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-2 px-4">
                  Lab de Filtros
                </TabsTrigger>
                <TabsTrigger value="rgb-splitter" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-2 px-4 flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> Análisis Espectral
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="visor3d" className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300">
              <VisorEvidencia3D customImageUrl={activeImage} />
            </TabsContent>
            
            <TabsContent value="ela-generator" className="mt-0 outline-none focus:outline-none animate-in fade-in zoom-in-95 duration-300">
              <ElaGenerator imageUrl={activeImage} />
            </TabsContent>

            <TabsContent value="magnifier" className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300">
              <ImageMagnifier src={activeImage} />
            </TabsContent>

            <TabsContent value="filters" className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300">
              <CanvasFilterLab imageUrl={activeImage} />
            </TabsContent>

            <TabsContent value="rgb-splitter" className="mt-0 outline-none animate-in fade-in zoom-in-95 duration-300">
              <RgbSplitter imageUrl={activeImage} />
            </TabsContent>
          </Tabs>
        </section>



        {/* Documentación breve con Shadcn Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-800/50">
          <Card className="bg-slate-900 border-slate-800 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Beaker className="w-5 h-5 text-blue-400" />
                Stack Tecnológico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-400 text-sm list-disc list-inside">
                <li>Next.js 14 & React 19</li>
                <li>Three.js & WebGL</li>
                <li>@react-three/fiber</li>
                <li>Shadcn UI (Tailwind CSS)</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-emerald-400" />
                Experiencia de Usuario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm leading-relaxed">
                Interactividad fluida con animaciones CSS (animate-in). 
                Controles táctiles y visualizadores optimizados para disminuir la fatiga visual.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                Integración Futura
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 text-sm leading-relaxed">
                Componentes de React 100% aislados. Se integran fácilmente en el 
                Dashboard del Perito inyectando la URL de la imagen generada por la API Python.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
