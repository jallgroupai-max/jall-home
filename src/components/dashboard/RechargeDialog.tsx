import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Coins, CreditCard, Smartphone, Bitcoin, Upload, ArrowLeft, ArrowRight, MessageCircle, CheckCircle, AlertTriangle, Shield, Loader2, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { walletsService } from "@/lib/wallets.service";

interface RechargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "method" | "amount" | "payment" | "confirm" | "card_maintenance";

const EXCHANGE_RATE = 590; // Bs por dólar
const POINTS_PER_DOLLAR = 100;
const POINTS_PER_DAY = 30;

const whatsappNumber = "584121234567";

interface PaymentMethod {
  id: string;
  name: string;
  typeMethod: string;
  account: string;
  money: 'usd' | 'bs';
  extraData?: any;
  active: boolean;
}

const RechargeDialog = ({ open, onOpenChange }: RechargeDialogProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { token } = useAuth();
  const [step, setStep] = useState<Step>("method");
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [proofKey, setProofKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const amountNum = parseFloat(amount) || 0;
  const pointsEquivalent = Math.floor(amountNum * POINTS_PER_DOLLAR);
  const daysEquivalent = (pointsEquivalent / POINTS_PER_DAY).toFixed(1);
  const bsAmount = amountNum * (exchangeRate || EXCHANGE_RATE);

  const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);

  useEffect(() => {
    if (open) {
      if(user) fetchWallet();
      fetchPaymentMethods();
    } else {
        resetDialog();
    }
  }, [open]);

  useEffect(() => {
    if (selectedMethod?.money === 'bs') {
        fetchExchangeRate();
    }
  }, [selectedMethodId]);

  const fetchExchangeRate = async () => {
      setLoadingRate(true);
      try {
          const response = await apiService.get<{ rate: number, currency: string, timestamp: string }>('/payments/exchange-rate', token!);
          if (response && response.rate) {
              setExchangeRate(response.rate);
          }
      } catch (error) {
          console.error("Failed to fetch exchange rate", error);
          toast({
              title: t("recharge.toast.rateWarning"),
              description: t("recharge.toast.rateWarningDesc"),
          });
      } finally {
          setLoadingRate(false);
      }
  };

  const fetchWallet = async () => {
    if (!user) return;
    try {
      const wallet = await walletsService.getByUserId(user.id, token!);
      setCurrentBalance(wallet.balance);
    } catch (error) {
      console.error("Failed to fetch wallet", error);
    }
  };

  const fetchPaymentMethods = async () => {
    setIsLoadingMethods(true);
    try {
      const response = await apiService.get<any>('/payment-methods', token!);
      const methods = response.data || []; // Handle paginated response
      // Filter active methods if needed, assuming backend returns all
      setPaymentMethods(methods.filter((m: any) => m.active));
    } catch (error) {
      console.error("Failed to fetch payment methods", error);
      toast({
        title: t("recharge.error.title"),
        description: t("recharge.toast.methodsErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsLoadingMethods(false);
    }
  };

  const resetDialog = () => {
    setStep("method");
    setSelectedMethodId("");
    setAmount("");
    setReference("");
    setExchangeRate(null);
    setProofKey(null);
    setIsUploading(false);
    setIsSubmitting(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetDialog();
    onOpenChange(isOpen);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await apiService.upload<{ key: string, url: string }>('/storage/upload', file, token!);
      setProofKey(result.key);
      toast({
        title: t("recharge.toast.proofUploaded"),
        description: t("recharge.toast.proofUploadedDesc"),
      });
    } catch (error) {
        console.error("Upload error", error);
      toast({
        title: t("recharge.toast.uploadError"),
        description: t("recharge.toast.uploadErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMethod || !amountNum) return;

    setIsSubmitting(true);
    try {
      await apiService.post('/payments', {
        paymentMethodId: selectedMethod.id,
        amount: amountNum,
        status: 'pending',
        moneyPayment: 'usd', 
        amountBs: selectedMethod.money === 'bs' ? bsAmount : undefined,
        exchangeRate: selectedMethod.money === 'bs' ? {
            rate: exchangeRate || EXCHANGE_RATE,
            money: 'usd',
            dateRate: new Date().toISOString()
        } : undefined, 
        responsePayment: {
            reference,
            proofKey
        }
      }, token!);

      toast({
        title: t("recharge.inProgress"),
        description: t("recharge.inProgressDesc"),
      });
      handleClose(false);
    } catch (error: any) {
        console.error("Payment error", error);
      toast({
        title: t("recharge.error.title"),
        description: error.message || t("recharge.toast.paymentErrorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWhatsAppLink = () => {
    if (!selectedMethod) return "";
    const methodLabel = selectedMethod.name;
    const message = encodeURIComponent(
      `Hola! Quiero reportar mi pago:\n\n` +
      `Método: ${methodLabel}\n` +
      `Monto: $${amountNum} USD\n` +
      `${selectedMethod.money === 'bs' ? `Monto en Bs: ${bsAmount.toLocaleString()} Bs\n` : ""}` +
      `Referencia: ${reference || "Pendiente"}\n` +
      `Puntos a recibir: ${pointsEquivalent} (${daysEquivalent} días aprox.)`
    );
    return `https://wa.me/${whatsappNumber}?text=${message}`;
  };

  const canProceed = () => {
    switch (step) {
      case "method": return !!selectedMethodId;
      case "amount": return amountNum >= 1; 
      case "payment": return !!proofKey || !!reference;
      default: return true;
    }
  };

  const goNext = () => {
    if (step === "method") {
        setStep("amount");
    }
    else if (step === "amount") setStep("payment");
    else if (step === "payment") setStep("confirm");
  };

  const goBack = () => {
    if (step === "amount") setStep("method");
    else if (step === "payment") setStep("amount");
    else if (step === "confirm") setStep("payment");
    else if (step === "card_maintenance") setStep("method");
  };

  const getIconForMethod = (type: string) => {
      switch(type.toLowerCase()) {
          case 'pago_movil': return Smartphone;
          case 'zelle': return Coins; // Or custom
          case 'crypto':
          case 'binance': return Bitcoin;
          case 'card': return CreditCard;
          default: return Coins;
      }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "method" && t("recharge.methodTitle")}
            {step === "amount" && t("recharge.amountTitle")}
            {step === "payment" && t("recharge.paymentTitle")}
            {step === "confirm" && t("recharge.confirmTitle")}
            {step === "card_maintenance" && t("recharge.cardMaintenanceTitle")}
          </DialogTitle>
          <DialogDescription>
            {step === "method" && t("recharge.methodDesc")}
            {step === "amount" && t("recharge.amountDesc")}
            {step === "payment" && t("recharge.paymentDesc")}
            {step === "confirm" && t("recharge.confirmDesc")}
            {step === "card_maintenance" && t("recharge.cardMaintenanceMessage")}
          </DialogDescription>
        </DialogHeader>

        <div className="pt-4">
          {/* Step 1: Payment Method */}
          {step === "method" && (
            isLoadingMethods ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
            <RadioGroup value={selectedMethodId} onValueChange={setSelectedMethodId} className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = getIconForMethod(method.typeMethod || method.name);
                return (
                <Label
                  key={method.id}
                  htmlFor={method.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedMethodId === method.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Icon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{method.typeMethod.replace('_', ' ')}</p>
                  </div>
                </Label>
              )})}
              {paymentMethods.length === 0 && (
                  <p className="text-center text-muted-foreground">{t("recharge.noMethods")}</p>
              )}
            </RadioGroup>
            )
          )}

          {/* Step 2: Amount */}
          {step === "amount" && (
            <div className="space-y-6">
                 <div className="p-4 rounded-lg border border-border">
                    <h4 className="font-medium mb-2 text-primary">{t("recharge.ratesInfo")}</h4>
                    <ul className="text-sm space-y-1">
                        <li>• 1 USD = {POINTS_PER_DOLLAR} {t("dashboard.points")}</li>
                        <li>• 1 {t("pricing.day")} ChatGPT = {POINTS_PER_DAY} {t("dashboard.points")}</li>
                    </ul>
                </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t("recharge.amountUsdLabel")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {amountNum > 0 && amountNum < 1 && (
                  <p className="text-sm text-destructive">{t("recharge.minAmount1")}</p>
                )}

                {currentBalance !== null && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Wallet className="w-4 h-4" />
                        <span>{t("recharge.currentBalance")} <span className="font-medium text-foreground">${currentBalance.toFixed(2)}</span></span>
                    </div>
                )}
              </div>

              {amountNum >= 1 && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span>{t("recharge.youWillReceive")}</span>
                        <div className="flex items-center gap-2">
                            <Coins className="w-5 h-5 text-accent" />
                            <span className="text-xl font-bold text-primary">{pointsEquivalent} {t("dashboard.points")}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-primary/20">
                         <span>{t("recharge.equivalentTo")}</span>
                         <span className="font-medium text-foreground">{daysEquivalent} {t("recharge.daysOfUse")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Payment Details */}
          {step === "payment" && selectedMethod && (
            <div className="space-y-6">
                <div className="p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-primary">{t("recharge.paymentDataTitle")}</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("recharge.method")}</span>
                        <span className="font-medium">{selectedMethod.name}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("recharge.accountPhone")}</span>
                        <span className="font-medium text-right break-all">{selectedMethod.account}</span>
                    </div>
                     {/* Render extra data if available */}
                     {selectedMethod.extraData && Object.entries(selectedMethod.extraData).map(([key, value]) => (
                         <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">{key}:</span>
                            <span className="font-medium text-right">{value as string}</span>
                        </div>
                     ))}
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t("recharge.amountToPay")}</span>
                      <span className="text-xl font-bold text-primary">
                          {selectedMethod.money === 'bs' 
                            ? `${bsAmount.toLocaleString()} Bs` 
                            : `$${amountNum} USD`}
                      </span>
                    </div>
                    {selectedMethod.money === 'bs' && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {t("recharge.rate")} {loadingRate ? <Loader2 className="w-3 h-3 animate-spin inline"/> : (exchangeRate || EXCHANGE_RATE).toFixed(2)} Bs/USD
                        </p>
                    )}
                  </div>
                </div>

              <div className="space-y-2">
                <Label htmlFor="reference">{t("recharge.reference")}</Label>
                <Input
                  id="reference"
                  placeholder="Ej: 123456789"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              <div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept="image/*,.pdf"    
                />
                <Button
                    type="button"
                    variant={proofKey ? "default" : "outline"}
                    className={`w-full gap-2 ${proofKey ? "bg-green-600 hover:bg-green-700" : "bg-primary"}`}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t("recharge.uploading")}
                        </>
                    ) : (
                        <>
                            {proofKey ? <CheckCircle className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                            {proofKey ? t("recharge.proofUploaded") : t("recharge.uploadProof")}
                        </>
                    )}
                </Button>
                {proofKey && (
                    <p className="text-xs text-center text-green-600 mt-1">{t("recharge.fileReady")}</p>
                )}
              </div>

              <div className="text-center">
                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t("recharge.reportWhatsApp")}
                </a>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === "confirm" && selectedMethod && (
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30 text-center">
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
                <h4 className="text-lg font-bold">{t("recharge.almostDone")}</h4>
                <p className="text-muted-foreground text-sm mt-1">
                  {t("recharge.reviewData")}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 rounded">
                  <span className="text-muted-foreground">{t("recharge.method")}</span>
                  <span className="font-medium">{selectedMethod.name}</span>
                </div>
                <div className="flex justify-between p-2 rounded">
                  <span className="text-muted-foreground">{t("recharge.amountUsdLabel")}</span>
                  <span className="font-medium">${amountNum}</span>
                </div>
                {selectedMethod.money === 'bs' && (
                  <div className="flex justify-between p-2 rounded">
                    <span className="text-muted-foreground">{t("recharge.amountBsLabel")}</span>
                    <span className="font-medium">{bsAmount.toLocaleString()} Bs</span>
                  </div>
                )}
                <div className="flex justify-between p-2 rounded">
                  <span className="text-muted-foreground">{t("recharge.pointsReceive")}</span>
                  <span className="font-bold text-primary">{pointsEquivalent} (+{daysEquivalent} {t("recharge.daysOfUse")})</span>
                </div>
                {reference && (
                  <div className="flex justify-between p-2 rounded">
                    <span className="text-muted-foreground">{t("recharge.referenceLabel")}</span>
                    <span className="font-medium">{reference}</span>
                  </div>
                )}
                <div className="flex justify-between p-2 rounded">
                    <span className="text-muted-foreground">{t("recharge.receiptLabel")}</span>
                    <span className="font-medium">{proofKey ? t("recharge.uploaded") : t("recharge.notUploaded")}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          {step !== "method" && (
            <Button variant="outline" onClick={goBack} className="flex-1" disabled={isSubmitting}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("recharge.back")}
            </Button>
          )}
          {step !== "confirm" ? (
            <Button
              onClick={goNext}
              disabled={!canProceed() || isLoadingMethods}
              className="flex-1 box-glow-green"
            >
              {t("recharge.next")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex-1 box-glow-green" disabled={isSubmitting}>
              {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t("recharge.processing")}
                  </>
              ) : (
                  t("recharge.confirmRecharge")
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RechargeDialog;
