// @ts-nocheck
"use client";

import React from "react";

export function LabTable() {
  return (
    <mesh position={[0, -0.5, 0]} receiveShadow>
      <boxGeometry args={[10, 0.2, 8]} />
      <meshStandardMaterial color="#1e293b" roughness={0.8} metalness={0.2} />
    </mesh>
  );
}
