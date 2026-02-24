import { Button } from "@/components/ui/button";
import { Sparkles, Play, DollarSign, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { t, isVenezuela } = useLanguage();
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="inicio"
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center pt-24 md:pt-20 pb-8 md:py-16 px-4"
    >
      <div className="max-w-6xl mx-auto w-full">
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
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold leading-[1.15] tracking-tight">
              {t("hero.title")}{" "}
              <span className="text-primary">{t("hero.pricePerDay")}</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
              {t("hero.subtitle")}{" "}
              <span className="text-accent font-medium">{isVenezuela ? t("hero.payInBs") : t("hero.payInUsd")}</span> {t("hero.createVideos")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="text-base px-6 gap-2"
              >
                {t("hero.registerFree")}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => scrollToSection("precios")}
                className="text-base px-6"
              >
                {t("hero.seePricing")}
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="flex items-center gap-5 pt-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-xs">{t("hero.activeCreators")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-xs">{isVenezuela ? t("hero.paymentBs") : t("hero.paymentFlex")}</span>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Mockup */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative bg-card rounded-2xl border border-border/60 p-4 md:p-6 shadow-2xl shadow-background/50">
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
                    <p className="text-xs text-muted-foreground">{t("hero.mockup.active")} • $0.30/{t("pricing.day").toLowerCase()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 md:p-4 bg-secondary/60 rounded-xl transition-colors hover:bg-secondary/80">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                    <Play className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Plan Creador Google AI</p>
                    <p className="text-xs text-muted-foreground">{t("hero.mockup.viralVideos")} • $1.50/{t("pricing.day").toLowerCase()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 md:p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary text-sm">{isVenezuela ? t("hero.mockup.paymentBs") : t("hero.mockup.paymentFlex")}</p>
                    <p className="text-xs text-muted-foreground">{isVenezuela ? t("hero.mockup.noIntCard") : t("hero.mockup.payAsYouGo")}</p>
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
