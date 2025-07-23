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
  CheckCircle,
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">UCPG</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in">
          <Badge variant="secondary" className="text-sm">
            Global • Anonymous • Instant
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Universal Crypto
            <br />
            <span className="text-primary">Payment Gateway</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pay in your local currency, receive anonymous cryptocurrency
            payments. Connecting the world through seamless crypto transactions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="group">
                Start Trading
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose UCPG?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the future of global payments with our innovative crypto
            gateway
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center hover-scale animate-fade-in">
            <CardHeader>
              <div className="bg-blue-100 dark:bg-blue-900/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Global Access</CardTitle>
              <CardDescription>
                Accept payments from 190+ countries in their local currencies
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover-scale animate-fade-in">
            <CardHeader>
              <div className="bg-green-100 dark:bg-green-900/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Anonymous & Secure</CardTitle>
              <CardDescription>
                Complete privacy with encrypted transactions and anonymous
                crypto receipts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover-scale animate-fade-in">
            <CardHeader>
              <div className="bg-purple-100 dark:bg-purple-900/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Instant Processing</CardTitle>
              <CardDescription>
                Lightning-fast transactions with real-time currency conversion
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">
              Simple, secure, and anonymous in just 3 steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 animate-fade-in">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold">Choose Currency</h3>
              <p className="text-muted-foreground">
                Select your local currency and enter the payment amount
              </p>
            </div>

            <div className="text-center space-y-4 animate-fade-in">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold">Process Payment</h3>
              <p className="text-muted-foreground">
                Complete the payment using your preferred local payment method
              </p>
            </div>

            <div className="text-center space-y-4 animate-fade-in">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold">Receive Crypto</h3>
              <p className="text-muted-foreground">
                Get anonymous cryptocurrency instantly in your wallet
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto space-y-8 animate-fade-in">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground">
            Join thousands of users who trust UCPG for their crypto payment
            needs
          </p>
          <Link to="/login">
            <Button size="lg" className="group">
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
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
              <span className="font-bold">UCPG</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Universal Crypto Payment Gateway. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
