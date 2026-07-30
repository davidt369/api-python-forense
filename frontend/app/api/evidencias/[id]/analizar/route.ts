import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserFromRequest } from "@/app/lib/auth";
import { readFile } from "fs/promises";
import path from "path";

const baseUrl = process.env.NEXT_PUBLIC_FORENSIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";
const FORENSIC_API_URL = `${baseUrl}/analyze`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (auth.role === "CLIENTE") {
      return NextResponse.json(
        { error: "No tienes permiso para analizar evidencias" },
        { status: 403 }
      );
    }

    const evidence = await prisma.evidence.findUnique({ where: { id } });
    if (!evidence) {
      return NextResponse.json(
        { error: "Evidencia no encontrada" },
        { status: 404 }
      );
    }

    if (!evidence.imagePath) {
      return NextResponse.json(
        { error: "No se encontró una imagen para analizar en esta evidencia." },
        { status: 400 }
      );
    }

    // Actualizar estado a REVISANDO
    await prisma.evidence.update({
      where: { id },
      data: { status: "REVISANDO" },
    });

    // Usar la ruta del backend guardada en hash para el análisis
    // Si no hay ruta de backend, subir el archivo local al backend primero
    let filename = evidence.hash;
    
    if (!filename) {
      // Intentar subir el archivo local al backend para análisis
      const baseUrlUploads = process.env.NEXT_PUBLIC_FORENSIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";
      const UPLOAD_API_URL = `${baseUrl}/upload`;
      
      try {
        // Leer el archivo local desde public/
        const localPath = path.join(process.cwd(), 'public', evidence.imagePath.replace(/^\//, ''));
        const fileBuffer = await readFile(localPath);
        
        // Crear un blob y subirlo al backend
        const uploadFormData = new FormData();
        const blob = new Blob([fileBuffer]);
        uploadFormData.append("file", blob, evidence.originalName);
        uploadFormData.append("folder", `evidencias/${evidence.userId}`);
        
        const uploadRes = await fetch(UPLOAD_API_URL, {
          method: "POST",
          body: uploadFormData,
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          filename = uploadData.filename;
          // Guardar la ruta del backend para futuros análisis
          await prisma.evidence.update({
            where: { id },
            data: { hash: filename },
          });
        }
      } catch (err) {
        console.error("Error al subir archivo local al backend:", err);
        return NextResponse.json(
          { error: "No se pudo enviar la imagen al servidor de análisis forense." },
          { status: 500 }
        );
      }
    }

    // Verificar que tengamos un filename antes de continuar
    if (!filename) {
      return NextResponse.json(
        { error: "No se pudo obtener la ruta de la imagen para el análisis. Verifica que el backend esté disponible." },
        { status: 500 }
      );
    }

    // Llamar a la API forense externa
    const formData = new FormData();
    formData.append("filename", filename);
    formData.append("original_name", evidence.originalName);

    let forensicResult;
    try {
      const response = await fetch(FORENSIC_API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API forense respondió con estado ${response.status}`);
      }

      forensicResult = await response.json();
      console.log("✅ Respuesta de API forense recibida correctamente");
    } catch (apiError) {
      console.error("⚠️ Error al conectar con API forense externa:", apiError);
      return NextResponse.json(
        { error: `No se pudo conectar con el servidor de análisis forense. Verifica que la API esté configurada correctamente.` },
        { status: 503 }
      );
    }

    // Guardar resultado del análisis con el formato real de la API
    const analysis = await prisma.analysisResult.upsert({
      where: { evidenceId: id },
      create: {
        evidenceId: id,
        elaScore: forensicResult.ela?.score ?? null,
        elaResult: forensicResult.ela?.possible_manipulation ? "POSIBLE_MANIPULACION" : "AUTENTICA",
        elaImagePath: forensicResult.ela?.ela_image || null,
        histogramData: JSON.stringify(forensicResult.histogram || {}),
        exifData: JSON.stringify(forensicResult.exif || {}),
        hashesData: JSON.stringify(forensicResult.hashes || {}),
        compressionData: JSON.stringify(forensicResult.compression || {}),
        noiseData: JSON.stringify(forensicResult.noise || {}),
        objectsData: JSON.stringify(forensicResult.objects || {}),
        steganographyData: JSON.stringify(forensicResult.steganography || {}),
        forensicReport: generarDictamen(forensicResult, evidence),
        analyzedBy: auth.userId,
      },
      update: {
        elaScore: forensicResult.ela?.score ?? null,
        elaResult: forensicResult.ela?.possible_manipulation ? "POSIBLE_MANIPULACION" : "AUTENTICA",
        elaImagePath: forensicResult.ela?.ela_image || null,
        histogramData: JSON.stringify(forensicResult.histogram || {}),
        exifData: JSON.stringify(forensicResult.exif || {}),
        hashesData: JSON.stringify(forensicResult.hashes || {}),
        compressionData: JSON.stringify(forensicResult.compression || {}),
        noiseData: JSON.stringify(forensicResult.noise || {}),
        objectsData: JSON.stringify(forensicResult.objects || {}),
        steganographyData: JSON.stringify(forensicResult.steganography || {}),
        forensicReport: generarDictamen(forensicResult, evidence),
        analyzedBy: auth.userId,
      },
    });

    return NextResponse.json({
      analysis,
      forensicResult,
      message: "Análisis forense completado exitosamente",
    });
  } catch (error) {
    console.error("Analyze evidence error:", error);
    return NextResponse.json(
      { error: "Error al analizar evidencia" },
      { status: 500 }
    );
  }
}

function generarDictamen(result: any, evidence: any): string {
  const manipulacion = result.ela?.possible_manipulation || false;
  const score = result.ela?.score || 0;
  const nivelRiesgo = score > 50 ? "ALTO" : score > 18 ? "MEDIO" : "BAJO";

  const detallesCamara = result.exif?.camera;
  const tieneCamara = detallesCamara?.make || detallesCamara?.model;
  const tieneGPS = result.exif?.gps?.latitude;
  const tieneSoftware = result.exif?.software?.software || result.exif?.software?.creator_tool;

  const riskInterpretation = score > 50 
    ? "ALTA probabilidad de manipulación" 
    : score > 18 
    ? "MEDIA probabilidad de manipulación" 
    : "BAJA probabilidad de manipulación";

  const resumenManipulacion = manipulacion
    ? `El análisis ELA (Error Level Analysis) reveló un score de ${score.toFixed(2)}%, superando el umbral del 18% considerado normal. Este resultado indica POSIBLE MANIPULACIÓN en la imagen. Se detectaron anomalías en los patrones de compresión que son consistentes con alteraciones en áreas específicas de la imagen. Nivel de riesgo: ${riskInterpretation}.`
    : `El análisis ELA (Error Level Analysis) muestra un score de ${score.toFixed(2)}%, dentro del rango normal (0% - 18%). Esto indica que la imagen NO PRESENTA EVIDENCIAS de manipulación. Los patrones de compresión son consistentes en toda la imagen. Nivel de riesgo: ${riskInterpretation}.`;

  const recomendacionTexto = manipulacion
    ? `La imagen presenta un score ELA de ${score.toFixed(2)}%, superando el umbral de alerta del 18%. Basado exclusivamente en el análisis automatizado del sistema (ELA, metadatos EXIF, histograma, detección de objetos y esteganografía), se concluye que existen indicios técnicos de alteración digital. Se recomienda revisar los detalles técnicos en las secciones correspondientes de este informe para comprender las anomalías detectadas.`
    : `La imagen presenta un score ELA de ${score.toFixed(2)}%, dentro del rango de seguridad (0% - 18%). Basado exclusivamente en el análisis automatizado del sistema (ELA, metadatos EXIF, histograma, detección de objetos y esteganografía), la imagen se considera APARENTEMENTE AUTÉNTICA. Todos los patrones de compresión y metadatos analizados son consistentes con una imagen no alterada.`;

  return JSON.stringify({
    veredicto: manipulacion
      ? "EVIDENCIA DE MANIPULACIÓN DETECTADA"
      : "IMAGEN APARENTEMENTE AUTÉNTICA",
    nivelRiesgo,
    scoreELA: score,
    fechaAnalisis: new Date().toISOString(),
    analista: "Sistema Automatizado",
    interpretacionRiesgo: riskInterpretation,
    resumen: resumenManipulacion,
    recomendacion: recomendacionTexto,
    intervalosConfianza: {
      ela: {
        score: `${score.toFixed(2)}%`,
        umbralNormal: "0% - 18%",
        umbralMedio: "18% - 50%",
        umbralAlto: "50% - 100%",
        interpretacion: nivelRiesgo === "BAJO" 
          ? "La imagen se encuentra en el rango de seguridad. No hay evidencia de manipulación detectada por ELA."
          : nivelRiesgo === "MEDIO"
          ? "La imagen presenta anomalías moderadas. Podría haber sido editada o guardada múltiples veces."
          : "La imagen presenta un score elevado. Alta probabilidad de manipulación o ensamblaje de múltiples fuentes.",
      },
    },
    detalles: {
      nombreArchivo: evidence.originalName,
      resolucion: result.exif?.file?.image_width && result.exif?.file?.image_height
        ? `${result.exif.file.image_width}x${result.exif.file.image_height}`
        : result.histogram?.image?.width && result.histogram?.image?.height
        ? `${result.histogram.image.width}x${result.histogram.image.height}`
        : "No disponible",
      tamaño: result.exif?.file?.file_size || (result.compression?.size_bytes ? `${(result.compression.size_bytes / 1024).toFixed(2)} KB` : "No disponible"),
      formato: result.compression?.format || result.exif?.file?.file_type || "Desconocido",
      modoColor: result.compression?.mode || "No disponible",
      megapixeles: result.exif?.file?.megapixels
        ? `${result.exif.file.megapixels} MP`
        : result.histogram?.image?.pixels
        ? `${(result.histogram.image.pixels / 1000000).toFixed(2)} MP`
        : "No disponible",
      camara: tieneCamara
        ? `${detallesCamara.make || ""} ${detallesCamara.model || ""}`.trim()
        : "No disponible (posible imagen generada o editada)",
      software: tieneSoftware || "No detectado",
      gps: tieneGPS ? "Presente" : "Ausente",
      fechaOriginal: result.exif?.dates?.datetime_original || result.exif?.dates?.modify_date || "No disponible",
      flash: result.exif?.photo?.flash || "No disponible",
      iso: result.exif?.photo?.iso || "No disponible",
      nitidez: result.noise?.sharpness?.classification || "No disponible",
      ruidoMedio: result.noise?.noise?.mean ?? "No disponible",
      brillo: result.histogram?.brightness?.toFixed(2) || "No disponible",
      contraste: result.histogram?.contrast?.toFixed(2) || "No disponible",
      scoreELA: `${score.toFixed(2)}%`,
      objetosDetectados: result.objects?.summary || "No analizado",
      esteganografia: result.steganography?.summary || "No analizado",
    },
    hashes: {
      md5: result.hashes?.cryptographic?.md5 || result.hashes?.cryptographic?.MD5 || "",
      sha1: result.hashes?.cryptographic?.sha1 || result.hashes?.cryptographic?.SHA1 || "",
      sha256: result.hashes?.cryptographic?.sha256 || result.hashes?.cryptographic?.SHA256 || "",
      sha512: result.hashes?.cryptographic?.sha512 || result.hashes?.cryptographic?.SHA512 || "",
      pHash: result.hashes?.perceptual?.phash || result.hashes?.perceptual?.PHash || "",
      dHash: result.hashes?.perceptual?.dhash || result.hashes?.perceptual?.DHash || "",
      averageHash: result.hashes?.perceptual?.average_hash || "",
      wHash: result.hashes?.perceptual?.whash || "",
    },
    agencia: "Agencia de Análisis Forense Digital",
    ubicacion: "Cochabamba, Bolivia",
  });
}
