"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ImageIcon,
  Camera,
  MapPin,
  Hash,
  Eye,
  Activity,
  BarChart3,
  FileText,
  Cpu,
  Fingerprint,
  Zap,
  Layers,
  Gauge,
  Target,
  Crosshair,
  Info,
  ChevronRight,
  Download,
  Copy,
  X,
} from "lucide-react";

export default function ImageForensicAnalyzer() {
  const API_URL = "http://127.0.0.1:8000/analyze";

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("Esperando imagen");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("resumen");
  const [copiedHash, setCopiedHash] = useState("");

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      processFile(droppedFile);
    }
  }, []);

  const processFile = (selected) => {
    setFile(selected);
    setError("");
    const url = URL.createObjectURL(selected);
    setPreview(url);
    setStatus("Listo para analizar");
    setResult(null);
  };

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (selected) processFile(selected);
  };

  const analyze = async () => {
    if (!file) {
      setError("Por favor selecciona una imagen");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStatus("Realizando análisis forense completo...");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error("Error al conectar con el servidor");

      setResult(data);
      setStatus("Análisis completado correctamente");
      setActiveTab("resumen");
    } catch (err) {
      setError(err.message);
      setStatus("Error en el análisis");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
    setStatus("Esperando imagen");
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(""), 2000);
  };

  const getRiskLevel = (score) => {
    if (score > 0.5)
      return { level: "ALTO", color: "text-red-400", bg: "bg-red-500/20" };
    if (score > 0.2)
      return { level: "MEDIO", color: "text-amber-400", bg: "bg-amber-500/20" };
    return {
      level: "BAJO",
      color: "text-emerald-400",
      bg: "bg-emerald-500/20",
    };
  };

  const getManipulationVerdict = () => {
    if (!result?.ela)
      return { verdict: "NO DISPONIBLE", color: "text-slate-400", icon: Info };
    if (result.ela.possible_manipulation) {
      return {
        verdict: "POSIBLE MANIPULACIÓN DETECTADA",
        color: "text-red-400",
        icon: AlertTriangle,
      };
    }
    return {
      verdict: "SIN EVIDENCIA DE MANIPULACIÓN",
      color: "text-emerald-400",
      icon: CheckCircle2,
    };
  };

  const tabs = [
    { id: "resumen", label: "Resumen", icon: Shield },
    { id: "ela", label: "Análisis ELA", icon: Eye },
    { id: "histograma", label: "Histograma", icon: BarChart3 },
    { id: "exif", label: "EXIF/Metadatos", icon: Camera },
    { id: "hashes", label: "Huellas Digitales", icon: Fingerprint },
    { id: "compresion", label: "Compresión", icon: Layers },
    { id: "ruido", label: "Ruido/Nitidez", icon: Activity },
    { id: "dictamen", label: "Dictamen Forense", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Header Dashboard */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
              <Shield className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Analizador Forense de Imágenes
              </h1>
              <p className="text-slate-400">
                Agencia de Análisis Forense Digital • v2.0
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">
              Detección de manipulaciones
            </div>
            <div className="text-xs text-slate-500">
              Metadatos • Autenticidad • Integridad
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda - Subida y Vista Previa */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                Subir Evidencia Digital
              </h2>

              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById("file-upload").click()}
                className="border-2 border-dashed border-slate-600 hover:border-blue-500 transition-all rounded-2xl p-8 text-center cursor-pointer bg-slate-950 min-h-[300px] flex items-center justify-center"
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
                {preview ? (
                  <img
                    src={preview}
                    alt="Vista previa"
                    className="max-h-72 rounded-xl shadow-2xl object-contain"
                  />
                ) : (
                  <div>
                    <Upload className="w-14 h-14 mx-auto text-slate-500 mb-3" />
                    <p className="text-base mb-1">Arrastra la imagen aquí</p>
                    <p className="text-sm text-slate-500">
                      o haz clic para seleccionar
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={analyze}
                  disabled={!file || loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Iniciar Análisis
                    </>
                  )}
                </button>

                <button
                  onClick={clearAll}
                  className="px-6 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="mt-4 p-3 bg-slate-950 rounded-xl">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-400">Estado:</span>
                  <span className="font-medium text-white">{status}</span>
                </div>
              </div>
            </div>

            {/* Info rápida de la imagen */}
            {result && (
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Archivo Analizado
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nombre original:</span>
                    <span className="font-mono text-xs">
                      {result.file?.original_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nombre guardado:</span>
                    <span className="font-mono text-xs truncate max-w-[180px]">
                      {result.file?.saved_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ruta:</span>
                    <span className="font-mono text-xs truncate max-w-[180px]">
                      {result.file?.path}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha - Dashboard de Resultados */}
          <div className="lg:col-span-8">
            {result ? (
              <div className="space-y-6">
                {/* Tabs de navegación */}
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-2">
                  <div className="flex gap-1 overflow-x-auto">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                            activeTab === tab.id
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                              : "text-slate-400 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TAB: RESUMEN */}
                {activeTab === "resumen" && (
                  <div className="space-y-6">
                    {/* Veredicto principal */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">
                          Dictamen Inmediato
                        </h2>
                        <div
                          className={`px-4 py-2 rounded-full font-bold text-sm ${getManipulationVerdict().color} ${getManipulationVerdict().color.includes("red") ? "bg-red-500/10" : "bg-emerald-500/10"}`}
                        >
                          {getManipulationVerdict().verdict}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500 mb-1">
                            Nivel de Riesgo
                          </p>
                          <p
                            className={`text-2xl font-bold ${getRiskLevel(result.ela?.score || 0).color}`}
                          >
                            {getRiskLevel(result.ela?.score || 0).level}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500 mb-1">
                            Score ELA
                          </p>
                          <p className="text-2xl font-bold">
                            {result.ela?.score || "N/A"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500 mb-1">
                            Brillo Medio
                          </p>
                          <p className="text-2xl font-bold">
                            {result.histogram?.brightness?.toFixed(2) || "N/A"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500 mb-1">
                            Contraste
                          </p>
                          <p className="text-2xl font-bold">
                            {result.histogram?.contrast?.toFixed(2) || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Datos del archivo */}
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FileText className="text-blue-400" />
                        Información del Archivo
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Tipo</p>
                          <p className="font-medium">
                            {result.exif?.file?.file_type || "—"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">MIME</p>
                          <p className="font-medium text-xs">
                            {result.exif?.file?.mime_type || "—"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Tamaño</p>
                          <p className="font-medium">
                            {result.exif?.file?.file_size || "—"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Extensión</p>
                          <p className="font-medium">
                            .{result.exif?.file?.extension || "—"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Resolución</p>
                          <p className="font-medium">
                            {result.exif?.file?.image_width} ×{" "}
                            {result.exif?.file?.image_height}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Megapíxeles</p>
                          <p className="font-medium">
                            {result.exif?.file?.megapixels} MP
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Total Píxeles
                          </p>
                          <p className="font-medium">
                            {result.histogram?.image?.pixels?.toLocaleString() ||
                              "—"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Profundidad</p>
                          <p className="font-medium">
                            {result.exif?.file?.bits_per_sample} bits
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: ELA */}
                {activeTab === "ela" && result.ela && (
                  <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                          <Eye className="text-purple-400" />
                          Error Level Analysis (ELA)
                        </h2>
                        <div
                          className={`px-4 py-2 rounded-full font-bold text-sm ${result.ela.possible_manipulation ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}
                        >
                          {result.ela.possible_manipulation
                            ? "⚠ POSIBLE MANIPULACIÓN"
                            : "✅ AUTÉNTICA"}
                        </div>
                      </div>

                      {result.ela.ela_image && (
                        <div className="mb-6">
                          <img
                            src={`http://127.0.0.1:8000/${result.ela.ela_image}`}
                            alt="ELA Analysis"
                            className="w-full rounded-2xl border border-slate-700"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Score ELA</p>
                          <p className="text-2xl font-bold">
                            {result.ela.score}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Umbral: 0.2
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Media</p>
                          <p className="text-2xl font-bold">
                            {result.ela.statistics?.mean}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Desv. Estándar
                          </p>
                          <p className="text-2xl font-bold">
                            {result.ela.statistics?.std}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Rango</p>
                          <p className="text-2xl font-bold">
                            {result.ela.statistics?.min} -{" "}
                            {result.ela.statistics?.max}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500 mb-1">
                            Calidad JPEG (ELA)
                          </p>
                          <p className="text-lg font-bold">
                            {result.ela.settings?.jpeg_quality}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500 mb-1">
                            Factor de Brillo
                          </p>
                          <p className="text-lg font-bold">
                            {result.ela.settings?.brightness_factor}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: HISTOGRAMA */}
                {activeTab === "histograma" && result.histogram && (
                  <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="text-cyan-400" />
                        Análisis de Histograma
                      </h2>

                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Brillo Global
                          </p>
                          <p className="text-2xl font-bold">
                            {result.histogram.brightness?.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Contraste</p>
                          <p className="text-2xl font-bold">
                            {result.histogram.contrast?.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Total Píxeles
                          </p>
                          <p className="text-2xl font-bold">
                            {result.histogram.image?.pixels?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Canales RGB */}
                      <div className="space-y-4">
                        {["red", "green", "blue"].map((channel) => {
                          const stats =
                            result.histogram.channels[channel]?.statistics;
                          const colorMap = {
                            red: "text-red-400",
                            green: "text-green-400",
                            blue: "text-blue-400",
                          };
                          const bgMap = {
                            red: "bg-red-500",
                            green: "bg-green-500",
                            blue: "bg-blue-500",
                          };

                          return (
                            <div
                              key={channel}
                              className="bg-slate-950 p-4 rounded-2xl"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <h3
                                  className={`font-semibold ${colorMap[channel]}`}
                                >
                                  Canal {channel.toUpperCase()}
                                </h3>
                              </div>
                              <div className="grid grid-cols-4 gap-3 text-sm">
                                <div>
                                  <p className="text-xs text-slate-500">Mín</p>
                                  <p className="font-mono">{stats?.min}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">Máx</p>
                                  <p className="font-mono">{stats?.max}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">
                                    Media
                                  </p>
                                  <p className="font-mono">
                                    {stats?.mean?.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">
                                    Desv. Est.
                                  </p>
                                  <p className="font-mono">
                                    {stats?.std?.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              {/* Barra visual */}
                              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${bgMap[channel]} transition-all`}
                                  style={{
                                    width: `${((stats?.mean || 0) / 255) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: EXIF */}
                {activeTab === "exif" && result.exif && (
                  <div className="space-y-6">
                    {/* Cámara */}
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Camera className="text-blue-400" />
                        Información de Cámara
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Fabricante</p>
                          <p className="font-medium">
                            {result.exif.camera?.make || "Desconocido"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Modelo</p>
                          <p className="font-medium">
                            {result.exif.camera?.model || "Desconocido"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Lente</p>
                          <p className="font-medium text-xs">
                            {result.exif.camera?.lens || "N/A"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Serial</p>
                          <p className="font-medium text-xs">
                            {result.exif.camera?.serial || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Fechas */}
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Clock className="text-amber-400" />
                        Fechas
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Fecha de Creación
                          </p>
                          <p className="font-medium text-sm">
                            {result.exif.dates?.create_date || "No disponible"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Fecha de Modificación
                          </p>
                          <p className="font-medium text-sm">
                            {result.exif.dates?.modify_date || "No disponible"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Fecha Original
                          </p>
                          <p className="font-medium text-sm">
                            {result.exif.dates?.datetime_original ||
                              "No disponible"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Software */}
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Cpu className="text-purple-400" />
                        Software
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Software</p>
                          <p className="font-medium">
                            {result.exif.software?.software || "No detectado"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Herramienta Creadora
                          </p>
                          <p className="font-medium">
                            {result.exif.software?.creator_tool ||
                              "No detectado"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* GPS */}
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="text-green-400" />
                        Datos GPS
                      </h2>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Latitud</p>
                          <p className="font-mono text-sm">
                            {result.exif.gps?.latitude || "No disponible"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Longitud</p>
                          <p className="font-mono text-sm">
                            {result.exif.gps?.longitude || "No disponible"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Altitud</p>
                          <p className="font-mono text-sm">
                            {result.exif.gps?.altitude || "No disponible"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Parámetros de Foto */}
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Target className="text-pink-400" />
                        Parámetros de Captura
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Orientación</p>
                          <p className="font-medium">
                            {result.exif.photo?.orientation || "N/A"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Espacio de Color
                          </p>
                          <p className="font-medium">
                            {result.exif.photo?.color_space || "N/A"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Flash</p>
                          <p className="font-medium">
                            {result.exif.photo?.flash || "N/A"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">ISO</p>
                          <p className="font-medium">
                            {result.exif.photo?.iso || "N/A"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Número F</p>
                          <p className="font-medium">
                            f/{result.exif.photo?.f_number || "N/A"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Tiempo Exposición
                          </p>
                          <p className="font-medium">
                            {result.exif.photo?.exposure_time || "N/A"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Distancia Focal
                          </p>
                          <p className="font-medium">
                            {result.exif.photo?.focal_length || "N/A"} mm
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Balance Blancos
                          </p>
                          <p className="font-medium">
                            {result.exif.photo?.white_balance || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Datos RAW */}
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Layers className="text-indigo-400" />
                        Datos RAW / Perfil
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Formato</p>
                          <p className="font-medium">
                            {result.exif.raw?.format}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Versión JFIF</p>
                          <p className="font-medium">
                            {result.exif.raw?.jfif_version}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Unidad Resolución
                          </p>
                          <p className="font-medium">
                            {result.exif.raw?.resolution_unit}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Resolución X</p>
                          <p className="font-medium">
                            {result.exif.raw?.x_resolution}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Resolución Y</p>
                          <p className="font-medium">
                            {result.exif.raw?.y_resolution}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Perfil Color</p>
                          <p className="font-medium">
                            {result.exif.raw?.profile_description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: HASHES */}
                {activeTab === "hashes" && result.hashes && (
                  <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Fingerprint className="text-amber-400" />
                        Hashes Criptográficos
                      </h2>
                      <div className="space-y-3">
                        {Object.entries(result.hashes.cryptographic || {}).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="bg-slate-950 p-4 rounded-2xl"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-semibold text-amber-400 uppercase">
                                  {key}
                                </p>
                                <button
                                  onClick={() => copyToClipboard(value, key)}
                                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                                >
                                  {copiedHash === key ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  {copiedHash === key ? "Copiado" : "Copiar"}
                                </button>
                              </div>
                              <p className="font-mono text-xs break-all text-slate-300">
                                {value}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Hash className="text-purple-400" />
                        Hashes Perceptuales
                      </h2>
                      <div className="space-y-3">
                        {Object.entries(result.hashes.perceptual || {}).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="bg-slate-950 p-4 rounded-2xl"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-semibold text-purple-400 uppercase">
                                  {key}
                                </p>
                                <button
                                  onClick={() => copyToClipboard(value, key)}
                                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                                >
                                  {copiedHash === key ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  {copiedHash === key ? "Copiado" : "Copiar"}
                                </button>
                              </div>
                              <p className="font-mono text-xs break-all text-slate-300">
                                {value}
                              </p>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: COMPRESIÓN */}
                {activeTab === "compresion" && (
                  <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Layers className="text-teal-400" />
                        Análisis de Compresión
                      </h2>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Formato</p>
                          <p className="font-medium">
                            {result.compression?.format}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Modo</p>
                          <p className="font-medium">
                            {result.compression?.mode}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Tamaño</p>
                          <p className="font-medium">
                            {result.compression?.size_bytes?.toLocaleString()}{" "}
                            bytes
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Progresivo</p>
                          <p className="font-medium">
                            {result.compression?.compression?.progressive
                              ? "Sí"
                              : "No"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Optimizado</p>
                          <p className="font-medium">
                            {result.compression?.compression?.optimize
                              ? "Sí"
                              : "No"}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">JFIF</p>
                          <p className="font-medium">
                            {result.compression?.compression?.jfif}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl">
                        <p className="text-xs text-slate-500 mb-2">
                          Versión JFIF
                        </p>
                        <p className="font-mono text-sm">
                          {JSON.stringify(
                            result.compression?.compression?.jfif_version,
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl mt-4">
                        <p className="text-xs text-slate-500 mb-2">
                          Submuestreo
                        </p>
                        <p className="font-mono text-xs break-all">
                          {JSON.stringify(
                            result.compression?.compression?.subsampling,
                          )}
                        </p>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-2xl mt-4">
                        <p className="text-xs text-slate-500 mb-2">
                          Estimación de Calidad
                        </p>
                        <p className="text-sm text-slate-300">
                          {result.compression?.compression?.quality_estimation}
                        </p>
                      </div>
                    </div>

                    {result.exif?.compression && (
                      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Gauge className="text-orange-400" />
                          Compresión EXIF
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-slate-950 p-4 rounded-2xl">
                            <p className="text-xs text-slate-500">Proceso</p>
                            <p className="font-medium text-sm">
                              {result.exif.compression.encoding_process}
                            </p>
                          </div>
                          <div className="bg-slate-950 p-4 rounded-2xl">
                            <p className="text-xs text-slate-500">
                              Submuestreo
                            </p>
                            <p className="font-medium text-sm">
                              {result.exif.compression.sub_sampling}
                            </p>
                          </div>
                          <div className="bg-slate-950 p-4 rounded-2xl">
                            <p className="text-xs text-slate-500">
                              Calidad JPEG
                            </p>
                            <p className="font-medium">
                              {result.exif.compression.jpeg_quality || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: RUIDO */}
                {activeTab === "ruido" && result.noise && (
                  <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Activity className="text-rose-400" />
                        Análisis de Ruido
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Media Ruido</p>
                          <p className="text-2xl font-bold">
                            {result.noise.noise?.mean}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Desv. Estándar
                          </p>
                          <p className="text-2xl font-bold">
                            {result.noise.noise?.std}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Mínimo</p>
                          <p className="text-2xl font-bold">
                            {result.noise.noise?.min}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">Máximo</p>
                          <p className="text-2xl font-bold">
                            {result.noise.noise?.max}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Crosshair className="text-cyan-400" />
                        Análisis de Nitidez
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Varianza Laplaciana
                          </p>
                          <p className="text-2xl font-bold">
                            {result.noise.sharpness?.laplacian_variance}
                          </p>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl">
                          <p className="text-xs text-slate-500">
                            Clasificación
                          </p>
                          <p className="text-xl font-bold text-amber-400">
                            {result.noise.sharpness?.classification}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: DICTAMEN */}
                {activeTab === "dictamen" && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <FileText className="text-blue-400" />
                        Dictamen Forense Completo
                      </h2>

                      <div className="space-y-6">
                        {/* Veredicto */}
                        <div
                          className={`p-6 rounded-2xl ${result.ela?.possible_manipulation ? "bg-red-500/10 border border-red-500/30" : "bg-emerald-500/10 border border-emerald-500/30"}`}
                        >
                          <div className="flex items-start gap-4">
                            {result.ela?.possible_manipulation ? (
                              <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                            )}
                            <div>
                              <h3
                                className={`text-xl font-bold mb-2 ${result.ela?.possible_manipulation ? "text-red-400" : "text-emerald-400"}`}
                              >
                                {result.ela?.possible_manipulation
                                  ? "EVIDENCIA DE MANIPULACIÓN DETECTADA"
                                  : "IMAGEN APARENTEMENTE AUTÉNTICA"}
                              </h3>
                              <p className="text-slate-300">
                                {result.ela?.possible_manipulation
                                  ? "El análisis ELA indica posibles alteraciones en la imagen. Se recomienda investigación adicional con herramientas forenses avanzadas."
                                  : "La imagen no presenta evidencias claras de manipulación según el análisis ELA. Los patrones de compresión y ruido son consistentes."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Detalles del análisis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-950 p-5 rounded-2xl">
                            <h4 className="font-semibold mb-3 text-blue-400 flex items-center gap-2">
                              <Eye className="w-4 h-4" /> Análisis ELA
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Score:</span>
                                <span className="font-mono">
                                  {result.ela?.score}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Umbral:</span>
                                <span className="font-mono">0.2</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">
                                  Resultado:
                                </span>
                                <span
                                  className={
                                    result.ela?.possible_manipulation
                                      ? "text-red-400"
                                      : "text-emerald-400"
                                  }
                                >
                                  {result.ela?.possible_manipulation
                                    ? "Anomalía"
                                    : "Normal"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-950 p-5 rounded-2xl">
                            <h4 className="font-semibold mb-3 text-purple-400 flex items-center gap-2">
                              <Activity className="w-4 h-4" /> Análisis de Ruido
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">
                                  Nivel medio:
                                </span>
                                <span className="font-mono">
                                  {result.noise?.noise?.mean}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Nitidez:</span>
                                <span className="font-mono">
                                  {result.noise?.sharpness?.classification}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">
                                  Varianza:
                                </span>
                                <span className="font-mono">
                                  {result.noise?.sharpness?.laplacian_variance}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-950 p-5 rounded-2xl">
                            <h4 className="font-semibold mb-3 text-amber-400 flex items-center gap-2">
                              <BarChart3 className="w-4 h-4" /> Histograma
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Brillo:</span>
                                <span className="font-mono">
                                  {result.histogram?.brightness?.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">
                                  Contraste:
                                </span>
                                <span className="font-mono">
                                  {result.histogram?.contrast?.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Píxeles:</span>
                                <span className="font-mono">
                                  {result.histogram?.image?.pixels?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-950 p-5 rounded-2xl">
                            <h4 className="font-semibold mb-3 text-teal-400 flex items-center gap-2">
                              <Layers className="w-4 h-4" /> Compresión
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Formato:</span>
                                <span className="font-mono">
                                  {result.compression?.format}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Modo:</span>
                                <span className="font-mono">
                                  {result.compression?.mode}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Tamaño:</span>
                                <span className="font-mono">
                                  {(
                                    result.compression?.size_bytes / 1024
                                  ).toFixed(2)}{" "}
                                  KB
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Metadatos */}
                        <div className="bg-slate-950 p-5 rounded-2xl">
                          <h4 className="font-semibold mb-3 text-pink-400 flex items-center gap-2">
                            <Camera className="w-4 h-4" /> Metadatos EXIF
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-slate-400">Cámara:</span>
                              <p className="font-medium">
                                {result.exif?.camera?.make || "Desconocida"}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-400">Software:</span>
                              <p className="font-medium">
                                {result.exif?.software?.software || "N/A"}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-400">GPS:</span>
                              <p className="font-medium">
                                {result.exif?.gps?.latitude
                                  ? "Presente"
                                  : "Ausente"}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-400">Fecha:</span>
                              <p className="font-medium text-xs">
                                {result.exif?.dates?.datetime_original || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Recomendación */}
                        <div className="bg-slate-950 p-6 rounded-2xl border-l-4 border-blue-500">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-400" />
                            Recomendación Forense
                          </h4>
                          <p className="text-slate-300">
                            {result.ela?.possible_manipulation
                              ? "Se recomienda realizar un análisis más profundo utilizando herramientas forenses avanzadas como análisis de ruido de sensor, detección de clonación, y verificación de consistencia de iluminación. La imagen debe tratarse como evidencia comprometida hasta que se complete la investigación adicional."
                              : "La imagen puede considerarse como evidencia válida para propósitos generales. Sin embargo, para casos legales de alta importancia, se recomienda complementar con análisis de metadatos de sensor y verificación de origen del archivo."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[650px] flex items-center justify-center bg-slate-900 border border-slate-700 rounded-3xl">
                <div className="text-center">
                  <ImageIcon className="w-24 h-24 mx-auto text-slate-600 mb-6" />
                  <p className="text-2xl text-slate-400">
                    Los resultados del análisis aparecerán aquí
                  </p>
                  <p className="text-slate-500 mt-3">
                    Sube una imagen y presiona Iniciar Análisis Forense
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
