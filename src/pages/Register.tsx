import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth.service";
import { apiService } from "@/lib/api";
import OtpDialog from "@/components/landing/OtpDialog";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [showEmailExistsModal, setShowEmailExistsModal] = useState(false);

  const { setAuthData } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  /* ─── Email / Password Register ──────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast({
        title: t("register.error.required"),
        description: t("register.error.requiredDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiService.post("/users", { email, password, name });

      // Redirigir a login para que dispare el OTP desde allí
      navigate("/login", { state: { autoOtp: true, email, password } });
    } catch (error: any) {
      const isEmailTaken =
        error?.status === 409 ||
        error?.statusCode === 409 ||
        error?.message?.includes('EMAIL_ALREADY_EXISTS');

      if (isEmailTaken) {
        setShowEmailExistsModal(true);
      } else {
        toast({
          title: "Error en el registro",
          description: error.message || "No se pudo crear el usuario. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── OTP Success ────────────────────────────────────────── */
  const handleOtpVerifySuccess = async (accessToken: string) => {
    try {
      const user = await authService.getProfile(accessToken);
      setAuthData(user, accessToken);
      setShowOtpDialog(false);
      // Redirigir a login con indicador de registro exitoso
      navigate("/login", { state: { registered: true, email } });
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
              "linear-gradient(135deg, hsl(var(--accent) / 0.12) 0%, hsl(var(--primary) / 0.08) 100%)",
          }}
        >
          {/* Gradient orbs */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: "hsl(var(--accent))" }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{ background: "hsl(var(--primary))" }}
          />

          {/* Logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/logo.png" alt="Jall AI" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Feature list */}
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-foreground leading-tight mb-6">
              Únete a miles de<br />
              usuarios de <span className="text-primary">JallAI</span>
            </h2>
            <ul className="space-y-3">
              {[
                "Acceso a múltiples modelos de IA",
                "Gestión de ordenes en tiempo real",
                "Panel de control personalizado",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-3">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}
                  >
                    ✓
                  </span>
                  <span className="text-muted-foreground text-sm">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom decoration */}
          <div className="relative z-10 flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1 rounded-full"
                style={{
                  width: i === 1 ? "2rem" : "0.5rem",
                  background: i === 1 ? "hsl(var(--primary))" : "hsl(var(--border))",
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
                Crear cuenta
              </h1>
              <p className="text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline underline-offset-4 transition-colors"
                >
                  Inicia sesión
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
              {/* Name */}
              <div>
                <label
                  htmlFor="register-name"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Nombre completo
                </label>
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground/60 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="register-email"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Correo electrónico
                </label>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground/60 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="register-password"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Contraseña
                </label>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground/60 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-2xl font-semibold text-sm text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "hsl(var(--primary))" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                    Creando cuenta...
                  </span>
                ) : (
                  "Crear cuenta"
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Al registrarte, aceptas nuestros{" "}
                <Link to="/terminos" className="text-primary hover:underline underline-offset-2">
                  Términos de servicio
                </Link>{" "}
                y{" "}
                <Link to="/privacidad" className="text-primary hover:underline underline-offset-2">
                  Política de privacidad
                </Link>
              </p>
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

      {/* OTP Dialog */}
      <OtpDialog
        open={showOtpDialog}
        onOpenChange={setShowOtpDialog}
        email={email}
        maskedEmail={maskedEmail}
        onVerifySuccess={handleOtpVerifySuccess}
      />

      {/* Modal — Correo ya registrado */}
      {showEmailExistsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowEmailExistsModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl p-8 shadow-2xl"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ícono */}
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "hsl(var(--primary) / 0.12)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
                style={{ color: "hsl(var(--primary))" }}
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>

            {/* Texto */}
            <h2 className="mb-2 text-center text-xl font-bold text-foreground">
              Correo ya registrado
            </h2>
            <p className="mb-6 text-center text-sm text-muted-foreground leading-relaxed">
              El correo{" "}
              <span className="font-medium text-foreground">{email}</span> ya
              tiene una cuenta en JallAI. Inicia sesión para continuar.
            </p>

            {/* Botones */}
            <button
              onClick={() => navigate("/login")}
              className="mb-3 w-full rounded-2xl py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
              style={{ background: "hsl(var(--primary))" }}
            >
              Ir a iniciar sesión
            </button>
            <button
              onClick={() => setShowEmailExistsModal(false)}
              className="w-full rounded-2xl py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              style={{ background: "hsl(var(--secondary))" }}
            >
              Intentar con otro correo
            </button>
          </div>
        </div>
      )}
    </>
  );
}
