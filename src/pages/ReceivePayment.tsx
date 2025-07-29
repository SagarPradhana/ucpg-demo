import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const ReceivePayment = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Fetch payment details from your backend
    const fetchPaymentDetails = async () => {
      // This is a mock implementation. Replace with actual API call.
      setPaymentDetails({
        amount: "100",
        currency: "USD",
        status: "pending",
      });
    };

    fetchPaymentDetails();
  }, [id]);

  const handleReceivePayment = async () => {
    setIsProcessing(true);
    // This is where you'd integrate with your backend to process the payment
    // For now, we'll simulate the process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setPaymentDetails((prev: any) => ({ ...prev, status: "completed" }));
    setIsProcessing(false);
    // Removed mock payment success toast - not a real API call
  };

  if (!paymentDetails) {
    return <div>{t("common.loading")}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("receive.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            {t("receive.amount")}: {paymentDetails.amount} {paymentDetails.currency}
          </p>
          <p>{t("profile.status")}: {paymentDetails.status}</p>
          {paymentDetails.status === "pending" && (
            <Button onClick={handleReceivePayment} disabled={isProcessing}>
              {isProcessing ? t("common.processing") : t("receive.receiveFunds")}
            </Button>
          )}
          {paymentDetails.status === "completed" && (
            <p className="text-green-500">
              {t("receive.paymentReceived")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceivePayment;
