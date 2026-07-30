"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Shield, Search, Mail, Phone, Lock, Activity, UserCog, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { motion } from "framer-motion";
import { MagicCard } from "@/components/ui/magic-card";

type User = {
  id: string;
  email: string;
  name: string;
  role: "CLIENTE" | "REVISOR" | "ADMIN";
  ci: string;
  phone: string;
  active: boolean;
  createdAt: string;
  _count: { evidences: number };
};

const roleConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  CLIENTE: { label: "Cliente", bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" },
  REVISOR: { label: "Revisor", bg: "bg-sky-500/10", text: "text-sky-500", border: "border-sky-500/20" },
  ADMIN: { label: "Admin", bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/usuarios");
      if (!res.ok) { router.push("/auth/login"); return; }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.ci.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: users.length,
    clientes: users.filter((u) => u.role === "CLIENTE").length,
    revisores: users.filter((u) => u.role === "REVISOR").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
  };

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
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Gestión de Usuarios</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Administración de identidades, accesos y permisos del sistema
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Usuarios", value: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { label: "Clientes", value: stats.clientes, icon: UserCog, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
          { label: "Revisores", value: stats.revisores, icon: Activity, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
          { label: "Administradores", value: stats.admins, icon: Shield, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <MagicCard key={stat.label} className="border-border/40 overflow-hidden" gradientColor="rgba(var(--primary), 0.1)">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-4xl font-black mt-2 tracking-tight text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.border} border shadow-inner`}>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
              </div>
            </MagicCard>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl w-full overflow-hidden">
        {/* Search Header */}
        <div className="p-5 sm:p-6 border-b border-border/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Directorio Activo
            <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 ml-2">
              {loading ? "..." : `${filteredUsers.length} resultados`}
            </span>
          </h2>
          
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre, CI o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="divide-y divide-border/40">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded-md bg-muted" />
                  <div className="h-3 w-56 rounded-md bg-muted/60" />
                </div>
                <div className="h-6 w-16 rounded-md bg-muted" />
                <div className="h-6 w-20 rounded-md bg-muted/60" />
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-24 bg-muted/10 flex flex-col items-center">
            <div className="p-5 bg-primary/5 rounded-3xl text-primary/40 mb-4 border border-primary/10">
              <Users className="w-12 h-12" />
            </div>
            <h3 className="font-extrabold text-xl mb-2 text-foreground">Sin resultados</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              No se encontraron usuarios que coincidan con la búsqueda "{searchTerm}".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto p-0 rounded-b-3xl">
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Identidad</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">CI / Pasaporte</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Nivel Acceso</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Casos</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Ingreso</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paginatedUsers.map((user) => {
                  const role = roleConfig[user.role] || { label: user.role, bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
                  return (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-inner border transition-colors ${role.bg} ${role.text} ${role.border} group-hover:scale-105`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate max-w-[150px] group-hover:text-primary transition-colors">{user.name}</p>
                            <p className="text-[11px] font-mono text-muted-foreground truncate max-w-[150px]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
                            <Mail className="w-3.5 h-3.5 opacity-70" />
                            {user.email}
                          </span>
                          {user.phone && (
                            <span className="text-xs flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-colors">
                              <Phone className="w-3.5 h-3.5 opacity-70" />
                              {user.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-foreground">
                        {user.ci}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm ${role.bg} ${role.text} ${role.border}`}>
                          {role.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                          {user._count.evidences}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {new Date(user.createdAt).toLocaleDateString("es-BO", {
                          day: "2-digit", month: "short", year: "numeric"
                        }).replace('.', '')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
                            <Activity className="w-3.5 h-3.5" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm">
                            <Lock className="w-3.5 h-3.5" /> Suspendido
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {!loading && filteredUsers.length > 0 && (
          <div className="p-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/20">
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground">
                Mostrando <span className="font-bold text-foreground">{startIndex + 1}</span> a <span className="font-bold text-foreground">{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</span> de <span className="font-bold text-foreground">{filteredUsers.length}</span>
              </p>
              <select
                value={itemsPerPage === filteredUsers.length && filteredUsers.length > 10 ? "all" : itemsPerPage}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "all") setItemsPerPage(filteredUsers.length);
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
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
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
