import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex-shrink-0" aria-label="Go to home">
            <img src="/logo.png" alt="Jall AI" className="h-8 w-auto" />
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scrollToSection("inicio")}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-all"
            >
              {t("nav.home")}
            </button>
            <button
              onClick={() => scrollToSection("precios")}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-all"
            >
              {t("nav.pricing")}
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-all"
            >
              {t("nav.faq")}
            </button>
            
            <div className="w-px h-6 bg-border mx-2" />

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-all text-sm">
                  <Globe className="w-4 h-4" />
                  <span className="uppercase text-xs font-medium">{language}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[120px]">
                <DropdownMenuItem 
                  onClick={() => setLanguage("es")}
                  className={language === "es" ? "bg-primary/10 text-primary" : ""}
                >
                  🇪🇸 {t("language.spanish")}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage("en")}
                  className={language === "en" ? "bg-primary/10 text-primary" : ""}
                >
                  🇺🇸 {t("language.english")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
              className="text-muted-foreground hover:text-foreground"
            >
              {t("nav.login")}
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/register")}
            >
              {t("nav.register")}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-1 animate-fade-in">
            <button
              onClick={() => scrollToSection("inicio")}
              className="block w-full text-left px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all text-sm"
            >
              {t("nav.home")}
            </button>
            <button
              onClick={() => scrollToSection("precios")}
              className="block w-full text-left px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all text-sm"
            >
              {t("nav.pricing")}
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="block w-full text-left px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-all text-sm"
            >
              {t("nav.faq")}
            </button>
            
            {/* Mobile Language Selector */}
            <div className="flex items-center gap-2 px-4 py-2.5">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <button
                onClick={() => setLanguage("es")}
                className={`text-sm ${language === "es" ? "text-primary font-medium" : "text-muted-foreground"}`}
              >
                ES
              </button>
              <span className="text-border">|</span>
              <button
                onClick={() => setLanguage("en")}
                className={`text-sm ${language === "en" ? "text-primary font-medium" : "text-muted-foreground"}`}
              >
                EN
              </button>
            </div>

            <div className="pt-3 space-y-2 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => { setIsOpen(false); navigate("/login"); }}
                className="w-full justify-start text-muted-foreground"
                size="sm"
              >
                {t("nav.login")}
              </Button>
              <Button
                onClick={() => { setIsOpen(false); navigate("/register"); }}
                className="w-full"
                size="sm"
              >
                {t("nav.register")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
