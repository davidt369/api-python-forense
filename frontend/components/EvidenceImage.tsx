"use client";

import { useState } from "react";

interface EvidenceImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  thumbnail?: boolean;
}

export default function EvidenceImage({ src, alt, className = "", thumbnail = false }: EvidenceImageProps) {
  const [imgSrc, setImgSrc] = useState(src || "/placeholder-image.svg");
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc("/placeholder-image.svg");
    }
  };

  if (thumbnail) {
    return (
      <div className={`w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border ${className}`}>
        <img
          src={imgSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
