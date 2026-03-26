import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AccountMenu from "@/components/dashboard/AccountMenu";
import {
  Coins,
  FileText,
  Menu,
  MessageSquarePlus,
  Moon,
  Plus,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type DashboardNavbarTab = {
  id: string;
  label: string;
  icon: LucideIcon;
};

interface DashboardNavbarProps {
  tabs: DashboardNavbarTab[];
  activeTabId?: string;
  pointsLabel: string;
  email: string;
  isGuest?: boolean;
  displayName?: string;
  pendingOrdersCount?: number;
  feedbackLabel: string;
  theme: string;
  onTabSelect: (tabId: string) => void;
  onRecharge: () => void;
  onOrdersOpen: () => void;
  onFeedback: () => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}

const DashboardNavbar = ({
  tabs,
  activeTabId,
  pointsLabel,
  email,
  isGuest = false,
  displayName,
  pendingOrdersCount = 0,
  feedbackLabel,
  theme,
  onTabSelect,
  onRecharge,
  onOrdersOpen,
  onFeedback,
  onLogout,
  onToggleTheme,
}: DashboardNavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
            aria-label="Ir al dashboard"
          >
            <img src="/logo.png" alt="JallAI Logo" className="h-8 w-auto" />
          </button>

          <nav className="hidden md:flex items-center bg-secondary/50 rounded-2xl p-1 gap-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabSelect(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTabId === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isGuest ? (
              <>
                <div className="flex items-center gap-2 rounded-2xl border border-primary/25 bg-primary/10 px-3 py-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Modo invitado
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {displayName || "Acceso temporal"}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="rounded-xl"
                >
                  Crear cuenta
                </Button>
              </>
            ) : (
              <>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onRecharge}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-2xl cursor-pointer transition-all duration-200 group"
                      aria-label="Recargar puntos"
                    >
                      <div className="w-5 h-5 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                        <Coins className="w-3 h-3 text-primary" />
                      </div>
                      <span className="font-semibold text-sm text-foreground">
                        {pointsLabel}
                      </span>
                      <Plus className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="rounded-xl p-2" align="end">
                    <p className="text-xs font-medium">Recargar puntos</p>
                  </TooltipContent>
                </Tooltip>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOrdersOpen}
                  className="gap-2 rounded-xl border-border/60"
                >
                  <FileText className="w-4 h-4" />
                  Mis ordenes
                  {pendingOrdersCount > 0 ? (
                    <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                      {pendingOrdersCount}
                    </span>
                  ) : null}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onFeedback}
              className="gap-2 rounded-xl border-border/60"
            >
              <MessageSquarePlus className="w-4 h-4" />
              {feedbackLabel}
            </Button>

            <AccountMenu
              email={email}
              onLogout={onLogout}
              onRecharge={isGuest ? undefined : onRecharge}
              pendingOrdersCount={isGuest ? 0 : pendingOrdersCount}
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleTheme}
              className="rounded-xl text-foreground hover:bg-secondary"
              aria-label={
                theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"
              }
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-secondary transition-colors text-foreground"
            aria-label={mobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in border-t border-border/50 pt-3">
            {isGuest ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Modo invitado
                </p>
                <p className="mt-1 font-semibold text-foreground">
                  {displayName || "Acceso temporal"}
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate("/register")}
                  className="mt-3 w-full rounded-xl"
                >
                  Crear cuenta
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 py-2.5 bg-primary/10 border border-primary/20 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tu saldo</p>
                    <p className="font-bold text-sm text-foreground">
                      {pointsLabel}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onRecharge}
                  size="sm"
                  variant="ghost"
                  className="h-8 px-3 rounded-xl text-primary hover:text-primary hover:bg-primary/10"
                  aria-label="Recargar puntos"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabSelect(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
                    activeTabId === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/80 hover:bg-secondary"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="pt-2 mt-1 border-t border-border/50 flex flex-col gap-2">
              {!isGuest ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOrdersOpen();
                  }}
                  className="w-full justify-start gap-2 px-3 rounded-xl"
                >
                  <FileText className="h-4 w-4" />
                  Mis ordenes
                </Button>
              ) : null}

              <AccountMenu
                email={email}
                onLogout={onLogout}
                onRecharge={
                  isGuest
                    ? undefined
                    : () => {
                        setMobileMenuOpen(false);
                        onRecharge();
                      }
                }
                pendingOrdersCount={isGuest ? 0 : pendingOrdersCount}
                className="w-full justify-start px-3"
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleTheme}
                className="w-full justify-start gap-2 px-3 rounded-xl"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                {theme === "dark" ? "Modo claro" : "Modo oscuro"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onFeedback();
                }}
                className="w-full justify-start gap-2 px-3 rounded-xl"
              >
                <MessageSquarePlus className="h-4 w-4" />
                {feedbackLabel}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardNavbar;
