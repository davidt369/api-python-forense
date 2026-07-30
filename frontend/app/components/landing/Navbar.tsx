"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";

export function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dashboardPath =
    user?.role === "ADMIN" || user?.role === "PERITO"
      ? "/admin/evidencias"
      : "/dashboard";

  const isDarkMode = mounted ? resolvedTheme === "dark" || theme === "dark" : true;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed w-full top-0 z-50 transition-all duration-300 border-b ${
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-border shadow-sm"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 cursor-pointer">
              <Image
                src="/logo/logo-afd.png"
                alt="AFD Logo"
                width={36}
                height={36}
                className="w-7 h-7 object-contain brightness-0 invert"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-foreground block leading-tight">
                Agencia Forense Digital
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-primary tracking-wider uppercase block font-semibold">
                Plataforma de Certificación
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-[13px] font-bold tracking-wide uppercase text-muted-foreground">
            {["Demostración Live", "Validar Hash", "Metodología", "Ley 1173", "Tarifas"].map((item, idx) => (
              <a
                key={idx}
                href={`#${item.toLowerCase().replace(/ /g, "-").replace(/ó/g, "o")}`}
                className="hover:text-primary transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
              title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              className="w-10 h-10 rounded-xl border border-border bg-muted text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
            >
              {mounted && (
                isDarkMode ? (
                  <Sun className="h-5 w-5 text-amber-400 transition-all" />
                ) : (
                  <Moon className="h-5 w-5 text-indigo-600 transition-all" />
                )
              )}
              {!mounted && <Sun className="h-5 w-5 opacity-0" />}
              <span className="sr-only">Cambiar Tema</span>
            </Button>

            <div className="hidden sm:flex items-center gap-3">
              {user ? (
                <Link href={dashboardPath} className={cn(buttonVariants({ size: "sm" }), "bg-primary hover:bg-primary/90 text-primary-foreground font-bold border-0 px-5 h-10 rounded-md transition-all shadow-md")}>
                  Ir al Panel
                  <ArrowRight className="w-4 h-4 ml-1.5 inline" />
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold px-4 h-10 rounded-md uppercase tracking-wider text-xs")}>
                    Iniciar Sesión
                  </Link>
                  <Link href="/auth/register" className={cn(buttonVariants({ size: "sm" }), "bg-primary hover:bg-primary/90 text-primary-foreground font-bold border-0 px-5 h-10 rounded-md transition-all shadow-md")}>
                    Acceder al Portal
                  </Link>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden w-11 h-11 border border-border text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Abrir Menú"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 w-full lg:hidden border-b border-border bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-2xl px-6 py-6 flex flex-col gap-4 shadow-2xl z-40"
          >
            {["Demostración Live", "Validar Hash", "Metodología", "Ley 1173", "Tarifas"].map((item, idx) => (
              <a
                key={idx}
                href={`#${item.toLowerCase().replace(/ /g, "-").replace(/ó/g, "o")}`}
                onClick={() => setIsMenuOpen(false)}
                className="text-foreground hover:text-primary font-medium py-2 text-lg"
              >
                {item}
              </a>
            ))}

            <div className="pt-4 border-t border-border flex flex-col gap-3">
              {user ? (
                <Link href={dashboardPath} onClick={() => setIsMenuOpen(false)} className={cn(buttonVariants(), "w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12 text-base")}>
                  Ir al Panel
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} className={cn(buttonVariants({ variant: "outline" }), "w-full border-border text-foreground h-12 text-base font-bold")}>
                    Iniciar Sesión
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMenuOpen(false)} className={cn(buttonVariants(), "w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12 text-base")}>
                    Acceder al Portal
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
