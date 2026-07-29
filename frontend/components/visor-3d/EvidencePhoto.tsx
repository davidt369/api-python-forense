// @ts-nocheck
"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface EvidencePhotoProps {
  url: string;
  position: [number, number, number];
  isWireframe?: boolean;
}

export function EvidencePhoto({ url, position, isWireframe = false }: EvidencePhotoProps) {
  const texture = useTexture(url);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Pequeña animación de flotación para darle un aspecto de holograma o análisis en curso
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      <planeGeometry args={[4, 3, 256, 256]} />
      <meshStandardMaterial 
        map={texture} 
        displacementMap={texture} 
        displacementScale={0.5} 
        side={THREE.DoubleSide} 
        roughness={0.2} 
        metalness={0.8}
        wireframe={isWireframe}
      />
    </mesh>
  );
}
