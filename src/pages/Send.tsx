import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  RefreshCw,
  CheckCircle,
  CreditCard,
  Copy,
  Shield,
  ArrowLeft,
  Coins,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const SendPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Mock API function for sending payment
  const mockSendPayment = (
    paymentData: any
  ): Promise<{
    transactionId: string;
    singleUseLink: string;
    singleUseQR: string;
    anonymousContact: string;
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate single-use link and QR code
        const singleUseId = Math.random().toString(36).substr(2, 16);
        const link = `${window.location.origin}/claim/${singleUseId}`;
        const qrData = JSON.stringify({
          id: singleUseId,
          amount: paymentData.convertedAmount,
          currency: paymentData.cryptoCurrency,
          expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          singleUse: true,
        });

        const newTransactionId = Math.random()
          .toString(36)
          .substr(2, 12)
          .toUpperCase();

        resolve({
          transactionId: newTransactionId,
          singleUseLink: link,
          singleUseQR: qrData,
          anonymousContact: `anonymous-${Math.random()
            .toString(36)
            .substr(2, 9)}@example.com`,
        });
      }, 3000);
    });
  };

  // Send payment mutation
  const sendPaymentMutation = useMutation({
    mutationFn: (paymentData: unknown) => mockSendPayment(paymentData),
    onSuccess: (result: {
      transactionId: string;
      singleUseLink: string;
      singleUseQR: string;
      anonymousContact: string;
    }) => {
      setSingleUseLink(result.singleUseLink);
      setSingleUseQR(result.singleUseQR);
      setTransactionId(result.transactionId);
      setPaymentStatus("completed");
      setIsModalOpen(true);

      toast({
        title: t("send.paymentSentSuccessfully"),
        description: t("send.transactionIdResult", {
          transactionId: result.transactionId,
        }),
      });
    },
    onError: (error) => {
      console.error("Send payment failed:", error);
      setPaymentStatus("idle");
      toast({
        title: t("send.paymentFailed"),
        description: t("send.paymentFailedDesc"),
        variant: "destructive",
      });
    },
  });

  // State for payment form
  const [paymentAmount, setPaymentAmount] = useState("");
  const [localCurrency, setLocalCurrency] = useState("USD");
  const [cryptoCurrency, setCryptoCurrency] = useState("USDT");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, processing, completed
  const [singleUseLink, setSingleUseLink] = useState("");
  const [singleUseQR, setSingleUseQR] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Mock exchange rates (in real app, this would come from an API)
  const exchangeRates = {
    USD: { USDT: 1, BTC: 0.000023, ETH: 0.0004 },
    EUR: { USDT: 1.08, BTC: 0.000025, ETH: 0.00043 },
    UZS: { USDT: 0.000082, BTC: 0.0000000019, ETH: 0.000000033 },
    KZT: { USDT: 0.0021, BTC: 0.000000048, ETH: 0.00000084 },
    GBP: { USDT: 1.26, BTC: 0.000029, ETH: 0.0005 },
  };

  const calculateConversion = (amount: string) => {
    if (!amount || isNaN(Number(amount))) {
      setConvertedAmount("");
      return;
    }

    const rate =
      exchangeRates[localCurrency as keyof typeof exchangeRates]?.[
        cryptoCurrency as keyof typeof exchangeRates.USD
      ] || 1;
    const converted = Number(amount) * rate;
    setConvertedAmount(converted.toFixed(8));
    setExchangeRate(rate);
  };

  const generateAnonymousContactInfo = () => {
    const contactId = Math.random().toString(36).substr(2, 9);
    return `anonymous-${contactId}@example.com`;
  };

  const handleSendPayment = () => {
    if (!paymentAmount || !convertedAmount) {
      // Removed non-API validation toast - this is client-side validation
      return;
    }

    setPaymentStatus("processing");

    sendPaymentMutation.mutate({
      paymentAmount,
      convertedAmount,
      cryptoCurrency,
      localCurrency,
      paymentMethod,
    });
  };

  const copySingleUseLink = () => {
    navigator.clipboard.writeText(singleUseLink);
    // Removed non-API copy toast
  };

  const resetSendForm = () => {
    setPaymentAmount("");
    setConvertedAmount("");
    setPaymentStatus("idle");
    setSingleUseLink("");
    setSingleUseQR("");
    setTransactionId("");
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Button>
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold">{t("send.title")}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-4xl">
        {/* Anonymity Disclaimer */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              {t("dashboard.anonymityDisclaimer")}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                {t("send.title")}
              </CardTitle>
              <CardDescription>{t("send.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">{t("send.amount")}</Label>
                    <Input
                      id="amount"
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(e) => {
                        setPaymentAmount(e.target.value);
                        calculateConversion(e.target.value);
                      }}
                      disabled={paymentStatus === "processing"}
                      className="text-lg font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("send.localCurrency")}</Label>
                    <Select
                      value={localCurrency}
                      onValueChange={(value) => {
                        setLocalCurrency(value);
                        calculateConversion(paymentAmount);
                      }}
                      disabled={paymentStatus === "processing"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">
                          🇺🇸 USD - {t("currency.usd")}
                        </SelectItem>
                        <SelectItem value="EUR">
                          🇪🇺 EUR - {t("currency.eur")}
                        </SelectItem>
                        <SelectItem value="GBP">
                          🇬🇧 GBP - {t("currency.gbp")}
                        </SelectItem>
                        <SelectItem value="UZS">
                          🇺🇿 UZS - {t("currency.uzs")}
                        </SelectItem>
                        <SelectItem value="KZT">
                          🇰🇿 KZT - {t("currency.kzt")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-2">
                  <Label>{t("send.paymentMethod")}</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">
                        💳 {t("send.bankCard")}
                      </SelectItem>
                      <SelectItem value="paypal">🏦 PayPal</SelectItem>
                      <SelectItem value="bank">
                        🏛️ {t("send.bankTransfer")}
                      </SelectItem>
                      <SelectItem value="apple">📱 Apple Pay</SelectItem>
                      <SelectItem value="google">📱 Google Pay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Conversion Display */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label>{t("send.convertTo")}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => calculateConversion(paymentAmount)}
                    disabled={paymentStatus === "processing"}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {t("send.refreshRate")}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={cryptoCurrency}
                    onValueChange={(value) => {
                      setCryptoCurrency(value);
                      calculateConversion(paymentAmount);
                    }}
                    disabled={paymentStatus === "processing"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">
                        ₮ USDT - {t("currency.usdt")}
                      </SelectItem>
                      <SelectItem value="BTC">
                        ₿ BTC - {t("currency.btc")}
                      </SelectItem>
                      <SelectItem value="ETH">
                        Ξ ETH - {t("currency.eth")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="space-y-1">
                    <Input
                      value={convertedAmount}
                      placeholder={t("send.convertedAmount")}
                      readOnly
                      className="font-mono text-right"
                    />
                    {exchangeRate && paymentAmount && (
                      <p className="text-xs text-muted-foreground">
                        {t("send.exchangeRateDisplay", {
                          localCurrency,
                          rate: exchangeRate.toFixed(8),
                          cryptoCurrency,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <Button
                onClick={handleSendPayment}
                className="w-full h-12"
                disabled={
                  !paymentAmount ||
                  !convertedAmount ||
                  paymentStatus === "processing"
                }
                size="lg"
              >
                {paymentStatus === "processing" ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    {t("send.processing")}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    {t("send.processPayment")} ({paymentAmount} {localCurrency})
                  </>
                )}
              </Button>

              {/* Processing Status */}
              {paymentStatus === "processing" && (
                <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin text-blue-600" />
                  <span className="text-blue-700">
                    {t("send.processingDescription", {
                      method: paymentMethod,
                      amount: paymentAmount,
                      currency: localCurrency,
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Result Panel */}
          <div className="space-y-6">
            {/* Payment Summary */}
            {paymentAmount && convertedAmount && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("send.paymentSummary")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("send.amount")}:
                    </span>
                    <span className="font-semibold">
                      {paymentAmount} {localCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("send.convertsTo")}:
                    </span>
                    <span className="font-semibold font-mono">
                      {convertedAmount} {cryptoCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("send.paymentMethod")}:
                    </span>
                    <span className="font-semibold capitalize">
                      {paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("send.exchangeRate")}:
                    </span>
                    <span>
                      1 {localCurrency} = {exchangeRate.toFixed(8)}{" "}
                      {cryptoCurrency}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Success Result */}
            {paymentStatus === "completed" && singleUseLink && (
              <Dialog open={isModalOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-green-800">
                      {t("send.completed")}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          {t("send.transactionId")}
                        </Label>
                        <div className="flex space-x-2">
                          <Input
                            value={transactionId}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(transactionId);
                              toast({ title: t("send.transactionIdCopied") });
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          {t("send.singleUseLink")}
                        </Label>
                        <div className="flex space-x-2">
                          <Input
                            value={singleUseLink}
                            readOnly
                            className="text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copySingleUseLink}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ⚠️ {t("send.singleUseLinkWarning")}
                        </p>
                      </div>

                      <div className="flex justify-center">
                        <div className="text-center space-y-2">
                          <Label className="text-sm font-medium">
                            {t("send.singleUseQR")}
                          </Label>
                          <div className="p-4 bg-white rounded-lg border">
                            <QRCodeSVG value={singleUseQR} size={150} />
                          </div>
                          <p className="text-xs text-muted-foreground max-w-xs">
                            {t("send.qrCodeInstructions")}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={resetSendForm}
                          className="flex-1"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {t("send.sendAnother")}
                        </Button>
                        <Button
                          onClick={() => navigate("/dashboard")}
                          className="flex-1"
                        >
                          {t("nav.back")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Security Notice */}
            <Card className="border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 mr-2 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-medium text-amber-800">
                      Security Notice
                    </h4>
                    <p className="text-amber-700 mt-1">
                      Your payment is processed anonymously. The generated link
                      and QR code are single-use only and will expire in 24
                      hours. Keep your transaction ID safe for any support
                      inquiries.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendPage;
