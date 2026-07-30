"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileSearch, ArrowRight, Shield, AlertTriangle, CheckCircle2, History, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { motion } from "framer-motion";
import { MagicCard } from "@/components/ui/magic-card";

export default function AnalisisPage() {
  const [evidencias, setEvidencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const fetchEvidencias = async () => {
      try {
        const res = await fetch("/api/evidencias");
        if (res.ok) {
          const data = await res.json();
          // Filter only evidences that have an analysis
          const analyzed = (data.evidencias || []).filter((e: any) => e.analysis);
          setEvidencias(analyzed);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvidencias();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 20 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-full space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl text-primary flex items-center justify-center shadow-inner border border-primary/20">
            <History className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Historial de Análisis</h1>
            <p className="text-sm text-muted-foreground mt-1">Archivo completo de peritajes digitales procesados por la plataforma</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl w-full overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-primary" />
            Registro Forense
            <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 ml-2">
              {loading ? "..." : `${evidencias.length} analizados`}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="divide-y divide-border/40">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 px-6 py-4 animate-pulse">
                <div className="h-4 w-16 rounded-md bg-muted" />
                <div className="h-4 w-40 rounded-md bg-muted flex-1" />
                <div className="h-6 w-24 rounded-lg bg-muted" />
                <div className="h-4 w-12 rounded-md bg-muted" />
                <div className="h-4 w-28 rounded-md bg-muted/60" />
                <div className="h-8 w-20 rounded-md bg-muted ml-auto" />
              </div>
            ))}
          </div>
        ) : evidencias.length === 0 ? (
          <div className="text-center py-24 bg-muted/10 flex flex-col items-center">
            <div className="p-5 bg-primary/5 rounded-3xl text-primary/40 mb-4 border border-primary/10">
              <Shield className="w-12 h-12" />
            </div>
            <h3 className="font-extrabold text-xl mb-2 text-foreground">No hay análisis registrados</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Aún no se ha completado ningún análisis forense profundo. Ve al panel de evidencias para procesar casos pendientes.
            </p>
            <Link href="/admin/evidencias">
              <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-xl px-6">
                Ir al Panel de Evidencias
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto p-0 rounded-lg border-t border-border/10">
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">ID Ref</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Archivo Original</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Veredicto Criptográfico</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Score Anomalías</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Reporte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {evidencias.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((evidence) => (
                  <tr key={evidence.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      <span className="bg-muted/50 px-2 py-1 rounded-md border border-border/50">
                        #{evidence.id.slice(-6)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground group-hover:text-primary transition-colors">
                      {evidence.originalName}
                    </td>
                    <td className="px-6 py-4">
                      {evidence.analysis?.elaResult === "AUTENTICA" ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Auténtica
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm">
                          <AlertTriangle className="w-3.5 h-3.5" /> Manipulada
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${evidence.analysis?.elaResult === "AUTENTICA" ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`} />
                        {(evidence.analysis?.elaScore || 0).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                      {new Date(evidence.analysis?.createdAt).toLocaleString("es-BO", {
                        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      }).replace('.', '')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/analisis/${evidence.id}`}>
                        <Button variant="outline" size="sm" className="border-border/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary group-hover:shadow-md transition-all">
                          Ver Reporte <ArrowRight className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && evidencias.length > 0 && (
          <div className="p-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/20">
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground">
                Mostrando <span className="font-bold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-bold text-foreground">{Math.min(currentPage * itemsPerPage, evidencias.length)}</span> de <span className="font-bold text-foreground">{evidencias.length}</span>
              </p>
              <select
                value={itemsPerPage === evidencias.length && evidencias.length > 10 ? "all" : itemsPerPage}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "all") setItemsPerPage(evidencias.length);
                  else setItemsPerPage(Number(val));
                }}
                className="h-7 text-xs rounded-md border border-border/50 bg-background px-2 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value={3}>3 por pág.</option>
                <option value={5}>5 por pág.</option>
                <option value={10}>10 por pág.</option>
                <option value="all">Todos</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-foreground bg-muted/50 px-3 py-1 rounded-md border border-border/50">
                {currentPage} / {Math.ceil(evidencias.length / itemsPerPage) || 1}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(evidencias.length / itemsPerPage) || 1))}
                disabled={currentPage === (Math.ceil(evidencias.length / itemsPerPage) || 1)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
