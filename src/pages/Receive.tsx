import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  RefreshCw,
  CheckCircle,
  Copy,
  Shield,
  ArrowLeft,
  Coins,
  Wallet,
  CreditCard,
  QrCode,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { PaymentRequest, PaymentResponse } from "@/types";

const ReceivePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Mock API functions
  const mockProcessIncomingPayment = (
    paymentId: string
  ): Promise<{ transactionId: string; paymentId: string; status: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTransactionId = Math.random()
          .toString(36)
          .substr(2, 12)
          .toUpperCase();

        resolve({
          transactionId: newTransactionId,
          paymentId,
          status: "completed",
        });
      }, 2000);
    });
  };

  const mockGenerateReceiveLink = (
    receiveData: PaymentRequest
  ): Promise<PaymentResponse> => {
    return new Promise((resolve) => {
      const uniqueId = Math.random().toString(36).substr(2, 16);
      const link = `${window.location.origin}/receive/${uniqueId}`;
      const qrData = JSON.stringify({
        id: uniqueId,
        amount: receiveData.receiveAmount,
        currency: receiveData.receiveCurrency,
        method: receiveData.receiveMethod,
        destination:
          receiveData.receiveMethod === "crypto"
            ? receiveData.walletAddress
            : `****${receiveData.bankCardNumber.slice(-4)}`,
        expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        singleUse: true,
      });

      const newTransactionId = Math.random()
        .toString(36)
        .substr(2, 12)
        .toUpperCase();

      resolve({
        receiveLink: link,
        receiveQRCode: qrData,
        transactionId: newTransactionId,
      });
    });
  };

  // Process incoming payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: (paymentId: string) => mockProcessIncomingPayment(paymentId),
    onSuccess: (result: {
      transactionId: string;
      paymentId: string;
      status: string;
    }) => {
      setTransactionId(result.transactionId);
      setPaymentReceived(true);
      setReceiveStatus("completed");

      toast({
        title: t("receive.paymentReceived"),
        description: t("receive.transactionIdResult", {
          transactionId: result.transactionId,
        }),
      });
    },
    onError: (error) => {
      console.error("Process payment failed:", error);
      setReceiveStatus("idle");
      toast({
        title: t("receive.processingFailed"),
        description: t("receive.processingFailedDesc"),
        variant: "destructive",
      });
    },
  });

  // Generate receive link mutation
  const generateLinkMutation = useMutation({
    mutationFn: (receiveData: PaymentRequest) =>
      mockGenerateReceiveLink(receiveData),
    onSuccess: (result: PaymentResponse) => {
      setReceiveLink(result?.receiveLink);
      setReceiveQRCode(result?.receiveQRCode);
      setTransactionId(result?.transactionId);
      setReceiveStatus("waiting");

      toast({
        title: t("receive.linkGenerated"),
        description: t("receive.linkGeneratedDesc"),
      });
    },
    onError: (error) => {
      console.error("Generate link failed:", error);
      toast({
        title: t("receive.linkGenerationFailed"),
        description: t("receive.linkGenerationFailedDesc"),
        variant: "destructive",
      });
    },
  });

  // State for receive form
  const [receiveAmount, setReceiveAmount] = useState("");
  const [receiveCurrency, setReceiveCurrency] = useState("USDT");
  const [receiveMethod, setReceiveMethod] = useState<"crypto" | "fiat">(
    "crypto"
  );
  const [walletAddress, setWalletAddress] = useState("");
  const [bankCardNumber, setBankCardNumber] = useState("");
  const [receiveLink, setReceiveLink] = useState("");
  const [receiveQRCode, setReceiveQRCode] = useState("");
  const [receiveStatus, setReceiveStatus] = useState<
    "idle" | "waiting" | "completed" | "expired"
  >("idle");
  const [transactionId, setTransactionId] = useState("");
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [paymentReceived, setPaymentReceived] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Check if accessing via payment link
  useEffect(() => {
    if (id) {
      // Simulate accessing a payment link
      processIncomingPayment(id);
    }
  }, [id]);

  const processIncomingPayment = (paymentId: string) => {
    setReceiveStatus("waiting");
    processPaymentMutation.mutate(paymentId);
  };

  const generateReceiveLink = () => {
    if (!receiveAmount) {
      // Removed non-API validation toast - this is client-side validation
      return;
    }

    if (receiveMethod === "crypto" && !walletAddress) {
      // Removed non-API validation toast - this is client-side validation
      return;
    }

    if (receiveMethod === "fiat" && !bankCardNumber) {
      // Removed non-API validation toast - this is client-side validation
      return;
    }

    generateLinkMutation.mutate({
      receiveAmount,
      receiveCurrency,
      receiveMethod,
      walletAddress,
      bankCardNumber,
    });
  };

  const copyReceiveLink = () => {
    navigator.clipboard.writeText(receiveLink);
    // Removed non-API copy toast
  };

  const resetReceiveForm = () => {
    setReceiveAmount("");
    setWalletAddress("");
    setBankCardNumber("");
    setReceiveLink("");
    setReceiveQRCode("");
    setReceiveStatus("idle");
    setTransactionId("");
    setPaymentReceived(false);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setBankCardNumber(formatted);
  };

  // If accessing via payment link, show payment processing page
  if (id && !paymentReceived) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Download className="h-5 w-5 mr-2" />
              {t("receive.processingPayment")}
            </CardTitle>
            <CardDescription>
              {t("receive.processingPaymentDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <RefreshCw className="h-12 w-12 animate-spin text-blue-600" />
            </div>
            <p className="text-muted-foreground">
              {t("receive.processingWait")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If payment completed via link
  if (id && paymentReceived) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md border-green-200">
          <CardHeader className="text-center bg-green-50">
            <CardTitle className="flex items-center justify-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              {t("receive.paymentDelivered")}
            </CardTitle>
            <CardDescription className="text-green-700">
              {t("receive.paymentDeliveredDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="text-center space-y-2">
              <Label className="text-sm font-medium">
                {t("send.transactionId")}
              </Label>
              <div className="flex space-x-2">
                <Input
                  value={transactionId}
                  readOnly
                  className="font-mono text-xs text-center"
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
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                ⚠️ {t("receive.linkBlocked")}
              </p>
            </div>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              {t("nav.back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold">{t("receive.title")}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-4xl">
        {/* Anonymity Disclaimer */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              {t("receive.anonymityDisclaimer")}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receive Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                {t("receive.requestPayment")}
              </CardTitle>
              <CardDescription>{t("receive.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount and Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receive-amount">
                    {t("receive.amountToReceive")}
                  </Label>
                  <Input
                    id="receive-amount"
                    placeholder="0.00"
                    value={receiveAmount}
                    onChange={(e) => setReceiveAmount(e.target.value)}
                    disabled={
                      generateLinkMutation.isPending ||
                      processPaymentMutation.isPending
                    }
                    className="text-lg font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.currency")}</Label>
                  <Select
                    value={receiveCurrency}
                    onValueChange={setReceiveCurrency}
                    disabled={
                      generateLinkMutation.isPending ||
                      processPaymentMutation.isPending
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">₮ USDT - Tether</SelectItem>
                      <SelectItem value="BTC">₿ BTC - Bitcoin</SelectItem>
                      <SelectItem value="ETH">Ξ ETH - Ethereum</SelectItem>
                      <SelectItem value="USD">🇺🇸 USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">🇪🇺 EUR - Euro</SelectItem>
                      <SelectItem value="GBP">
                        🇬🇧 GBP - British Pound
                      </SelectItem>
                      <SelectItem value="UZS">
                        🇺🇿 UZS - Uzbekistani Som
                      </SelectItem>
                      <SelectItem value="KZT">
                        🇰🇿 KZT - Kazakhstani Tenge
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Delivery Method */}
              <div className="space-y-4">
                <Label>Delivery Method</Label>
                <Tabs
                  value={receiveMethod}
                  onValueChange={setReceiveMethod as any}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="crypto">
                      <Wallet className="h-4 w-4 mr-2" />
                      Crypto Wallet
                    </TabsTrigger>
                    <TabsTrigger value="fiat">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Bank Card
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="crypto" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="wallet-address">Wallet Address</Label>
                      <Input
                        id="wallet-address"
                        placeholder="Enter your wallet address"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        disabled={
                          generateLinkMutation.isPending ||
                          processPaymentMutation.isPending
                        }
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your {receiveCurrency} wallet address to receive
                        funds
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="fiat" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Bank Card Number</Label>
                      <div className="relative">
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          value={bankCardNumber}
                          onChange={handleCardNumberChange}
                          disabled={
                            generateLinkMutation.isPending ||
                            processPaymentMutation.isPending
                          }
                          type={showCardNumber ? "text" : "password"}
                          maxLength={19}
                          className="font-mono"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCardNumber(!showCardNumber)}
                        >
                          {showCardNumber ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Funds will be converted and transferred to your bank
                        card
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateReceiveLink}
                className="w-full h-12"
                disabled={
                  generateLinkMutation.isPending ||
                  processPaymentMutation.isPending
                }
                size="lg"
              >
                {generateLinkMutation.isPending ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Generating Link...
                  </>
                ) : receiveStatus === "waiting" ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Waiting for Payment...
                  </>
                ) : (
                  <>
                    <QrCode className="h-5 w-5 mr-2" />
                    Generate Receive Link
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Panel */}
          <div className="space-y-6">
            {/* Payment Summary */}
            {receiveAmount && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Receive Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">
                      {receiveAmount} {receiveCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Delivery Method:
                    </span>
                    <span className="font-semibold capitalize">
                      {receiveMethod === "crypto"
                        ? "Crypto Wallet"
                        : "Bank Card"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Destination:</span>
                    <span className="font-semibold font-mono text-xs">
                      {receiveMethod === "crypto"
                        ? walletAddress
                          ? `${walletAddress.substring(
                              0,
                              8
                            )}...${walletAddress.slice(-8)}`
                          : "Not set"
                        : bankCardNumber
                        ? `****-****-****-${bankCardNumber.slice(-4)}`
                        : "Not set"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generated Link and QR */}
            {receiveLink && (
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50">
                  <div className="flex items-center">
                    <QrCode className="h-5 w-5 mr-2 text-blue-600" />
                    <CardTitle className="text-blue-800">
                      Receive Link Generated
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Transaction ID
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
                            // Removed non-API copy toast
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Payment Link
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          value={receiveLink}
                          readOnly
                          className="text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyReceiveLink}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ⚠️ Share this link to receive payment. Single-use only,
                        expires in 24 hours.
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <div className="text-center space-y-2">
                        <Label className="text-sm font-medium">QR Code</Label>
                        <div className="p-4 bg-white rounded-lg border">
                          <QRCodeSVG value={receiveQRCode} size={150} />
                        </div>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          Share this QR code for easy payment access. It becomes
                          invalid after first use.
                        </p>
                      </div>
                    </div>

                    {receiveStatus === "waiting" && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin text-blue-600" />
                          <span className="text-blue-700">
                            Waiting for payment...
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={resetReceiveForm}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Generate New Link
                      </Button>
                      <Button
                        onClick={() => navigate("/dashboard")}
                        className="flex-1"
                      >
                        Back to Dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                      All payments are processed anonymously. Generated links
                      are single-use only and expire in 24 hours. Keep your
                      transaction ID for support inquiries.
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

export default ReceivePage;
