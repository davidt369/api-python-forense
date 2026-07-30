"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileBadge, Download, Eye, QrCode, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CertificadosPage() {
  const [evidencias, setEvidencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const fetchEvidencias = async () => {
      try {
        const res = await fetch("/api/evidencias");
        if (res.ok) {
          const data = await res.json();
          // Filter only evidences that have a certificate
          const certificated = (data.evidencias || []).filter((e: any) => e.certificate);
          setEvidencias(certificated);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvidencias();
  }, []);

  return (
    <>
      <div className="bg-card border border-border rounded-xl shadow-sm p-5 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileBadge className="w-5 h-5 text-primary" />
              Certificados Emitidos
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Documentos con validez legal generados por la agencia.</p>
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-border">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                <div className="h-4 w-64 rounded-md bg-muted" />
                <div className="h-4 w-48 rounded-md bg-muted flex-1" />
                <div className="h-4 w-24 rounded-md bg-muted/60" />
                <div className="flex gap-2 ml-auto">
                  <div className="h-8 w-8 rounded-md bg-muted" />
                  <div className="h-8 w-8 rounded-md bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : evidencias.length === 0 ? (
          <div className="text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border flex flex-col items-center">
            <QrCode className="w-10 h-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-lg">No hay certificados</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
              Aún no se ha generado ningún certificado digital. Estos se generan después de completar un análisis forense.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Hash de Certificado</th>
                  <th className="px-4 py-3 font-medium">Evidencia</th>
                  <th className="px-4 py-3 font-medium">Emitido en</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {evidencias.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((evidence) => (
                  <tr key={evidence.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-primary">
                      {evidence.certificate.certificateHash.substring(0, 32)}...
                    </td>
                    <td className="px-4 py-3 font-medium text-muted-foreground">
                      {evidence.originalName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(evidence.certificate.createdAt).toLocaleDateString("es-BO")}
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <a href={`/api/evidencias/${evidence.id}/certificado`} download>
                        <Button variant="outline" size="sm" title="Descargar">
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        title="Previsualizar"
                        onClick={() => setSelectedPdf(`/api/evidencias/${evidence.id}/certificado`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && evidencias.length > 0 && (
          <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/20 rounded-b-lg mt-0 border-x">
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
      </div>

      <Dialog open={!!selectedPdf} onOpenChange={(open) => !open && setSelectedPdf(null)}>
        <DialogContent className="max-w-5xl w-[95vw] sm:w-[90vw] h-[90vh] flex flex-col p-0 overflow-hidden border-border/40 bg-background/70 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.4)] sm:rounded-2xl">
          <DialogHeader className="p-4 border-b border-border/40 bg-muted/20">
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground/90 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Previsualización del Certificado Forense
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full h-full relative bg-zinc-950/5 dark:bg-zinc-950/50">
            {selectedPdf && (
              <iframe 
                src={`${selectedPdf}#toolbar=0`} 
                className="w-full h-full border-0 absolute inset-0"
                title="Certificado PDF"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
