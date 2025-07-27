import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const ReceivePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  // State for receive form
  const [receiveAmount, setReceiveAmount] = useState("");
  const [receiveCurrency, setReceiveCurrency] = useState("USDT");
  const [receiveMethod, setReceiveMethod] = useState("crypto"); // crypto or fiat
  const [walletAddress, setWalletAddress] = useState("");
  const [bankCardNumber, setBankCardNumber] = useState("");
  const [receiveLink, setReceiveLink] = useState("");
  const [receiveQRCode, setReceiveQRCode] = useState("");
  const [receiveStatus, setReceiveStatus] = useState("idle"); // idle, waiting, completed, expired
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

  const processIncomingPayment = async (paymentId: string) => {
    setReceiveStatus("waiting");

    // Simulate payment processing
    setTimeout(() => {
      const newTransactionId = Math.random()
        .toString(36)
        .substr(2, 12)
        .toUpperCase();
      setTransactionId(newTransactionId);
      setPaymentReceived(true);
      setReceiveStatus("completed");

      toast({
        title: "Payment Received",
        description: `Funds have been delivered anonymously. Transaction ID: ${newTransactionId}`,
      });
    }, 2000);
  };

  const generateReceiveLink = () => {
    if (!receiveAmount) {
      toast({
        title: "Error",
        description: "Please enter an amount to receive.",
        variant: "destructive",
      });
      return;
    }

    if (receiveMethod === "crypto" && !walletAddress) {
      toast({
        title: "Error",
        description: "Please enter your wallet address.",
        variant: "destructive",
      });
      return;
    }

    if (receiveMethod === "fiat" && !bankCardNumber) {
      toast({
        title: "Error",
        description: "Please enter your bank card number.",
        variant: "destructive",
      });
      return;
    }

    // Generate receive link and QR code
    const uniqueId = Math.random().toString(36).substr(2, 16);
    const link = `${window.location.origin}/receive/${uniqueId}`;
    const qrData = JSON.stringify({
      id: uniqueId,
      amount: receiveAmount,
      currency: receiveCurrency,
      method: receiveMethod,
      destination:
        receiveMethod === "crypto"
          ? walletAddress
          : `****${bankCardNumber.slice(-4)}`,
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      singleUse: true,
    });

    setReceiveLink(link);
    setReceiveQRCode(qrData);
    setReceiveStatus("waiting");

    const newTransactionId = Math.random()
      .toString(36)
      .substr(2, 12)
      .toUpperCase();
    setTransactionId(newTransactionId);

    toast({
      title: "Receive Link Generated",
      description:
        "Share this link or QR code to receive payment. It's valid for 24 hours and single-use only.",
    });
  };

  const copyReceiveLink = () => {
    navigator.clipboard.writeText(receiveLink);
    toast({
      title: "Link Copied",
      description: "Receive payment link copied to clipboard.",
    });
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
              Processing Payment
            </CardTitle>
            <CardDescription>
              Your payment is being processed anonymously
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center">
              <RefreshCw className="h-12 w-12 animate-spin text-blue-600" />
            </div>
            <p className="text-muted-foreground">
              Please wait while we deliver your funds securely...
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
              Payment Delivered
            </CardTitle>
            <CardDescription className="text-green-700">
              Funds have been delivered anonymously
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="text-center space-y-2">
              <Label className="text-sm font-medium">Transaction ID</Label>
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
                    toast({ title: "Transaction ID Copied" });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                ⚠️ This payment link is now blocked and cannot be used again.
              </p>
            </div>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Back to Dashboard
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
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold">Receive Payment</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-4xl">
        {/* Anonymity Disclaimer */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Generate a secure link or QR code to receive anonymous payments.
              All transfers are processed anonymously and links are single-use
              only.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receive Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                Request Payment
              </CardTitle>
              <CardDescription>
                Create a secure link to receive anonymous payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount and Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receive-amount">Amount to Receive</Label>
                  <Input
                    id="receive-amount"
                    placeholder="0.00"
                    value={receiveAmount}
                    onChange={(e) => setReceiveAmount(e.target.value)}
                    disabled={receiveStatus === "waiting"}
                    className="text-lg font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={receiveCurrency}
                    onValueChange={setReceiveCurrency}
                    disabled={receiveStatus === "waiting"}
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
                <Tabs value={receiveMethod} onValueChange={setReceiveMethod}>
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
                        disabled={receiveStatus === "waiting"}
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
                          disabled={receiveStatus === "waiting"}
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
                disabled={receiveStatus === "waiting"}
                size="lg"
              >
                {receiveStatus === "waiting" ? (
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
                            toast({ title: "Transaction ID Copied" });
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
