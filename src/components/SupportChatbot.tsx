import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";

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

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "350px",
        maxHeight: "70vh",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        borderRadius: "8px",
        backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
        color: theme === "dark" ? "#f1f5f9" : "#1e293b",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, system-ui, sans-serif",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          padding: "10px 15px",
          backgroundColor: theme === "dark" ? "#1e293b" : "#3b82f6",
          color: theme === "dark" ? "#f1f5f9" : "#ffffff",
          fontWeight: "bold",
          fontSize: "16px",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setChatOpen(!chatOpen)}
      >
        {chatOpen
          ? "🤖 UCPG Support - Click to Minimize"
          : "💬 Need help? Chat with our AI assistant!"}
      </div>
      {chatOpen && (
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
                Hello! 👋 I'm your UCPG support assistant. I can help you with
                dashboard navigation, payments, exchanges, and account
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
                border: `1px solid ${theme === "dark" ? "#334155" : "#cbd5e1"}`,
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
    </div>
  );
};

export default SupportChatbot;
