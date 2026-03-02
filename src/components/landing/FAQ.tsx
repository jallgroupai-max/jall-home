import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQ = () => {
  const { t, isVenezuela } = useLanguage();

  const faqs = [
    { qKey: "faq.q1", aKey: "faq.a1" },
    { qKey: "faq.q7", aKey: "faq.a7" },
    { qKey: "faq.q2", aKey: isVenezuela ? "faq.a2" : "faq.a2.global" },
    { qKey: "faq.q3", aKey: "faq.a3" },
    { qKey: "faq.q5", aKey: "faq.a5" },
    { qKey: "faq.q4", aKey: "faq.a4" },
    { qKey: "faq.q6", aKey: "faq.a6" },
  ];

  return (
    <section id="faq" className="py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            {t("faq.title")}{" "}
            <span className="text-accent">{t("faq.titleHighlight")}</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("faq.subtitle")}
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card border border-border/50 rounded-xl px-5 data-[state=open]:border-primary/30 transition-colors"
            >
              <AccordionTrigger className="text-left text-sm hover:no-underline hover:text-primary py-4">
                {t(faq.qKey)}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm pb-4">
                {t(faq.aKey)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
