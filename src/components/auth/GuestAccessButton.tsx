import { useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { TimerReset, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type GuestAccessButtonProps = {
  label: string;
  pendingLabel?: string;
  description?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "sm" | "lg" | "default" | "icon";
  className?: string;
  showDescription?: boolean;
  compact?: boolean;
};

export function GuestAccessButton({
  label,
  pendingLabel = "Preparando acceso...",
  description,
  variant = "outline",
  size = "lg",
  className,
  showDescription = false,
  compact = false,
}: GuestAccessButtonProps) {
  const navigate = useNavigate();
  const { loginAsGuest } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  const handleGuestAccess = async () => {
    setIsSubmitting(true);

    try {
      await loginAsGuest();
      startTransition(() => navigate("/dashboard", { replace: true }));
    } catch (error) {
      console.error("Guest access error:", error);
      toast({
        title: "No pudimos abrir el modo invitado",
        description: "Intenta nuevamente en unos segundos.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={compact ? "inline-flex" : "flex flex-col gap-2"}>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleGuestAccess}
        disabled={isSubmitting}
        className={className}
      >
        {isSubmitting ? (
          <>
            <TimerReset className="w-4 h-4 animate-spin" />
            {pendingLabel}
          </>
        ) : (
          <>
            <WandSparkles className="w-4 h-4" />
            {label}
          </>
        )}
      </Button>
      {showDescription && description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
