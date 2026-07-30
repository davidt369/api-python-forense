import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserFromRequest } from "@/app/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    // Admin/Revisor can see all, Cliente only theirs
    if (auth.role === "CLIENTE") {
      where.userId = auth.userId;
    }

    if (status) {
      where.status = status;
    }

    const [evidencias, total] = await Promise.all([
      prisma.evidence.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, ci: true },
          },
          analysis: true,
          certificate: {
            select: { id: true, certificateHash: true, generatedAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.evidence.count({ where }),
    ]);

    return NextResponse.json({
      evidencias,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get evidencias error:", error);
    return NextResponse.json(
      { error: "Error al obtener evidencias" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Admin, Revisor y Cliente pueden subir evidencias
    // Los administradores pueden subir para análisis rápido sin necesidad de cliente

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const description = formData.get("description") as string || "";

    if (!file) {
      return NextResponse.json(
        { error: "Debes subir una imagen" },
        { status: 400 }
      );
    }

    // Validar que sea imagen
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Solo se permiten imágenes" },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen es demasiado grande. Máximo 10MB permitidos." },
        { status: 413 }
      );
    }

    // Guardar imagen en public/ para visualización local
    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueName = `${Date.now()}-${sanitizedName}`;
    const userFolder = `evidencias/${auth.userId}`;
    const publicDir = path.join(process.cwd(), 'public', userFolder);
    let localSaveSuccess = false;
    try {
      if (!process.env.VERCEL) {
        await mkdir(publicDir, { recursive: true });
        const localPath = path.join(publicDir, uniqueName);
        await writeFile(localPath, buffer);
        localSaveSuccess = true;
      }
    } catch (fsError) {
      console.warn("⚠️ No se pudo guardar la imagen localmente (posible entorno Serverless como Vercel):", fsError);
    }

    // También enviar al backend para que tenga el archivo para análisis
    const baseUrl = process.env.NODE_ENV === "production"
      ? "https://api-python-forense.onrender.com"
      : (process.env.NEXT_PUBLIC_FORENSIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000");
    const UPLOAD_API_URL = `${baseUrl}/upload`;

    let backendFilename = uniqueName;
    try {
      const backendFormData = new FormData();
      backendFormData.append("file", file, file.name);
      backendFormData.append("folder", userFolder);

      const uploadRes = await fetch(UPLOAD_API_URL, {
        method: "POST",
        body: backendFormData,
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        backendFilename = uploadData.filename;
      }
    } catch (err) {
      console.warn("⚠️ No se pudo enviar la imagen al backend (el análisis forense podría no funcionar si el backend no está disponible):", err);
    }

    // Los admins/revisores pueden subir para análisis rápido (sin pago)
    const isAdminOrRevisor = auth.role === "ADMIN" || auth.role === "REVISOR";
    
    // Si estamos en Vercel o no se guardó localmente, usamos la URL del backend
    const finalImagePath = (process.env.VERCEL || !localSaveSuccess)
      ? `${baseUrl}/uploads/${userFolder}/${uniqueName}`
      : `/${userFolder}/${uniqueName}`;

    // Crear evidencia
    const evidence = await prisma.evidence.create({
      data: {
        userId: auth.userId,
        imagePath: finalImagePath, // Ruta dinámica según entorno
        hash: backendFilename, // Guardamos la ruta del backend para el análisis
        originalName: file.name,
        description,
        status: isAdminOrRevisor ? "REVISANDO" : "PENDIENTE",
        amount: isAdminOrRevisor ? 0 : 50.0,
        paymentVerified: isAdminOrRevisor ? true : false,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      { evidence, message: "Solicitud creada exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create evidence error:", error);
    return NextResponse.json(
      { error: "Error al crear solicitud" },
      { status: 500 }
    );
  }
}
