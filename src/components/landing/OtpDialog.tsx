import { useState, useEffect } from "react";
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
import { Coins } from "lucide-react";

interface OtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  maskedEmail: string;
  onVerifySuccess: (accessToken: string, expiresAt: string) => void;
}

const OtpDialog = ({
  open,
  onOpenChange,
  email,
  maskedEmail,
  onVerifySuccess,
}: OtpDialogProps) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const { toast } = useToast();
  const { t } = useLanguage();

  // Timer countdown
  useEffect(() => {
    if (!open) {
      setTimeLeft(300);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast({
            title: "Código expirado",
            description:
              "El código OTP ha expirado. Por favor, inicia sesión nuevamente.",
            variant: "destructive",
          });
          onOpenChange(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, onOpenChange, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim() || otp.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Por favor, ingresa un código de 6 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/verify/otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: parseInt(otp),
            email: email,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Código OTP inválido");
      }

      toast({
        title: "¡Verificación exitosa!",
        description: "Tu correo ha sido verificado correctamente.",
      });

      onVerifySuccess(data.access.accessToken, data.access.expiresAt);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error de verificación",
        description:
          error.message || "El código OTP es inválido o ha expirado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    // Only allow numbers and max 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    setOtp(numericValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Verificación de correo
          </DialogTitle>
          <DialogDescription className="text-center">
            Verifica tu correo y recibe de regalo <br /> 30 puntos extra{" "}
            <Coins className="w-5 h-5 text-accent inline" />
            <br />
            <br />
            <strong className="text-primary mt-4">{maskedEmail}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="otp-code">Código de verificación (6 dígitos)</Label>
            <Input
              id="otp-code"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              className="bg-secondary text-center text-2xl tracking-widest font-mono"
              maxLength={6}
              autoFocus
            />
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Tiempo restante:{" "}
            <span className="font-semibold text-primary">
              {formatTime(timeLeft)}
            </span>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? "Verificando..." : "Verificar código"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            ¿No recibiste el código? Revisa tu carpeta de spam o inicia sesión
            nuevamente.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OtpDialog;
