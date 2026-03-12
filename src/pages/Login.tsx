import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth.service";
import OtpDialog from "@/components/landing/OtpDialog";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");

  const { setAuthData } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Si viene de un registro exitoso: disparar OTP automáticamente
  useEffect(() => {
    const state = location.state as {
      registered?: boolean;
      autoOtp?: boolean;
      email?: string;
      password?: string;
    } | null;

    if (state?.autoOtp && state.email && state.password) {
      // Pre-rellenar campos visualmente
      setEmail(state.email);
      setPassword(state.password);
      // Limpiar state del historial
      window.history.replaceState({}, document.title);
      // Disparar el sign-in para enviar el OTP
      authService.signIn({ email: state.email, password: state.password })
        .then((response) => {
          if (response.ok && response.message && !response.access) {
            setMaskedEmail(response.message);
            setShowOtpDialog(true);
          }
        })
        .catch(() => {/* silencioso, el usuario puede intentar manualmente */});
    } else if (state?.registered) {
      if (state.email) setEmail(state.email);
      toast({
        title: "✅ Cuenta creada exitosamente",
        description: "Tu correo fue verificado. Inicia sesión para continuar.",
      });
      window.history.replaceState({}, document.title);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Email / Password Login ─────────────────────────────── */
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
        setAuthData(response.user, response.access.accessToken);
        toast({
          title: "¡Bienvenido!",
          description: `Hola ${response.user.name || response.user.email}`,
        });
        navigate("/dashboard");
      } else if (response.ok && response.message && !response.access) {
        setMaskedEmail(response.message);
        setShowOtpDialog(true);
      } else {
        toast({
          title: "Error inesperado",
          description: "Por favor, intenta nuevamente",
          variant: "destructive",
        });
      }
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

  /* ─── OTP Success ────────────────────────────────────────── */
  const handleOtpVerifySuccess = async (accessToken: string) => {
    try {
      const user = await authService.getProfile(accessToken);
      setAuthData(user, accessToken);
      toast({
        title: "¡Bienvenido!",
        description: `Hola ${user.name || user.email}`,
      });
      setShowOtpDialog(false);
      navigate("/dashboard");
    } catch {
      toast({
        title: "Error",
        description: "No se pudo obtener la información del usuario",
        variant: "destructive",
      });
    }
  };

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <>
      <div className="min-h-screen flex bg-background animate-fade-in">
        {/* Left panel — decorative */}
        <div
          className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden animate-fade-in-up [animation-delay:80ms] [animation-fill-mode:both]"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 100%)",
          }}
        >
          {/* Gradient orbs */}
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: "hsl(var(--primary))" }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{ background: "hsl(var(--accent))" }}
          />

          {/* Logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/logo.png" alt="Jall AI" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Tagline */}
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-foreground leading-tight mb-4">
              Accede al poder<br />
              de la <span className="text-primary">IA</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Gestiona tus servicios, ordenes y mucho más desde un solo lugar.
            </p>
          </div>

          {/* Bottom decoration */}
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

        {/* Right panel — form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 animate-fade-in-up [animation-delay:140ms] [animation-fill-mode:both]">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8">
              <Link to="/" className="inline-flex items-center gap-2">
                <img src="/logo.png" alt="Jall AI" className="h-10 w-auto" />
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Iniciar sesión
              </h1>
              <p className="text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <Link
                  to="/register"
                  className="text-primary font-medium hover:underline underline-offset-4 transition-colors"
                >
                  Regístrate gratis
                </Link>
              </p>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">
                  o continúa con tu email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <div className="relative">
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Correo electrónico
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground/60 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                />
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-medium text-foreground"
                  >
                    Contraseña
                  </label>
                  <Link
                    to="/recovery"
                    className="text-xs text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground/60 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-2xl font-semibold text-sm text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "hsl(var(--primary))" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>

            {/* Back to home */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">
                ← Volver al inicio
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Dialog (reused from existing component) */}
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
