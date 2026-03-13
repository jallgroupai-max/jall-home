import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import OtpDialog from "@/components/landing/OtpDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth.service";
import { clearRememberedAuth, getRememberedAuth, saveRememberedAuth } from "@/lib/remembered-auth";

const isGoogleAuthEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");

  const { setAuthData } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const rememberedAuth = getRememberedAuth();
    if (rememberedAuth.remember) {
      setEmail(rememberedAuth.email);
      setPassword(rememberedAuth.password);
      setRememberPassword(true);
    }

    const state = location.state as {
      registered?: boolean;
      autoOtp?: boolean;
      email?: string;
      password?: string;
    } | null;

    if (state?.autoOtp && state.email && state.password) {
      setEmail(state.email);
      setPassword(state.password);
      window.history.replaceState({}, document.title);

      authService
        .signIn({ email: state.email, password: state.password })
        .then((response) => {
          if (response.ok && response.message && !response.access) {
            setMaskedEmail(response.message);
            setShowOtpDialog(true);
          }
        })
        .catch(() => undefined);

      return;
    }

    if (state?.registered) {
      if (state.email) {
        setEmail(state.email);
      }

      toast({
        title: "Cuenta creada exitosamente",
        description: "Tu correo fue verificado. Inicia sesion para continuar.",
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

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
        if (rememberPassword) {
          saveRememberedAuth(email, password);
        } else {
          clearRememberedAuth();
        }

        setAuthData(response.user, response.access.accessToken);
        toast({
          title: "Bienvenido",
          description: `Hola ${response.user.name || response.user.email}`,
        });
        navigate("/dashboard", { replace: true });
        return;
      }

      if (response.ok && response.message && !response.access) {
        if (rememberPassword) {
          saveRememberedAuth(email, password);
        } else {
          clearRememberedAuth();
        }

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

      if (rememberPassword) {
        saveRememberedAuth(email, password);
      } else {
        clearRememberedAuth();
      }

      setAuthData(user, accessToken);
      toast({
        title: "Bienvenido",
        description: `Hola ${user.name || user.email}`,
      });
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
      <div className="min-h-screen flex bg-background animate-fade-in">
        <div
          className="hidden lg:flex w-1/2 flex-col justify-between overflow-hidden p-12 relative animate-fade-in-up [animation-delay:80ms] [animation-fill-mode:both]"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 100%)",
          }}
        >
          <div
            className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
            style={{ background: "hsl(var(--primary))" }}
          />
          <div
            className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-15 blur-3xl"
            style={{ background: "hsl(var(--accent))" }}
          />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/logo.png" alt="Jall AI" className="h-10 w-auto" />
            </Link>
          </div>

          <div className="relative z-10">
            <h2 className="mb-4 text-4xl font-bold leading-tight text-foreground">
              Accede al poder
              <br />
              de la <span className="text-primary">IA</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Gestiona tus servicios, ordenes y mucho mas desde un solo lugar.
            </p>
          </div>

          <div className="relative z-10 flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1 rounded-full"
                style={{
                  width: i === 0 ? "2rem" : "0.5rem",
                  background: i === 0 ? "hsl(var(--primary))" : "hsl(var(--border))",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6 lg:p-12 animate-fade-in-up [animation-delay:140ms] [animation-fill-mode:both]">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2">
                <img src="/logo.png" alt="Jall AI" className="h-10 w-auto" />
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold text-foreground">Iniciar sesion</h1>
              <p className="text-muted-foreground">
                No tienes cuenta?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary transition-colors hover:underline underline-offset-4"
                >
                  Registrate gratis
                </Link>
              </p>
            </div>

            {isGoogleAuthEnabled && (
              <>
                <GoogleSignInButton
                  disabled={isLoading}
                  mode="signin"
                  onStart={() => setIsGoogleLoading(true)}
                  onSettled={() => setIsGoogleLoading(false)}
                  onAuthenticated={(user, accessToken) => {
                    setAuthData(user, accessToken);
                    toast({
                      title: "Bienvenido",
                      description: `Hola ${user.name || user.email}`,
                    });
                    navigate("/dashboard", { replace: true });
                  }}
                />

                <div className="relative mb-6 mt-6">
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-foreground">
                  Correo electronico
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="relative">
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-sm font-medium text-foreground">
                    Contrasena
                  </label>
                  <Link
                    to="/recovery"
                    className="text-xs text-primary transition-colors hover:underline underline-offset-4"
                  >
                    Olvidaste tu contrasena?
                  </Link>
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/50 px-4 py-3 pr-12 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-[2.65rem] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
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

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full rounded-2xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: "hsl(var(--primary))" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    Iniciando sesion...
                  </span>
                ) : (
                  "Iniciar sesion"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              <Link to="/" className="transition-colors hover:text-foreground">
                Volver al inicio
              </Link>
            </p>
          </div>
        </div>
      </div>

      <OtpDialog
        open={showOtpDialog}
        onOpenChange={setShowOtpDialog}
        email={email}
        maskedEmail={maskedEmail}
        onVerifySuccess={handleOtpVerifySuccess}
      />
    </>
  );
}
