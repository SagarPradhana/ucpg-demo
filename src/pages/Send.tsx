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
import CurrencyDropdown from "@/components/CurrencyDropdown";
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

  // Payment confirmation polling
  const [isAwaitingPayment, setIsAwaitingPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

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

  // Check authentication and test API connectivity
  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    if (!token) {
      navigate("/login");
      return;
    }

    // Test ChangeNOW API connectivity
    const testApi = async () => {
      try {
        const isConnected = await changeNowService.testApiConnectivity();
        if (!isConnected) {
          toast({
            title: "API Connection Warning",
            description:
              "Unable to connect to ChangeNOW API. Some features may not work properly.",
            variant: "destructive",
          });
        } else {
          console.log("✅ ChangeNOW API connectivity successful");

          // Test the exact format from your curl request
          try {
            // Import the test utility dynamically to avoid breaking the build
            const { testChangeNowApiCall, testChangeNowApiCallExact } =
              await import("@/utils/testChangeNowApi");

            // Test with to_network parameter (recommended)
            console.log("🧪 Testing with to_network parameter...");
            const testEstimate1 = await testChangeNowApiCall();
            console.log(
              "✅ Fiat estimate test (with to_network) successful:",
              testEstimate1
            );

            // Test without to_network parameter (matches exact curl)
            console.log(
              "🧪 Testing without to_network parameter (exact curl)..."
            );
            const testEstimate2 = await testChangeNowApiCallExact();
            console.log(
              "✅ Fiat estimate test (exact curl) successful:",
              testEstimate2
            );
          } catch (estimateError) {
            console.warn("⚠️ Fiat estimate test failed:", estimateError);

            // Fallback to service method test
            try {
              const testEstimate = await changeNowService.testFiatEstimate({
                from_currency: "INR",
                from_amount: 1900,
                to_currency: "USDT",
                to_network: "ETH",
                deposit_type: "SEPA_1",
                payout_type: "SEPA_1",
              });
              console.log(
                "✅ Fallback fiat estimate test successful:",
                testEstimate
              );
            } catch (fallbackError) {
              console.error(
                "❌ All fiat estimate tests failed:",
                fallbackError
              );
            }
          }
        }
      } catch (error) {
        console.warn("API connectivity test failed:", error);
      }
    };

    testApi();
  }, [navigate, toast]);

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

  // Ensure crypto network is valid when crypto currency changes
  useEffect(() => {
    if (
      availableNetworks.length > 0 &&
      !availableNetworks.includes(cryptoNetwork)
    ) {
      setCryptoNetwork(availableNetworks[0]);
    }
  }, [cryptoCurrency, availableNetworks, cryptoNetwork]);

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
        getEnhancedEstimate();
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [fiatAmount, fiatCurrency, cryptoCurrency, cryptoNetwork, paymentMethod]);

  // Enhanced rate estimation with network fees
  const getEnhancedEstimate = async () => {
    if (!fiatAmount || isNaN(Number(fiatAmount))) return;

    console.log("Getting enhanced estimate with params:", {
      fiatAmount: Number(fiatAmount),
      fiatCurrency,
      cryptoCurrency,
      cryptoNetwork,
      paymentMethod,
    });

    setIsEstimating(true);
    try {
      const amount = Number(fiatAmount);
      const finalAmounts = changeNowService.calculateFinalAmounts(
        amount,
        fiatCurrency
      );

      // Ensure we have a valid crypto network
      if (!cryptoNetwork) {
        toast({
          title: t("send.error"),
          description: "Please select a valid crypto network",
          variant: "destructive",
        });
        return;
      }

      // Get fiat estimate
      console.log("Requesting fiat estimate with:", {
        from_currency: fiatCurrency,
        from_amount: finalAmounts.netAmount,
        to_currency: cryptoCurrency,
        to_network: cryptoNetwork,
        deposit_type: paymentMethod,
        payout_type: paymentMethod,
      });

      const estimate = await changeNowService.getFiatEstimate({
        from_currency: fiatCurrency,
        from_amount: finalAmounts.netAmount,
        to_currency: cryptoCurrency,
        to_network: cryptoNetwork,
        deposit_type: paymentMethod,
        payout_type: paymentMethod,
      });

      console.log("Fiat estimate received:", estimate);

      // Get market info for additional details and validation
      try {
        const marketInfo = (await changeNowService.getMarketInfo(
          fiatCurrency,
          cryptoCurrency,
          undefined, // fromNetwork for fiat is undefined
          cryptoNetwork
        )) as any;

        console.log("Market info:", marketInfo);

        // Validate if the current amount is within the allowed range
        if (
          marketInfo?.minAmount &&
          finalAmounts?.netAmount < marketInfo?.minAmount
        ) {
          toast({
            title: t("send.error"),
            description: `Minimum amount is ${marketInfo.minAmount} ${fiatCurrency}`,
            variant: "destructive",
          });
          return;
        }

        if (
          marketInfo.maxAmount &&
          finalAmounts.netAmount > marketInfo.maxAmount
        ) {
          toast({
            title: t("send.error"),
            description: `Maximum amount is ${marketInfo.maxAmount} ${fiatCurrency}`,
            variant: "destructive",
          });
          return;
        }
      } catch (marketError) {
        console.warn("Could not fetch market info:", marketError);
        // Continue with estimation even if market info fails
      }

      // Get optimal exchange rate with fees
      try {
        const optimalRate = await changeNowService.getOptimalExchangeRate(
          fiatCurrency,
          cryptoCurrency,
          finalAmounts.netAmount,
          undefined, // fromNetwork for fiat is undefined
          cryptoNetwork
        );

        setPaymentFlowData((prev) => ({
          ...prev,
          ...finalAmounts,
          estimatedCryptoAmount: optimalRate.estimatedAmount,
          exchangeRate: optimalRate.rate,
          networkFee: optimalRate.networkFee,
          serviceFee: optimalRate.serviceFee,
        }));
      } catch (rateError) {
        console.warn(
          "Could not get optimal rate, using basic estimate:",
          rateError
        );

        setPaymentFlowData((prev) => ({
          ...prev,
          ...finalAmounts,
          estimatedCryptoAmount: estimate.toAmount,
          exchangeRate: estimate.toAmount / finalAmounts.netAmount,
        }));
      }
    } catch (error) {
      console.error("Error getting enhanced estimate:", error);
      const errorInfo = changeNowService.handleApiError(error);

      toast({
        title: t("send.error"),
        description: errorInfo.message,
        variant: "destructive",
      });
    } finally {
      setIsEstimating(false);
    }
  };

  // Create fiat transaction
  const createFiatTransactionMutation = useMutation({
    mutationFn: async () => {
      const netAmount = Number(fiatAmount) - paymentFlowData.commission;
      const transactionData = {
        from_amount: netAmount,
        from_currency: fiatCurrency,
        to_currency: cryptoCurrency,
        to_network: cryptoNetwork,
        payout_address: "temp_address", // Temporary address - will convert to USDC first
        deposit_type: paymentMethod,
        payout_type: paymentMethod,
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
      setCurrentStep("fiat_payment");
      setShowQRModal(true);
      setIsAwaitingPayment(true);

      // Start monitoring the fiat transaction for payment confirmation
      startFiatPaymentMonitoring(transaction.id);

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
        // Create fiat transaction directly after amount selection
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
        return 16; // 1/6 steps
      case "fiat_payment":
        return 33; // 2/6 steps
      case "payment_confirmation":
        return 50; // 3/6 steps
      case "wallet_input":
        return 66; // 4/6 steps
      case "crypto_conversion":
        return 83; // 5/6 steps
      case "completed":
        return 100; // 6/6 steps
      default:
        return 0;
    }
  };

  // Get available payment methods from service
  const getPaymentMethods = () => {
    const methods = changeNowService.getSupportedPaymentMethods();
    return methods.map((method) => ({
      ...method,
      label: method.label.includes("SEPA")
        ? t("send.sepaTransfer")
        : method.label.includes("Card")
        ? t("send.cardPayment")
        : method.label.includes("Wire")
        ? t("send.bankWire")
        : method.label,
    }));
  };

  // Transaction monitoring
  const startTransactionMonitoring = (
    transactionId: string,
    type: "fiat" | "exchange" = "fiat"
  ) => {
    changeNowService
      .monitorTransactionWithPolling(
        transactionId,
        type,
        (status, data) => {
          console.log("Transaction status update:", status, data);

          // Update progress based on status
          switch (status) {
            case "waiting":
            case "confirming":
              setPaymentProgress(25);
              break;
            case "processing":
            case "exchanging":
              setPaymentProgress(50);
              break;
            case "sending":
              setPaymentProgress(75);
              break;
            case "finished":
            case "completed":
              setPaymentProgress(100);
              setCurrentStep("completed");
              toast({
                title: "Payment Completed",
                description: `Transaction ${transactionId} has been completed successfully.`,
              });
              break;
            case "failed":
            case "expired":
              toast({
                title: "Payment Failed",
                description: `Transaction ${transactionId} has failed. Please try again.`,
                variant: "destructive",
              });
              break;
          }
        },
        30, // 30 attempts max
        10000 // 10 seconds interval
      )
      .catch((error) => {
        console.error("Transaction monitoring failed:", error);
        toast({
          title: "Monitoring Error",
          description:
            "Could not monitor transaction status. Please check manually.",
          variant: "destructive",
        });
      });
  };

  // Fiat payment monitoring (specifically for payment confirmation)
  const startFiatPaymentMonitoring = (transactionId: string) => {
    changeNowService
      .monitorTransactionWithPolling(
        transactionId,
        "fiat",
        (status, data) => {
          console.log("Fiat payment status update:", status, data);

          // Update progress based on fiat payment status
          switch (status) {
            case "waiting":
            case "new":
              setPaymentProgress(10);
              break;
            case "waiting_for_deposit":
              setPaymentProgress(25);
              break;
            case "confirming":
              setPaymentProgress(50);
              break;
            case "confirmed":
            case "deposited":
              setPaymentProgress(75);
              setPaymentConfirmed(true);
              setIsAwaitingPayment(false);
              setCurrentStep("payment_confirmation");
              setShowQRModal(false);
              toast({
                title: "Payment Received",
                description:
                  "Your fiat payment has been confirmed. Please enter your crypto wallet address.",
              });
              break;
            case "failed":
            case "expired":
            case "cancelled":
              setIsAwaitingPayment(false);
              toast({
                title: "Payment Failed",
                description: `Fiat payment ${transactionId} has failed or expired. Please try again.`,
                variant: "destructive",
              });
              break;
          }
        },
        60, // 60 attempts max (5 minutes with 5s interval)
        5000 // 5 seconds interval
      )
      .catch((error) => {
        console.error("Fiat payment monitoring failed:", error);
        setIsAwaitingPayment(false);
        toast({
          title: "Monitoring Error",
          description:
            "Could not monitor payment status. Please check manually.",
          variant: "destructive",
        });
      });
  };

  // Wallet address validation mutation
  const validateAddressMutation = useMutation({
    mutationFn: async (address: string) => {
      return await changeNowService.validateAddress(
        cryptoCurrency.toLowerCase(),
        address
      );
    },
    onSuccess: (result) => {
      setIsAddressValid(result.result);
      if (result.result) {
        toast({
          title: t("send.addressValid"),
          description: "Wallet address is valid and ready for transaction.",
        });
      } else {
        toast({
          title: t("send.addressInvalid"),
          description: result.message || "Please check your wallet address.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("Address validation error:", error);
      setIsAddressValid(false);
      toast({
        title: t("send.error"),
        description: "Could not validate address. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create exchange transaction (crypto conversion after fiat payment)
  const createExchangeTransactionMutation = useMutation({
    mutationFn: async () => {
      if (!fiatTransaction || !walletAddress) {
        throw new Error("Missing transaction data or wallet address");
      }

      const exchangeData = {
        fromCurrency: "usdc", // Assuming ChangeNOW converts fiat to USDC first
        toCurrency: cryptoCurrency.toLowerCase(),
        fromNetwork: "eth",
        toNetwork: cryptoNetwork.toLowerCase(),
        fromAmount: (
          fiatTransaction.fromAmount - paymentFlowData.commission
        ).toString(),
        toAmount: "",
        address: walletAddress,
        extraId: "",
        refundAddress: "",
        refundExtraId: "",
        userId: "",
        payload: JSON.stringify({
          originalFiatTxId: fiatTransaction.id,
          originalAmount: fiatTransaction.fromAmount,
          commission: paymentFlowData.commission,
        }),
        contactEmail: "anonymous@ucpg.com",
        source: "ucpg",
        flow: "standard",
        type: "direct",
        rateId: "",
      };

      return await changeNowService.createExchangeTransaction(
        exchangeData as any
      );
    },
    onSuccess: (exchangeTransaction) => {
      setExchangeTransaction(exchangeTransaction);
      setCurrentStep("crypto_conversion");

      // Start monitoring the exchange transaction
      startExchangeMonitoring(exchangeTransaction.id);

      toast({
        title: "Crypto Conversion Started",
        description: `Exchange transaction ${exchangeTransaction.id} has been created.`,
      });
    },
    onError: (error) => {
      console.error("Exchange transaction creation failed:", error);
      const errorInfo = changeNowService.handleApiError(error);

      toast({
        title: "Conversion Failed",
        description: errorInfo.message,
        variant: "destructive",
      });
    },
  });

  // Exchange transaction monitoring
  const startExchangeMonitoring = (transactionId: string) => {
    changeNowService
      .monitorTransactionWithPolling(
        transactionId,
        "exchange",
        (status, data) => {
          console.log("Exchange transaction status update:", status, data);

          switch (status) {
            case "new":
            case "waiting":
              setPaymentProgress(80);
              break;
            case "confirming":
            case "exchanging":
              setPaymentProgress(85);
              break;
            case "sending":
              setPaymentProgress(95);
              break;
            case "finished":
            case "completed":
              setPaymentProgress(100);
              setCurrentStep("completed");
              toast({
                title: "Transaction Completed!",
                description: `Your crypto has been sent to your wallet. Transaction ID: ${transactionId}`,
              });
              break;
            case "failed":
            case "refunded":
              toast({
                title: "Exchange Failed",
                description: `Exchange transaction ${transactionId} has failed. Your funds will be refunded.`,
                variant: "destructive",
              });
              break;
          }
        },
        40, // 40 attempts max (about 3-4 minutes)
        5000 // 5 seconds interval
      )
      .catch((error) => {
        console.error("Exchange monitoring failed:", error);
        toast({
          title: "Monitoring Error",
          description:
            "Could not monitor exchange status. Please check manually.",
          variant: "destructive",
        });
      });
  };

  // Handle wallet address submission
  const handleWalletSubmission = () => {
    if (!walletAddress) {
      toast({
        title: "Address Required",
        description: "Please enter your crypto wallet address.",
        variant: "destructive",
      });
      return;
    }

    if (isAddressValid === false) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid wallet address before proceeding.",
        variant: "destructive",
      });
      return;
    }

    // Create the exchange transaction
    createExchangeTransactionMutation.mutate();
  };

  // Auto-validate address when it changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (walletAddress && walletAddress.length > 10) {
        validateAddressMutation.mutate(walletAddress);
      } else {
        setIsAddressValid(null);
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [walletAddress]);

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
              <span className="text-sm font-medium">
                {t("send.paymentProgress")}
              </span>
              <span className="text-sm text-muted-foreground">
                {getStepProgress()}%
              </span>
            </div>
            <Progress value={getStepProgress()} className="mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("send.amountLabel")}</span>
              <span>{t("send.paymentLabel")}</span>
              <span>{t("send.walletLabel")}</span>
              <span>{t("send.convertLabel")}</span>
              <span>{t("send.doneLabel")}</span>
            </div>
            {paymentProgress > 0 && paymentProgress < 100 && (
              <div className="mt-2 text-center">
                <p className="text-sm text-muted-foreground">
                  {paymentProgress <= 25
                    ? t("send.waitingForConfirmation")
                    : paymentProgress <= 50
                    ? t("send.paymentInProgress")
                    : paymentProgress <= 75
                    ? t("send.conversionStarted")
                    : t("send.fundsSent")}
                </p>
              </div>
            )}
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
                    {t("send.configurePayment")}
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
                      <CurrencyDropdown
                        currencies={fiatCurrencies}
                        selectedValue={fiatCurrency}
                        onSelect={setFiatCurrency}
                        placeholder="Select local currency"
                        disabled={loadingFiatCurrencies || isEstimating}
                        type="fiat"
                      />
                    </div>
                  </div>

                  {/* Crypto Currency and Network */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("send.cryptoCurrency")}</Label>
                      <CurrencyDropdown
                        currencies={cryptoCurrencies}
                        selectedValue={cryptoCurrency}
                        onSelect={(value) => {
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
                        placeholder="Select cryptocurrency"
                        disabled={loadingCryptoCurrencies || isEstimating}
                        type="crypto"
                      />
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
                        <SelectContent
                          position="popper"
                          side="bottom"
                          align="start"
                          className="dropdown-bottom"
                        >
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
                      <SelectContent
                        position="popper"
                        side="bottom"
                        align="start"
                        className="dropdown-bottom"
                      >
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
                          onClick={getEnhancedEstimate}
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
                        {paymentFlowData.networkFee &&
                          paymentFlowData.networkFee > 0 && (
                            <div>
                              <span className="text-muted-foreground">
                                Network Fee
                              </span>
                              <p className="font-semibold">
                                {paymentFlowData.networkFee.toFixed(4)}{" "}
                                {cryptoCurrency}
                              </p>
                            </div>
                          )}
                        {paymentFlowData.serviceFee &&
                          paymentFlowData.serviceFee > 0 && (
                            <div>
                              <span className="text-muted-foreground">
                                Service Fee
                              </span>
                              <p className="font-semibold">
                                {paymentFlowData.serviceFee.toFixed(2)}{" "}
                                {fiatCurrency}
                              </p>
                            </div>
                          )}
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

            {/* Step 2: Fiat Payment */}
            {currentStep === "fiat_payment" && fiatTransaction && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 animate-pulse" />
                    {t("send.paymentStep2")}
                  </CardTitle>
                  <CardDescription>
                    Complete your fiat payment using the details below
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t("send.paymentRequired")}</AlertTitle>
                    <AlertDescription>
                      {t("send.paymentInstructions")} Transaction ID:{" "}
                      {fiatTransaction.id}
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
                          ~{paymentFlowData.estimatedCryptoAmount.toFixed(6)}{" "}
                          {cryptoCurrency}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold mb-2">Payment Instructions</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {isAwaitingPayment
                        ? "Waiting for your payment..."
                        : "Click below to view payment details"}
                    </p>
                    <Button
                      onClick={() => setShowQRModal(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      {isAwaitingPayment
                        ? "Show Payment QR Code"
                        : "View Payment Details"}
                    </Button>
                  </div>

                  {isAwaitingPayment && (
                    <div className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      <p className="text-sm">
                        {t("send.monitoringPaymentStatus")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment Confirmation */}
            {currentStep === "payment_confirmation" && paymentConfirmed && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    {t("send.paymentConfirmed")}
                  </CardTitle>
                  <CardDescription>
                    {t("send.paymentSuccessMessage")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Payment Confirmed</AlertTitle>
                    <AlertDescription>
                      We have received your payment. Please enter your{" "}
                      {cryptoCurrency} wallet address to receive your crypto.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={() => setCurrentStep("wallet_input")}
                    className="w-full"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Enter Wallet Address
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Wallet Address Input */}
            {currentStep === "wallet_input" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    {t("send.enterWalletAddress")}
                  </CardTitle>
                  <CardDescription>
                    {t("send.enterWalletAddress")}
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
                        onClick={() =>
                          validateAddressMutation.mutate(walletAddress)
                        }
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
                      onClick={() => setCurrentStep("payment_confirmation")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleWalletSubmission}
                      disabled={
                        !walletAddress ||
                        !isAddressValid ||
                        createExchangeTransactionMutation.isPending
                      }
                      className="flex-1"
                    >
                      {createExchangeTransactionMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Starting Conversion...
                        </>
                      ) : (
                        "Convert & Send Crypto"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Crypto Conversion */}
            {currentStep === "crypto_conversion" && exchangeTransaction && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Coins className="h-5 w-5 mr-2 animate-pulse" />
                    {t("send.conversionInProgress")}
                  </CardTitle>
                  <CardDescription>
                    {t("send.processingConversion")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Conversion in Progress</AlertTitle>
                    <AlertDescription>
                      Exchange Transaction ID: {exchangeTransaction.id}
                      <br />
                      Estimated completion: 5-15 minutes
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>Converting to:</span>
                      <span className="font-semibold">
                        {cryptoCurrency} on {cryptoNetwork}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>Destination:</span>
                      <span className="font-mono text-sm">
                        {walletAddress?.slice(0, 10)}...
                        {walletAddress?.slice(-10)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    <p className="text-sm">{t("send.processingConversion")}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Completed */}
            {currentStep === "completed" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    {t("send.transactionCompleted")}
                  </CardTitle>
                  <CardDescription>
                    {t("send.paymentSuccessMessage")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>
                      Your transaction has been completed successfully. The
                      crypto has been sent to your wallet.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Amount Paid
                          </span>
                          <p className="font-semibold">
                            {paymentFlowData.fiatAmount}{" "}
                            {paymentFlowData.fiatCurrency}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Commission
                          </span>
                          <p className="font-semibold">
                            {paymentFlowData.commission.toFixed(2)}{" "}
                            {paymentFlowData.fiatCurrency}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Crypto Received
                          </span>
                          <p className="font-semibold text-green-700">
                            {paymentFlowData.estimatedCryptoAmount.toFixed(6)}{" "}
                            {cryptoCurrency}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Network</span>
                          <p className="font-semibold">{cryptoNetwork}</p>
                        </div>
                      </div>
                    </div>

                    {fiatTransaction && (
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">
                          Fiat Transaction ID
                        </span>
                        <p className="font-mono text-sm">
                          {fiatTransaction.id}
                        </p>
                      </div>
                    )}

                    {exchangeTransaction && (
                      <div className="p-3 bg-muted rounded-lg">
                        <span className="text-sm text-muted-foreground">
                          Exchange Transaction ID
                        </span>
                        <p className="font-mono text-sm">
                          {exchangeTransaction.id}
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">
                        Destination Wallet
                      </span>
                      <p className="font-mono text-sm break-all">
                        {walletAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="flex-1"
                    >
                      {t("send.startNewPayment")}
                    </Button>
                    <Button
                      onClick={() => navigate("/dashboard")}
                      className="flex-1"
                    >
                      {t("send.backToDashboard")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("send.paymentSummary")}
                </CardTitle>
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
                  {t("send.securityNotice")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.anonymityDisclaimer")}
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
