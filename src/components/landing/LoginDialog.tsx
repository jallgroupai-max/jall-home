import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import OtpDialog from "./OtpDialog";
import { authService } from "@/lib/auth.service";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister: () => void;
}

const LoginDialog = ({ open, onOpenChange, onSwitchToRegister }: LoginDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const { toast } = useToast();
  const { login, setAuthData } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

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
        // Normal login - use response data directly
        setAuthData(response.user, response.access.accessToken);
        toast({
          title: "¡Bienvenido!",
          description: `Hola ${response.user.name || response.user.email}`,
        });
        onOpenChange(false);
        navigate("/dashboard");
      } else if (response.ok && response.message && !response.access) {
        // OTP Required
        setMaskedEmail(response.message);
        setShowOtpDialog(true);
      } else {
        toast({
          title: "Error inesperado",
          description: "Por favor, intenta nuevamente",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: t("login.error.invalid"),
        description: t("login.error.invalidDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerifySuccess = async (accessToken: string, expiresAt: string) => {
    try {
      // Get user profile with the token
      const user = await authService.getProfile(accessToken);
      
      // Set auth data in context
      if (setAuthData) {
        setAuthData(user, accessToken);
      }
      
      toast({
        title: "¡Bienvenido!",
        description: `Hola ${user.name || user.email}`,
      });
      
      onOpenChange(false);
      setShowOtpDialog(false);
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo obtener la información del usuario",
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
            <DialogTitle className="text-2xl text-center">{t("login.title")}</DialogTitle>
            <DialogDescription className="text-center">
              {t("login.subtitle")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
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
