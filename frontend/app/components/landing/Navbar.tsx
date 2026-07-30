"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ArrowRight, Download } from "lucide-react";
import { Button, buttonVariants } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";

export function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-md transition-all group-hover:scale-105">
              <Image
                src="/logo/logo-afd.png"
                alt="AFD Logo"
                width={32}
                height={32}
                className="w-6 h-6 object-contain brightness-0 invert"
                priority
              />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-foreground block leading-tight group-hover:text-primary transition-colors">
                Agencia Forense Digital
              </span>
              <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase block font-medium">
                Plataforma de Certificación
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 xl:gap-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {[
              { name: "Demostración Live", href: "#demostracion-live" },
              { name: "Validar Hash", href: "#validar-hash" },
              { name: "Metodología", href: "#metodologia" },
              { name: "Tarifas", href: "#tarifas" },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="hover:text-foreground transition-colors relative py-1 group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
              title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              className="w-9 h-9 rounded-xl border border-border/60 bg-card/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-sm"
            >
              {mounted && (
                isDarkMode ? (
                  <Sun className="h-4 w-4 text-amber-400 transition-all" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-600 transition-all" />
                )
              )}
              {!mounted && <Sun className="h-4 w-4 opacity-0" />}
              <span className="sr-only">Cambiar Tema</span>
            </Button>

            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <Link href={dashboardPath} className={cn(buttonVariants({ size: "sm" }), "bg-primary hover:bg-primary/90 text-primary-foreground font-bold border-0 px-4 h-9 rounded-xl transition-all shadow-md text-xs")}>
                  Ir al Panel
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 inline" />
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground hover:text-foreground font-medium px-3.5 h-9 rounded-xl text-xs")}>
                    Iniciar Sesión
                  </Link>
                  <Link href="/auth/register" className={cn(buttonVariants({ size: "sm" }), "bg-primary hover:bg-primary/90 text-primary-foreground font-bold border-0 px-4 h-9 rounded-xl transition-all shadow-md text-xs")}>
                    Acceder al Portal
                  </Link>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-9 h-9 border border-border/60 text-muted-foreground rounded-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Abrir Menú"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            {["Demostración Live", "Validar Hash", "Metodología", "Tarifas"].map((item, idx) => (
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
              {deferredPrompt && (
                <Button
                  onClick={handleInstallClick}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 text-base"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Instalar Aplicación
                </Button>
              )}
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
