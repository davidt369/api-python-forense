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

    // Subir imagen a través del StorageProvider agnóstico
    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueName = `${Date.now()}-${sanitizedName}`;
    const userFolder = `evidencias/${auth.userId}`;
    
    let finalImagePath = "";
    try {
      const { storageService } = await import("@/app/lib/storage");
      finalImagePath = await storageService.uploadImage(buffer, uniqueName, userFolder);
    } catch (uploadError) {
      console.error("Error subiendo archivo al storage provider:", uploadError);
      return NextResponse.json(
        { error: "Error al subir el archivo al almacenamiento en la nube." },
        { status: 500 }
      );
    }

    // Los admins/revisores pueden subir para análisis rápido (sin pago)
    const isAdminOrRevisor = auth.role === "ADMIN" || auth.role === "REVISOR";

    // Crear evidencia
    const evidence = await prisma.evidence.create({
      data: {
        userId: auth.userId,
        imagePath: finalImagePath, // Ruta segura en Cloudinary
        hash: null, // Ya no se guarda ruta local del backend
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
