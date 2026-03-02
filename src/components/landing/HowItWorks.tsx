import { useState } from "react";
import { UserPlus, Mail, Rocket, ArrowRight, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import RegisterDialog from "./RegisterDialog";
import LoginDialog from "./LoginDialog";

const HowItWorks = () => {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { t } = useLanguage();

  const steps = [
    {
      icon: UserPlus,
      step: "01",
      title: t("howItWorks.step1.title"),
      desc: t("howItWorks.step1.desc"),
    },
    {
      icon: Mail,
      step: "02",
      title: t("howItWorks.step2.title"),
      desc: t("howItWorks.step2.desc"),
    },
    {
      icon: Rocket,
      step: "03",
      title: t("howItWorks.step3.title"),
      desc: t("howItWorks.step3.desc"),
    },
  ];

  return (
    <section id="como-funciona" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            {t("howItWorks.title")}{" "}
            <span className="text-primary">{t("howItWorks.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-300 text-center"
            >
              <div className="text-xs font-bold text-primary/40 mb-3">{step.step}</div>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <ArrowRight className="w-5 h-5 text-primary/30" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No VPN, no downloads badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border/50 text-sm text-muted-foreground">
            <Monitor className="w-4 h-4 text-primary" />
            {t("howItWorks.noDownload")}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border/50 text-sm text-muted-foreground">
            <Smartphone className="w-4 h-4 text-accent" />
            {t("howItWorks.mobileOrPc")}
          </div>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            onClick={() => setRegisterOpen(true)}
            className="text-base px-8 gap-2"
          >
            {t("howItWorks.cta")}
            <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="text-xs text-muted-foreground mt-3">{t("howItWorks.noCreditCard")}</p>
        </div>
      </div>

      <RegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSwitchToLogin={() => setLoginOpen(true)}
      />
      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToRegister={() => setRegisterOpen(true)}
      />
    </section>
  );
};

export default HowItWorks;
