"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/app/components/landing/Navbar";
import { HeroSection } from "@/app/components/landing/HeroSection";
import { VerificationModule } from "@/app/components/landing/VerificationModule";
import { Methodology } from "@/app/components/landing/Methodology";
import { LegalFramework } from "@/app/components/landing/LegalFramework";
import { Pricing } from "@/app/components/landing/Pricing";
import { FaqSection } from "@/app/components/landing/FaqSection";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/app/lib/utils";
import { useSpring, animated, useScroll } from "@react-spring/web";

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

  const { scrollYProgress } = useScroll();

  const mainSpring = useSpring({
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0 },
    config: { tension: 80, friction: 20, clamp: true },
  });

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary font-sans relative overflow-x-hidden transition-colors duration-300">
      
      {/* Scroll Progress Bar */}
      <animated.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-primary z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Background Decorators & Grid */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
          )}
        />
        <animated.div 
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 opacity-30 dark:opacity-100 blur-[120px]"
          style={{
            y: scrollYProgress.to(val => val * 300)
          }}
        />
      </div>

      <Navbar />

      <animated.main className="relative z-10" style={mainSpring}>
        <HeroSection user={user} dashboardPath={dashboardPath} />
        <VerificationModule />
        <Methodology />
        <LegalFramework />
        <Pricing />
        <FaqSection />
      </animated.main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-muted/50 py-12 text-center relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-muted-foreground text-sm font-medium">
            &copy; {new Date().getFullYear()} Agencia Forense Digital. Todos los derechos reservados.
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
