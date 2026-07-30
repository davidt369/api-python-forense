"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/app/components/landing/Navbar";
import { HeroSection } from "@/app/components/landing/HeroSection";
import { VerificationModule } from "@/app/components/landing/VerificationModule";
import { Methodology } from "@/app/components/landing/Methodology";
import { LegalFramework } from "@/app/components/landing/LegalFramework";
import { Pricing } from "@/app/components/landing/Pricing";
import { FaqSection } from "@/app/components/landing/FaqSection";

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const dashboardPath =
    user?.role === "ADMIN" || user?.role === "PERITO"
      ? "/admin/evidencias"
      : "/dashboard";

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary font-sans relative overflow-x-hidden transition-colors duration-300">
      
      {/* Background Decorators & Grid */}
      <div className="fixed inset-0 bg-corporate-grid opacity-100 pointer-events-none z-0" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 opacity-30 dark:opacity-100 blur-[120px]" />
      </div>

      <Navbar />

      <main className="relative z-10">
        <HeroSection user={user} dashboardPath={dashboardPath} />
        <VerificationModule />
        <Methodology />
        <LegalFramework />
        <Pricing />
        <FaqSection />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-muted/50 py-12 text-center relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-muted-foreground text-sm font-medium">
            &copy; {new Date().getFullYear()} Agencia Forense Digital Bolivia. Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-6 mt-6">
            <a href="#" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">Términos de Servicio</a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">Política de Privacidad</a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">Soporte Legal</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
