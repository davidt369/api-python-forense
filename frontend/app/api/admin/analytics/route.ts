import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserFromRequest } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = getUserFromRequest(request);
    if (!auth || (auth.role !== "ADMIN" && auth.role !== "REVISOR")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // ==============================
    // 1. SUMMARY STATS
    // ==============================
    const [
      totalEvidencias,
      pendientes,
      revisando,
      terminados,
      recepcionados,
      totalClientes,
      totalAnalisis,
      totalCertificados,
      ingresosAgg,
    ] = await Promise.all([
      prisma.evidence.count(),
      prisma.evidence.count({ where: { status: "PENDIENTE" } }),
      prisma.evidence.count({ where: { status: "REVISANDO" } }),
      prisma.evidence.count({ where: { status: "TERMINADO" } }),
      prisma.evidence.count({ where: { status: "RECEPCIONADO" } }),
      prisma.user.count({ where: { role: "CLIENTE" } }),
      prisma.analysisResult.count(),
      prisma.certificate.count(),
      prisma.evidence.aggregate({ _sum: { amount: true }, where: { paymentVerified: true } }),
    ]);

    const summary = {
      totalEvidencias,
      pendientes,
      revisando,
      terminados,
      recepcionados,
      totalClientes,
      totalAnalisis,
      totalCertificados,
      ingresosTotales: ingresosAgg._sum.amount || 0,
    };

    // ==============================
    // 2. STATUS DISTRIBUTION (Pie Chart)
    // ==============================
    const statusDistribution = [
      { name: "Pendiente", value: pendientes, color: "#f59e0b" },
      { name: "En Revisión", value: revisando, color: "#3b82f6" },
      { name: "Completado", value: terminados, color: "#10b981" },
      { name: "Recepcionado", value: recepcionados, color: "#8b5cf6" },
    ];

    // ==============================
    // 3. EVIDENCIAS POR MES (Area Chart)
    // ==============================
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 7);

    const evidenciasDelPeriodo = await prisma.evidence.findMany({
      where: { createdAt: { gte: seisMesesAtras } },
      select: { createdAt: true, amount: true, paymentVerified: true },
      orderBy: { createdAt: "asc" },
    });

    // Agrupar por mes
    const mapMeses: Record<string, { count: number; ingresos: number }> = {};
    for (let i = -6; i <= 0; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      mapMeses[key] = { count: 0, ingresos: 0 };
    }

    for (const ev of evidenciasDelPeriodo) {
      const key = `${ev.createdAt.getFullYear()}-${String(ev.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (mapMeses[key]) {
        mapMeses[key].count++;
        if (ev.paymentVerified) {
          mapMeses[key].ingresos += ev.amount || 0;
        }
      }
    }

    const nombresMeses: Record<string, string> = {
      "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
      "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
      "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
    };

    const evidenciasPorMes = Object.entries(mapMeses).map(([key, val]) => {
      const monthNum = key.split("-")[1];
      return {
        mes: nombresMeses[monthNum] || monthNum,
        fecha: key,
        evidencias: val.count,
        ingresos: val.ingresos,
      };
    });

    // ==============================
    // 4. RIESGO DISTRIBUTION (Bar Chart)
    // ==============================
    const analisisConScore = await prisma.analysisResult.findMany({
      where: { elaScore: { not: null } },
      select: { elaScore: true },
    });

    let bajo = 0, medio = 0, alto = 0;
    for (const a of analisisConScore) {
      const score = a.elaScore || 0;
      if (score > 50) alto++;
      else if (score > 18) medio++;
      else bajo++;
    }

    const riesgoDistribution = [
      { name: "Bajo (< 18%)", value: bajo, color: "#10b981" },
      { name: "Medio (18-50%)", value: medio, color: "#f59e0b" },
      { name: "Alto (> 50%)", value: alto, color: "#ef4444" },
    ];

    // ==============================
    // 5. TOP CLIENTES (Bar Chart)
    // ==============================
    const evidenciasConUser = await prisma.evidence.groupBy({
      by: ["userId"],
      _count: { id: true },
      _sum: { amount: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const userIds = evidenciasConUser.map((e) => e.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    const topClientes = evidenciasConUser.map((e) => ({
      name: userMap.get(e.userId) || "Desconocido",
      evidencias: e._count.id,
      ingresos: e._sum.amount || 0,
    }));

    // ==============================
    // 6. RECENT EVIDENCIAS
    // ==============================
    const recentEvidencias = await prisma.evidence.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        analysis: { select: { elaScore: true, elaResult: true } },
      },
    });

    // ==============================
    // 7. GPS LOCATIONS (Mapa)
    // ==============================
    const evidenciasConAnalisis = await prisma.analysisResult.findMany({
      where: { exifData: { not: null } },
      select: { evidenceId: true, exifData: true },
      take: 50,
    });

    const ubicacionesGPS: { lat: number; lng: number; evidenceId: string; name: string; city?: string; elaResult?: string }[] = [];

    for (const a of evidenciasConAnalisis) {
      try {
        const exif = JSON.parse(a.exifData!);
        if (exif.gps?.latitude && exif.gps?.longitude) {
          const evidencia = await prisma.evidence.findUnique({
            where: { id: a.evidenceId },
            select: { originalName: true, analysis: { select: { elaResult: true } } },
          });
          ubicacionesGPS.push({
            lat: exif.gps.latitude,
            lng: exif.gps.longitude,
            evidenceId: a.evidenceId,
            name: evidencia?.originalName || "Desconocido",
            elaResult: evidencia?.analysis?.elaResult || "AUTENTICA",
          });
        }
      } catch (e) {
        // skip invalid JSON
      }
    }

    // ==============================
    // 8. TIEMPO PROMEDIO DE ANÁLISIS
    // ==============================
    const evidenciasConFechas = await prisma.evidence.findMany({
      where: {
        status: { in: ["TERMINADO", "RECEPCIONADO"] },
        analysis: { isNot: null },
      },
      select: { createdAt: true, analysis: { select: { createdAt: true } } },
      take: 50,
    });

    let tiempoTotalMs = 0;
    let tiempoCount = 0;
    for (const ev of evidenciasConFechas) {
      if (ev.analysis?.createdAt) {
        tiempoTotalMs += ev.analysis.createdAt.getTime() - ev.createdAt.getTime();
        tiempoCount++;
      }
    }
    const tiempoPromedioHoras = tiempoCount > 0
      ? Math.round(tiempoTotalMs / tiempoCount / (1000 * 60 * 60))
      : 0;

    return NextResponse.json({
      summary,
      statusDistribution,
      evidenciasPorMes,
      riesgoDistribution,
      topClientes,
      recentEvidencias,
      ubicacionesGPS,
      tiempoPromedioHoras,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Error al obtener datos de analytics" },
      { status: 500 }
    );
  }
}
