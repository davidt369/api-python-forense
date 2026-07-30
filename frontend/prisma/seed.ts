import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { hashSync } from "bcryptjs";

const url = (process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./dev.db") as string;
const authToken = process.env.TURSO_AUTH_TOKEN;

async function main() {
  const adapter = new PrismaLibSql({ url, authToken });
  const prisma = new PrismaClient({ adapter });

  console.log("🌱 Sembrando base de datos con datos completos...\n");

  // ==============================
  // LIMPIAR TODO
  // ==============================
  await prisma.certificate.deleteMany({});
  await prisma.analysisResult.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("🗑️  Datos anteriores eliminados.\n");

  // ==============================
  // USUARIOS
  // ==============================
  const pass = hashSync("123456", 12);

  const admin = await prisma.user.create({
    data: {
      email: "rcondori@demo.bo",
      password: pass,
      name: "Lic. R. Condori",
      ci: "12345678 LP",
      phone: "+591 71234567",
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin creado: ${admin.email} / 123456`);

  // Clientes adicionales para que los gráficos tengan datos
  const clientes = [
    { email: "cliente@demo.bo",     name: "María Elena Quispe",    ci: "4523891 CBBA", phone: "+591 71234569" },
    { email: "carlos.garcia@demo.bo", name: "Carlos García López",  ci: "6734215 LP",   phone: "+591 71567890" },
    { email: "ana.mamani@demo.bo",   name: "Ana Mamani Condori",   ci: "8945612 SC",   phone: "+591 72345678" },
    { email: "pedro.rodriguez@demo.bo", name: "Pedro Rodríguez Vela", ci: "3378924 OR", phone: "+591 73456789" },
    { email: "lucia.fernandez@demo.bo", name: "Lucía Fernández Ruiz", ci: "5612347 TJ", phone: "+591 74567890" },
  ];

  const createdClients: any[] = [];
  for (const c of clientes) {
    const user = await prisma.user.create({
      data: { ...c, password: pass, role: "CLIENTE" },
    });
    createdClients.push(user);
    console.log(`✅ Cliente creado: ${user.email} / 123456`);
  }

  // Perito/Revisor adicional
  const revisor = await prisma.user.create({
    data: {
      email: "perito@demo.bo",
      password: pass,
      name: "Ing. David Torres",
      ci: "9988776 CBBA",
      phone: "+591 75678901",
      role: "REVISOR",
    },
  });
  console.log(`✅ Revisor creado: ${revisor.email} / 123456`);

  // ==============================
  // EVIDENCIAS — 30 casos realistas
  // ==============================

  // Helper para crear fechas
  const d = (y: number, m: number, day: number, h = 10, min = 0) =>
    new Date(y, m - 1, day, h, min);

  const evs: {
    id: string;
    userId: string;
    originalName: string;
    imagePath: string;
    description: string;
    status: "PENDIENTE" | "REVISANDO" | "TERMINADO" | "RECEPCIONADO";
    amount: number;
    paymentVerified: boolean;
    createdAt: Date;
    elaScore?: number;
    elaResult?: string;
    hasGPS?: boolean;
    lat?: number;
    lng?: number;
    city?: string;
    hasSteganography?: boolean;
    stegoMessage?: string;
  }[] = [
    // ---- CLIENTE 1: María Elena Quispe ----
    {
      id: "AFD-2026-000412", userId: createdClients[0].id,
      originalName: "contrato_compraventa.jpg", imagePath: "/uploads/demo/contrato_compraventa.jpg",
      description: "Contrato de compraventa de vehículo firmado ante notario",
      status: "PENDIENTE", amount: 150.00, paymentVerified: false,
      createdAt: d(2026, 7, 25),
    },
    {
      id: "AFD-2026-000398", userId: createdClients[0].id,
      originalName: "captura_chat_whatsapp.png", imagePath: "/uploads/demo/captura_chat.png",
      description: "Captura de conversación de WhatsApp para verificar autenticidad",
      status: "REVISANDO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 7, 20),
    },
    {
      id: "AFD-2026-000371", userId: createdClients[0].id,
      originalName: "foto_escritura_notarial.jpg", imagePath: "/uploads/demo/foto_escritura.jpg",
      description: "Fotografía de escritura notarial para certificación",
      status: "TERMINADO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 7, 10),
      elaScore: 0.12, elaResult: "AUTENTICA", hasGPS: true, lat: -17.3817, lng: -66.1500, city: "Cochabamba",
    },
    {
      id: "AFD-2026-000355", userId: createdClients[0].id,
      originalName: "foto_accidente_transito.jpg", imagePath: "/uploads/demo/accidente.jpg",
      description: "Evidencia fotográfica de accidente de tránsito",
      status: "TERMINADO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 7, 2),
      elaScore: 0.35, elaResult: "POSIBLE_MANIPULACION", hasGPS: true, lat: -17.3895, lng: -66.1468, city: "Cochabamba",
    },
    {
      id: "AFD-2026-000342", userId: createdClients[0].id,
      originalName: "recibo_sueldo.jpg", imagePath: "/uploads/demo/recibo_sueldo.jpg",
      description: "Recibo de sueldo para verificar firma",
      status: "RECEPCIONADO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 6, 22),
      elaScore: 0.08, elaResult: "AUTENTICA",
    },

    // ---- CLIENTE 2: Carlos García ----
    {
      id: "AFD-2026-000330", userId: createdClients[1].id,
      originalName: "foto_propiedad.jpg", imagePath: "/uploads/demo/foto_propiedad.jpg",
      description: "Fotografía de propiedad en disputa legal",
      status: "PENDIENTE", amount: 150.00, paymentVerified: false,
      createdAt: d(2026, 7, 28),
    },
    {
      id: "AFD-2026-000321", userId: createdClients[1].id,
      originalName: "foto_cheque_sin_fondo.jpg", imagePath: "/uploads/demo/cheque.jpg",
      description: "Fotografía de cheque presuntamente falsificado",
      status: "REVISANDO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 7, 18),
    },
    {
      id: "AFD-2026-000310", userId: createdClients[1].id,
      originalName: "documento_identidad.jpg", imagePath: "/uploads/demo/documento_identidad.jpg",
      description: "Documento de identidad escaneado",
      status: "TERMINADO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 7, 5),
      elaScore: 0.05, elaResult: "AUTENTICA",
    },
    {
      id: "AFD-2026-000298", userId: createdClients[1].id,
      originalName: "foto_daños_propiedad.png", imagePath: "/uploads/demo/danos_propiedad.png",
      description: "Foto de daños a propiedad para peritaje judicial",
      status: "TERMINADO", amount: 250.00, paymentVerified: true,
      createdAt: d(2026, 6, 15),
      elaScore: 0.22, elaResult: "AUTENTICA", hasGPS: true, lat: -16.5000, lng: -68.1500, city: "La Paz",
    },
    {
      id: "AFD-2026-000285", userId: createdClients[1].id,
      originalName: "video_frame_extraction.jpg", imagePath: "/uploads/demo/video_frame.jpg",
      description: "Frame extraído de video de vigilancia",
      status: "RECEPCIONADO", amount: 200.00, paymentVerified: true,
      createdAt: d(2026, 5, 30),
      elaScore: 0.55, elaResult: "POSIBLE_MANIPULACION", hasGPS: true, lat: -16.5083, lng: -68.1256, city: "La Paz",
    },
    {
      id: "AFD-2026-000272", userId: createdClients[1].id,
      originalName: "foto_lesiones.jpg", imagePath: "/uploads/demo/lesiones.jpg",
      description: "Fotografía de lesiones personales para caso penal",
      status: "RECEPCIONADO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 5, 12),
      elaScore: 0.09, elaResult: "AUTENTICA",
    },

    // ---- CLIENTE 3: Ana Mamani ----
    {
      id: "AFD-2026-000265", userId: createdClients[2].id,
      originalName: "pantallazo_transferencia.jpg", imagePath: "/uploads/demo/transferencia.jpg",
      description: "Pantallazo de transferencia bancaria para verificar",
      status: "PENDIENTE", amount: 150.00, paymentVerified: false,
      createdAt: d(2026, 7, 26),
    },
    {
      id: "AFD-2026-000253", userId: createdClients[2].id,
      originalName: "contrato_arrendamiento.jpg", imagePath: "/uploads/demo/contrato_arriendo.jpg",
      description: "Contrato de arrendamiento con firmas",
      status: "REVISANDO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 7, 15),
    },
    {
      id: "AFD-2026-000248", userId: createdClients[2].id,
      originalName: "foto_producto_falsificado.jpg", imagePath: "/uploads/demo/producto_falsificado.jpg",
      description: "Producto presuntamente falsificado para denuncia",
      status: "TERMINADO", amount: 200.00, paymentVerified: true,
      createdAt: d(2026, 7, 1),
      elaScore: 0.68, elaResult: "POSIBLE_MANIPULACION", hasGPS: true, lat: -17.7833, lng: -63.1833, city: "Santa Cruz",
    },
    {
      id: "AFD-2026-000236", userId: createdClients[2].id,
      originalName: "foto_evento_publico.jpg", imagePath: "/uploads/demo/evento_publico.jpg",
      description: "Fotografía de evento público para verificar fecha",
      status: "TERMINADO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 6, 18),
      elaScore: 0.15, elaResult: "AUTENTICA", hasGPS: true, lat: -17.7767, lng: -63.1935, city: "Santa Cruz",
    },
    {
      id: "AFD-2026-000224", userId: createdClients[2].id,
      originalName: "foto_firma_digital.jpg", imagePath: "/uploads/demo/firma_digital.jpg",
      description: "Firma digital escaneada para autenticación",
      status: "RECEPCIONADO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 5, 25),
      elaScore: 0.11, elaResult: "AUTENTICA",
    },
    {
      id: "AFD-2026-000215", userId: createdClients[2].id,
      originalName: "imagen_satelital_terreno.jpg", imagePath: "/uploads/demo/satelital.jpg",
      description: "Imagen satelital de terreno en disputa",
      status: "RECEPCIONADO", amount: 300.00, paymentVerified: true,
      createdAt: d(2026, 5, 3),
      elaScore: 0.42, elaResult: "AUTENTICA", hasGPS: true, lat: -17.7892, lng: -63.1711, city: "Santa Cruz",
    },

    // ---- CLIENTE 4: Pedro Rodríguez ----
    {
      id: "AFD-2026-000208", userId: createdClients[3].id,
      originalName: "foto_construccion.jpg", imagePath: "/uploads/demo/construccion.jpg",
      description: "Evidencia de construcción en disputa vecinal",
      status: "PENDIENTE", amount: 150.00, paymentVerified: false,
      createdAt: d(2026, 7, 29),
    },
    {
      id: "AFD-2026-000196", userId: createdClients[3].id,
      originalName: "captura_red_social.jpg", imagePath: "/uploads/demo/red_social.jpg",
      description: "Captura de publicación en red social para peritaje",
      status: "REVISANDO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 7, 12),
    },
    {
      id: "AFD-2026-000187", userId: createdClients[3].id,
      originalName: "foto_mercancia.jpg", imagePath: "/uploads/demo/mercancia.jpg",
      description: "Fotografía de mercancía para aduana",
      status: "TERMINADO", amount: 250.00, paymentVerified: true,
      createdAt: d(2026, 6, 28),
      elaScore: 0.18, elaResult: "AUTENTICA", hasGPS: true, lat: -17.9833, lng: -67.1500, city: "Oruro",
    },
    {
      id: "AFD-2026-000175", userId: createdClients[3].id,
      originalName: "foto_pago_efectivo.jpg", imagePath: "/uploads/demo/pago_efectivo.jpg",
      description: "Foto de pago en efectivo como prueba",
      status: "TERMINADO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 6, 5),
      elaScore: 0.08, elaResult: "AUTENTICA",
      hasSteganography: true, stegoMessage: "PAGO_RECIBIDO_2026-06-05",
    },
    {
      id: "AFD-2026-000163", userId: createdClients[3].id,
      originalName: "foto_reunion_negocios.jpg", imagePath: "/uploads/demo/reunion.jpg",
      description: "Fotografía de reunión de negocios para verificar",
      status: "RECEPCIONADO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 4, 22),
      elaScore: 0.07, elaResult: "AUTENTICA", hasGPS: true, lat: -19.0333, lng: -65.2627, city: "Sucre",
    },

    // ---- CLIENTE 5: Lucía Fernández ----
    {
      id: "AFD-2026-000154", userId: createdClients[4].id,
      originalName: "foto_joyas_valor.jpg", imagePath: "/uploads/demo/joyas.jpg",
      description: "Fotografía de joyas para avalúo forense",
      status: "PENDIENTE", amount: 200.00, paymentVerified: false,
      createdAt: d(2026, 7, 27),
    },
    {
      id: "AFD-2026-000142", userId: createdClients[4].id,
      originalName: "documento_contable.jpg", imagePath: "/uploads/demo/documento_contable.jpg",
      description: "Documento contable presuntamente alterado",
      status: "REVISANDO", amount: 250.00, paymentVerified: true,
      createdAt: d(2026, 7, 8),
    },
    {
      id: "AFD-2026-000138", userId: createdClients[4].id,
      originalName: "foto_herencia.jpg", imagePath: "/uploads/demo/herencia.jpg",
      description: "Fotografía de documento de herencia familiar",
      status: "TERMINADO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 6, 20),
      elaScore: 0.14, elaResult: "AUTENTICA",
    },
    {
      id: "AFD-2026-000125", userId: createdClients[4].id,
      originalName: "foto_accidente_laboral.jpg", imagePath: "/uploads/demo/accidente_laboral.jpg",
      description: "Foto de accidente laboral para demanda",
      status: "TERMINADO", amount: 200.00, paymentVerified: true,
      createdAt: d(2026, 6, 2),
      elaScore: 0.78, elaResult: "POSIBLE_MANIPULACION", hasGPS: true, lat: -21.5333, lng: -64.7333, city: "Tarija",
    },
    {
      id: "AFD-2026-000112", userId: createdClients[4].id,
      originalName: "foto_denuncia_violencia.jpg", imagePath: "/uploads/demo/denuncia.jpg",
      description: "Evidencia fotográfica de denuncia por violencia",
      status: "RECEPCIONADO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 4, 8),
      elaScore: 0.32, elaResult: "POSIBLE_MANIPULACION", hasGPS: true, lat: -21.5356, lng: -64.7292, city: "Tarija",
    },

    // ---- ALGUNOS CASOS ADICIONALES para enriquecer datos ----
    {
      id: "AFD-2026-000105", userId: createdClients[0].id,
      originalName: "foto_antigua_finca.jpg", imagePath: "/uploads/demo/finca_antigua.jpg",
      description: "Fotografía antigua de finca familiar para peritaje de autenticidad",
      status: "RECEPCIONADO", amount: 200.00, paymentVerified: true,
      createdAt: d(2026, 3, 28),
      elaScore: 0.25, elaResult: "AUTENTICA", hasGPS: true, lat: -17.3810, lng: -66.1480, city: "Cochabamba",
    },
    {
      id: "AFD-2026-000092", userId: createdClients[2].id,
      originalName: "foto_manifestacion.jpg", imagePath: "/uploads/demo/manifestacion.jpg",
      description: "Fotografía de manifestación pública para prensa",
      status: "RECEPCIONADO", amount: 150.00, paymentVerified: true,
      createdAt: d(2026, 3, 10),
      elaScore: 0.45, elaResult: "POSIBLE_MANIPULACION", hasGPS: true, lat: -16.4958, lng: -68.1333, city: "La Paz",
    },
    {
      id: "AFD-2026-000078", userId: createdClients[3].id,
      originalName: "foto_minerales.jpg", imagePath: "/uploads/demo/minerales.jpg",
      description: "Fotografía de muestras minerales para peritaje minero",
      status: "RECEPCIONADO", amount: 250.00, paymentVerified: true,
      createdAt: d(2026, 2, 28),
      elaScore: 0.10, elaResult: "AUTENTICA", hasGPS: true, lat: -19.5833, lng: -65.7500, city: "Potosí",
    },
    {
      id: "AFD-2026-000065", userId: createdClients[1].id,
      originalName: "foto_contrato_exportacion.jpg", imagePath: "/uploads/demo/exportacion.jpg",
      description: "Contrato de exportación firmado para verificación",
      status: "RECEPCIONADO", amount: 300.00, paymentVerified: true,
      createdAt: d(2026, 2, 14),
      elaScore: 0.06, elaResult: "AUTENTICA",
    },
    {
      id: "AFD-2026-000051", userId: createdClients[4].id,
      originalName: "foto_camara_seguridad.jpg", imagePath: "/uploads/demo/camara_seguridad.jpg",
      description: "Captura de cámara de seguridad para investigación",
      status: "RECEPCIONADO", amount: 200.00, paymentVerified: true,
      createdAt: d(2026, 2, 1),
      elaScore: 0.62, elaResult: "POSIBLE_MANIPULACION", hasGPS: true, lat: -14.8333, lng: -64.9000, city: "Trinidad",
    },
  ];

  for (const ev of evs) {
    const evidence = await prisma.evidence.create({
      data: {
        id: ev.id,
        userId: ev.userId,
        originalName: ev.originalName,
        imagePath: ev.imagePath,
        description: ev.description,
        status: ev.status,
        amount: ev.amount,
        paymentVerified: ev.paymentVerified,
        createdAt: ev.createdAt,
      },
    });

    // Si tiene análisis, crearlo
    if (ev.elaScore !== undefined && ev.elaResult !== undefined) {
      // Generar datos EXIF con GPS si aplica
      const exifData: any = {
        file: {
          file_size: Math.floor(Math.random() * 5000000) + 500000,
          file_type: ev.originalName.endsWith(".png") ? "PNG" : "JPEG",
          image_width: Math.floor(Math.random() * 3000) + 1000,
          image_height: Math.floor(Math.random() * 2000) + 800,
          megapixels: ((Math.random() * 5) + 2).toFixed(1),
          mime_type: ev.originalName.endsWith(".png") ? "image/png" : "image/jpeg",
          bits_per_sample: 8,
        },
        camera: {
          make: Math.random() > 0.3 ? "Apple" : "Samsung",
          model: Math.random() > 0.3 ? "iPhone 15 Pro Max" : "Galaxy S24 Ultra",
          lens: Math.random() > 0.5 ? "Apple f/1.78" : "Samsung f/1.7",
        },
        photo: {
          f_number: (Math.random() * 3 + 1.8).toFixed(1),
          focal_length: Math.floor(Math.random() * 20) + 24,
          iso: Math.floor(Math.random() * 800) + 50,
          exposure_time: `1/${Math.floor(Math.random() * 500) + 60}`,
        },
        software: ev.elaResult === "POSIBLE_MANIPULACION" && Math.random() > 0.5
          ? { software: "Adobe Photoshop 25.0", creator_tool: "Adobe Photoshop" }
          : { software: "Ninguno detectado", creator_tool: null },
        dates: {
          create_date: ev.createdAt.toISOString(),
          datetime_original: ev.createdAt.toISOString(),
        },
      };

      // GPS
      if (ev.hasGPS && ev.lat && ev.lng) {
        exifData.gps = {
          latitude: ev.lat,
          longitude: ev.lng,
          altitude: Math.floor(Math.random() * 500) + 200,
          latitude_ref: "S",
          longitude_ref: "W",
        };
      }

      const hashesData = {
        cryptographic: {
          md5: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          sha1: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          sha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          sha512: Array.from({ length: 128 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        },
        perceptual: {
          phash: Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          dhash: Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        },
      };

      const stegoData = ev.hasSteganography
        ? { success: true, hidden_data_found: true, message: ev.stegoMessage, summary: `¡ALERTA! Texto oculto encontrado: '${ev.stegoMessage}'` }
        : { success: true, hidden_data_found: false, summary: "No se encontraron mensajes ocultos." };

      await prisma.analysisResult.create({
        data: {
          evidenceId: ev.id,
          elaScore: ev.elaScore,
          elaResult: ev.elaResult,
          elaImagePath: `/temp/ela_${ev.id}.png`,
          histogramData: JSON.stringify({
            brightness: Math.random() * 100 + 50,
            contrast: Math.random() * 50 + 30,
            channels: {
              red: { statistics: { min: 0, max: 255, mean: Math.random() * 150 + 50, std: Math.random() * 40 + 10 } },
              green: { statistics: { min: 0, max: 255, mean: Math.random() * 150 + 50, std: Math.random() * 40 + 10 } },
              blue: { statistics: { min: 0, max: 255, mean: Math.random() * 150 + 50, std: Math.random() * 40 + 10 } },
            },
            image: { width: 1920, height: 1080, pixels: 2073600 },
          }),
          exifData: JSON.stringify(exifData),
          hashesData: JSON.stringify(hashesData),
          compressionData: JSON.stringify({
            format: exifData.file.file_type,
            mode: "RGB",
            size_bytes: exifData.file.file_size,
            compression: { progressive: Math.random() > 0.5, optimize: Math.random() > 0.3 },
          }),
          noiseData: JSON.stringify({
            mean_noise: (Math.random() * 0.5 + 0.1).toFixed(3),
            std_noise: (Math.random() * 0.3 + 0.05).toFixed(3),
            snr_estimate: (Math.random() * 20 + 10).toFixed(2),
          }),
          objectsData: JSON.stringify({
            success: true,
            summary: Math.random() > 0.3
              ? "Se detectaron los siguientes elementos: 1 rostro/persona."
              : "No se detectaron rostros, perfiles ni ojos en la imagen.",
            engine: "opencv-haar",
            detected: Math.random() > 0.3 ? [{ object: "rostro/persona", confidence: null }] : [],
            counts: Math.random() > 0.3 ? { "rostro/persona": 1 } : {},
          }),
          steganographyData: JSON.stringify(stegoData),
          forensicReport: JSON.stringify({
            veredicto: ev.elaResult === "POSIBLE_MANIPULACION"
              ? "EVIDENCIA DE MANIPULACIÓN DETECTADA"
              : "IMAGEN APARENTEMENTE AUTÉNTICA",
            nivelRiesgo: ev.elaScore > 50 ? "ALTO" : ev.elaScore > 18 ? "MEDIO" : "BAJO",
            scoreELA: ev.elaScore,
            fechaAnalisis: new Date(ev.createdAt.getTime() + 86400000).toISOString(),
            resumen: ev.elaResult === "POSIBLE_MANIPULACION"
              ? `El análisis ELA reveló un score de ${ev.elaScore.toFixed(2)}%, superando el umbral normal. Se detectaron anomalías en patrones de compresión.`
              : `El análisis ELA muestra un score de ${ev.elaScore.toFixed(2)}%, dentro del rango normal.`,
            detalles: {
              nombreArchivo: ev.originalName,
              resolucion: `${exifData.file.image_width}x${exifData.file.image_height}`,
              tamaño: `${(exifData.file.file_size / 1024 / 1024).toFixed(2)} MB`,
              formato: exifData.file.file_type,
              camara: `${exifData.camera.make} ${exifData.camera.model}`,
            },
            hashes: hashesData.cryptographic,
          }),
          analyzedBy: ev.elaResult === "POSIBLE_MANIPULACION" ? admin.id : revisor.id,
          createdAt: new Date(ev.createdAt.getTime() + 86400000),
        },
      });

      // Para los TERMINADO y RECEPCIONADO, crear certificado
      if (ev.status === "TERMINADO" || ev.status === "RECEPCIONADO") {
        const hashStr = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        await prisma.certificate.create({
          data: {
            evidenceId: ev.id,
            certificateHash: hashStr,
            qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            generatedBy: admin.id,
            generatedAt: new Date(ev.createdAt.getTime() + 86400000 * 2),
          },
        });
      }
    }
  }

  console.log(`\n✅ ${evs.length} evidencias creadas con resultados de análisis.`);
  console.log("✅ Certificados generados para casos terminados.\n");

  // ==============================
  // RESUMEN
  // ==============================
  const counts = {
    total: await prisma.evidence.count(),
    pendientes: await prisma.evidence.count({ where: { status: "PENDIENTE" } }),
    revisando: await prisma.evidence.count({ where: { status: "REVISANDO" } }),
    terminados: await prisma.evidence.count({ where: { status: "TERMINADO" } }),
    recepcionados: await prisma.evidence.count({ where: { status: "RECEPCIONADO" } }),
    clientes: await prisma.user.count({ where: { role: "CLIENTE" } }),
    analisis: await prisma.analysisResult.count(),
    certificados: await prisma.certificate.count(),
  };

  console.log("📊 RESUMEN DE LA BASE DE DATOS:");
  console.log(`   Usuarios: ${await prisma.user.count()} (${counts.clientes} clientes, 1 admin, 1 revisor)`);
  console.log(`   Evidencias: ${counts.total}`);
  console.log(`     ├─ Pendientes: ${counts.pendientes}`);
  console.log(`     ├─ En revisión: ${counts.revisando}`);
  console.log(`     ├─ Terminados: ${counts.terminados}`);
  console.log(`     └─ Recepcionados: ${counts.recepcionados}`);
  console.log(`   Análisis realizados: ${counts.analisis}`);
  console.log(`   Certificados emitidos: ${counts.certificados}`);

  console.log("\n🔐 CREDENCIALES DE ACCESO:");
  console.log("   ┌──────────────────────┬──────────────────────────┐");
  console.log("   │ Admin                │ rcondori@demo.bo / 123456 │");
  console.log("   │ Cliente              │ cliente@demo.bo / 123456  │");
  console.log("   │ Perito               │ perito@demo.bo / 123456   │");
  console.log("   └──────────────────────┴──────────────────────────┘\n");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error en seed:", e);
  process.exit(1);
});
