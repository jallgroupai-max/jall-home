import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { providersService, Provider } from '@/lib/providers.service';
import { accountsService, UserAccount } from '@/lib/accounts.service';
import { walletsService, Wallet } from '@/lib/wallets.service';
import { useAuth } from '@/contexts/AuthContext';

export const MyAccountsCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myAccounts, setMyAccounts] = useState<UserAccount[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    loadMyAccounts();
    loadWallet();
  }, []);

  const loadMyAccounts = async () => {
    try {
      setLoading(true);
      const accounts = await accountsService.getMyAccounts(token);
      setMyAccounts(accounts);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar tus cuentas',
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

  const handleAccessAccount = async (accountId: string) => {
    if (!user?.id) return;

    try {
      // Validate access
      const validation = await accountsService.validateAccess(
        { userId: user.id, accountId },
        token
      );

      if (!validation.hasAccess) {
        toast({
          title: 'Acceso denegado',
          description: validation.message,
          variant: 'destructive',
        });
        return;
      }

      if (!validation.hasBalance) {
        toast({
          title: 'Saldo insuficiente',
          description: 'No tienes saldo suficiente para acceder a esta cuenta',
          variant: 'destructive',
        });
        return;
      }

      // Generate access token
      const { token: accessToken, account } = await accountsService.generateToken(
        { userId: user.id, accountId },
        token
      );

      // Redirect to GPT account (implement your redirect logic here)
      toast({
        title: '¡Acceso concedido!',
        description: `Redirigiendo a ${account.email}...`,
      });

      // TODO: Implement redirect to GPT account with token
      window.open(`https://gpt.jall.lat/?token=${accessToken}`, '_blank');
      
      // Reload accounts to update lastAccessAt
      await loadMyAccounts();
      await loadWallet();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al acceder a la cuenta',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivateAccount = async (accountId: string) => {
    if (!user?.id) return;

    try {
      await accountsService.deactivateAccount(user.id, accountId, token);
      toast({
        title: 'Cuenta desactivada',
        description: 'La cuenta ha sido desactivada exitosamente',
      });
      await loadMyAccounts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al desactivar la cuenta',
        variant: 'destructive',
      });
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

  if (myAccounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Cuentas GPT</CardTitle>
          <CardDescription>No tienes cuentas activas</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Contrata una cuenta GPT para comenzar a usar las herramientas de IA
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Mis Cuentas GPT
        </CardTitle>
        <CardDescription>
          Saldo disponible: <span className="font-bold text-primary">${wallet?.balance.toFixed(2) || '0.00'}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {myAccounts.map((userAccount) => (
          <div
            key={userAccount.id}
            className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-all"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{userAccount.account?.email || 'GPT Account'}</h4>
                <Badge variant={userAccount.active ? 'default' : 'secondary'}>
                  {userAccount.active ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Activa
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Inactiva
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {userAccount.account?.provider?.typeProvider || 'ChatGPT Plus'}
              </p>
              {userAccount.lastAccessAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Último acceso: {new Date(userAccount.lastAccessAt).toLocaleDateString()}
                </p>
              )}
              {userAccount.expiresAt && (
                <p className="text-xs text-muted-foreground">
                  Expira: {new Date(userAccount.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {userAccount.active && (
                <Button
                  onClick={() => handleAccessAccount(userAccount.accountId)}
                  size="sm"
                  className="box-glow-cyan"
                >
                  Acceder
                </Button>
              )}
              <Button
                onClick={() => handleDeactivateAccount(userAccount.accountId)}
                size="sm"
                variant="outline"
              >
                Desactivar
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
