import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Testimonials = () => {
  const { t, isVenezuela } = useLanguage();

  const testimonials = [
    { name: "María González", roleKey: "testimonials.role.creator", avatar: "MG", quoteKey: "testimonials.quote1", rating: 5 },
    { name: "Carlos Rodríguez", roleKey: "testimonials.role.entrepreneur", avatar: "CR", quoteKey: isVenezuela ? "testimonials.quote2" : "testimonials.quote2.global", rating: 5 },
    { name: "Ana Martínez", roleKey: "testimonials.role.cm", avatar: "AM", quoteKey: "testimonials.quote3", rating: 5 },
    { name: "Luis Pérez", roleKey: "testimonials.role.youtuber", avatar: "LP", quoteKey: "testimonials.quote4", rating: 5 },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            {t("testimonials.title")}{" "}
            <span className="text-primary">{t("testimonials.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-medium text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{t(testimonial.roleKey)}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm italic leading-relaxed">
                "{t(testimonial.quoteKey)}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
