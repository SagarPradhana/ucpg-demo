import React, { useState, useEffect, useRef } from "react";
import { Bot, Minimize2, MessageCircle, Send, X, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";

interface Message {
  id: string;
  content: string;
  sender: "bot" | "user";
  timestamp: number;
}

interface SupportChatbotProps {
  /** Title displayed in the chatbot header */
  title?: string;
  /** Initial greeting message from the bot */
  greeting?: string;
  /** Placeholder text for the input field */
  placeholder?: string;
  /** Custom knowledge base to extend or replace the default one */
  customKnowledgeBase?: Record<string, Record<string, string>>;
  /** Message shown when no relevant response is found */
  fallbackMessage?: string;
  /** Position of the chatbot on the screen */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Custom icon for the chatbot trigger button */
  icon?: React.ReactNode;
  /** Accent color for the chatbot UI elements */
  accentColor?: string;
  /** Whether the chatbot should be initially open */
  initiallyOpen?: boolean;
  /** Optional callback when user sends a message */
  onUserMessage?: (message: string) => void;
  /** Optional callback to override the default bot response */
  getCustomResponse?: (message: string) => string | Promise<string>;
}

export const SupportChatbot: React.FC<SupportChatbotProps> = ({
  title = "Support Chat",
  greeting = "Hello! 👋 I'm your support assistant. How can I help you today?",
  placeholder = "Type your message here...",
  customKnowledgeBase,
  fallbackMessage,
  position = "bottom-right",
  icon = <MessageCircle size={24} />,
  accentColor = "#3b82f6", // Default blue color
  initiallyOpen = false,
  onUserMessage,
  getCustomResponse,
}) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { toast } = useToast();

  // Chatbot state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatOpen, setChatOpen] = useState(initiallyOpen);
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Default knowledge base for the chatbot
  const defaultKnowledgeBase = {
    general: {
      help: "I can help you with various topics. Just ask me a question about our services, account, or how to use specific features.",
      contact: "You can reach our support team via email at support@example.com or by phone at +1-800-123-4567 during business hours.",
      about: "We are a leading crypto payment gateway providing secure and fast cryptocurrency transactions for businesses and individuals.",
    },
    account: {
      login: "To log in, visit the login page and enter your email and password. If you've forgotten your password, use the 'Forgot Password' link.",
      signup: "To create a new account, click the 'Sign Up' button on the homepage and follow the registration steps.",
      security: "We recommend enabling two-factor authentication (2FA) for additional account security.",
    },
    payments: {
      send: "To send a payment, navigate to the Send page, enter the recipient's address, choose the currency, and specify the amount.",
      receive: "To receive payments, go to the Receive page and share your wallet address or QR code with the sender.",
      fees: "Our fee structure is transparent with competitive rates. Fees vary by payment method and transaction volume.",
    },
    dashboard: {
      overview: "The dashboard provides an overview of your account, including your balance, recent transactions, and quick access to key features.",
      balance: "Your balance is displayed prominently on the dashboard. It shows your available funds across different cryptocurrencies.",
      wallet: "Your wallet addresses are securely stored and can be accessed from the dashboard for receiving payments."
    },
    sending: {
      payment: "Our platform makes it easy to send payments to anyone, anywhere in the world using cryptocurrencies.",
      methods: "We support multiple payment methods including direct crypto transfers and email-based payments.",
      fees: "Our sending fees are competitive and transparent, with discounts available for larger transaction volumes."
    },
    receiving: {
      generate: "You can easily generate payment requests that can be shared with others.",
      links: "Create shareable payment links that can be sent via email, messaging apps, or social media.",
      qr: "Generate QR codes that others can scan to send you payments quickly and easily."
    },
    services: {
      exchange: "We offer cryptocurrency exchange services with competitive rates and low fees.",
      rates: "Our exchange rates are updated in real-time to ensure you get the best value for your transactions.",
      support: "Our support team is available to help with any questions about our services."
    },
    profile: {
      settings: "Manage your profile settings including notification preferences, language, and theme.",
      security: "We offer advanced security features including 2FA, email verification, and session management.",
      verification: "Account verification increases your limits and provides access to additional features."
    }
  };

  // Merge default and custom knowledge bases
  const knowledgeBase = customKnowledgeBase
    ? { ...defaultKnowledgeBase, ...customKnowledgeBase }
    : defaultKnowledgeBase;

  // Helper function to find relevant responses
  const findResponse = (query: string): string => {
    query = query.toLowerCase().trim();
    let response = "I'm sorry, I don't have information about that topic yet. Please try asking about dashboard, sending, receiving, services, or profile settings.";

    // Check for common greetings
    if (/^(hello|hi|hey|greetings|howdy)\b/i.test(query)) {
      return "Hello! I'm your CryptoFlow support assistant. I can help you with dashboard navigation, sending/receiving payments, services, and account management. What would you like to know?";
    }

    // Check for thanks
    if (/\b(thank|thanks|appreciate)\b/i.test(query)) {
      return "You're welcome! Is there anything else I can help you with?";
    }

    // Check for goodbye
    if (/\b(bye|goodbye|see you|talk later)\b/i.test(query)) {
      return "Goodbye! Feel free to come back if you have more questions.";
    }

    // Check for help
    if (/\b(help|assist)\b/i.test(query)) {
      return "I'm here to help! I can assist you with:\n• Dashboard and balance management\n• Sending crypto payments\n• Receiving payments and generating links\n• Exchange services and rates\n• Profile and security settings\n\nWhat specific topic would you like help with?";
    }

    // Score-based matching for knowledge base entries
    let bestMatch = { score: 0, response: "" };

    // Dashboard related queries
    if (
      query.includes("dashboard") ||
      query.includes("balance") ||
      query.includes("overview")
    ) {
      if (query.includes("balance")) return knowledgeBase.dashboard.balance;
      if (query.includes("wallet") || query.includes("address"))
        return knowledgeBase.dashboard.wallet;
      return knowledgeBase.dashboard.overview;
    }

    // Sending related queries
    if (
      query.includes("send") ||
      query.includes("payment") ||
      query.includes("pay")
    ) {
      if (query.includes("method") || query.includes("how"))
        return knowledgeBase.sending.methods;
      if (query.includes("fee") || query.includes("cost"))
        return knowledgeBase.sending.fees;
      return knowledgeBase.sending.payment;
    }

    // Receiving related queries
    if (
      query.includes("receive") ||
      query.includes("generate") ||
      query.includes("link")
    ) {
      if (query.includes("link")) return knowledgeBase.receiving.links;
      if (query.includes("qr") || query.includes("code"))
        return knowledgeBase.receiving.qr;
      return knowledgeBase.receiving.generate;
    }

    // Services related queries
    if (
      query.includes("service") ||
      query.includes("exchange") ||
      query.includes("rate")
    ) {
      if (query.includes("rate") || query.includes("price"))
        return knowledgeBase.services.rates;
      if (query.includes("support") || query.includes("help"))
        return knowledgeBase.services.support;
      return knowledgeBase.services.exchange;
    }

    // Profile related queries
    if (
      query.includes("profile") ||
      query.includes("account") ||
      query.includes("setting")
    ) {
      if (query.includes("security") || query.includes("2fa"))
        return knowledgeBase.profile.security;
      if (query.includes("verify") || query.includes("verification"))
        return knowledgeBase.profile.verification;
      return knowledgeBase.profile.settings;
    }

    // Default fallback
    return (
      "I understand you're asking about: \"" +
      query +
      "\". Let me help you with that. For detailed assistance, you can:\n\n• Ask about specific features (dashboard, send, receive, services)\n• Contact our support team at support@ucpg.com\n• Browse our help documentation\n\nIs there a specific area you'd like me to explain?"
    );
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle user message submission
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: "user",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Call the onUserMessage callback if provided
    onUserMessage?.(input.trim());

    // Bot response after a short delay for natural feel
    try {
      // Get response - either from custom handler or default
      let responseContent: string;

      if (getCustomResponse) {
        responseContent = await Promise.resolve(getCustomResponse(input.trim()));
      } else {
        responseContent = findResponse(input.trim());
      }

      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: responseContent,
          sender: "bot",
          timestamp: Date.now() + 1,
        };
        setMessages((prev) => [...prev, botResponse]);
      }, 600);
    } catch (error) {
      // Handle error and show error message
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: fallbackMessage || "Sorry, I encountered an error. Please try again later.",
          sender: "bot",
          timestamp: Date.now() + 1,
        };
        setMessages((prev) => [...prev, botResponse]);
      }, 600);
    }

    setInput("");
  };

  // Handle enter key press in input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid newline in input
      handleSend();
    }
  };

  // Toggle chatbot visibility
  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      className="chatbot-container"
      style={{
        position: "fixed",
        ...(position === "bottom-right" && { bottom: "20px", right: "20px" }),
        ...(position === "bottom-left" && { bottom: "20px", left: "20px" }),
        ...(position === "top-right" && { top: "20px", right: "20px" }),
        ...(position === "top-left" && { top: "20px", left: "20px" }),
        width: chatOpen ? "350px" : "60px",
        height: chatOpen ? "500px" : "60px",
        maxHeight: chatOpen ? "70vh" : "60px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        borderRadius: chatOpen ? "12px" : "50%",
        backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
        color: theme === "dark" ? "#f1f5f9" : "#1e293b",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, system-ui, sans-serif",
        zIndex: 9999,
        transition: "all 0.3s ease",
        overflow: "hidden"
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
              <span>{title}</span>
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
                    {greeting}
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
                  borderTop: `1px solid ${theme === "dark" ? "#334155" : "#e2e8f0"
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
                  placeholder={placeholder}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "20px",
                    border: `1px solid ${theme === "dark" ? "#334155" : "#cbd5e1"
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
              </div>

              <div style={{ flex: 1, minHeight: 200, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <p>Chart functionality is currently unavailable.</p>
              </div>

              <div className="text-xs text-muted-foreground flex items-center justify-between pt-2 border-t">
                <span className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Market data unavailable
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

// Only use the named export
// export default SupportChatbot;
