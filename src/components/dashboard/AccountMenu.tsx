import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Globe, FileText, Plus, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AccountMenuProps {
  email: string;
  onLogout: () => void;
  onRecharge?: () => void;
  pendingOrdersCount?: number;
  className?: string;
}

const AccountMenu = ({ email, onLogout, onRecharge, pendingOrdersCount = 0, className }: AccountMenuProps) => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`gap-2.5 relative px-2 hover:bg-secondary rounded-xl ${className}`}>
            <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-xs">
              {email ? email[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <span className="hidden sm:block text-sm font-medium">{t("account.title")}</span>
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse border-2 border-background" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border/60 rounded-2xl shadow-xl z-50 p-1">
          <DropdownMenuLabel className="font-normal px-2 py-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {email ? email[0].toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-semibold truncate">{t("account.myAccount")}</p>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="mx-1" />
          <DropdownMenuItem onClick={() => navigate("/mis-ordenes")} className="cursor-pointer rounded-xl gap-3 px-2">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
            Mis Ordenes
            {pendingOrdersCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {pendingOrdersCount}
              </span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRecharge} className="cursor-pointer rounded-xl gap-3 px-2">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <Plus className="w-3.5 h-3.5" />
            </div>
            Recargar Puntos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowLanguageDialog(true)} className="cursor-pointer rounded-xl gap-3 px-2">
            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <Globe className="w-3.5 h-3.5" />
            </div>
            {t("account.language")}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="mx-1" />
          <DropdownMenuItem onClick={onLogout} className="cursor-pointer rounded-xl gap-3 px-2 text-destructive focus:text-destructive focus:bg-destructive/10">
            <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-3.5 h-3.5 text-destructive" />
            </div>
            {t("account.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="sm:max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>{t("account.language")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-4">
            <button
              onClick={() => {
                setLanguage("es");
                setShowLanguageDialog(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                language === "es"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 hover:bg-secondary/50"
              }`}
            >
              <span className="text-xl">ES</span>
              <span className="font-medium">{t("language.spanish")}</span>
              {language === "es" && <Check className="w-4 h-4 ml-auto" />}
            </button>
            <button
              onClick={() => {
                setLanguage("en");
                setShowLanguageDialog(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                language === "en"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 hover:bg-secondary/50"
              }`}
            >
              <span className="text-xl">EN</span>
              <span className="font-medium">{t("language.english")}</span>
              {language === "en" && <Check className="w-4 h-4 ml-auto" />}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountMenu;
