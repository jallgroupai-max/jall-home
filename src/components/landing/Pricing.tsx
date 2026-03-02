import { Button } from "@/components/ui/button";
import { Check, Sparkles, Play, Zap, Rocket, Mic, Gift } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";

const Pricing = () => {
  const { t, isVenezuela } = useLanguage();
  const navigate = useNavigate();
  const [chatGptProvider, setChatGptProvider] = useState<any>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await apiService.get<any>('/providers/public/all');
        if (data) {
          const chatGpt = data.find((p: any) => p.typeProvider.toLowerCase() === 'chatgpt');
          if (chatGpt) {
            setChatGptProvider(chatGpt);
          }
        }
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    };
    fetchProviders();
  }, []);

  const tools = [
    {
      name: "Agente ChatGPT",
      icon: Sparkles,
      color: "primary" as const,
      plans: [
        { 
          label: t("pricing.day"), 
          regular: "$0.70", 
          promo: chatGptProvider ? `$${chatGptProvider.finalPrice.toFixed(2)}` : "$0.30", 
          planComingSoon: false 
        },
        { 
          label: t("pricing.week"), 
          regular: "$4.00", 
          promo: chatGptProvider ? `$${chatGptProvider.finalPriceWeekly.toFixed(2)}` : "$1.80", 
          planComingSoon: false 
        },
      ],
      benefits: [
        t("pricing.chatgpt.benefit1"),
        t("pricing.chatgpt.benefit2"),
        t("pricing.chatgpt.benefit3"),
        t("pricing.chatgpt.benefit4"),
      ],
      comingSoon: false,
    },
    {
      name: "Plan Creador Google AI",
      icon: Play,
      color: "accent" as const,
      plans: [
        { label: t("pricing.day"), regular: "$7.00", promo: "$1.50", planComingSoon: false },
        { label: "15 " + t("pricing.days"), regular: "", promo: "", planComingSoon: true },
      ],
      benefits: [
        t("pricing.aiultra.benefit1"),
        t("pricing.aiultra.benefit2"),
        t("pricing.aiultra.benefit3"),
        t("pricing.aiultra.benefit4"),
      ],
      comingSoon: false,
    },
    {
      name: "Eleven Labs",
      icon: Mic,
      color: "primary" as const,
      plans: [
        { label: t("pricing.elevenlabs.freeCredits"), regular: "", promo: t("pricing.elevenlabs.free"), planComingSoon: false, isFree: true },
        { label: t("pricing.elevenlabs.extraCredits"), regular: "", promo: "$5.00", planComingSoon: false },
      ],
      benefits: [
        t("pricing.elevenlabs.benefit1"),
        t("pricing.elevenlabs.benefit2"),
        t("pricing.elevenlabs.benefit3"),
        t("pricing.elevenlabs.benefit4"),
      ],
      comingSoon: false,
    },
  ];

  return (
    <section id="precios" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            {t("pricing.title")}{" "}
            <span className="text-accent">{t("pricing.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className={`relative rounded-2xl border bg-card transition-all duration-300 hover:shadow-xl overflow-hidden ${
                tool.color === "primary"
                  ? "border-primary/20 hover:border-primary/40 hover:shadow-primary/5"
                  : "border-accent/20 hover:border-accent/40 hover:shadow-accent/5"
              }`}
            >
              {/* Header */}
              <div className="p-6 pb-4 text-center">
                <div
                  className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                    tool.color === "primary" ? "bg-primary/10" : "bg-accent/10"
                  }`}
                >
                  <tool.icon
                    className={`w-7 h-7 ${
                      tool.color === "primary" ? "text-primary" : "text-accent"
                    }`}
                  />
                </div>
                <h3 className="text-xl font-semibold">{tool.name}</h3>
              </div>

              {/* Plans */}
              <div className="px-6 space-y-3">
                {tool.plans.map((plan) => (
                  <div
                    key={plan.label}
                    className={`p-4 rounded-xl ${
                      plan.planComingSoon
                        ? "bg-muted/50 border border-border/50"
                        : tool.color === "primary" ? "bg-primary/5 border border-primary/10" : "bg-accent/5 border border-accent/10"
                    }`}
                  >
                    {plan.planComingSoon ? (
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{plan.label}</span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-medium">
                          {t("pricing.comingSoon")}
                        </span>
                      </div>
                    ) : (plan as any).isFree ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{plan.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary`}>
                            <Gift className="w-3 h-3 inline mr-1" />
                            {t("pricing.elevenlabs.free")}
                          </span>
                        </div>
                        <div className="flex items-center justify-center mb-3">
                          <span className="font-bold text-xl text-primary">
                            10,000 {t("pricing.elevenlabs.creditsLabel")}
                          </span>
                        </div>
                        <Button
                          onClick={() => navigate('/comprar')}
                          className="w-full"
                          size="sm"
                          variant="default"
                        >
                          {t("hero.registerFree")}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{plan.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            tool.color === "primary" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                          }`}>
                            {t("pricing.promo")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          {plan.regular && (
                            <span className="text-muted-foreground text-sm line-through">
                              {plan.regular}
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 ml-auto">
                            <Zap className={`w-4 h-4 ${tool.color === "primary" ? "text-primary" : "text-accent"}`} />
                            <span className={`font-bold text-xl ${tool.color === "primary" ? "text-primary" : "text-accent"}`}>
                              {plan.promo}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => navigate('/comprar')}
                          className="w-full"
                          size="sm"
                          variant={tool.color === "primary" ? "default" : "secondary"}
                        >
                          {t("pricing.buy")}
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <div className="p-6 pt-4 space-y-2">
                {tool.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className={`w-4 h-4 flex-shrink-0 ${
                      tool.color === "primary" ? "text-primary" : "text-accent"
                    }`} />
                    <span>{benefit}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Check className={`w-4 h-4 flex-shrink-0 ${tool.color === "primary" ? "text-primary" : "text-accent"}`} />
                  <span>{t("pricing.instantAccess")}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Check className={`w-4 h-4 flex-shrink-0 ${tool.color === "primary" ? "text-primary" : "text-accent"}`} />
                  <span>{isVenezuela ? t("pricing.paymentBs") : t("pricing.paymentFlex")}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Check className={`w-4 h-4 flex-shrink-0 ${tool.color === "primary" ? "text-primary" : "text-accent"}`} />
                  <span>{t("pricing.whatsappSupport")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coming soon banner */}
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 p-4 rounded-2xl border border-accent/15 bg-accent/5 text-center">
            <Rocket className="w-5 h-5 text-accent" />
            <p className="text-sm text-muted-foreground">
              <span className="text-accent font-medium">{t("pricing.comingSoon")}:</span>{" "}
              {t("pricing.newAgents")}
            </p>
          </div>
        </div>

        <p className="text-center text-muted-foreground mt-8 text-xs">
          {isVenezuela ? t("pricing.disclaimer") : t("pricing.disclaimerGlobal")}
        </p>
      </div>
    </section>
  );
};

export default Pricing;
