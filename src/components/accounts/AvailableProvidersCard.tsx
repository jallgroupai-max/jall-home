import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, CheckCircle2, TrendingUp, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { providersService, Provider } from '@/lib/providers.service';
import { accountsService } from '@/lib/accounts.service';
import { walletsService, Wallet } from '@/lib/wallets.service';
import { useAuth } from '@/contexts/AuthContext';

export const AvailableProvidersCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [contractingId, setContractingId] = useState<string | null>(null);

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    loadProviders();
    loadWallet();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await providersService.getAll(token);
      setProviders(data.filter((p) => p.active));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar proveedores',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWallet = async () => {
    if (!user?.id) return;
    try {
      const walletData = await walletsService.getByUserId(user.id, token);
      setWallet(walletData);
    } catch (error: any) {
      console.error('Error loading wallet:', error);
    }
  };

  const handleContractAccount = async (providerId: string) => {
    if (!user?.id) return;

    // Check balance
    if (!wallet || wallet.balance < 1) {
      toast({
        title: 'Saldo insuficiente',
        description: 'Necesitas recargar tu cuenta para contratar una cuenta GPT',
        variant: 'destructive',
      });
      return;
    }

    try {
      setContractingId(providerId);

      await accountsService.assignAccount(
        {
          userId: user.id,
          providerId,
        },
        token
      );

      toast({
        title: '¡Cuenta contratada!',
        description: 'La cuenta GPT ha sido asignada exitosamente',
      });

      // Reload wallet to show updated balance
      await loadWallet();
      
      // Trigger parent component to reload accounts
      window.dispatchEvent(new CustomEvent('accounts-updated'));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al contratar la cuenta',
        variant: 'destructive',
      });
    } finally {
      setContractingId(null);
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'chatgpt':
        return <Sparkles className="w-5 h-5" />;
      case 'elevenlabs':
        return <Zap className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (providers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proveedores Disponibles</CardTitle>
          <CardDescription>No hay proveedores disponibles en este momento</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contratar Cuenta GPT</CardTitle>
        <CardDescription>
          Selecciona un proveedor para comenzar. Saldo disponible:{' '}
          <span className="font-bold text-primary">${wallet?.balance.toFixed(2) || '0.00'}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => (
          <Card key={provider.id} className="overflow-hidden border-2 hover:border-primary/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getProviderIcon(provider.typeProvider)}
                  <CardTitle className="text-lg">{provider.typeProvider}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {provider.typeCost === 'D' ? 'Diario' : 'Mensual'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">${provider.finalPrice}</span>
                  <span className="text-sm text-muted-foreground">/ {provider.typeCost === 'D' ? 'día' : 'mes'}</span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Costo base: ${provider.cost}</p>
                  <p>Margen: {provider.profitMargin}%</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t">
              <Button
                onClick={() => handleContractAccount(provider.id)}
                disabled={contractingId === provider.id || !wallet || wallet.balance < provider.finalPrice}
                className="w-full box-glow-green"
              >
                {contractingId === provider.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Contratando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Contratar Ahora
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
      {wallet && wallet.balance < 2 && (
        <CardFooter className="border-t bg-accent/10">
          <p className="text-sm text-muted-foreground text-center w-full">
            ⚠️ Saldo bajo. Recuerda recargar tu cuenta para seguir usando los servicios.
          </p>
        </CardFooter>
      )}
    </Card>
  );
};
