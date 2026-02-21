import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, TrendingUp, TrendingDown, RefreshCw, Loader2 } from 'lucide-react';
import { walletsService, Wallet as WalletType } from '@/lib/wallets.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BalanceCardProps {
  onRecharge?: () => void;
}

export const BalanceCard = ({ onRecharge }: BalanceCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    loadWallet();
    
    // Listen for balance updates
    const handleBalanceUpdate = () => {
      loadWallet();
    };
    
    window.addEventListener('balance-updated', handleBalanceUpdate);
    window.addEventListener('accounts-updated', handleBalanceUpdate);

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
        loadWallet();
    }, 5000);
    
    return () => {
      window.removeEventListener('balance-updated', handleBalanceUpdate);
      window.removeEventListener('accounts-updated', handleBalanceUpdate);
      clearInterval(interval);
    };
  }, []);

  const loadWallet = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const walletData = await walletsService.getByUserId(user.id, token);
      setWallet(walletData);
    } catch (error: any) {
      // If wallet doesn't exist, create it
      if (error.message.includes('404') || error.message.includes('not found')) {
        try {
          const newWallet = await walletsService.create(user.id, token);
          setWallet(newWallet);
        } catch (createError: any) {
          toast({
            title: 'Error',
            description: createError.message || 'Error al crear wallet',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Error al cargar saldo',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWallet();
    setRefreshing(false);
  };

  const getBalanceStatus = () => {
    if (!wallet) return { color: 'text-muted-foreground', icon: Wallet, message: 'Sin saldo' };
    
    if (wallet.balance >= 10) {
      return { color: 'text-green-500', icon: TrendingUp, message: 'Saldo saludable' };
    } else if (wallet.balance >= 2) {
      return { color: 'text-yellow-500', icon: Wallet, message: 'Saldo moderado' };
    } else {
      return { color: 'text-red-500', icon: TrendingDown, message: 'Saldo bajo' };
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

  const status = getBalanceStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <CardTitle>Mi Saldo</CardTitle>
          </div>
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="ghost"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${status.color}`} />
          {status.message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            ${wallet?.balance.toFixed(2) || '0.00'}
          </div>
          <p className="text-sm text-muted-foreground">
            {wallet?.lastRecharge 
              ? `Última recarga: ${new Date(wallet.lastRecharge).toLocaleDateString()}`
              : 'Sin recargas previas'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onRecharge}
            size="lg"
            className="box-glow-green"
          >
            <Plus className="w-4 h-4 mr-2" />
            Recargar
          </Button>
          <Button
            onClick={() => {/* Navigate to transactions */}}
            size="lg"
            variant="outline"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Historial
          </Button>
        </div>

        {wallet && wallet.balance < 2 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-400 text-center">
              ⚠️ Tu saldo está bajo. Recarga para seguir usando los servicios.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
