import { Sparkles, Play, Mic, Wallet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Benefits = () => {
  const { t, isVenezuela } = useLanguage();

  const benefits = [
    {
      icon: Sparkles,
      titleKey: "benefits.chatgpt.title",
      descKey: "benefits.chatgpt.desc",
      color: "primary" as const,
    },
    {
      icon: Play,
      titleKey: "benefits.video.title",
      descKey: "benefits.video.desc",
      color: "accent" as const,
    },
    {
      icon: Mic,
      titleKey: "benefits.voice.title",
      descKey: "benefits.voice.desc",
      color: "primary" as const,
    },
    {
      icon: Wallet,
      titleKey: isVenezuela ? "benefits.payment.title" : "benefits.payment.title",
      descKey: isVenezuela ? "benefits.payment.desc" : "benefits.payment.desc",
      color: "accent" as const,
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            {t("benefits.title")}{" "}
            <span className="text-primary">{t("benefits.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("benefits.subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.titleKey}
              className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 ${
                  benefit.color === "primary"
                    ? "bg-primary/10"
                    : "bg-accent/10"
                }`}
              >
                <benefit.icon
                  className={`w-6 h-6 ${
                    benefit.color === "primary"
                      ? "text-primary"
                      : "text-accent"
                  }`}
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t(benefit.titleKey)}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{t(benefit.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
