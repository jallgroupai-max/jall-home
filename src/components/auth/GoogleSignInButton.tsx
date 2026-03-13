import { useEffect, useState } from "react";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { authService, User } from "@/lib/auth.service";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

type GoogleSignInButtonProps = {
  disabled?: boolean;
  mode?: "signin" | "signup";
  onAuthenticated: (user: User, accessToken: string) => void | Promise<void>;
  onStart?: () => void;
  onSettled?: () => void;
};

export function GoogleSignInButton({
  disabled = false,
  mode = "signin",
  onAuthenticated,
  onStart,
  onSettled,
}: GoogleSignInButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const { toast } = useToast();
  const { theme } = useTheme();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateResolvedTheme = () => {
      if (theme === "system") {
        setResolvedTheme(mediaQuery.matches ? "dark" : "light");
        return;
      }

      setResolvedTheme(theme === "dark" ? "dark" : "light");
    };

    updateResolvedTheme();
    mediaQuery.addEventListener("change", updateResolvedTheme);

    return () => mediaQuery.removeEventListener("change", updateResolvedTheme);
  }, [theme]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const credential = credentialResponse.credential;

    if (!credential) {
      toast({
        title: "Error con Google",
        description: "Google no devolvio una credencial valida.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    onStart?.();

    try {
      const response = await authService.googleSignIn(credential);

      if (!response.ok || !response.access || !response.user) {
        throw new Error("No fue posible completar el inicio de sesion con Google.");
      }

      await onAuthenticated(response.user, response.access.accessToken);
    } catch (error: any) {
      toast({
        title: "Error con Google",
        description: error?.message || "No se pudo completar la autenticacion con Google.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      onSettled?.();
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${disabled || isSubmitting ? "pointer-events-none opacity-70" : ""}`}
    >
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() =>
          toast({
            title: "Error con Google",
            description: "No se pudo abrir el flujo de autenticacion de Google.",
            variant: "destructive",
          })
        }
        shape="pill"
        size="large"
        theme={resolvedTheme === "dark" ? "filled_black" : "outline"}
        text={mode === "signup" ? "signup_with" : "signin_with"}
        locale="es"
        width="100%"
      />

      {(disabled || isSubmitting) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
      )}
    </div>
  );
}
