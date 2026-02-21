import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { MyAccountsCard } from '@/components/accounts/MyAccountsCard';
import { AvailableProvidersCard } from '@/components/accounts/AvailableProvidersCard';
import { BalanceCard } from '@/components/accounts/BalanceCard';

const AccountsPage = () => {
  const { user, loading, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showRechargeDialog, setShowRechargeDialog] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate('/');
    }
  }, [loading, isLoggedIn, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Gestión de Cuentas <span className="text-primary glow-green">GPT</span>
          </h1>
          <p className="text-muted-foreground">
            Administra tus cuentas, saldo y accede a las herramientas de IA
          </p>
        </div>

        {/* Balance and My Accounts */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <BalanceCard onRecharge={() => setShowRechargeDialog(true)} />
          </div>
          <div className="lg:col-span-2">
            <MyAccountsCard />
          </div>
        </div>

        {/* Available Providers */}
        <div>
          <AvailableProvidersCard />
        </div>
      </div>
    </div>
  );
};

export default AccountsPage;
