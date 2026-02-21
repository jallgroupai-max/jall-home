import { XCircle, CheckCircle, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ProblemSolution = () => {
  const { t, isVenezuela } = useLanguage();

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            {t("problem.title")}{" "}
            <span className="text-destructive">{t("problem.titleHighlight")}</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("problem.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-center">
          {/* Problem */}
          <div className="bg-destructive/5 border border-destructive/15 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              <span className="font-semibold text-sm uppercase tracking-wide">{t("problem.theProblem")}</span>
            </div>
            <ul className="space-y-3">
              {["item1", "item2", "item3", "item4"].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-muted-foreground text-sm">
                  <XCircle className="w-4 h-4 mt-0.5 text-destructive/70 shrink-0" />
                  <span>{t(`problem.${item}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/15">
              <ArrowRight className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* Solution */}
          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold text-sm uppercase tracking-wide">{t("solution.theSolution")}</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-foreground/80 text-sm">
                <CheckCircle className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>{t("solution.item1")} <strong className="text-primary">{t("solution.item1Price")}</strong> {t("solution.item1Suffix")}</span>
              </li>
              <li className="flex items-start gap-2.5 text-foreground/80 text-sm">
                <CheckCircle className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                {isVenezuela ? (
                  <span>{t("solution.item2")} <strong className="text-accent">{t("solution.item2Highlight")}</strong></span>
                ) : (
                  <span>{t("solution.item2Global")} <strong className="text-accent">{t("solution.item2GlobalHighlight")}</strong></span>
                )}
              </li>
              <li className="flex items-start gap-2.5 text-foreground/80 text-sm">
                <CheckCircle className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>{t("solution.item3")}</span>
              </li>
              <li className="flex items-start gap-2.5 text-foreground/80 text-sm">
                <CheckCircle className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>{t("solution.item4")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
