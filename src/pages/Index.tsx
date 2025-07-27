import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  Shield,
  Globe,
  Zap,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="fixed w-full z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">{t("app.title")}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">{t("auth.signIn")}</Button>
              </Link>
              <Link to="/login">
                <Button>{t("home.hero.getStarted")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
            <Badge variant="secondary" className="text-sm">
              {t("home.hero.badge")}
            </Badge>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tighter">
              {t("home.hero.title")}
              <br />
              <span className="text-primary bg-clip-text  bg-gradient-to-r from-primary to-primary-light">
                {t("home.hero.titleHighlight")}
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("home.hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="group">
                  {t("home.hero.startTrading")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                {t("home.hero.learnMore")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              {t("home.features.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("home.features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              }
              title={t("home.features.globalAccess")}
              description={t("home.features.globalAccessDesc")}
              color="blue"
            />
            <FeatureCard
              icon={
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              }
              title={t("home.features.anonymousSecure")}
              description={t("home.features.anonymousSecureDesc")}
              color="green"
            />
            <FeatureCard
              icon={
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              }
              title={t("home.features.instantProcessing")}
              description={t("home.features.instantProcessingDesc")}
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              {t("home.howItWorks.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("home.howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title={t("home.howItWorks.step1.title")}
              description={t("home.howItWorks.step1.desc")}
            />
            <StepCard
              number={2}
              title={t("home.howItWorks.step2.title")}
              description={t("home.howItWorks.step2.desc")}
            />
            <StepCard
              number={3}
              title={t("home.howItWorks.step3.title")}
              description={t("home.howItWorks.step3.desc")}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold">{t("home.cta.title")}</h2>
            <p className="text-primary-foreground/80">
              {t("home.cta.subtitle")}
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="group">
                {t("home.cta.startJourney")}
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold">{t("app.title")}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("home.footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }) => (
  <Card className="text-center hover:shadow-lg transition-shadow duration-300 animate-fade-in">
    <CardHeader>
      <div
        className={`bg-${color}-100 dark:bg-${color}-900/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4`}
      >
        {icon}
      </div>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription>{description}</CardDescription>
    </CardContent>
  </Card>
);

const StepCard = ({ number, title, description }) => (
  <div className="text-center space-y-4 animate-fade-in">
    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
      <span className="text-2xl font-bold text-primary">{number}</span>
    </div>
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;
