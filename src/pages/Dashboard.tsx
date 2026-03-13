import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import RechargeDialog from "@/components/dashboard/RechargeDialog";
import FeedbackDialog from "@/components/dashboard/FeedbackDialog";
import ElevenLabsPage from "@/components/elevenlabs/ElevenLabsPage";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { buildProviderLaunchUrl } from "@/lib/provider-links";
import { walletsService } from "@/lib/wallets.service";
import { paymentsService } from "@/lib/payments.service";
import {
  Bot,
  Clock,
  Coins,
  Compass,
  Gem,
  GitBranch,
  HelpCircle,
  Home,
  Mic,
  Play,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";

type ActivationToolType = "texttools" | "chatgpt" | "grok" | "elevenlabs" | "aiultra";
type TabType = "inicio" | "texttools" | "elevenlabs" | "aiultra";

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

type ProviderAccess = {
  redirectUrl?: string;
  accessToken?: string;
};

const toCoins = (balance: number) => Math.round(balance * 100);
const formatCoins = (coins: number) => (coins >= 1000 ? `${(coins / 1000).toFixed(1)}K pts` : `${coins} pts`);

const ToolHelpButton = () => {
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    t("toolHelp.chatgpt.1"),
    t("toolHelp.chatgpt.2"),
    t("toolHelp.chatgpt.3"),
    t("toolHelp.chatgpt.4"),
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`relative inline-flex items-center justify-center w-6 h-6 rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all ml-2 ${
            isAnimating ? "animate-help-pulse" : ""
          }`}
        >
          <HelpCircle className="w-4 h-4 relative z-10" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-2xl shadow-xl border border-border/60" align="center">
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">{t("toolHelp.chatgpt.title")}</h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">-</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Dashboard = () => {
  const { user, token, logout, loading } = useAuth();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>("inicio");
  const [showRechargeDialog, setShowRechargeDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [loadingTool, setLoadingTool] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    if (!loading && (!user || !token)) {
      navigate("/");
    }
  }, [loading, navigate, token, user]);

  useEffect(() => {
    const locationState = location.state as { initialTab?: TabType } | null;
    if (locationState?.initialTab) {
      setActiveTab(locationState.initialTab);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

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
    if (!user || !token) return;
    try {
      const wallet = await walletsService.getByUserId(user.id, token);
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
  }, [showRechargeDialog, token, user]);

  const handleActivate = async (tool: ActivationToolType) => {
    if (!user || !token) return;

    const providerTypeMap: Record<ActivationToolType, string> = {
      texttools: "ChatGPT",
      chatgpt: "ChatGPT",
      grok: "Grok",
      elevenlabs: "ElevenLabs",
      aiultra: "Google AI Ultra",
    };

    const provider = providers.find((p) => p.typeProvider === providerTypeMap[tool]);

    if (!provider) {
      toast({ title: "Error", description: "Provider not found", variant: "destructive" });
      return;
    }

    setLoadingTool(true);
    try {
      await apiService.post("/user-accounts/assign", { userId: user.id, providerId: provider.id }, token);
      toast({ title: "Activado", description: "Membresia activada exitosamente.", variant: "default" });
      await Promise.all([fetchWallet(), fetchUserAccounts()]);
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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const coins = toCoins(balance);
  const coinsLabel = formatCoins(coins);

  const tabs = [
    { id: "inicio" as TabType, label: t("dashboard.home"), icon: Home },
    { id: "texttools" as TabType, label: t("dashboard.textToolsNav"), icon: GitBranch },
    { id: "elevenlabs" as TabType, label: "Eleven Labs", icon: Mic },
    { id: "aiultra" as TabType, label: "AI Ultra", icon: Play },
  ];

  const activeChatGPT = useMemo(
    () =>
      userAccounts
        .filter((ua) => ua.active && ua.account?.provider?.typeProvider === "ChatGPT")
        .sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime())
        .find((ua) => new Date(ua.expiresAt) > new Date()),
    [userAccounts],
  );

  const activeGrok = useMemo(
    () =>
      userAccounts
        .filter((ua) => ua.active && ua.account?.provider?.typeProvider === "Grok")
        .sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime())
        .find((ua) => new Date(ua.expiresAt) > new Date()),
    [userAccounts],
  );

  const activePerplexity = useMemo(
    () =>
      userAccounts
        .filter((ua) => ua.active && ua.account?.provider?.typeProvider === "Perplexity")
        .sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime())
        .find((ua) => new Date(ua.expiresAt) > new Date()),
    [userAccounts],
  );

  const isGenerativeActive = !!activeChatGPT || !!activeGrok || !!activePerplexity;
  const chatGPTProvider = providers.find((p) => p.typeProvider === "ChatGPT");
  const grokProvider = providers.find((p) => p.typeProvider === "Grok");
  const perplexityProvider = providers.find((p) => p.typeProvider === "Perplexity");
  const sharedAccessToken = activePerplexity?.accessToken || activeGrok?.accessToken || activeChatGPT?.accessToken;

  const chatGPTAccess: ProviderAccess = {
    redirectUrl: activeChatGPT?.account.provider.redirectUrl || chatGPTProvider?.redirectUrl,
    accessToken: activeChatGPT?.accessToken,
  };
  const grokAccess: ProviderAccess = {
    redirectUrl: activeGrok?.account.provider.redirectUrl || grokProvider?.redirectUrl,
    accessToken: activeGrok?.accessToken,
  };
  const perplexityAccess: ProviderAccess = {
    redirectUrl: activePerplexity?.account.provider.redirectUrl || perplexityProvider?.redirectUrl,
    accessToken: activePerplexity?.accessToken || sharedAccessToken,
  };

  const chatGPTHref = buildProviderLaunchUrl("ChatGPT", chatGPTAccess.accessToken, chatGPTAccess.redirectUrl);
  const grokHref = buildProviderLaunchUrl("Grok", sharedAccessToken, grokAccess.redirectUrl);
  const perplexityHref = buildProviderLaunchUrl("Perplexity", sharedAccessToken, perplexityAccess.redirectUrl);

  const latestExpiration = [activeChatGPT?.expiresAt, activeGrok?.expiresAt, activePerplexity?.expiresAt]
    .filter(Boolean)
    .map((expiresAt) => new Date(expiresAt as string))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const getRemaining = (endDate?: Date) => {
    if (!endDate) return t("dashboard.expired");
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    if (diff <= 0) return t("dashboard.expired");
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  const renderGenerativeCards = (active: boolean) => (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="surface-1 rounded-3xl border border-border/60 p-5 animate-fade-in-up [animation-delay:80ms] [animation-fill-mode:both]">
        <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <p className="font-semibold text-foreground">ChatGPT</p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          {active ? "GPT-4o y herramientas avanzadas" : "Se habilita al activar IA Generativa"}
        </p>
        {active ? (
          <Button className="w-full rounded-xl" asChild>
            <a href={chatGPTHref} target="_blank" rel="noopener noreferrer">
              {t("dashboard.openChatGPT")}
            </a>
          </Button>
        ) : (
          <Button variant="outline" className="w-full rounded-xl" disabled>
            Activar para usar
          </Button>
        )}
      </div>

      <div className="surface-1 rounded-3xl border border-border/60 p-5 animate-fade-in-up [animation-delay:160ms] [animation-fill-mode:both]">
        <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <p className="font-semibold text-foreground">Grok</p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          {active ? "Investigacion y respuestas de contexto web" : "Se habilita al activar IA Generativa"}
        </p>
        {active ? (
          <Button className="w-full rounded-xl" asChild>
            <a href={grokHref} target="_blank" rel="noopener noreferrer">
              {t("dashboard.openGrok")}
            </a>
          </Button>
        ) : (
          <Button variant="outline" className="w-full rounded-xl" disabled>
            Activar para usar
          </Button>
        )}
      </div>

      <div className="surface-1 rounded-3xl border border-border/60 p-5 animate-fade-in-up [animation-delay:240ms] [animation-fill-mode:both]">
        <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
          <Compass className="w-5 h-5 text-accent" />
        </div>
        <p className="font-semibold text-foreground">Perplexity</p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          {active ? "Busqueda web asistida con IA y contexto en tiempo real" : "Se habilita al activar IA Generativa"}
        </p>
        {active ? (
          <Button className="w-full rounded-xl" asChild>
            <a href={perplexityHref} target="_blank" rel="noopener noreferrer">
              {t("dashboard.openPerplexity")}
            </a>
          </Button>
        ) : (
          <Button variant="outline" className="w-full rounded-xl" disabled>
            Activar para usar
          </Button>
        )}
      </div>

      <div className="surface-1 rounded-3xl border border-border/60 p-5 animate-fade-in-up [animation-delay:320ms] [animation-fill-mode:both]">
        <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
          <Gem className="w-5 h-5 text-accent" />
        </div>
        <p className="font-semibold text-foreground">Gemini</p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">Asistente multimodal de Google</p>
        <Button variant="outline" className="w-full rounded-xl" disabled>
          {t("dashboard.comingSoon")}
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === "inicio") {
      return (
        <div className="text-center space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-2">
              <Zap className="w-3 h-3" />
              Panel de control
            </div>
            <h2 className="text-3xl font-bold">{t("dashboard.welcome")}</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">{t("dashboard.selectTool")}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-6">
            {tabs.slice(1).map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="group relative p-6 bg-card border border-border/60 rounded-3xl hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 text-left overflow-hidden animate-fade-in-up [animation-fill-mode:both]"
                style={{ animationDelay: `${120 + index * 80}ms` }}
              >
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/3 transition-colors duration-300 rounded-3xl" />
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <tab.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="font-semibold text-foreground relative z-10">{tab.label}</p>
                {tab.id === "texttools" && (
                  <div className="relative z-10 mt-2 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      ChatGPT
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-foreground">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                      Grok
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-foreground">
                      <Compass className="w-3.5 h-3.5 text-primary" />
                      Perplexity
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-foreground">
                      <Gem className="w-3.5 h-3.5 text-primary" />
                      Gemini
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1 relative z-10">Acceder ahora -&gt;</p>
              </button>
            ))}
          </div>

          <div
            onClick={() => setShowRechargeDialog(true)}
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

    if (activeTab === "texttools") {
      const priceInCoins = 30;
      const canAfford = toCoins(balance) >= priceInCoins;

      return (
        <div className="space-y-8 max-w-5xl mx-auto">
          <div className="text-center space-y-3">
            {isGenerativeActive ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                <Zap className="w-3 h-3" />
                {t("dashboard.membershipActive")}
              </div>
            ) : null}
            <h2 className="text-2xl font-bold inline-flex items-center justify-center">
              {isGenerativeActive ? t("dashboard.textToolsTitle") : `${t("dashboard.noAccess")} ${t("dashboard.textToolsTitle")}`}
              <ToolHelpButton />
            </h2>
            {isGenerativeActive ? (
              <div className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-secondary/60 border border-border/50 max-w-md mx-auto">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground text-sm">{t("dashboard.timeRemaining")}</span>
                <span className="font-mono font-bold text-foreground">{getRemaining(latestExpiration)}</span>
              </div>
            ) : (
              <p className="text-muted-foreground max-w-xl mx-auto">
                {canAfford
                  ? t("dashboard.activateTextToolsAccess").replace("$0.30", `${priceInCoins} pts`)
                  : t("dashboard.noAccessDesc")}
              </p>
            )}
          </div>

          {renderGenerativeCards(isGenerativeActive)}

          {!isGenerativeActive ? (
            <div className="max-w-md mx-auto p-5 rounded-3xl border border-primary/20 bg-primary/5 text-center space-y-4 animate-fade-in-up [animation-delay:280ms] [animation-fill-mode:both]">
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                  <Coins className="w-3.5 h-3.5" />
                  {priceInCoins} pts
                </span>
                <span className="text-xs text-muted-foreground">por 1 dia</span>
              </div>
              <Button
                onClick={() => (canAfford ? handleActivate("texttools") : setShowRechargeDialog(true))}
                className="w-full h-12 rounded-2xl font-bold shadow-md"
                size="lg"
                disabled={loadingTool}
              >
                {loadingTool ? t("dashboard.activating") : canAfford ? t("dashboard.activatePlan") : t("dashboard.rechargeNow")}
              </Button>
            </div>
          ) : null}
        </div>
      );
    }

    if (activeTab === "elevenlabs") {
      return (
        <div className="w-full h-[calc(100vh-140px)] max-w-6xl mx-auto animate-fade-in">
          <ElevenLabsPage token={token!} />
        </div>
      );
    }

    return (
      <div className="text-center space-y-6 max-w-lg mx-auto">
        <div className="w-24 h-24 mx-auto bg-accent/15 rounded-3xl flex items-center justify-center shadow-sm">
          <Play className="w-12 h-12 text-accent" />
        </div>
        <h2 className="text-2xl font-bold">AI Ultra</h2>
        <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent font-semibold rounded-full text-sm border border-accent/20">
          {t("dashboard.comingSoon")}
        </span>
        <p className="text-muted-foreground">{t("dashboard.aiultraDesc")}</p>
        <Button onClick={() => setActiveTab("inicio")} variant="outline" size="lg" className="rounded-2xl">
          {t("dashboard.backHome")}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar
        tabs={tabs}
        activeTabId={activeTab}
        pointsLabel={coinsLabel}
        email={user?.email || ""}
        pendingOrdersCount={pendingOrdersCount}
        feedbackLabel={t("dashboard.suggestChanges")}
        theme={theme}
        onTabSelect={(tabId) => setActiveTab(tabId as TabType)}
        onRecharge={() => setShowRechargeDialog(true)}
        onFeedback={() => setShowFeedbackDialog(true)}
        onLogout={handleLogout}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />

      <main className="pt-24 px-4 pb-16">
        <div key={activeTab} className={`max-w-4xl mx-auto animate-fade-in-up ${activeTab === "elevenlabs" ? "max-w-none" : ""}`}>
          {renderContent()}
        </div>
      </main>

      <RechargeDialog open={showRechargeDialog} onOpenChange={setShowRechargeDialog} />
      <FeedbackDialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} />
    </div>
  );
};

export default Dashboard;
