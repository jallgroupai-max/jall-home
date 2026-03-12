import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { paymentsService } from "@/lib/payments.service";
import { walletsService } from "@/lib/wallets.service";
import type { Payment } from "@/lib/payments.service";
import RechargeDialog from "@/components/dashboard/RechargeDialog";
import FeedbackDialog from "@/components/dashboard/FeedbackDialog";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, ExternalLink, FileText, GitBranch, Home, Loader2, Mic, Play, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TabType = "inicio" | "texttools" | "elevenlabs" | "aiultra";

const toCoins = (balance: number) => Math.round(balance * 100);
const formatCoins = (coins: number) => (coins >= 1000 ? `${(coins / 1000).toFixed(1)}K pts` : `${coins} pts`);

const MyOrders = () => {
  const { user, token, logout } = useAuth();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [balance, setBalance] = useState<number>(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [showRechargeDialog, setShowRechargeDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const fetchOrders = async () => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const result = await paymentsService.getByUser(user.id, token, { page, limit: 10 });
      setOrders(result.data);
      setTotal(result.meta.total);
      setTotalPages(result.meta.totalPages);
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
      toast({
        title: "Error fetching orders",
        description: error.message || "Could not load your orders.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    if (!user || !token) return;
    try {
      const wallet = await walletsService.getByUserId(user.id, token);
      setBalance(wallet.balance);
    } catch (error) {
      console.error("Failed to fetch wallet", error);
    }
  };

  const fetchPendingOrders = async () => {
    if (!token || !user?.id) return;
    try {
      const count = await paymentsService.getPendingCount(user.id, token);
      setPendingOrdersCount(count);
    } catch (error) {
      console.error("Error fetching pending orders:", error);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchWallet();
      fetchPendingOrders();
      fetchOrders();
    }
  }, [token, user]);

  useEffect(() => {
    if (user && token) {
      fetchOrders();
    }
  }, [page]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Aprobado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Pendiente</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const tabs = [
    { id: "inicio" as TabType, label: t("dashboard.home"), icon: Home },
    { id: "texttools" as TabType, label: t("dashboard.textToolsNav"), icon: GitBranch },
    { id: "elevenlabs" as TabType, label: "Eleven Labs", icon: Mic },
    { id: "aiultra" as TabType, label: "AI Ultra", icon: Play },
  ];

  const pointsLabel = formatCoins(toCoins(balance));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNavbar
        tabs={tabs}
        pointsLabel={pointsLabel}
        email={user?.email || ""}
        pendingOrdersCount={pendingOrdersCount}
        feedbackLabel={t("dashboard.suggestChanges")}
        theme={theme}
        onTabSelect={(tabId) => {
          navigate("/dashboard", { state: { initialTab: tabId } });
        }}
        onRecharge={() => setShowRechargeDialog(true)}
        onFeedback={() => setShowFeedbackDialog(true)}
        onLogout={() => {
          logout();
          navigate("/");
        }}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />

      <main className="pt-24 px-4 pb-12">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Mis Ordenes</h1>
              <p className="text-muted-foreground">Historial de tus transacciones y pagos realizados.</p>
            </div>
            <Button onClick={fetchOrders} disabled={loading} variant="outline" className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Historial
              </CardTitle>
              <CardDescription>
                Mostrando {orders.length} de {total} ordenes totales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && orders.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No tienes ordenes registradas aun.</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Metodo</TableHead>
                        <TableHead>Monto (USD)</TableHead>
                        <TableHead>Monto (BS)</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Recibo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">{order.id.slice(0, 8)}...</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(order.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.paymentMethod?.name || "Desconocido"}
                            {order.typePayment === "Transfer-movil" ? (
                              <span className="text-xs text-muted-foreground ml-1">(Movil)</span>
                            ) : null}
                          </TableCell>
                          <TableCell className="font-medium">${order.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {order.amountBs ? `Bs ${order.amountBs.toFixed(2)}` : "-"}
                            {order.exchangeRate ? (
                              <div className="text-xs text-muted-foreground">Tasa: {order.exchangeRate.rate.toFixed(2)}</div>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.status)}
                            {order.note ? (
                              <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate" title={order.note}>
                                Nota: {order.note}
                              </div>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-right">
                            {order.receiptFile?.url || (order.responsePayment as any)?.proofKey ? (
                              <div className="flex justify-end items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Ver">
                                  <a
                                    href={
                                      order.receiptFile?.url ||
                                      `${import.meta.env.VITE_API_URL || "http://localhost:3002/api"}/storage/public/${(order.responsePayment as any).proofKey}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4 text-primary" />
                                  </a>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Descargar">
                                  <a
                                    href={`${import.meta.env.VITE_API_URL || "http://localhost:3002/api"}/storage/download/${
                                      order.receiptFile?.key || (order.responsePayment as any).proofKey
                                    }`}
                                    download
                                  >
                                    <Download className="h-4 w-4 text-primary" />
                                  </a>
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {totalPages > 1 ? (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                  >
                    Anterior
                  </Button>
                  <div className="text-sm font-medium">
                    Pagina {page} de {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                  >
                    Siguiente
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>

      <RechargeDialog open={showRechargeDialog} onOpenChange={setShowRechargeDialog} />
      <FeedbackDialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} />
    </div>
  );
};

export default MyOrders;
