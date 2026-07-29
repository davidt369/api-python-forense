"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, User, Send, Cpu, MapPin, Camera, Code, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export function AiForensicDashboard() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "ai", text: "Hola. Soy el Asistente Forense IA. He terminado de analizar el hash y la matriz de compresión de la evidencia proporcionada. ¿En qué puedo ayudarte?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al recibir nuevos mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Lógica simulada de respuestas (Mock IA)
    setTimeout(() => {
      let aiResponseText = "";
      const lowerInput = userMessage.text.toLowerCase();

      if (lowerInput.includes("alterada") || lowerInput.includes("manipulación") || lowerInput.includes("ia")) {
        aiResponseText = "He detectado anomalías de nivel de error (ELA) en el cuadrante superior derecho. La matriz de cuantización sugiere un 89% de probabilidad de manipulación algorítmica (posible inpainting con IA).";
      } else if (lowerInput.includes("gps") || lowerInput.includes("ubicación") || lowerInput.includes("lugar")) {
        aiResponseText = "Los metadatos EXIF indican que las coordenadas GPS originales (Lat: -16.5000, Lon: -68.1193) fueron eliminadas mediante un software de edición (Adobe Photoshop 2024) antes de guardar el archivo.";
      } else if (lowerInput.includes("resumen") || lowerInput.includes("reporte")) {
        aiResponseText = "Resumen del análisis: \n1. Compresión JPEG alterada.\n2. Firma de cámara borrada.\n3. Alteración detectada en la zona central.\nTe sugiero utilizar la pestaña de 'Zoom Inteligente' o exportar el PDF en el 'Lab de Filtros'.";
      } else {
        aiResponseText = "Interesante observación. Según mis vectores de análisis profundo, hay discrepancias en la distribución de color RGB de los píxeles. Te recomiendo inspeccionarlo usando el Filtro de Relieve (Emboss).";
      }

      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "ai", text: aiResponseText }]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Retraso aleatorio para simular pensamiento
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
      
      {/* Panel Izquierdo: Dashboard de Metadatos EXIF / Análisis de IA */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <Card className="p-5 bg-slate-900 border-slate-800 shadow-xl flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-3">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-slate-200">Telemetría Forense (BETA)</h3>
          </div>

          <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar flex-1">
            
            {/* Metadato 1 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-slate-400"><Camera className="w-4 h-4 text-emerald-400" /> Dispositivo Origen</span>
                <span className="text-slate-200 font-medium font-mono">Desconocido</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-red-500 h-1.5 rounded-full w-[10%]"></div>
              </div>
              <p className="text-xs text-slate-500 text-right">Firmas eliminadas</p>
            </div>

            {/* Metadato 2 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-slate-400"><MapPin className="w-4 h-4 text-blue-400" /> Datos GPS</span>
                <span className="text-slate-200 font-medium font-mono text-xs">Exif.GPSInfo Eliminado</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-orange-500 h-1.5 rounded-full w-[35%]"></div>
              </div>
            </div>

            {/* Metadato 3 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-slate-400"><Code className="w-4 h-4 text-purple-400" /> Software Edición</span>
                <span className="text-slate-200 font-medium font-mono text-xs">Adobe Photoshop</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full w-[100%] shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
              </div>
              <p className="text-xs text-purple-400/80 text-right">Huella digital detectada</p>
            </div>

            {/* Alertas */}
            <div className="pt-4 space-y-3 border-t border-slate-700/50">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-400">Anomalía de Compresión</h4>
                  <p className="text-xs text-red-300/80 mt-1">La matriz JPEG no coincide con el algoritmo estándar del dispositivo declarado.</p>
                </div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-emerald-400">Hash MD5 Verificado</h4>
                  <p className="text-xs text-emerald-300/80 mt-1">La integridad de la descarga está intacta.</p>
                </div>
              </div>
            </div>

          </div>
        </Card>
      </div>

      {/* Panel Derecho: Interfaz del Chatbot */}
      <div className="lg:col-span-8 flex flex-col h-[600px]">
        <Card className="flex flex-col flex-1 bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
          
          <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Forense-GPT</h3>
                <p className="text-xs text-emerald-400">En línea (Simulador)</p>
              </div>
            </div>
            <div className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              Modelo LLM v4.5
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-950/30 custom-scrollbar"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-4 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === "user" ? "bg-emerald-600" : "bg-blue-600"
                }`}>
                  {msg.sender === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>

                {/* Burbuja */}
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-md leading-relaxed ${
                  msg.sender === "user" 
                    ? "bg-emerald-600 text-white rounded-tr-sm" 
                    : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm"
                }`}>
                  {msg.text.split('\n').map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4 flex-row">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5 w-16 h-12">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <form onSubmit={handleSendMessage} className="flex gap-3 relative">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Pregúntale a la IA sobre la evidencia (ej: '¿Está alterada?')..." 
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
              <Button 
                type="submit" 
                disabled={!inputValue.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 h-auto shadow-lg shadow-blue-500/20 transition-transform active:scale-95 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </form>
          </div>

        </Card>
      </div>

    </div>
  );
}
