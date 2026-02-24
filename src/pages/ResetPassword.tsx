import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth.service";
import { KeyRound, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(!token);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setTokenError(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Por favor verifica que ambas contraseñas sean iguales.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPasswordByToken(token, password);
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setTokenError(true);
      }
    } catch {
      setTokenError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 100%)",
        }}
      >
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "hsl(var(--primary))" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: "hsl(var(--accent))" }}
        />
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Jall<span className="text-primary">AI</span>
            </span>
          </Link>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-foreground leading-tight mb-4">
            Nueva<br />
            <span className="text-primary">contraseña</span> segura
          </h2>
          <p className="text-muted-foreground text-lg">
            Crea una contraseña fuerte para proteger tu cuenta.
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

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Jall<span className="text-primary">AI</span>
              </span>
            </Link>
          </div>

          {tokenError ? (
            /* Token invalid/expired state */
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Enlace inválido o expirado
                </h1>
                <p className="text-muted-foreground">
                  Este enlace de recuperación ya no es válido. Puede haber expirado o ya fue usado.
                </p>
              </div>
              <Link
                to="/recovery"
                className="inline-flex items-center justify-center w-full py-3 px-6 rounded-2xl font-semibold text-sm text-primary-foreground transition-all duration-200 hover:opacity-90"
                style={{ background: "hsl(var(--primary))" }}
              >
                Solicitar un nuevo enlace
              </Link>
              <p className="text-xs text-muted-foreground">
                <Link to="/login" className="hover:text-foreground transition-colors">
                  ← Volver al inicio de sesión
                </Link>
              </p>
            </div>
          ) : success ? (
            /* Success state */
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  ¡Contraseña actualizada!
                </h1>
                <p className="text-muted-foreground">
                  Tu contraseña ha sido cambiada exitosamente. Redirigiendo al inicio de sesión...
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-3 px-6 rounded-2xl font-semibold text-sm text-primary-foreground transition-all duration-200 hover:opacity-90"
                style={{ background: "hsl(var(--primary))" }}
              >
                Ir al inicio de sesión
              </Link>
            </div>
          ) : (
            /* Reset form */
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Nueva contraseña
                </h1>
                <p className="text-muted-foreground">
                  Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New password */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 pr-11 rounded-2xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground/60 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-1.5 flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            password.length >= (i + 1) * 3
                              ? password.length >= 12
                                ? "bg-primary"
                                : password.length >= 8
                                ? "bg-yellow-500"
                                : "bg-destructive"
                              : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repite la contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 pr-11 rounded-2xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground/60 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-destructive">Las contraseñas no coinciden</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="mt-1 text-xs text-primary">✓ Las contraseñas coinciden</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !password || !confirmPassword}
                  className="w-full py-3 px-6 rounded-2xl font-semibold text-sm text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "hsl(var(--primary))" }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </span>
                  ) : (
                    "Cambiar contraseña"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                <Link to="/login" className="hover:text-foreground transition-colors">
                  ← Volver al inicio de sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
