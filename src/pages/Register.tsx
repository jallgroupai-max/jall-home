import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { GuestAccessButton } from "@/components/auth/GuestAccessButton";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

const isGoogleAuthEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showEmailExistsModal, setShowEmailExistsModal] = useState(false);

  const { setAuthData } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const passwordTooShort = password.length > 0 && password.length < 8;

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
      navigate("/login", { state: { registered: true, email } });
    } catch (error: any) {
      const isEmailTaken =
        error?.status === 409 ||
        error?.statusCode === 409 ||
        error?.message?.includes("EMAIL_ALREADY_EXISTS");

      if (isEmailTaken) {
        setShowEmailExistsModal(true);
      } else {
        toast({
          title: "Error en el registro",
          description:
            error.message || "No se pudo crear el usuario. Intentalo de nuevo.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex bg-background animate-fade-in">
        <div
          className="hidden lg:flex w-1/2 flex-col justify-between overflow-hidden p-12 relative animate-fade-in-up [animation-delay:80ms] [animation-fill-mode:both]"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--accent) / 0.12) 0%, hsl(var(--primary) / 0.08) 100%)",
          }}
        >
          <div
            className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
            style={{ background: "hsl(var(--accent))" }}
          />
          <div
            className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full opacity-15 blur-3xl"
            style={{ background: "hsl(var(--primary))" }}
          />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/logo.png" alt="Jall AI" className="h-10 w-auto" />
            </Link>
          </div>

          <div className="relative z-10">
            <h2 className="mb-6 text-4xl font-bold leading-tight text-foreground">
              Unete a miles de
              <br />
              usuarios de <span className="text-primary">JallAI</span>
            </h2>
            <ul className="space-y-3">
              {[
                "Acceso a multiples modelos de IA",
                "Gestion de ordenes en tiempo real",
                "Panel de control personalizado",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs"
                    style={{
                      background: "hsl(var(--primary) / 0.15)",
                      color: "hsl(var(--primary))",
                    }}
                  >
                    +
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1 rounded-full"
                style={{
                  width: i === 1 ? "2rem" : "0.5rem",
                  background:
                    i === 1 ? "hsl(var(--primary))" : "hsl(var(--border))",
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
              <h1 className="mb-2 text-3xl font-bold text-foreground">
                Crear cuenta
              </h1>
              <p className="text-muted-foreground">
                Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary transition-colors hover:underline underline-offset-4"
                >
                  Inicia sesion
                </Link>
              </p>
            </div>

            <div className="mb-6 rounded-3xl border border-border/60 bg-card/70 p-4">
              <p className="text-sm font-semibold text-foreground">
                ¿Quieres verlo primero?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Entra como invitado por 5 minutos y recorre la experiencia antes
                de registrarte.
              </p>
              <GuestAccessButton
                label="Entrar como invitado"
                pendingLabel="Abriendo acceso..."
                variant="outline"
                size="sm"
                className="mt-3 w-full rounded-2xl border-primary/30"
              />
            </div>

            {isGoogleAuthEnabled && (
              <>
                <GoogleSignInButton
                  disabled={isLoading}
                  mode="signup"
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
              <div>
                <label
                  htmlFor="register-name"
                  className="mb-1.5 block text-sm font-medium text-foreground"
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
                  className="w-full rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Correo electronico
                </label>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Contrasena
                </label>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Minimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/40"
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span
                    className={
                      passwordTooShort
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }
                  >
                    Usa al menos 8 caracteres.
                  </span>
                  <span
                    className={
                      password.length >= 8
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {password.length >= 8 ? "Lista" : "Pendiente"}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full rounded-2xl px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: "hsl(var(--primary))" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    Creando cuenta...
                  </span>
                ) : (
                  "Crear cuenta"
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Al registrarte, aceptas nuestros{" "}
                <Link
                  to="/terminos"
                  className="text-primary hover:underline underline-offset-2"
                >
                  Terminos de servicio
                </Link>{" "}
                y{" "}
                <Link
                  to="/privacidad"
                  className="text-primary hover:underline underline-offset-2"
                >
                  Politica de privacidad
                </Link>
              </p>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              <Link to="/" className="transition-colors hover:text-foreground">
                Volver al inicio
              </Link>
            </p>
          </div>
        </div>
      </div>

      {showEmailExistsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowEmailExistsModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl p-8 shadow-2xl"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
            onClick={(e) => e.stopPropagation()}
          >
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

            <h2 className="mb-2 text-center text-xl font-bold text-foreground">
              Correo ya registrado
            </h2>
            <p className="mb-6 text-center text-sm leading-relaxed text-muted-foreground">
              El correo{" "}
              <span className="font-medium text-foreground">{email}</span> ya
              tiene una cuenta en JallAI. Inicia sesion para continuar.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="mb-3 w-full rounded-2xl py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
              style={{ background: "hsl(var(--primary))" }}
            >
              Ir a iniciar sesion
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
