import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Wallet, Gift, CheckCircle, Sparkles, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Comprar = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>

        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Cómo funciona{" "}
            <span className="text-primary glow-green">Jall AI</span>?
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Accede a las mejores herramientas de IA de forma simple y económica.
          </p>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card border-border text-center">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">1. Recarga tu cuenta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Mínimo <span className="text-primary font-bold">$2</span> para empezar. 
                Paga con tu método de pago favorito.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-center">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-xl">2. Elige tu herramienta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                ChatGPT Plus, Google AI Ultra, Eleven Labs... 
                Alquila solo lo que necesitas.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border text-center">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">3. ¡Crea sin límites!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Acceso inmediato a tu herramienta. 
                Sin tarjeta de crédito internacional.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bonus Card */}
        <Card className="bg-primary/10 border-primary/30 mb-12">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Gift className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">¡$1.5 GRATIS!</h3>
                <p className="text-muted-foreground">
                  Regístrate y verifica tu email para recibir saldo de prueba.
                </p>
              </div>
            </div>
            <Button 
              size="lg" 
              className="box-glow-green whitespace-nowrap"
              onClick={() => navigate('/register')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Recargar Ahora
            </Button>
          </CardContent>
        </Card>

        {/* Pricing reminder */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Precios por día</CardTitle>
            <CardDescription>Alquila solo lo que necesitas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                <span>ChatGPT Plus</span>
                <span className="font-bold text-primary">$0.3</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                <span>Google AI Ultra</span>
                <span className="font-bold text-accent">$1.4</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                <span>Eleven Labs</span>
                <span className="font-bold text-primary">$0.5</span>
              </div>
            </div>
            <p className="text-center text-muted-foreground mt-6 text-sm">
              También disponible: <span className="text-accent font-medium">Pack Creador</span> - Veo 3 + Google AI Ultra + ChatGPT Plus por solo <span className="text-primary font-bold">$1.5/día</span>
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default Comprar;
