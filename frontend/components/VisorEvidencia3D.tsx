// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Text } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layers, ScanEye, Hand } from "lucide-react";

import { EvidencePhoto } from "./visor-3d/EvidencePhoto";
import { LabTable } from "./visor-3d/LabTable";

interface VisorProps {
  customImageUrl?: string;
}

export default function VisorEvidencia3D({ customImageUrl }: VisorProps) {
  const [isWireframe, setIsWireframe] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const imageUrl = customImageUrl || "/poc-assets/original.jpg";

  return (
    <Card className="w-full h-[500px] md:h-[600px] relative bg-slate-950/50 rounded-xl overflow-hidden shadow-2xl border-slate-800">
      
      {/* UI Overlay - Controles */}
      <div className="absolute top-4 left-4 z-10 flex flex-col sm:flex-row gap-2">
        <Button
          variant={!isWireframe ? "default" : "secondary"}
          onClick={() => setIsWireframe(false)}
          className="shadow-lg flex gap-2 items-center"
          size={isMobile ? "sm" : "default"}
        >
          <Layers className="w-4 h-4" />
          Topografía Sólida
        </Button>
        <Button
          variant={isWireframe ? "default" : "secondary"}
          onClick={() => setIsWireframe(true)}
          className="shadow-lg flex gap-2 items-center"
          size={isMobile ? "sm" : "default"}
        >
          <ScanEye className="w-4 h-4" />
          Malla Geométrica
        </Button>
      </div>

      {/* UI Overlay - Instrucciones */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-4 z-10 w-[90%] md:w-auto">
        <div className="bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700/50 text-xs md:text-sm text-slate-300 pointer-events-none flex items-center gap-3 shadow-xl">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Hand className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-medium">
            {isMobile 
              ? "Desliza para rotar 3D • Inspecciona relieves" 
              : "Clic izq. para rotar 3D • Inspecciona relieves"}
          </span>
        </div>
      </div>

      {/* Escena 3D */}
      <div className="absolute inset-0">
        <Canvas 
          shadows
          camera={{ position: isMobile ? [0, 4, 7] : [0, 3, 5], fov: 50 }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]} // Soluciona los bordes pixelados
          />
          <spotLight position={[-5, 5, 0]} intensity={0.8} penumbra={1} />

          <Environment preset="city" />

          <LabTable />
          <EvidencePhoto url={imageUrl} position={[0, 0, 0]} isWireframe={isWireframe} />

          <Text
            position={[0, 0.5, -2]}
            rotation={[-Math.PI / 4, 0, 0]}
            fontSize={0.4}
            color="#3b82f6"
            anchorX="center"
            anchorY="middle"
          >
            Mesa de Análisis Forense
          </Text>

          <ContactShadows position={[0, -0.39, 0]} opacity={0.6} scale={10} blur={2.5} far={4} />

          <OrbitControls 
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2.1}
            minDistance={2}
            maxDistance={isMobile ? 12 : 10}
            enablePan={!isMobile} // Disable pan on mobile for better touch UX
          />
        </Canvas>
      </div>
    </Card>
  );
}
