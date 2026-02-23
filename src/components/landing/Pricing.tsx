import { Button } from "@/components/ui/button";
import { Check, Sparkles, Play, Zap, Rocket } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";

const Pricing = () => {
  const { t, isVenezuela } = useLanguage();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await apiService.get<any>('/providers/public/all');
        if (data) {
          const hasChatGPT = data.some((p: any) => p.typeProvider.toLowerCase() === 'chatgpt');
          const filtered = hasChatGPT ? data.filter((p: any) => p.typeProvider.toLowerCase() === 'chatgpt') : data;
          setProviders(filtered);
        }
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    };
    fetchProviders();
  }, []);

  const getTools = () => {
    if (providers.length === 0) {
      return [
        {
          name: "Agente ChatGPT",
          icon: Sparkles,
          color: "primary" as const,
          plans: [
            { label: t("pricing.day"), regular: "$0.70", promo: "$0.30", planComingSoon: false },
            { label: t("pricing.week"), regular: "$4.00", promo: "$1.80", planComingSoon: false },
          ],
          benefits: [
            t("pricing.instantAccess"),
            isVenezuela ? t("pricing.paymentBs") : t("pricing.paymentFlex"),
            t("pricing.whatsappSupport"),
          ],
          comingSoon: false,
        }
      ];
    }

    return providers.map(p => {
      const isChatGPT = p.typeProvider.toLowerCase() === 'chatgpt';
      const isGoogle = p.typeProvider.toLowerCase() === 'google ai ultra';
      
      return {
        name: isChatGPT ? "Agente ChatGPT" : (isGoogle ? "Plan Creador Google AI" : p.typeProvider),
        icon: isChatGPT ? Sparkles : (isGoogle ? Play : Rocket),
        color: isChatGPT ? "primary" as const : "accent" as const,
        plans: [
          { 
            label: t("pricing.day"), 
            regular: isChatGPT ? "$0.70" : (isGoogle ? "$7.00" : ""), 
            promo: `$${p.finalPrice.toFixed(2)}`, 
            planComingSoon: false 
          },
          { 
            label: isChatGPT ? t("pricing.week") : ("15 " + t("pricing.days")), 
            regular: isChatGPT ? "$4.00" : (isGoogle ? "$15.00" : ""), 
            promo: isChatGPT ? `$${p.finalPriceWeekly.toFixed(2)}` : (isGoogle ? `$${p.finalPriceWeekly.toFixed(2)}` : ""), 
            planComingSoon: isGoogle && p.finalPriceWeekly === 0
          },
        ],
        benefits: [
          t("pricing.instantAccess"),
          isVenezuela ? t("pricing.paymentBs") : t("pricing.paymentFlex"),
          t("pricing.whatsappSupport"),
        ],
        comingSoon: !p.active,
      };
    });
  };

  const tools = getTools();

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

        <div className="grid md:grid-cols-1 gap-6 max-w-2xl mx-auto">
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
                          <span className="text-muted-foreground text-sm line-through">
                            {plan.regular}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Zap className={`w-4 h-4 ${tool.color === "primary" ? "text-primary" : "text-accent"}`} />
                            <span className={`font-bold text-xl ${tool.color === "primary" ? "text-primary" : "text-accent"}`}>
                              {plan.promo}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => navigate('/register')}
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
              </div>
            </div>
          ))}
        </div>

    

        <p className="text-center text-muted-foreground mt-8 text-xs">
          {isVenezuela ? t("pricing.disclaimer") : t("pricing.disclaimerGlobal")}
        </p>
      </div>
    </section>
  );
};

export default Pricing;
