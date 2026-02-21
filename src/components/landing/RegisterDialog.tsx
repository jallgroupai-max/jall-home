import { useState } from "react";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/lib/api";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
}

const RegisterDialog = ({ open, onOpenChange, onSwitchToLogin }: RegisterDialogProps) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !email.trim() || !password.trim()) {
      toast({
        title: t("register.error.required"),
        description: t("register.error.requiredDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await apiService.post('/users', {
        email,
        password,
        name: username
      });

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada exitosamente. Por favor, inicia sesión.",
      });

      onOpenChange(false);
      onSwitchToLogin();
    } catch (error: any) {
      toast({
        title: "Error en el registro",
        description: error.message || "No se pudo crear el usuario. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{t("register.title")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("register.subtitle")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="register-username">{t("register.username")}</Label>
            <Input
              id="register-username"
              type="text"
              placeholder="tu_usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">{t("register.email")}</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">{t("register.password")}</Label>
            <Input
              id="register-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary"
            />
          </div>
          <Button type="submit" className="w-full box-glow-green" disabled={isLoading}>
            {isLoading ? t("register.loading") : t("register.submit")}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t("register.hasAccount")}{" "}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSwitchToLogin();
              }}
              className="text-primary hover:underline"
            >
              {t("register.loginHere")}
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;
