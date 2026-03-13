import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth.service";
import { clearRememberedAuth, getRememberedAuth, saveRememberedAuth } from "@/lib/remembered-auth";
import OtpDialog from "./OtpDialog";

const isGoogleAuthEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister: () => void;
}

const LoginDialog = ({ open, onOpenChange, onSwitchToRegister }: LoginDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");

  const { toast } = useToast();
  const { setAuthData } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedAuth = getRememberedAuth();
    if (!rememberedAuth.remember) {
      return;
    }

    setEmail(rememberedAuth.email);
    setPassword(rememberedAuth.password);
    setRememberPassword(true);
  }, []);

  const persistRememberedAuth = () => {
    if (rememberPassword) {
      saveRememberedAuth(email, password);
      return;
    }

    clearRememberedAuth();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        title: t("login.error.required"),
        description: t("login.error.requiredDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.signIn({ email, password });

      if (response.ok && response.access && response.user) {
        persistRememberedAuth();
        setAuthData(response.user, response.access.accessToken);
        toast({
          title: "Bienvenido",
          description: `Hola ${response.user.name || response.user.email}`,
        });
        onOpenChange(false);
        navigate("/dashboard", { replace: true });
        return;
      }

      if (response.ok && response.message && !response.access) {
        persistRememberedAuth();
        setMaskedEmail(response.message);
        setShowOtpDialog(true);
        return;
      }

      toast({
        title: "Error inesperado",
        description: "Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } catch {
      toast({
        title: t("login.error.invalid"),
        description: t("login.error.invalidDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerifySuccess = async (accessToken: string) => {
    try {
      const user = await authService.getProfile(accessToken);
      persistRememberedAuth();
      setAuthData(user, accessToken);
      toast({
        title: "Bienvenido",
        description: `Hola ${user.name || user.email}`,
      });
      onOpenChange(false);
      setShowOtpDialog(false);
      navigate("/dashboard", { replace: true });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo obtener la informacion del usuario.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2">
              <img src="/logo.png" alt="Jall AI" className="h-8 w-auto" />
            </div>
            <DialogTitle className="text-center text-2xl">{t("login.title")}</DialogTitle>
            <DialogDescription className="text-center">{t("login.subtitle")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {isGoogleAuthEnabled && (
              <>
                <GoogleSignInButton
                  disabled={isLoading}
                  mode="signin"
                  onStart={() => setIsGoogleLoading(true)}
                  onSettled={() => setIsGoogleLoading(false)}
                  onAuthenticated={(user, accessToken) => {
                    persistRememberedAuth();
                    setAuthData(user, accessToken);
                    toast({
                      title: "Bienvenido",
                      description: `Hola ${user.name || user.email}`,
                    });
                    onOpenChange(false);
                    navigate("/dashboard", { replace: true });
                  }}
                />

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-3 text-muted-foreground">
                      o continua con tu email
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="login-email">{t("login.email")}</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">{t("login.password")}</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary pr-12"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={rememberPassword}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setRememberPassword(checked);
                  if (!checked) {
                    clearRememberedAuth();
                  }
                }}
                className="h-4 w-4 rounded border-border bg-secondary text-primary focus:ring-primary"
              />
              Recordar contrasena
            </label>

            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading ? t("login.loading") : t("login.submit")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("login.noAccount")}{" "}
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onSwitchToRegister();
                }}
                className="text-primary hover:underline"
              >
                {t("login.registerHere")}
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>

      <OtpDialog
        open={showOtpDialog}
        onOpenChange={setShowOtpDialog}
        email={email}
        maskedEmail={maskedEmail}
        onVerifySuccess={handleOtpVerifySuccess}
      />
    </>
  );
};

export default LoginDialog;
