import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth.service";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function Recovery() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo enviar el correo. Verifica la dirección e intenta nuevamente.",
        variant: "destructive",
      });
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
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Jall<span className="text-primary">AI</span>
            </span>
          </Link>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-foreground leading-tight mb-4">
            Recupera el<br />
            acceso a tu <span className="text-primary">cuenta</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Te enviaremos un enlace seguro para restablecer tu contraseña.
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

          {sent ? (
            /* Success state */
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">¡Correo enviado!</h1>
                <p className="text-muted-foreground">
                  Revisa tu bandeja de entrada en{" "}
                  <span className="font-medium text-foreground">{email}</span> y
                  haz clic en el enlace para restablecer tu contraseña.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                El enlace expirará en <strong>30 minutos</strong>. Si no lo ves, revisa tu carpeta de spam.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline underline-offset-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Recuperar contraseña
                </h1>
                <p className="text-muted-foreground">
                  Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <label
                    htmlFor="recovery-email"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="recovery-email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground/60 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full py-3 px-6 rounded-2xl font-semibold text-sm text-primary-foreground transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "hsl(var(--primary))" }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando enlace...
                    </span>
                  ) : (
                    "Enviar enlace de recuperación"
                  )}
                </button>
              </form>

              {/* Back to login */}
              <p className="mt-6 text-center text-sm text-muted-foreground">
                ¿Recordaste tu contraseña?{" "}
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline underline-offset-4 transition-colors"
                >
                  Iniciar sesión
                </Link>
              </p>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">
                  ← Volver al inicio
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
