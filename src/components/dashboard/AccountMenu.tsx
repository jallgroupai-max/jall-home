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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { User, Settings, Key, LogOut, Gift, Pencil, Check, X, Loader2, Globe, FileText, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface AccountMenuProps {
  email: string;
  onLogout: () => void;
  onRecharge?: () => void;
  pendingOrdersCount?: number;
  className?: string;
}

// Simulated taken usernames for demo
const takenUsernames = ["admin", "jallai", "usuario", "test", "demo"];

const AccountMenu = ({ email, onLogout, onRecharge, pendingOrdersCount = 0, className }: AccountMenuProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [username, setUsername] = useState("demo_user");
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Error",
      description: t("account.passwordError"),
      variant: "destructive",
    });
  };

  const handlePhoneSave = () => {
    if (phoneNumber.trim()) {
      toast({
        title: t("account.phoneSaved"),
        description: t("account.phoneSavedDesc"),
      });
    }
  };

  const checkUsernameAvailability = async (name: string) => {
    if (name.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    
    setCheckingUsername(true);
    // Simulate API check
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const isAvailable = !takenUsernames.includes(name.toLowerCase()) && name !== username;
    setUsernameAvailable(isAvailable);
    setCheckingUsername(false);
  };

  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setNewUsername(sanitized);
    setUsernameAvailable(null);
    checkUsernameAvailability(sanitized);
  };

  const handleUsernameSave = () => {
    if (usernameAvailable && newUsername.length >= 3) {
      setUsername(newUsername);
      setEditingUsername(false);
      setNewUsername("");
      setUsernameAvailable(null);
      toast({
        title: t("account.usernameUpdated"),
        description: `${t("account.usernameUpdatedDesc")} @${newUsername}`,
      });
    }
  };

  const handleUsernameCancel = () => {
    setEditingUsername(false);
    setNewUsername("");
    setUsernameAvailable(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className={`gap-2 relative ${className}`}>
            <User className="w-4 h-4" />
            {t("account.title")}
            {pendingOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse border-2 border-background" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border z-50">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{t("account.myAccount")}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowProfileDialog(true)} className="cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            {t("account.profile")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/mis-ordenes')} className="cursor-pointer">
            <FileText className="w-4 h-4 mr-2" />
            Mis Órdenes
            {pendingOrdersCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {pendingOrdersCount}
                </span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowPasswordDialog(true)} className="cursor-pointer">
            <Key className="w-4 h-4 mr-2" />
            {t("account.changePassword")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRecharge} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Recargar Saldo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowLanguageDialog(true)} className="cursor-pointer">
            <Globe className="w-4 h-4 mr-2" />
            {t("account.language")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-secondary">
            <LogOut className="w-4 h-4 mr-2" />
            {t("account.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("account.myProfile")}</DialogTitle>
            <DialogDescription>{t("account.accountInfo")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t("account.email")}</Label>
              <p className="text-sm font-medium">{email}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t("account.username")}</Label>
              {editingUsername ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                      <Input
                        value={newUsername}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="nuevo_usuario"
                        className="pl-7"
                        maxLength={20}
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleUsernameSave}
                      disabled={!usernameAvailable || newUsername.length < 3}
                      className="text-primary hover:text-primary"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleUsernameCancel}
                      className="text-muted-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {newUsername.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      {checkingUsername ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                          <span className="text-muted-foreground">{t("account.checking")}</span>
                        </>
                      ) : newUsername.length < 3 ? (
                        <span className="text-muted-foreground">{t("account.minChars")}</span>
                      ) : usernameAvailable ? (
                        <span className="text-primary">{t("account.available")}</span>
                      ) : (
                        <span className="text-destructive">{t("account.notAvailable")}</span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">@{username}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingUsername(true);
                      setNewUsername("");
                    }}
                    className="h-7 px-2"
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">{t("account.phone")}</Label>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Gift className="w-4 h-4 text-accent cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px]">
                    <p>{t("account.phoneBonus")} <span className="text-primary font-semibold">{t("account.phoneBonusPoints")}</span> {t("account.phoneBonusEnd")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">{t("account.noPhone")}</p>
                <Button onClick={handlePhoneSave} size="sm" variant="outline">
                  {t("account.addPhone")}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">{t("account.memberSince")}</Label>
              <p className="text-sm font-medium">{language === "es" ? "Enero 2025" : "January 2025"}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("account.passwordTitle")}</DialogTitle>
            <DialogDescription>{t("account.passwordSubtitle")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t("account.currentPassword")}</Label>
              <Input id="currentPassword" type="password" placeholder="••••••••" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("account.newPassword")}</Label>
              <Input id="newPassword" type="password" placeholder="••••••••" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">{t("account.confirmPassword")}</Label>
              <Input id="confirmNewPassword" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full box-glow-cyan">
              {t("account.saveChanges")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Language Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("account.language")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-4">
            <button
              onClick={() => {
                setLanguage("es");
                setShowLanguageDialog(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                language === "es" 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span className="text-xl">🇪🇸</span>
              <span className="font-medium">{t("language.spanish")}</span>
              {language === "es" && <Check className="w-4 h-4 ml-auto" />}
            </button>
            <button
              onClick={() => {
                setLanguage("en");
                setShowLanguageDialog(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                language === "en" 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span className="text-xl">🇺🇸</span>
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
