import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import {
  Bot,
  TrendingUp,
  RefreshCw,
  Minimize2,
  MessageCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

interface Message {
  id: string;
  content: string;
  sender: "bot" | "user";
  timestamp: number;
}

const SupportChatbot: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { toast } = useToast();

  // Chatbot state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Crypto chart state
  const [cryptoPriceData, setCryptoPriceData] = useState([
    { time: "1h", BTC: 42850, ETH: 2650, USDT: 1.0 },
    { time: "2h", BTC: 42920, ETH: 2645, USDT: 1.0 },
    { time: "3h", BTC: 43100, ETH: 2670, USDT: 1.0 },
    { time: "4h", BTC: 43050, ETH: 2690, USDT: 1.0 },
    { time: "5h", BTC: 43200, ETH: 2710, USDT: 1.0 },
  ]);
  const [cryptoTrend, setCryptoTrend] = useState<"up" | "down" | "neutral">(
    "neutral"
  );

  // Tab state: "chat" or "chart"
  const [activeTab, setActiveTab] = useState<"chat" | "chart">("chat");

  // Knowledge base for the chatbot
  const knowledgeBase = {
    dashboard: {
      overview:
        "The dashboard is your main control center where you can view your balance, monitor transactions, and access quick actions like Send, Receive, and Services.",
      balance:
        "Your balance is displayed prominently on the dashboard. It shows your current balance amount with real-time updates every 30 seconds.",
      wallet:
        "Your wallet address is shown in the dashboard. Click the 'Copy Address' button to copy it to clipboard or generate QR codes for easy sharing.",
    },
    sending: {
      payment:
        "To send a payment: 1) Go to Send page 2) Enter amount and select currencies 3) Choose payment method 4) Review and process payment",
      methods:
        "Available payment methods include Credit Card, Bank Transfer (SEPA), and Digital Wallets. Each method has different processing times and fees.",
      fees: "Our fee structure: Credit Card (2.5%), Bank Transfer (1.5%), Digital Wallet (2.0%). Network fees are additional and depend on blockchain congestion.",
    },
    receiving: {
      generate:
        "To receive payments: 1) Go to Receive page 2) Enter amount and select currency 3) Generate payment link or QR code 4) Share with sender",
      links:
        "Payment links are single-use and expire after 24 hours. They provide secure, anonymous transactions without revealing personal information.",
      qr: "QR codes contain all necessary payment information. Recipients can scan them with any crypto wallet or payment app.",
    },
    services: {
      exchange:
        "Our exchange service supports multiple cryptocurrencies (USDT, BTC, ETH) and fiat currencies (USD, EUR, GBP, UZS, KZT).",
      rates:
        "Exchange rates are updated in real-time and include a small service fee. Rates are locked for 15 minutes after quote generation.",
      support:
        "24/7 customer support is available via this chat, email (support@ucpg.com), or through our contact form.",
    },
    profile: {
      settings:
        "Manage your profile settings including personal information, security preferences, notification settings, and account preferences.",
      security:
        "Security features include 2FA, session management, login history, and device management for enhanced account protection.",
      verification:
        "Account verification helps increase your transaction limits and provides additional security for your account.",
    },
  };

  // Helper function to find relevant responses
  const findResponse = (message: string): string => {
    const msg = message.toLowerCase();

    // Dashboard related queries
    if (
      msg.includes("dashboard") ||
      msg.includes("balance") ||
      msg.includes("overview")
    ) {
      if (msg.includes("balance")) return knowledgeBase.dashboard.balance;
      if (msg.includes("wallet") || msg.includes("address"))
        return knowledgeBase.dashboard.wallet;
      return knowledgeBase.dashboard.overview;
    }

    // Sending related queries
    if (
      msg.includes("send") ||
      msg.includes("payment") ||
      msg.includes("pay")
    ) {
      if (msg.includes("method") || msg.includes("how"))
        return knowledgeBase.sending.methods;
      if (msg.includes("fee") || msg.includes("cost"))
        return knowledgeBase.sending.fees;
      return knowledgeBase.sending.payment;
    }

    // Receiving related queries
    if (
      msg.includes("receive") ||
      msg.includes("generate") ||
      msg.includes("link")
    ) {
      if (msg.includes("link")) return knowledgeBase.receiving.links;
      if (msg.includes("qr") || msg.includes("code"))
        return knowledgeBase.receiving.qr;
      return knowledgeBase.receiving.generate;
    }

    // Services related queries
    if (
      msg.includes("service") ||
      msg.includes("exchange") ||
      msg.includes("rate")
    ) {
      if (msg.includes("rate") || msg.includes("price"))
        return knowledgeBase.services.rates;
      if (msg.includes("support") || msg.includes("help"))
        return knowledgeBase.services.support;
      return knowledgeBase.services.exchange;
    }

    // Profile related queries
    if (
      msg.includes("profile") ||
      msg.includes("account") ||
      msg.includes("setting")
    ) {
      if (msg.includes("security") || msg.includes("2fa"))
        return knowledgeBase.profile.security;
      if (msg.includes("verify") || msg.includes("verification"))
        return knowledgeBase.profile.verification;
      return knowledgeBase.profile.settings;
    }

    // Default responses for common queries
    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
      return "Hello! I'm your UCPG support assistant. I can help you with dashboard navigation, sending/receiving payments, services, and account management. What would you like to know?";
    }

    if (msg.includes("help") || msg.includes("support")) {
      return "I'm here to help! I can assist you with:\n• Dashboard and balance management\n• Sending crypto payments\n• Receiving payments and generating links\n• Exchange services and rates\n• Profile and security settings\n\nWhat specific topic would you like help with?";
    }

    // Default fallback
    return (
      "I understand you're asking about: \"" +
      message +
      "\". Let me help you with that. For detailed assistance, you can:\n\n• Ask about specific features (dashboard, send, receive, services)\n• Contact our support team at support@ucpg.com\n• Browse our help documentation\n\nIs there a specific area you'd like me to explain?"
    );
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle user message submission
  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Bot response after a short delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: findResponse(input.trim()),
        sender: "bot",
        timestamp: Date.now() + 1,
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 500);

    setInput("");
  };

  // Handle enter key press in input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Mock API for refreshing crypto price data
  const mockRefreshCryptoPrices = (): Promise<any[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate new data points with slight variations
        const newData = [...cryptoPriceData];

        // Shift data and add a new point
        const shiftedData = [
          ...newData.slice(1),
          {
            time: `${parseInt(newData[newData.length - 1].time) + 1}h`,
            BTC: newData[newData.length - 1].BTC + (Math.random() - 0.5) * 200,
            ETH: newData[newData.length - 1].ETH + (Math.random() - 0.5) * 50,
            USDT: 1.0 + (Math.random() - 0.5) * 0.01,
          },
        ];

        resolve(shiftedData);
      }, 500);
    });
  };

  // Crypto price refresh mutation
  const refreshCryptoPricesMutation = useMutation({
    mutationFn: () => mockRefreshCryptoPrices(),
    onSuccess: (result) => {
      setCryptoPriceData(result);

      // Calculate trend based on BTC
      const lastIndex = result.length - 1;
      const secondLastIndex = lastIndex - 1;

      if (result[lastIndex].BTC > result[secondLastIndex].BTC) {
        setCryptoTrend("up");
      } else if (result[lastIndex].BTC < result[secondLastIndex].BTC) {
        setCryptoTrend("down");
      } else {
        setCryptoTrend("neutral");
      }
    },
    onError: (error) => {
      console.error("Crypto price refresh failed:", error);
      toast({
        title: "Update Failed",
        description: "Failed to refresh crypto prices",
        variant: "destructive",
      });
    },
  });

  // Auto-update crypto prices every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshCryptoPricesMutation.isPending) {
        refreshCryptoPricesMutation.mutate();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshCryptoPricesMutation]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: chatOpen ? "350px" : "60px",
        height: chatOpen ? "auto" : "60px",
        maxHeight: chatOpen ? "70vh" : "60px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        borderRadius: chatOpen ? "8px" : "50%",
        backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
        color: theme === "dark" ? "#f1f5f9" : "#1e293b",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, system-ui, sans-serif",
        zIndex: 9999,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <div
        style={{
          padding: chatOpen ? "10px 15px" : "0",
          backgroundColor: theme === "dark" ? "#1e293b" : "#3b82f6",
          color: theme === "dark" ? "#f1f5f9" : "#ffffff",
          fontWeight: "bold",
          fontSize: "16px",
          borderTopLeftRadius: chatOpen ? "8px" : "50%",
          borderTopRightRadius: chatOpen ? "8px" : "50%",
          borderBottomLeftRadius: chatOpen ? "0" : "50%",
          borderBottomRightRadius: chatOpen ? "0" : "50%",
          cursor: "pointer",
          userSelect: "none",
          display: "flex",
          justifyContent: chatOpen ? "space-between" : "center",
          alignItems: "center",
          width: "100%",
          height: chatOpen ? "auto" : "60px",
          transition: "all 0.3s ease-in-out",
        }}
        onClick={!chatOpen ? () => setChatOpen(true) : undefined}
      >
        {!chatOpen ? (
          <MessageCircle size={24} />
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Bot size={18} />
              <span>UCPG Support</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab("chat");
                  }}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor:
                      activeTab === "chat"
                        ? theme === "dark"
                          ? "#2563eb"
                          : "#1e40af"
                        : "transparent",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                >
                  Chat
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab("chart");
                  }}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor:
                      activeTab === "chart"
                        ? theme === "dark"
                          ? "#2563eb"
                          : "#1e40af"
                        : "transparent",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                >
                  Chart
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setChatOpen(false);
                }}
                style={{
                  padding: "4px",
                  borderRadius: "4px",
                  backgroundColor: "transparent",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Minimize"
              >
                <Minimize2 size={16} />
              </button>
            </div>
          </>
        )}
      </div>
      {chatOpen && (
        <>
          {activeTab === "chat" && (
            <>
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "10px 15px",
                  backgroundColor: theme === "dark" ? "#0f172a" : "#f8fafc",
                  color: theme === "dark" ? "#f1f5f9" : "#1e293b",
                }}
              >
                {messages.length === 0 && (
                  <div
                    style={{
                      fontStyle: "italic",
                      color: theme === "dark" ? "#94a3b8" : "#64748b",
                    }}
                  >
                    Hello! 👋 I'm your UCPG support assistant. I can help you
                    with dashboard navigation, payments, exchanges, and account
                    management. How can I assist you today?
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent:
                        msg.sender === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "8px 12px",
                        borderRadius: "15px",
                        backgroundColor:
                          msg.sender === "user"
                            ? "#3b82f6"
                            : theme === "dark"
                            ? "#334155"
                            : "#e2e8f0",
                        color:
                          msg.sender === "user"
                            ? "#ffffff"
                            : theme === "dark"
                            ? "#f1f5f9"
                            : "#1e293b",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div
                style={{
                  padding: "10px 15px",
                  borderTop: `1px solid ${
                    theme === "dark" ? "#334155" : "#e2e8f0"
                  }`,
                  backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about UCPG..."
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "20px",
                    border: `1px solid ${
                      theme === "dark" ? "#334155" : "#cbd5e1"
                    }`,
                    backgroundColor: theme === "dark" ? "#0f172a" : "#f8fafc",
                    color: theme === "dark" ? "#f1f5f9" : "#1e293b",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleSend}
                  style={{
                    marginLeft: "10px",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    backgroundColor: "#3b82f6",
                    color: "#ffffff",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  Send
                </button>
              </div>
            </>
          )}
          {activeTab === "chart" && (
            <div
              style={{
                padding: "10px 15px",
                backgroundColor: theme === "dark" ? "#0f172a" : "#f8fafc",
                color: theme === "dark" ? "#f1f5f9" : "#1e293b",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-sm">Crypto Price Bot</h4>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => refreshCryptoPricesMutation.mutate()}
                  disabled={refreshCryptoPricesMutation.isPending}
                >
                  <RefreshCw
                    className={`h-3 w-3 ${
                      refreshCryptoPricesMutation.isPending
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                </Button>
              </div>

              <div style={{ flex: 1, minHeight: 200 }}>
                <ChartContainer
                  config={{
                    BTC: {
                      label: "Bitcoin",
                      theme: {
                        light: "#F7931A",
                        dark: "#F7931A",
                      },
                    },
                    ETH: {
                      label: "Ethereum",
                      theme: {
                        light: "#627EEA",
                        dark: "#627EEA",
                      },
                    },
                    USDT: {
                      label: "Tether",
                      theme: {
                        light: "#26A17B",
                        dark: "#26A17B",
                      },
                    },
                  }}
                >
                  <LineChart data={cryptoPriceData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      tick={{ fontSize: 10 }}
                      width={30}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="BTC"
                      stroke="var(--color-BTC)"
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="ETH"
                      stroke="var(--color-ETH)"
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="USDT"
                      stroke="var(--color-USDT)"
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>

              <div className="text-xs text-muted-foreground flex items-center justify-between pt-2 border-t">
                <span className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {cryptoTrend === "up"
                    ? "Market trending up"
                    : cryptoTrend === "down"
                    ? "Market trending down"
                    : "Market stable"}
                </span>
                <span>Updated {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SupportChatbot;
