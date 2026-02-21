import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { paymentsService } from "@/lib/payments.service";
import { walletsService } from "@/lib/wallets.service";
import type { Payment } from "@/lib/payments.service";
import AccountMenu from "@/components/dashboard/AccountMenu";
import RechargeDialog from "@/components/dashboard/RechargeDialog";
import FeedbackDialog from "@/components/dashboard/FeedbackDialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { 
    ArrowLeft, RefreshCw, FileText, Calendar, DollarSign, ExternalLink, Loader2,
    Home, Sparkles, Mic, Play, Menu, X, Wallet, Plus, MessageSquarePlus, Sun, Moon, Coins, Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TabType = "inicio" | "chatgpt" | "elevenlabs" | "aiultra";

const MyOrders = () => {
    const { user, token, logout } = useAuth();
    const { t } = useLanguage();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Data State
    const [orders, setOrders] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Navbar State
    const [balance, setBalance] = useState<number>(0);
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showRechargeDialog, setShowRechargeDialog] = useState(false);
    const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

    // Initial Data Fetching
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
    }, [user, token]);

    useEffect(() => {
        if (user && token) {
            fetchOrders();
        }
    }, [page]); // Refresh orders when page changes

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleRecharge = () => {
        setShowRechargeDialog(true);
    };

    const handleTabClick = (tabId: TabType) => {
        navigate("/dashboard");
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Aprobado</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Pendiente</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Rechazado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const tabs = [
        { id: "inicio" as TabType, label: t("dashboard.home"), icon: Home },
        { id: "chatgpt" as TabType, label: "ChatGPT", icon: Sparkles },
        { id: "elevenlabs" as TabType, label: "Eleven Labs", icon: Mic },
        { id: "aiultra" as TabType, label: "AI Ultra", icon: Play },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
             {/* Header - Reused from Dashboard */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <span onClick={() => navigate('/dashboard')} className="text-2xl font-bold text-primary glow-green cursor-pointer">
                            Jall AI
                        </span>

                        {/* Desktop Menu */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground font-medium"
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        {/* Points & Account */}
                        <div className="hidden md:flex items-center gap-4">
                            <HoverCard openDelay={100} closeDelay={200}>
                                <HoverCardTrigger asChild>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg cursor-pointer hover:bg-accent/90 transition-colors">
                                        <Wallet className="w-4 h-4 text-white" />
                                        <span className="font-medium text-white">${balance?.toFixed(2) || "0.00"} Saldo</span>
                                    </div>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-48 p-2" align="end">
                                    <Button onClick={handleRecharge} className="w-full gap-2" size="sm">
                                        <Plus className="w-4 h-4" />
                                        {t("dashboard.rechargePoints")}
                                    </Button>
                                </HoverCardContent>
                            </HoverCard>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFeedbackDialog(true)}
                                className="gap-2"
                            >
                                <MessageSquarePlus className="w-4 h-4" />
                                {t("dashboard.suggestChanges")}
                            </Button>

                            <AccountMenu email={user?.email || ""} onLogout={handleLogout} pendingOrdersCount={pendingOrdersCount} />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="text-foreground"
                            >
                                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-foreground"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 space-y-2 animate-fade-in border-t border-border">
                            <div className="flex flex-col gap-2 p-2 bg-secondary rounded-lg mb-4">
                                <div className="flex items-center justify-between px-2">
                                   <div className="flex items-center gap-2">
                                      <Wallet className="w-4 h-4 text-white" />
                                      <span className="font-medium text-white">${balance?.toFixed(2) || "0.00"} Saldo</span>
                                   </div>
                                   <Button onClick={handleRecharge} size="sm" variant="ghost" className="h-7 px-2 text-white hover:text-white hover:bg-white/10">
                                      <Plus className="w-4 h-4" />
                                   </Button>
                                </div>
                                <div className="flex items-center gap-2 px-2 text-sm text-muted-foreground border-t border-white/10 pt-2">
                                  <Coins className="w-4 h-4 text-accent" />
                                  <span className="font-medium">{user?.points || 0} {t("dashboard.points")}</span>
                                </div>
                            </div>

                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className="flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors text-foreground/80 hover:bg-secondary"
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                            <div className="pt-4 mt-2 border-t border-border flex flex-col gap-3">
                                <AccountMenu 
                                    email={user?.email || ""} 
                                    onLogout={handleLogout} 
                                    pendingOrdersCount={pendingOrdersCount}
                                    className="w-full justify-start px-4"
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                    className="w-full justify-start gap-2 px-4"
                                >
                                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                    {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 px-4 pb-12">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">Mis Órdenes</h1>
                            <p className="text-muted-foreground">
                                Historial de tus transacciones y pagos realizados.
                            </p>
                        </div>
                        <Button onClick={fetchOrders} disabled={loading} variant="outline" className="gap-2">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
                                Mostrando {orders.length} de {total} órdenes totales.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading && orders.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    No tienes órdenes registradas aún.
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Método</TableHead>
                                            <TableHead>Monto (USD)</TableHead>
                                            <TableHead>Monto (BS)</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Recibo</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {order.id.slice(0, 8)}...
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {formatDate(order.created_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {order.paymentMethod?.name || 'Desconocido'}
                                                    {order.typePayment === 'Transfer-movil' && <span className="text-xs text-muted-foreground ml-1">(Móvil)</span>}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    ${order.amount.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                     {order.amountBs ? `Bs ${order.amountBs.toFixed(2)}` : '-'}
                                                     {order.exchangeRate && (
                                                         <div className="text-xs text-muted-foreground">
                                                             Tasa: {order.exchangeRate.rate.toFixed(2)}
                                                         </div>
                                                     )}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(order.status)}
                                                    {order.note && (
                                                        <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate" title={order.note}>
                                                            Nota: {order.note}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {(order.receiptFile?.url || (order.responsePayment as any)?.proofKey) ? (
                                                        <div className="flex justify-end items-center gap-1">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Ver">
                                                                <a 
                                                                    href={order.receiptFile?.url || `${import.meta.env.VITE_API_URL || 'http://localhost:3002/api'}/storage/public/${(order.responsePayment as any).proofKey}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <ExternalLink className="h-4 w-4 text-primary" />
                                                                </a>
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Descargar">
                                                                <a 
                                                                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:3002/api'}/storage/download/${order.receiptFile?.key || (order.responsePayment as any).proofKey}`} 
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

                            {/* Pagination */}
                            {totalPages > 1 && (
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
                                        Página {page} de {totalPages}
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
                            )}
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
