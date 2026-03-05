
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Coins, Home, Sparkles, Play, Mic, Menu, X, Plus, MessageSquarePlus, Clock, HelpCircle, Sun, Moon, FileText, Zap } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AccountMenu from "@/components/dashboard/AccountMenu";
import RechargeDialog from "@/components/dashboard/RechargeDialog";
import FeedbackDialog from "@/components/dashboard/FeedbackDialog";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { walletsService } from "@/lib/wallets.service";
import { paymentsService } from "@/lib/payments.service";
import ElevenLabsPage from "@/components/elevenlabs/ElevenLabsPage";

type ToolType = "chatgpt" | "elevenlabs" | "aiultra";

type Provider = {
  id: string;
  typeProvider: string;
  finalPrice: number;
  active: boolean;
  redirectUrl?: string;
};

type Account = {
  id: string;
  providerId: string;
  provider: Provider;
};

type UserAccount = {
  id: string;
  userId: string;
  accountId: string;
  active: boolean;
  expiresAt: string;
  accessToken?: string;
  account: Account;
};

/** Convert dollar balance to coins (1 USD = 100 pts) */
const toCoins = (balance: number) => Math.round(balance * 100);
const formatCoins = (coins: number) =>
  coins >= 1000 ? `${(coins / 1000).toFixed(1)}K pts` : `${coins} pts`;

const ToolHelpButton = ({ tool }: { tool: ToolType }) => {
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const features: Record<ToolType, string[]> = {
    chatgpt: [
      t("toolHelp.chatgpt.1"),
      t("toolHelp.chatgpt.2"),
      t("toolHelp.chatgpt.3"),
      t("toolHelp.chatgpt.4"),
      t("toolHelp.chatgpt.5"),
      t("toolHelp.chatgpt.6"),
      t("toolHelp.chatgpt.7"),
      t("toolHelp.chatgpt.8"),
    ],
    elevenlabs: [
      t("toolHelp.elevenlabs.1"),
      t("toolHelp.elevenlabs.2"),
      t("toolHelp.elevenlabs.3"),
      t("toolHelp.elevenlabs.4"),
      t("toolHelp.elevenlabs.5"),
      t("toolHelp.elevenlabs.6"),
    ],
    aiultra: [
      t("toolHelp.aiultra.1"),
      t("toolHelp.aiultra.2"),
      t("toolHelp.aiultra.3"),
      t("toolHelp.aiultra.4"),
      t("toolHelp.aiultra.5"),
      t("toolHelp.aiultra.6"),
    ],
  };

  const titles: Record<ToolType, string> = {
    chatgpt: t("toolHelp.chatgpt.title"),
    elevenlabs: t("toolHelp.elevenlabs.title"),
    aiultra: t("toolHelp.aiultra.title"),
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`
            relative inline-flex items-center justify-center w-6 h-6 rounded-full 
            border border-primary/30 bg-primary/10 text-primary 
            hover:bg-primary/20 hover:border-primary/50 transition-all ml-2
            ${isAnimating ? "animate-help-pulse" : ""}
          `}
        >
          {isAnimating && (
            <>
              <span className="absolute inset-0 rounded-full border border-primary/40 animate-ping-slow" />
              <span className="absolute inset-[-2px] rounded-full border border-primary/20 animate-ping-slower" />
            </>
          )}
          <HelpCircle className="w-4 h-4 relative z-10" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-2xl shadow-xl border border-border/60" align="center">
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">{titles[tool]}</h4>
          <ul className="space-y-2">
            {features[tool].map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
};

type TabType = "inicio" | "chatgpt" | "elevenlabs" | "aiultra";

type ChatGPTMembershipProps = {
  membershipEnd: Date;
  redirectUrl?: string;
  accessToken?: string;
};

const ChatGPTMembership = ({ membershipEnd, redirectUrl, accessToken }: ChatGPTMembershipProps) => {
  const { t } = useLanguage();
  const [timeRemaining, setTimeRemaining] = useState("");

  const formatTimeRemaining = (endDate: Date): string => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    if (diff <= 0) return t("dashboard.expired");
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    setTimeRemaining(formatTimeRemaining(membershipEnd));
    const interval = setInterval(() => setTimeRemaining(formatTimeRemaining(membershipEnd)), 1000);
    return () => clearInterval(interval);
  }, [membershipEnd]);

  return (
    <div className="text-center space-y-6 max-w-lg mx-auto">
      {/* MD3 tonal icon container */}
      <div className="w-24 h-24 mx-auto bg-primary/15 rounded-3xl flex items-center justify-center shadow-sm">
        <Sparkles className="w-12 h-12 text-primary" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-bold inline-flex items-center justify-center">
          ChatGPT Plus
          <ToolHelpButton tool="chatgpt" />
        </h2>
        <div className="flex justify-center">
          <span className="px-4 py-1.5 bg-primary/10 text-primary font-semibold rounded-full text-sm border border-primary/20">
            ✓ {t("dashboard.membershipActive")}
          </span>
        </div>
      </div>

      {/* Countdown Timer — MD3 outlined surface */}
      <div className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-secondary/60 border border-border/50">
        <Clock className="w-5 h-5 text-primary" />
        <span className="text-muted-foreground text-sm">{t("dashboard.timeRemaining")}</span>
        <span className="font-mono font-bold text-foreground">{timeRemaining}</span>
      </div>

      <div className="bg-primary/8 border border-primary/15 p-4 rounded-2xl text-sm text-primary animate-fade-in">
        <p className="font-medium">✨ {t("dashboard.fullAccess")}</p>
      </div>

      <Button
        className="w-full h-12 bg-primary hover:opacity-90 font-bold tracking-wide rounded-2xl shadow-md"
        size="lg"
        asChild
      >
        <a
          href={(redirectUrl || "https://gpt.jall.lat") + (accessToken ? `?token=${accessToken}` : "")}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("dashboard.openChatGPT")}
        </a>
      </Button>
    </div>
  );
};

const Dashboard = () => {
  const { user, token, logout, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("inicio");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRechargeDialog, setShowRechargeDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [loadingTool, setLoadingTool] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!loading && (!user || !token)) navigate("/");
  }, [user, token, loading, navigate]);

  const fetchInitialData = async () => {
    if (!token) return;
    try {
      const [providersData, accountsData] = await Promise.all([
        apiService.get<Provider[]>("/providers/find/all", token),
        apiService.get<UserAccount[]>("/user-accounts/my-accounts", token),
      ]);
      setProviders(providersData);
      setUserAccounts(accountsData);
    } catch (error) {
      console.error("Failed to fetch initial data", error);
    }
  };

  const fetchUserAccounts = async () => {
    if (!token) return;
    try {
      const accountsData = await apiService.get<UserAccount[]>("/user-accounts/my-accounts", token);
      setUserAccounts(accountsData);
    } catch (error) {
      console.error("Failed to fetch user accounts", error);
    }
  };

  const fetchWallet = async () => {
    if (!user) return;
    try {
      const wallet = await walletsService.getByUserId(user.id, token!);
      setBalance(wallet.balance);
    } catch (error) {
      console.error("Failed to fetch wallet", error);
    }
  };

  const fetchPendingOrders = async () => {
    if (!token || !user?.id) return;
    try {
      const count = await paymentsService.getPendingCount(user.id, token);
      setPendingOrdersCount(count);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchWallet();
      fetchInitialData();
      fetchPendingOrders();
      const interval = setInterval(() => {
        fetchWallet();
        fetchUserAccounts();
        fetchPendingOrders();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user, token, showRechargeDialog]);

  const handleActivate = async (tool: ToolType) => {
    if (!user || !token) return;
    const providerTypeMap: Record<ToolType, string> = {
      chatgpt: "ChatGPT",
      elevenlabs: "ElevenLabs",
      aiultra: "AIUltra",
    };
    const provider = providers.find(
      (p) => p.typeProvider === providerTypeMap[tool] || (tool === "chatgpt" && p.typeProvider === "ChatGPT")
    );
    if (!provider) {
      toast({ title: "Error", description: "Provider not found", variant: "destructive" });
      return;
    }
    setLoadingTool(true);
    try {
      await apiService.post("/user-accounts/assign", { userId: user.id, providerId: provider.id }, token);
      toast({ title: "¡Activado!", description: "Membresía activada exitosamente.", variant: "default" });
      await Promise.all([fetchWallet(), fetchUserAccounts()]);
      if (provider.redirectUrl) window.open(provider.redirectUrl, "_blank");
    } catch (error: any) {
      if (error.message?.includes("saldo") || error.message?.includes("balance")) {
        toast({ title: "Saldo insuficiente", description: "Por favor recarga tu saldo.", variant: "destructive" });
        setShowRechargeDialog(true);
      } else {
        toast({ title: "Error", description: error.message || "No se pudo activar.", variant: "destructive" });
      }
    } finally {
      setLoadingTool(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };
  const handleRecharge = () => setShowRechargeDialog(true);

  const coins = toCoins(balance);
  const coinsLabel = formatCoins(coins);

  const tabs = [
    { id: "inicio" as TabType, label: t("dashboard.home"), icon: Home },
    { id: "chatgpt" as TabType, label: "ChatGPT", icon: Sparkles },
    { id: "elevenlabs" as TabType, label: "Eleven Labs", icon: Mic },
    { id: "aiultra" as TabType, label: "AI Ultra", icon: Play },
  ];

  const renderContent = () => {
    if (activeTab === "inicio") {
      return (
        <div className="text-center space-y-8">
          {/* Welcome hero */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-2">
              <Zap className="w-3 h-3" />
              Panel de control
            </div>
            <h2 className="text-3xl font-bold">{t("dashboard.welcome")}</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              {t("dashboard.selectTool")}
            </p>
          </div>

          {/* Tool cards — MD3 elevated surfaces */}
          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-6">
            {tabs.slice(1).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="group relative p-6 bg-card border border-border/60 rounded-3xl hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 text-left overflow-hidden"
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/3 transition-colors duration-300 rounded-3xl" />
                {/* Tonal icon container */}
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <tab.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="font-semibold text-foreground relative z-10">{tab.label}</p>
                <p className="text-xs text-muted-foreground mt-1 relative z-10">Acceder ahora →</p>
              </button>
            ))}
          </div>

          {/* Coins balance card */}
          <div
            onClick={handleRecharge}
            className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-accent/10 border border-accent/20 cursor-pointer hover:bg-accent/20 transition-colors duration-200 group"
          >
            <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
              <Coins className="w-4 h-4 text-accent" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Tu saldo disponible</p>
              <p className="font-bold text-foreground">{coinsLabel}</p>
            </div>
            <Plus className="w-4 h-4 text-muted-foreground ml-1" />
          </div>
        </div>
      );
    }

    const toolNames: Record<TabType, string> = {
      inicio: "",
      chatgpt: "ChatGPT Plus",
      elevenlabs: "Eleven Labs",
      aiultra: "Google AI Ultra",
    };

    // ChatGPT Logic
    if (activeTab === "chatgpt") {
      const chatGPTProvider = providers.find((p) => p.typeProvider === "ChatGPT");
      const activeAccount = userAccounts
        .filter((ua) => ua.active && ua.account?.provider?.typeProvider === "ChatGPT")
        .sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime())
        .find((ua) => new Date(ua.expiresAt) > new Date());
      const isActive = activeAccount && new Date(activeAccount.expiresAt) > new Date();

      if (isActive && activeAccount) {
        return (
          <ChatGPTMembership
            membershipEnd={new Date(activeAccount.expiresAt)}
            redirectUrl={activeAccount.account.provider.redirectUrl}
            accessToken={activeAccount.accessToken}
          />
        );
      }

      const price = chatGPTProvider?.finalPrice || 0;
      const priceInCoins = toCoins(price);
      const canAfford = toCoins(balance) >= priceInCoins;

      return (
        <div className="text-center space-y-6 max-w-lg mx-auto">
          <div className="w-24 h-24 mx-auto bg-accent/15 rounded-3xl flex items-center justify-center shadow-sm">
            <Sparkles className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-2xl font-bold inline-flex items-center justify-center">
            {t("dashboard.noAccess")} ChatGPT Plus
            <ToolHelpButton tool="chatgpt" />
          </h2>
          <p className="text-muted-foreground">
            {canAfford
              ? t("dashboard.activateAccess").replace("$0.30", `${priceInCoins} pts`)
              : t("dashboard.noAccessDesc")}
          </p>
          {/* Price chip */}
          {chatGPTProvider && (
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                <Coins className="w-3.5 h-3.5" />
                {priceInCoins} pts
              </span>
              <span className="text-xs text-muted-foreground">
                {priceInCoins === 30 ? "por 1 día" : "por 30 días"}
              </span>
            </div>
          )}
          <Button
            onClick={() => (canAfford ? handleActivate("chatgpt") : handleRecharge())}
            className="w-full h-12 rounded-2xl font-bold shadow-md"
            size="lg"
            disabled={loadingTool}
          >
            {loadingTool
              ? t("dashboard.activating")
              : canAfford
              ? t("dashboard.activatePlan")
              : t("dashboard.rechargeNow")}
          </Button>
        </div>
      );
    }

    // Eleven Labs
    if (activeTab === "elevenlabs") {
      return (
        <div className="w-full h-[calc(100vh-140px)] max-w-6xl mx-auto">
          <ElevenLabsPage token={token!} />
        </div>
      );
    }

    // AI Ultra — Coming Soon
    return (
      <div className="text-center space-y-6 max-w-lg mx-auto">
        <div className="w-24 h-24 mx-auto bg-accent/15 rounded-3xl flex items-center justify-center shadow-sm">
          <Play className="w-12 h-12 text-accent" />
        </div>
        <h2 className="text-2xl font-bold inline-flex items-center justify-center">
          {t("dashboard.noAccess")} {toolNames[activeTab]}
          {activeTab === "aiultra" && <ToolHelpButton tool="aiultra" />}
        </h2>
        <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent font-semibold rounded-full text-sm border border-accent/20">
          {t("dashboard.comingSoon")}
        </span>
        <p className="text-muted-foreground">{t("dashboard.aiultraDesc")}</p>
        <Button
          onClick={() => setActiveTab("inicio")}
          variant="outline"
          size="lg"
          className="rounded-2xl"
        >
          {t("dashboard.backHome")}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header / Navbar ─────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="JallAI Logo" className="h-8 w-auto" />
            </div>

            {/* Desktop Tab Navigation — MD3 pill indicator */}
            <nav className="hidden md:flex items-center bg-secondary/50 rounded-2xl p-1 gap-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Coins balance pill */}
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleRecharge}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-2xl cursor-pointer transition-all duration-200 group"
                  >
                    <div className="w-5 h-5 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                      <Coins className="w-3 h-3 text-primary" />
                    </div>
                    <span className="font-semibold text-sm text-foreground">{coinsLabel}</span>
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
                onClick={() => setShowFeedbackDialog(true)}
                className="gap-2 rounded-xl border-border/60"
              >
                <MessageSquarePlus className="w-4 h-4" />
                {t("dashboard.suggestChanges")}
              </Button>

              <AccountMenu
                email={user?.email || ""}
                onLogout={handleLogout}
                onRecharge={handleRecharge}
                pendingOrdersCount={pendingOrdersCount}
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-xl text-foreground hover:bg-secondary"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-secondary transition-colors text-foreground"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* ─── Mobile Menu ─────────────────────────── */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2 animate-fade-in border-t border-border/50 pt-3">
              {/* Balance card */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-primary/10 border border-primary/20 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tu saldo</p>
                    <p className="font-bold text-sm text-foreground">{coinsLabel}</p>
                  </div>
                </div>
                <Button onClick={handleRecharge} size="sm" variant="ghost" className="h-8 px-3 rounded-xl text-primary hover:text-primary hover:bg-primary/10">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Tab links */}
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
                      activeTab === tab.id
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
                <AccountMenu
                  email={user?.email || ""}
                  onLogout={handleLogout}
                  onRecharge={() => { setMobileMenuOpen(false); handleRecharge(); }}
                  pendingOrdersCount={pendingOrdersCount}
                  className="w-full justify-start px-3"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-full justify-start gap-2 px-3 rounded-xl"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setMobileMenuOpen(false); setShowFeedbackDialog(true); }}
                  className="w-full justify-start gap-2 px-3 rounded-xl"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  {t("dashboard.suggestChanges")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ─── Main Content ─────────────────────────────── */}
      <main className="pt-24 px-4 pb-16">
        <div className={`max-w-4xl mx-auto ${activeTab === 'elevenlabs' ? 'max-w-none' : ''}`}>
          {renderContent()}
        </div>
      </main>

      {/* Dialogs */}
      <RechargeDialog open={showRechargeDialog} onOpenChange={setShowRechargeDialog} />
      <FeedbackDialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} />
    </div>
  );
};

export default Dashboard;
