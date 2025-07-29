import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
}

const mockServices: Service[] = [
  {
    id: "1",
    name: "VPN Service",
    description: "Secure and anonymous browsing",
    price: "9.99",
    currency: "USD",
  },
  {
    id: "2",
    name: "Game Pass",
    description: "Access to premium games",
    price: "14.99",
    currency: "USD",
  },
  {
    id: "3",
    name: "Cloud Storage",
    description: "Encrypted cloud storage",
    price: "4.99",
    currency: "USD",
  },
];

const ServicesSection: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [services] = useState<Service[]>(mockServices);

  const handlePurchase = (service: Service) => {
    // This is where you'd integrate with your backend to process the payment and connect to the service API
    // Removed non-API mock purchase toast

    // Simulate redirection to service
    setTimeout(() => {
      window.open(`https://example.com/service/${service.id}`, "_blank");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("services.availableServices")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-4">
                {service.price} {service.currency}
              </p>
              <Button
                onClick={() => handlePurchase(service)}
                className="w-full"
              >
                {t("services.purchaseAnonymously")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServicesSection;
