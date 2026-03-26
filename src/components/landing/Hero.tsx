import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GuestAccessButton } from "@/components/auth/GuestAccessButton";
import {
  Sparkles,
  Play,
  ArrowRight,
  Gift,
  Mic,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { t, isVenezuela, language } = useLanguage();
  const navigate = useNavigate();
  const guestCopy =
    language === "es"
      ? {
          title: "Prueba guiada sin registro",
          description:
            "Entra como invitado por 5 minutos y recorre el panel antes de crear tu cuenta.",
          cta: "Entrar como invitado",
          pending: "Abriendo demo...",
        }
      : {
          title: "Try it before creating an account",
          description:
            "Enter as a guest for 5 minutes and explore the dashboard before signing up.",
          cta: "Try guest access",
          pending: "Opening demo...",
        };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="inicio"
      className="relative min-h-[calc(100vh-4rem)] overflow-hidden flex items-center justify-center pt-24 md:pt-20 pb-8 md:py-16 px-4"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[-10rem] top-32 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/85 to-transparent" />
      </div>
      <div className="max-w-6xl mx-auto w-full">
        {/* Registration incentive banner */}
        <div className="mb-8 p-4 rounded-2xl border border-primary/25 bg-card/75 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left animate-fade-in-up shadow-[0_20px_60px_-40px_hsl(var(--primary)/0.7)]">
          <Gift className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">
              {t("hero.bonus.title")}
            </span>{" "}
            {t("hero.bonus.desc")}
          </p>
          <Button
            size="sm"
            onClick={() => navigate("/register")}
            className="shrink-0 gap-1.5"
          >
            {t("hero.bonus.cta")}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/15 text-xs text-primary font-medium">
                <Sparkles className="w-3 h-3" />
                {t("hero.badge.noCard")}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/15 text-xs text-accent font-medium">
                {t("hero.badge.noVpn")}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/15 text-xs text-primary font-medium">
                <Gift className="w-3 h-3" />
                {t("hero.badge.freePoints")}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold leading-[1.15] tracking-tight">
              {t("hero.title")}{" "}
              <span className="text-primary">{t("hero.pricePerDay")}</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
              {t("hero.subtitle")}{" "}
              <span className="text-accent font-medium">
                {isVenezuela ? t("hero.payInBs") : t("hero.payInUsd")}
              </span>{" "}
              {t("hero.createVideos")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="text-base px-6 gap-2 box-glow-cyan min-h-12"
              >
                {t("hero.registerFree")}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <GuestAccessButton
                label={guestCopy.cta}
                pendingLabel={guestCopy.pending}
                description={guestCopy.description}
                variant="outline"
                size="lg"
                className="text-base px-6 min-h-12 rounded-2xl border-primary/30 bg-background/70 hover:bg-primary/10"
                showDescription
              />
              <Button
                size="lg"
                variant="secondary"
                onClick={() => scrollToSection("precios")}
                className="text-base px-6 min-h-12"
              >
                {t("hero.seePricing")}
              </Button>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Clock3 className="h-5 w-5" />
                </div>
                <p className="font-semibold text-foreground">
                  {guestCopy.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {guestCopy.description}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/14 text-accent">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="font-semibold text-foreground">
                  {language === "es"
                    ? "Sin fricción para empezar"
                    : "Start with less friction"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {language === "es"
                    ? "Explora el panel, entiende el producto y luego decide si quieres registrarte."
                    : "Explore the dashboard, understand the product and then decide if you want to sign up."}
                </p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-5 pt-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-xs">{t("hero.activeCreators")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-xs">
                  {isVenezuela ? t("hero.paymentBs") : t("hero.paymentFlex")}
                </span>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Mockup */}
          <div
            className="relative animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="relative bg-card/85 rounded-[2rem] border border-border/60 p-4 md:p-6 shadow-2xl shadow-background/50 backdrop-blur-md">
              {/* Mockup Header */}
              <div className="flex items-center gap-1.5 mb-4 md:mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/50" />
              </div>

              {/* Mockup Content */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 md:p-4 bg-secondary/60 rounded-xl transition-colors hover:bg-secondary/80">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Agente ChatGPT</p>
                    <p className="text-xs text-muted-foreground">
                      {t("hero.mockup.active")} • $0.30/
                      {t("pricing.day").toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 md:p-4 bg-secondary/60 rounded-xl transition-colors hover:bg-secondary/80">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                    <Play className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      Plan Creador Google AI
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("hero.mockup.viralVideos")} • $1.50/
                      {t("pricing.day").toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 md:p-4 bg-secondary/60 rounded-xl transition-colors hover:bg-secondary/80">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Mic className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Eleven Labs</p>
                    <p className="text-xs text-muted-foreground">
                      {t("hero.mockup.elevenLabs")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 md:p-4 bg-primary/6 rounded-xl border border-primary/20">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary text-sm">
                      {t("hero.mockup.bonusTitle")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("hero.mockup.bonusDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-3 -right-2 md:-top-3 md:-right-3 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
              {t("hero.limitedOffer")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
