
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Coins, Home, Sparkles, Play, Mic, Menu, X, Plus, MessageSquarePlus, Clock, HelpCircle, Wallet, Sun, Moon, FileText } from "lucide-react";
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

type ToolType = "chatgpt" | "elevenlabs" | "aiultra";

type Provider = {
  id: string;
  typeProvider: string;
  finalPrice: number;
  active: boolean;
  redirectUrl?: string; // Added this
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

const ToolHelpButton = ({ tool }: { tool: ToolType }) => {
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 5000);
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
            ${isAnimating ? 'animate-help-pulse' : ''}
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
      <PopoverContent className="w-80" align="center">
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

// Demo membership: 30 days from now
const DEMO_MEMBERSHIP_END = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  };

  useEffect(() => {
    setTimeRemaining(formatTimeRemaining(membershipEnd));
    const interval = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(membershipEnd));
    }, 1000);

    return () => clearInterval(interval);
  }, [membershipEnd]);

  return (
    <div className="text-center space-y-6 max-w-lg mx-auto">
      <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-bold inline-flex items-center justify-center">
          ChatGPT Plus
          <ToolHelpButton tool="chatgpt" />
        </h2>
        <div className="flex justify-center">
          <div className="inline-block px-4 py-2 bg-accent/20 rounded-full">
            <span className="text-purple-900 dark:text-white font-bold">{t("dashboard.membershipActive")}</span>
          </div>
        </div>
      </div>
      
      {/* Countdown Timer */}
      <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg">
        <Clock className="w-5 h-5 text-primary" />
        <span className="text-muted-foreground">{t("dashboard.timeRemaining")}</span>
        <span className="font-mono font-bold text-foreground">{timeRemaining}</span>
      </div>
      
      <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-sm text-green-500 animate-fade-in relative overflow-hidden group">
        <div className="absolute inset-0 bg-green-500/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <p className="relative z-10 font-medium">✨ {t("dashboard.fullAccess")}</p>
      </div>

      <Button 
        className="w-full h-11 bg-primary hover:opacity-90 font-bold tracking-wide relative overflow-hidden group box-glow-cyan"
        size="lg"
      >
         <a href={(redirectUrl || "https://gpt.jall.lat") + (accessToken ? `?token=${accessToken}` : '')} target="_blank" rel="noopener noreferrer">
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
    if (!loading && (!user || !token)) {
      navigate("/");
    }
  }, [user, token, loading, navigate]);


  const fetchInitialData = async () => {
    if (!token) return;
    try {
      const [providersData, accountsData] = await Promise.all([
        apiService.get<Provider[]>('/providers/find/all', token),
        apiService.get<UserAccount[]>('/user-accounts/my-accounts', token)
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
          const accountsData = await apiService.get<UserAccount[]>('/user-accounts/my-accounts', token);
          setUserAccounts(accountsData);
      } catch (error) {
          console.error("Failed to fetch user accounts", error);
      }
  }

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
        // optionally refresh accounts to check expiry
        fetchUserAccounts();
        fetchPendingOrders();
      }, 10000); 

      return () => clearInterval(interval);
    }
  }, [user, token, showRechargeDialog]);

  const handleActivate = async (tool: ToolType) => {
      if (!user || !token) return;
      
      const providerTypeMap: Record<ToolType, string> = {
          chatgpt: 'ChatGPT',
          elevenlabs: 'ElevenLabs',
          aiultra: 'AIUltra' 
      };

      const provider = providers.find(p => p.typeProvider === providerTypeMap[tool] || (tool === 'chatgpt' && p.typeProvider === 'ChatGPT'));
      
      if (!provider) {
          toast({ title: "Error", description: "Provider not found", variant: "destructive" });
          return;
      }

      setLoadingTool(true);
      try {
          await apiService.post('/user-accounts/assign', {
              userId: user.id,
              providerId: provider.id
          }, token);
          
          toast({ title: "Success", description: "Membership activated successfully!", variant: "default" });
          await Promise.all([fetchWallet(), fetchUserAccounts()]);
          
          // Open the URL directly
          if (provider.redirectUrl) {
              window.open(provider.redirectUrl, '_blank');
          }

      } catch (error: any) {
          console.error(error);
          if (error.message?.includes('saldo') || error.message?.includes('balance')) {
              toast({ title: "Insufficient Balance", description: "Please recharge your wallet.", variant: "destructive" });
              setShowRechargeDialog(true);
          } else {
              toast({ title: "Error", description: error.message || "Failed to activate.", variant: "destructive" });
          }
      } finally {
          setLoadingTool(false);
      }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleRecharge = () => {
    setShowRechargeDialog(true);
  };

  const tabs = [
    { id: "inicio" as TabType, label: t("dashboard.home"), icon: Home },
    { id: "chatgpt" as TabType, label: "ChatGPT", icon: Sparkles },
    { id: "elevenlabs" as TabType, label: "Eleven Labs", icon: Mic },
    { id: "aiultra" as TabType, label: "AI Ultra", icon: Play },
  ];

  const renderContent = () => {
    if (activeTab === "inicio") {
      return (
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">{t("dashboard.welcome")}</h2>
          <p className="text-muted-foreground text-lg">
            {t("dashboard.selectTool")}
          </p>
          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
            {tabs.slice(1).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-all"
              >
                <tab.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                <p className="font-medium">{tab.label}</p>
              </button>
            ))}
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
        const chatGPTProvider = providers.find(p => p.typeProvider === 'ChatGPT');
        
        // Find the latest active and valid account
        const activeAccount = userAccounts
            .filter(ua => ua.active && ua.account?.provider?.typeProvider === 'ChatGPT')
            .sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime())
            .find(ua => new Date(ua.expiresAt) > new Date());

        // Check if expired logic (though backend handles 'active' status usually)
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

        // Inactive - Show Subscribe/Recharge UI
        const price = chatGPTProvider?.finalPrice || 0;
        const canAfford = balance >= price;

        return (
            <div className="text-center space-y-6 max-w-lg mx-auto">
                <div className="w-20 h-20 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-2xl font-bold inline-flex items-center justify-center">
                    {t("dashboard.noAccess")} ChatGPT Plus
                    <ToolHelpButton tool="chatgpt" />
                </h2>
                <p className="text-muted-foreground">
                    {canAfford 
                        ? t("dashboard.activateAccess").replace("$0.30", `$${price.toFixed(2)}`)
                        : t("dashboard.noAccessDesc")
                    }
                </p>
                <Button
                    onClick={() => canAfford ? handleActivate('chatgpt') : handleRecharge()}
                    className="box-glow-green"
                    size="lg"
                    disabled={loadingTool}
                >
                    {loadingTool 
                        ? t("dashboard.activating")
                        : canAfford 
                            ? t("dashboard.activatePlan")
                            : t("dashboard.rechargeNow")
                    }
                </Button>
            </div>
        );
    }

    // Eleven Labs - Coming Soon
    if (activeTab === "elevenlabs") {
      return (
        <div className="text-center space-y-6 max-w-lg mx-auto">
      <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
            <Mic className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold inline-flex items-center justify-center">
              Eleven Labs
              <ToolHelpButton tool="elevenlabs" />
            </h2>
            <div className="flex justify-center">
              <div className="inline-block px-4 py-2 bg-accent/20 rounded-full">
                <span className="text-primary font-bold">{t("dashboard.comingSoon")}</span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground">
            {t("dashboard.elevenLabsDesc")}
          </p>
          <Button
            onClick={() => setActiveTab("inicio")}
            variant="outline"
            size="lg"
          >
            {t("dashboard.backHome")}
          </Button>
        </div>
      );
    }

    return (
      <div className="text-center space-y-6 max-w-lg mx-auto">
        <div className="w-20 h-20 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
          <Play className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-2xl font-bold inline-flex items-center justify-center">
          {t("dashboard.noAccess")} {toolNames[activeTab]}
          {activeTab === "aiultra" && <ToolHelpButton tool="aiultra" />}
        </h2>
        <div className="flex justify-center">
              <div className="inline-block px-4 py-2 bg-accent/20 rounded-full">
                <span className="text-primary font-bold">{t("dashboard.comingSoon")}</span>
              </div>
        </div>  
        <p className="text-muted-foreground">
            {t("dashboard.aiultraDesc")}
        </p>
        <Button
            onClick={() => setActiveTab("inicio")}
            variant="outline"
            size="lg"
          >
            {t("dashboard.backHome")}
          </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <span className="text-2xl font-bold text-primary glow-green">
              Jall AI
            </span>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground font-medium"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Points & Account */}
            <div className="hidden md:flex items-center gap-4">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div 
                    onClick={handleRecharge}
                    className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg cursor-pointer hover:bg-accent/90 transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-white" />
                    <span className="font-medium text-white">${balance?.toFixed(2) || "0.00"} Saldo</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-2" align="end">
                  <p className="text-xs font-medium">Recargar Saldo</p>
                </TooltipContent>
              </Tooltip>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFeedbackDialog(true)}
                className="gap-2"
              >
                <MessageSquarePlus className="w-4 h-4" />
                {t("dashboard.suggestChanges")}
              </Button>
              
              <AccountMenu email={user?.email || ""} onLogout={handleLogout} onRecharge={handleRecharge} pendingOrdersCount={pendingOrdersCount} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-foreground"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 animate-fade-in border-t border-border">

            <div className="flex flex-col gap-2 p-2 bg-secondary rounded-lg mb-4">
              {/* Wallet Balance */}
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-white" />
                    <span className="font-medium text-white">${balance?.toFixed(2) || "0.00"} Saldo</span>
                 </div>
                 <Button onClick={handleRecharge} size="sm" variant="ghost" className="h-7 px-2 text-white hover:text-white hover:bg-white/10">
                    <Plus className="w-4 h-4" />
                 </Button>
              </div>
              
              {/* Points (optional, keeping basic structure similar to desktop or minimal) */}
              <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground border-t border-white/10 pt-2">
                <Coins className="w-4 h-4 text-accent" />
                <span className="font-medium">{user?.points || 0} {t("dashboard.points")}</span>
              </div>
            </div>

              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary/20 text-primary"
                      : "text-foreground/80 hover:bg-secondary"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
              <div className="pt-4 mt-2 border-t border-border flex flex-col gap-3">
                <AccountMenu 
                    email={user?.email || ""} 
                    onLogout={handleLogout} 
                    onRecharge={() => {
                      setMobileMenuOpen(false);
                      handleRecharge();
                    }}
                    pendingOrdersCount={pendingOrdersCount}
                    className="w-full justify-start px-4"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-full justify-start gap-2 px-4"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="pt-24 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Recharge Dialog */}
      <RechargeDialog open={showRechargeDialog} onOpenChange={setShowRechargeDialog} />

      {/* Feedback Dialog */}
      <FeedbackDialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} />
    </div>
  );
};

export default Dashboard;
