import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Filter,
  ExternalLink,
  Shield,
  Gamepad2,
  Monitor,
  Globe,
  ShoppingBag,
  Star,
  Clock,
  Users,
  CheckCircle,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { loginActions } from "@/store/loginReducer";
import { debugToken } from "@/utils/debugToken";
import { servicesApi, handleApiError } from "@/utils/api";

interface DecodedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  metadata: any;
  is_active: boolean;
  timezone: number;
  exp: number;
}

interface Service {
  id: string;
  name: string;
  category: "games" | "software" | "vpn" | "digital_goods" | "other";
  description: string;
  price: number;
  currency: string;
  rating: number;
  totalUsers: number;
  provider: string;
  thumbnail: string;
  tags: string[];
  features: string[];
  apiEndpoint?: string;
  redirectUrl?: string;
  isPopular?: boolean;
  isNew?: boolean;
  discount?: number;
}

// Mock services data
const mockServices: Service[] = [
  {
    id: "steam-games",
    name: "Steam Game Keys",
    category: "games",
    description: "Access to premium Steam game keys with instant delivery",
    price: 29.99,
    currency: "USDT",
    rating: 4.8,
    totalUsers: 15420,
    provider: "GameHub Pro",
    thumbnail: "/api/placeholder/300/200",
    tags: ["Instant", "Premium", "Popular"],
    features: [
      "Instant delivery",
      "24/7 support",
      "Lifetime access",
      "Multiple platforms",
    ],
    redirectUrl: "https://steamgames-provider.com/auth",
    isPopular: true,
  },
  {
    id: "premium-vpn",
    name: "Premium VPN Access",
    category: "vpn",
    description:
      "Anonymous VPN service with global servers and unlimited bandwidth",
    price: 9.99,
    currency: "USDT",
    rating: 4.9,
    totalUsers: 28350,
    provider: "SecureNet VPN",
    thumbnail: "/api/placeholder/300/200",
    tags: ["Anonymous", "Global", "Unlimited"],
    features: [
      "50+ countries",
      "No logs policy",
      "Unlimited bandwidth",
      "Multiple devices",
    ],
    apiEndpoint: "/api/vpn/access",
    isPopular: true,
  },
  {
    id: "design-software",
    name: "Creative Design Suite",
    category: "software",
    description:
      "Professional design software with all premium features unlocked",
    price: 49.99,
    currency: "USDT",
    rating: 4.7,
    totalUsers: 8920,
    provider: "CreativeTech",
    thumbnail: "/api/placeholder/300/200",
    tags: ["Professional", "Creative", "Premium"],
    features: [
      "All premium tools",
      "Cloud storage",
      "Templates library",
      "Video tutorials",
    ],
    redirectUrl: "https://creativetech.com/premium",
    discount: 20,
  },
  {
    id: "digital-courses",
    name: "Crypto Trading Courses",
    category: "digital_goods",
    description:
      "Complete cryptocurrency trading masterclass with expert guidance",
    price: 199.99,
    currency: "USDT",
    rating: 4.6,
    totalUsers: 5430,
    provider: "CryptoAcademy",
    thumbnail: "/api/placeholder/300/200",
    tags: ["Education", "Expert", "Comprehensive"],
    features: [
      "10+ hours content",
      "Live sessions",
      "Trading signals",
      "Community access",
    ],
    apiEndpoint: "/api/courses/access",
    isNew: true,
  },
  {
    id: "streaming-service",
    name: "Premium Streaming",
    category: "digital_goods",
    description:
      "Access to premium streaming content worldwide with 4K quality",
    price: 15.99,
    currency: "USDT",
    rating: 4.5,
    totalUsers: 12780,
    provider: "StreamMax",
    thumbnail: "/api/placeholder/300/200",
    tags: ["4K Quality", "Worldwide", "Premium"],
    features: [
      "4K streaming",
      "Multiple devices",
      "Offline downloads",
      "Family sharing",
    ],
    redirectUrl: "https://streammax.com/premium",
  },
  {
    id: "cloud-storage",
    name: "Secure Cloud Storage",
    category: "software",
    description:
      "Encrypted cloud storage with unlimited space and privacy protection",
    price: 19.99,
    currency: "USDT",
    rating: 4.8,
    totalUsers: 9650,
    provider: "CloudSafe",
    thumbnail: "/api/placeholder/300/200",
    tags: ["Encrypted", "Unlimited", "Secure"],
    features: [
      "End-to-end encryption",
      "Unlimited storage",
      "File versioning",
      "Team collaboration",
    ],
    apiEndpoint: "/api/storage/access",
  },
];

const Services = () => {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [filteredServices, setFilteredServices] =
    useState<Service[]>(mockServices);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const userProfile = useSelector((store: any) => store.auth.userDetails);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Load user data from token when component mounts
  useEffect(() => {
    const loadUserFromToken = () => {
      if (userProfile) {
        setIsLoadingUser(false);
        return;
      }

      const token = localStorage.getItem("sessionToken");
      if (token) {
        try {
          const decodedUser = jwtDecode<DecodedUser>(token);

          const currentTime = Date.now() / 1000;
          if (decodedUser.exp > currentTime) {
            dispatch(loginActions.setUserDetails(decodedUser));
            setIsLoadingUser(false);
          } else {
            localStorage.removeItem("sessionToken");
            navigate("/login");
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem("sessionToken");
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    };

    loadUserFromToken();

    if (process.env.NODE_ENV === "development") {
      debugToken();
    }
  }, [dispatch, navigate, userProfile]);

  // Filter services based on search and category
  useEffect(() => {
    let filtered = services;

    if (searchQuery) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          service.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (service) => service.category === selectedCategory
      );
    }

    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, services]);

  const handleServiceAccess = async (service: Service) => {
    setIsLoading(true);

    try {
      // Prepare payment data
      const paymentData = {
        serviceId: service.id,
        amount: service.price,
        currency: service.currency,
        timestamp: Date.now(),
      };

      // Handle different access methods
      if (service.redirectUrl) {
        // For external redirects, simulate payment and redirect
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast({
          title: t("services.accessGranted"),
          description: t("services.accessGrantedDesc", {
            serviceName: service.name,
          }),
        });

        // Redirect to external service
        window.open(service.redirectUrl, "_blank");
      } else if (service.apiEndpoint) {
        // Handle API-based access with real API calls
        let apiResponse;

        if (service.category === "vpn") {
          apiResponse = await servicesApi.accessVpn(service.id, paymentData);
        } else if (
          service.category === "digital_goods" &&
          service.name.includes("Courses")
        ) {
          apiResponse = await servicesApi.accessCourse(service.id, paymentData);
        } else if (
          service.category === "software" &&
          service.name.includes("Storage")
        ) {
          apiResponse = await servicesApi.accessStorage(
            service.id,
            paymentData
          );
        } else {
          // Generic service access
          apiResponse = await servicesApi.accessService(
            service.id,
            paymentData
          );
        }

        toast({
          title: t("services.accessGranted"),
          description: t("services.accessGrantedDesc", {
            serviceName: service.name,
          }),
        });

        console.log(`API Access granted for ${service.name}:`, apiResponse);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      const errorMessage = handleApiError(error);

      toast({
        title: t("services.accessFailed"),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "games":
        return <Gamepad2 className="h-5 w-5" />;
      case "software":
        return <Monitor className="h-5 w-5" />;
      case "vpn":
        return <Globe className="h-5 w-5" />;
      case "digital_goods":
        return <ShoppingBag className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const categories = [
    { id: "all", name: t("services.allServices") },
    { id: "games", name: t("services.games") },
    { id: "software", name: t("services.software") },
    { id: "vpn", name: t("services.vpn") },
    { id: "digital_goods", name: t("services.digitalGoods") },
  ];

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">
            {t("services.loadingServices")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("services.back")}</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t("services.title")}</h1>
              <p className="text-muted-foreground">{t("services.subtitle")}</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>{t("services.anonymous")}</span>
          </Badge>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("services.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                {category.id !== "all" && getCategoryIcon(category.id)}
                <span>{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="relative overflow-hidden hover:shadow-lg transition-shadow"
            >
              {service.isPopular && (
                <Badge className="absolute top-2 left-2 z-10 bg-orange-500 hover:bg-orange-600">
                  {t("services.popular")}
                </Badge>
              )}
              {service.isNew && (
                <Badge className="absolute top-2 left-2 z-10 bg-green-500 hover:bg-green-600">
                  {t("services.new")}
                </Badge>
              )}
              {service.discount && (
                <Badge className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600">
                  -{service.discount}%
                </Badge>
              )}

              <div className="aspect-video bg-muted relative">
                <img
                  src={service.thumbnail}
                  alt={service.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (
                      e.target as HTMLImageElement
                    ).src = `https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop&crop=center`;
                  }}
                />
                <div className="absolute top-2 left-2">
                  {getCategoryIcon(service.category)}
                </div>
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {service.provider}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {service.price} {service.currency}
                    </p>
                    {service.discount && (
                      <p className="text-sm text-muted-foreground line-through">
                        {(service.price / (1 - service.discount / 100)).toFixed(
                          2
                        )}{" "}
                        {service.currency}
                      </p>
                    )}
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {service.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{service.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{service.totalUsers.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {service.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {t("services.features")}:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handleServiceAccess(service)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>{t("services.processing")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4" />
                      <span>{t("services.accessNow")}</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {t("services.noResults")}
            </h3>
            <p className="text-muted-foreground">
              {t("services.noResultsDesc")}
            </p>
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">
                  {t("services.anonymousPayments")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("services.anonymousPaymentsDesc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Services;
