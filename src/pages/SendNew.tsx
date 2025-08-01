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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Send,
  RefreshCw,
  CheckCircle,
  CreditCard,
  Copy,
  Shield,
  ArrowLeft,
  Coins,
  Wallet,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  MapPin,
  Loader2,
  QrCode,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ChangeNowService from "@/service/changeNowService";
import {
  ChangeNowFiatCurrency,
  ChangeNowCryptoCurrency,
  PaymentStep,
  PaymentFlowData,
  ChangeNowFiatTransaction,
  ChangeNowExchangeTransaction,
} from "@/types";

const SendPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const changeNowService = ChangeNowService.getInstance();

  // Payment flow state
  const [currentStep, setCurrentStep] =
    useState<PaymentStep["step"]>("amount_selection");
  const [paymentFlowData, setPaymentFlowData] = useState<PaymentFlowData>({
    fiatAmount: 0,
    fiatCurrency: "USD",
    cryptoCurrency: "USDT",
    cryptoNetwork: "ETH",
    paymentMethod: "card",
    commission: 0,
    estimatedCryptoAmount: 0,
    exchangeRate: 0,
  });

  // Form state
  const [fiatAmount, setFiatAmount] = useState("");
  const [fiatCurrency, setFiatCurrency] = useState("USD");
  const [cryptoCurrency, setCryptoCurrency] = useState("USDT");
  const [cryptoNetwork, setCryptoNetwork] = useState("ETH");
  const [paymentMethod, setPaymentMethod] = useState("SEPA_1");
  const [walletAddress, setWalletAddress] = useState("");
  const [isAddressValid, setIsAddressValid] = useState<boolean | null>(null);

  // Transaction state
  const [fiatTransaction, setFiatTransaction] =
    useState<ChangeNowFiatTransaction | null>(null);
  const [exchangeTransaction, setExchangeTransaction] =
    useState<ChangeNowExchangeTransaction | null>(null);
  const [qrCodeData, setQrCodeData] = useState("");
  const [paymentLink, setPaymentLink] = useState("");

  // UI state
  const [isEstimating, setIsEstimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState(0);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch available currencies
  const { data: fiatCurrencies = [], isLoading: loadingFiatCurrencies } =
    useQuery({
      queryKey: ["fiatCurrencies"],
      queryFn: () => changeNowService.getFiatCurrencies(),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  const { data: cryptoCurrencies = [], isLoading: loadingCryptoCurrencies } =
    useQuery({
      queryKey: ["cryptoCurrencies"],
      queryFn: () => changeNowService.getCryptoCurrencies(),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // Available networks for selected crypto currency
  const availableNetworks = cryptoCurrencies
    .filter((crypto) => crypto.ticker.toUpperCase() === cryptoCurrency)
    .map((crypto) => crypto.network)
    .filter((network, index, self) => self.indexOf(network) === index);

  // Exchange rate estimation
  const estimateExchangeRate = async () => {
    if (!fiatAmount || isNaN(Number(fiatAmount))) return;

    setIsEstimating(true);
    try {
      const amount = Number(fiatAmount);
      const commission = changeNowService.calculateCommission(
        amount,
        fiatCurrency
      );
      const netAmount = changeNowService.calculateAmountAfterCommission(
        amount,
        fiatCurrency
      );

      // Get estimate from ChangeNOW
      const estimate = await changeNowService.getFiatEstimate({
        from_currency: fiatCurrency,
        from_amount: netAmount,
        to_currency: cryptoCurrency,
        to_network: cryptoNetwork,
        deposit_type: paymentMethod,
        payout_type: paymentMethod,
      });

      const exchangeRate = estimate.toAmount / netAmount;

      setPaymentFlowData((prev) => ({
        ...prev,
        fiatAmount: amount,
        fiatCurrency,
        cryptoCurrency,
        cryptoNetwork,
        paymentMethod,
        commission,
        estimatedCryptoAmount: estimate.toAmount,
        exchangeRate,
      }));
    } catch (error) {
      console.error("Error estimating exchange rate:", error);
      toast({
        title: t("send.error"),
        description: "Failed to get exchange rate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEstimating(false);
    }
  };

  // Auto-refresh rates when inputs change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (fiatAmount && Number(fiatAmount) > 0) {
        estimateExchangeRate();
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [fiatAmount, fiatCurrency, cryptoCurrency, cryptoNetwork, paymentMethod]);

  // Create fiat transaction
  const createFiatTransactionMutation = useMutation({
    mutationFn: async () => {
      const transactionData = {
        from_amount: paymentFlowData.fiatAmount - paymentFlowData.commission,
        from_currency: paymentFlowData.fiatCurrency,
        to_currency: paymentFlowData.cryptoCurrency,
        to_network: paymentFlowData.cryptoNetwork,
        payout_address: walletAddress,
        deposit_type: paymentFlowData.paymentMethod,
        payout_type: paymentFlowData.paymentMethod,
        customer: {
          contact_info: {
            email: "anonymous@ucpg.com", // Use anonymous email
          },
        },
      };

      return changeNowService.createFiatTransaction(transactionData);
    },
    onSuccess: (transaction) => {
      setFiatTransaction(transaction);
      const qrData = changeNowService.generateQRCodeData(
        transaction.id,
        transaction.fromAmount,
        transaction.fromCurrency
      );
      const link = changeNowService.generatePaymentLink(transaction.id);

      setQrCodeData(qrData);
      setPaymentLink(link);
      setCurrentStep("payment_processing");
      setShowQRModal(true);

      toast({
        title: t("send.paymentCreated"),
        description: `Transaction ID: ${transaction.id}`,
      });
    },
    onError: (error) => {
      console.error("Error creating fiat transaction:", error);
      toast({
        title: t("send.error"),
        description: "Failed to create payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Validate wallet address
  const validateAddressMutation = useMutation({
    mutationFn: (address: string) =>
      changeNowService.validateAddress(cryptoCurrency.toLowerCase(), address),
    onSuccess: (result) => {
      setIsAddressValid(result.result);
      if (result.result) {
        toast({
          title: t("send.addressValid"),
          description: "Wallet address is valid",
        });
      } else {
        toast({
          title: t("send.addressInvalid"),
          description: result.message || "Invalid wallet address",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Error validating address:", error);
      setIsAddressValid(false);
      toast({
        title: t("send.error"),
        description: "Could not validate address. Please check and try again.",
        variant: "destructive",
      });
    },
  });

  // Handle wallet address validation
  const handleValidateAddress = () => {
    if (walletAddress.trim()) {
      validateAddressMutation.mutate(walletAddress.trim());
    }
  };

  // Handle step navigation
  const handleNextStep = () => {
    switch (currentStep) {
      case "amount_selection":
        if (!fiatAmount || Number(fiatAmount) <= 0) {
          toast({
            title: t("send.enterValidAmount"),
            variant: "destructive",
          });
          return;
        }
        setCurrentStep("wallet_input");
        break;

      case "wallet_input":
        if (!walletAddress || !isAddressValid) {
          toast({
            title: t("send.addressInvalid"),
            description: "Please enter a valid wallet address",
            variant: "destructive",
          });
          return;
        }
        createFiatTransactionMutation.mutate();
        break;
    }
  };

  const handleReset = () => {
    setCurrentStep("amount_selection");
    setFiatAmount("");
    setWalletAddress("");
    setIsAddressValid(null);
    setFiatTransaction(null);
    setExchangeTransaction(null);
    setQrCodeData("");
    setPaymentLink("");
    setShowQRModal(false);
    setPaymentProgress(0);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("common.copy"),
      description: `${label} copied to clipboard`,
    });
  };

  // Get step progress
  const getStepProgress = () => {
    switch (currentStep) {
      case "amount_selection":
        return 25;
      case "wallet_input":
        return 50;
      case "payment_processing":
        return 75;
      case "completed":
        return 100;
      default:
        return 0;
    }
  };

  // Get available payment methods
  const getPaymentMethods = () => [
    { value: "SEPA_1", label: t("send.sepaTransfer"), icon: "🏦" },
    { value: "card", label: t("send.cardPayment"), icon: "💳" },
    { value: "bank_wire", label: t("send.bankWire"), icon: "🏛️" },
  ];

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

      <div className="container mx-auto p-6 max-w-6xl">
        {/* Progress Indicator */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Payment Progress</span>
              <span className="text-sm text-muted-foreground">
                {getStepProgress()}%
              </span>
            </div>
            <Progress value={getStepProgress()} className="mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Amount</span>
              <span>Wallet</span>
              <span>Payment</span>
              <span>Complete</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Amount Selection */}
            {currentStep === "amount_selection" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    {t("send.paymentStep1")}
                  </CardTitle>
                  <CardDescription>
                    Configure your payment amount and currencies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Amount and Fiat Currency */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">{t("send.amount")}</Label>
                      <Input
                        id="amount"
                        placeholder="0.00"
                        value={fiatAmount}
                        onChange={(e) => setFiatAmount(e.target.value)}
                        className="text-lg font-semibold"
                        disabled={isEstimating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("send.localCurrency")}</Label>
                      <Select
                        value={fiatCurrency}
                        onValueChange={setFiatCurrency}
                        disabled={loadingFiatCurrencies || isEstimating}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fiatCurrencies.map((currency) => (
                            <SelectItem
                              key={currency.ticker}
                              value={currency.ticker}
                            >
                              {currency.ticker} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Crypto Currency and Network */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("send.cryptoCurrency")}</Label>
                      <Select
                        value={cryptoCurrency}
                        onValueChange={(value) => {
                          setCryptoCurrency(value);
                          // Reset network when crypto changes
                          const networks = cryptoCurrencies
                            .filter(
                              (crypto) => crypto.ticker.toUpperCase() === value
                            )
                            .map((crypto) => crypto.network);
                          if (
                            networks.length > 0 &&
                            !networks.includes(cryptoNetwork)
                          ) {
                            setCryptoNetwork(networks[0]);
                          }
                        }}
                        disabled={loadingCryptoCurrencies || isEstimating}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            new Set(
                              cryptoCurrencies.map((c) =>
                                c.ticker.toUpperCase()
                              )
                            )
                          ).map((ticker) => (
                            <SelectItem key={ticker} value={ticker}>
                              {ticker} -{" "}
                              {
                                cryptoCurrencies.find(
                                  (c) => c.ticker.toUpperCase() === ticker
                                )?.name
                              }
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("send.selectNetwork")}</Label>
                      <Select
                        value={cryptoNetwork}
                        onValueChange={setCryptoNetwork}
                        disabled={availableNetworks.length <= 1 || isEstimating}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableNetworks.map((network) => (
                            <SelectItem key={network} value={network}>
                              {network}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Payment Method */}
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
                        {getPaymentMethods().map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.icon} {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Exchange Rate Display */}
                  {paymentFlowData.exchangeRate > 0 && (
                    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">
                          {t("send.exchangeRate")}
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={estimateExchangeRate}
                          disabled={isEstimating}
                        >
                          {isEstimating ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-1" />
                          )}
                          {t("send.refreshRate")}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Commission (
                            {changeNowService.getCommissionRate(fiatCurrency)}%)
                          </span>
                          <p className="font-semibold">
                            {paymentFlowData.commission.toFixed(2)}{" "}
                            {fiatCurrency}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Net Amount
                          </span>
                          <p className="font-semibold">
                            {(
                              paymentFlowData.fiatAmount -
                              paymentFlowData.commission
                            ).toFixed(2)}{" "}
                            {fiatCurrency}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Exchange Rate
                          </span>
                          <p className="font-semibold">
                            1 {fiatCurrency} ={" "}
                            {paymentFlowData.exchangeRate.toFixed(8)}{" "}
                            {cryptoCurrency}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            You will receive
                          </span>
                          <p className="font-semibold text-green-600">
                            {paymentFlowData.estimatedCryptoAmount.toFixed(8)}{" "}
                            {cryptoCurrency}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleNextStep}
                    className="w-full"
                    disabled={
                      !fiatAmount || Number(fiatAmount) <= 0 || isEstimating
                    }
                  >
                    Continue to Wallet Address
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Wallet Address Input */}
            {currentStep === "wallet_input" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    {t("send.paymentStep3")}
                  </CardTitle>
                  <CardDescription>
                    Enter your crypto wallet address to receive the funds
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">
                      {t("send.walletAddress")}
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="walletAddress"
                        placeholder={`Enter your ${cryptoCurrency} wallet address`}
                        value={walletAddress}
                        onChange={(e) => {
                          setWalletAddress(e.target.value);
                          setIsAddressValid(null);
                        }}
                        className={
                          isAddressValid === true
                            ? "border-green-500"
                            : isAddressValid === false
                            ? "border-red-500"
                            : ""
                        }
                      />
                      <Button
                        onClick={handleValidateAddress}
                        disabled={
                          !walletAddress || validateAddressMutation.isPending
                        }
                        variant="outline"
                      >
                        {validateAddressMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        {t("send.validateAddress")}
                      </Button>
                    </div>
                    {isAddressValid === true && (
                      <p className="text-sm text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t("send.addressValid")}
                      </p>
                    )}
                    {isAddressValid === false && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {t("send.addressInvalid")}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("amount_selection")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      disabled={
                        !walletAddress ||
                        !isAddressValid ||
                        createFiatTransactionMutation.isPending
                      }
                      className="flex-1"
                    >
                      {createFiatTransactionMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating Payment...
                        </>
                      ) : (
                        "Create Payment"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment Processing */}
            {currentStep === "payment_processing" && fiatTransaction && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    {t("send.paymentStep2")}
                  </CardTitle>
                  <CardDescription>
                    Complete your payment using the details below
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Payment Required</AlertTitle>
                    <AlertDescription>
                      Complete the payment to proceed with the crypto
                      conversion. Transaction ID: {fiatTransaction.id}
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount to Pay</Label>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-lg font-bold">
                          {fiatTransaction.fromAmount}{" "}
                          {fiatTransaction.fromCurrency}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>You will receive</Label>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-lg font-bold text-green-700">
                          {fiatTransaction.toAmount}{" "}
                          {fiatTransaction.toCurrency}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions would go here based on payment method */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold mb-2">Payment Instructions</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Follow the payment instructions sent to your email or use
                      the QR code below.
                    </p>
                    <Button
                      onClick={() => setShowQRModal(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Show QR Code
                    </Button>
                  </div>

                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full"
                  >
                    Start New Payment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentFlowData.fiatAmount > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold">
                        {paymentFlowData.fiatAmount}{" "}
                        {paymentFlowData.fiatCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commission</span>
                      <span className="font-semibold text-red-600">
                        -{paymentFlowData.commission.toFixed(2)}{" "}
                        {paymentFlowData.fiatCurrency}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Amount</span>
                      <span className="font-semibold">
                        {(
                          paymentFlowData.fiatAmount -
                          paymentFlowData.commission
                        ).toFixed(2)}{" "}
                        {paymentFlowData.fiatCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">You receive</span>
                      <span className="font-semibold text-green-600">
                        {paymentFlowData.estimatedCryptoAmount.toFixed(8)}{" "}
                        {paymentFlowData.cryptoCurrency}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This platform ensures your anonymity. No personal data is
                  collected or stored. All transactions use anonymous
                  identifiers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* QR Code Modal */}
        <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Payment QR Code</DialogTitle>
              <DialogDescription>
                Scan this QR code to complete your payment
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              {qrCodeData && (
                <QRCodeSVG
                  value={qrCodeData}
                  size={200}
                  className="border rounded-lg p-2"
                />
              )}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Transaction ID: {fiatTransaction?.id}
                </p>
                {paymentLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(paymentLink, "Payment Link")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Payment Link
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SendPage;
