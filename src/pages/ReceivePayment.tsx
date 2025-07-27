import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ReceivePayment = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
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
    toast({
      title: "Payment Received",
      description: "The funds have been transferred to your account.",
    });
  };

  if (!paymentDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Receive Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Amount: {paymentDetails.amount} {paymentDetails.currency}
          </p>
          <p>Status: {paymentDetails.status}</p>
          {paymentDetails.status === "pending" && (
            <Button onClick={handleReceivePayment} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Receive Funds"}
            </Button>
          )}
          {paymentDetails.status === "completed" && (
            <p className="text-green-500">
              Payment has been received successfully!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceivePayment;
