import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle,
  X,
  Minimize2,
  Search,
  Send,
  ThumbsUp,
  ThumbsDown,
  Bot,
  User,
  HelpCircle,
  ArrowRight,
  Lightbulb,
  ChevronRight,
  Home,
  BarChart3,
  CreditCard,
  Download,
  Settings,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  helpful?: boolean;
}

interface KnowledgeItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  relatedPages?: string[];
}

const SupportChatbot: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentView, setCurrentView] = useState<
    "chat" | "categories" | "search"
  >("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Comprehensive knowledge base covering all non-auth pages
  const knowledgeBase: KnowledgeItem[] = [
    // Dashboard Help
    {
      id: "dashboard-overview",
      question: "How do I use the dashboard?",
      answer:
        "The dashboard is your main control center. Here you can:\n• View your total balance and recent changes\n• Monitor active payments and pending confirmations\n• Access quick actions (Send, Receive, Services)\n• View recent transactions\n• Copy your wallet address\n• Navigate to all platform features",
      category: "dashboard",
      keywords: ["dashboard", "balance", "overview", "wallet", "transactions"],
      relatedPages: ["/dashboard"],
    },
    {
      id: "balance-check",
      question: "How do I check my balance?",
      answer:
        'Your balance is displayed prominently on the dashboard main page. The "Total Balance" card shows:\n• Current balance amount\n• Percentage change from last month\n• Real-time updates every 30 seconds\n• Click the refresh button for manual updates',
      category: "dashboard",
      keywords: ["balance", "check", "total", "amount", "refresh"],
      relatedPages: ["/dashboard"],
    },
    {
      id: "wallet-address",
      question: "How do I find my wallet address?",
      answer:
        'Your wallet address is shown in the dashboard:\n• Look for the "Wallet Address" section\n• Click the "Copy Address" button to copy it to clipboard\n• You can also generate QR codes for easy sharing\n• Address format: 1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S',
      category: "dashboard",
      keywords: ["wallet", "address", "copy", "qr", "share"],
      relatedPages: ["/dashboard"],
    },

    // Send Payments Help
    {
      id: "send-payment",
      question: "How do I send payments?",
      answer:
        'To send a payment:\n1. Go to the Send page from dashboard or navigation\n2. Enter the amount in local currency\n3. Select your local currency (USD, EUR, GBP, UZS, KZT)\n4. Choose crypto currency (USDT, BTC, ETH)\n5. Review the exchange rate and converted amount\n6. Select payment method (Credit Card, Bank Transfer, Digital Wallet)\n7. Click "Process Payment"\n8. Receive transaction ID and single-use payment link',
      category: "sending",
      keywords: ["send", "payment", "crypto", "currency", "exchange", "rate"],
      relatedPages: ["/send"],
    },
    {
      id: "payment-methods",
      question: "What payment methods are supported?",
      answer:
        "UCPG supports multiple payment methods:\n• Credit/Debit Cards\n• Bank Transfers\n• Digital Wallets\n• Supported currencies: USD, EUR, GBP, UZS, KZT\n• Crypto outputs: USDT, BTC, ETH\n• Real-time exchange rate conversion",
      category: "sending",
      keywords: [
        "payment",
        "methods",
        "credit",
        "card",
        "bank",
        "transfer",
        "wallet",
      ],
      relatedPages: ["/send"],
    },
    {
      id: "exchange-rates",
      question: "How do exchange rates work?",
      answer:
        "Exchange rates are updated in real-time:\n• Rates shown for local currency to crypto conversion\n• Example: 1 USD = 0.000023 BTC\n• Converted amount updates automatically\n• Processing includes current market rates\n• Small fees may apply for currency conversion",
      category: "sending",
      keywords: ["exchange", "rates", "conversion", "crypto", "market"],
      relatedPages: ["/send"],
    },

    // Receive Payments Help
    {
      id: "receive-payment",
      question: "How do I receive payments?",
      answer:
        'To receive payments:\n1. Navigate to the Receive page\n2. Enter the amount you want to receive\n3. Select the currency\n4. Click "Generate Payment Link"\n5. Share the generated link or QR code\n6. Recipients can pay using the link\n7. Funds will appear in your wallet anonymously',
      category: "receiving",
      keywords: ["receive", "payment", "link", "generate", "qr", "share"],
      relatedPages: ["/receive"],
    },
    {
      id: "payment-links",
      question: "How do payment links work?",
      answer:
        "Payment links provide secure payment collection:\n• Generate unique links for specific amounts\n• Include QR codes for mobile scanning\n• Links can be shared via any communication method\n• Single-use links expire after 24 hours\n• Anonymous processing maintains privacy",
      category: "receiving",
      keywords: ["payment", "links", "qr", "unique", "expire", "anonymous"],
      relatedPages: ["/receive"],
    },

    // Services Help
    {
      id: "services-overview",
      question: "What services are available?",
      answer:
        "UCPG offers various integrated services:\n• Gaming platforms and digital entertainment\n• E-commerce integrations\n• Business payment solutions\n• Global marketplace access\n• Each service supports anonymous crypto payments\n• Browse and filter available services",
      category: "services",
      keywords: ["services", "gaming", "ecommerce", "business", "marketplace"],
      relatedPages: ["/services"],
    },
    {
      id: "service-integration",
      question: "How do I use integrated services?",
      answer:
        "Using integrated services:\n1. Visit the Services page\n2. Browse or search for services\n3. Click on a service to view details\n4. Services include ratings and user reviews\n5. Direct integration with your UCPG wallet\n6. Pay anonymously using your crypto balance",
      category: "services",
      keywords: ["integration", "browse", "search", "ratings", "reviews"],
      relatedPages: ["/services"],
    },

    // Profile & Settings Help
    {
      id: "profile-management",
      question: "How do I manage my profile?",
      answer:
        "Profile management features:\n• View account information and member status\n• Update personal information (name, phone, location)\n• Change password for security\n• Account shows creation date and type\n• All profile data is stored securely\n• Changes are saved automatically",
      category: "profile",
      keywords: [
        "profile",
        "account",
        "personal",
        "information",
        "password",
        "security",
      ],
      relatedPages: ["/profile"],
    },
    {
      id: "theme-language",
      question: "How do I change theme and language?",
      answer:
        "Customizing your experience:\n• Theme: Use the theme toggle in the header (light/dark/system)\n• Language: Click the language selector (EN/RU/TR supported)\n• Settings are saved automatically\n• System theme adapts to your device preferences\n• Changes apply immediately across the platform",
      category: "profile",
      keywords: ["theme", "language", "settings", "dark", "light", "customize"],
      relatedPages: ["/profile"],
    },

    // General Platform Help
    {
      id: "anonymous-payments",
      question: "How does anonymous payment work?",
      answer:
        "UCPG ensures complete anonymity:\n• No personal data collected or stored\n• Anonymous identifiers for all transactions\n• Crypto addresses don't link to personal info\n• Support uses transaction IDs only\n• End-to-end encryption for all communications\n• Global coverage without identity verification",
      category: "general",
      keywords: ["anonymous", "privacy", "encryption", "identity", "global"],
      relatedPages: ["/dashboard", "/send", "/receive"],
    },
    {
      id: "supported-countries",
      question: "Which countries are supported?",
      answer:
        "UCPG provides global coverage:\n• 190+ countries supported\n• Multiple local currencies accepted\n• No geographic restrictions\n• Anonymous access from anywhere\n• Local payment methods in each region\n• 24/7 availability worldwide",
      category: "general",
      keywords: ["countries", "global", "worldwide", "190", "coverage"],
      relatedPages: ["/"],
    },
    {
      id: "transaction-fees",
      question: "What are the transaction fees?",
      answer:
        "Transaction fees are competitive:\n• Fees vary by payment method and currency\n• Credit cards: typically 2-3%\n• Bank transfers: usually lower fees\n• Crypto transactions: network fees apply\n• Exact fees shown before confirmation\n• No hidden charges",
      category: "general",
      keywords: ["fees", "charges", "cost", "credit", "bank", "crypto"],
      relatedPages: ["/send", "/receive"],
    },
    {
      id: "navigation-help",
      question: "How do I navigate the platform?",
      answer:
        'Platform navigation:\n• Header menu: Access all main pages\n• Dashboard: Central hub with quick actions\n• Send: Process outgoing payments\n• Receive: Generate payment links\n• Services: Browse integrated services\n• Profile: Manage account settings\n• Always click "Back to Dashboard" to return home',
      category: "general",
      keywords: ["navigation", "menu", "pages", "dashboard", "header"],
      relatedPages: [
        "/dashboard",
        "/send",
        "/receive",
        "/services",
        "/profile",
      ],
    },
  ];

  const quickHelpItems = [
    {
      key: "howToSend",
      question: t("support.quick.howToSend"),
      id: "send-payment",
    },
    {
      key: "howToReceive",
      question: t("support.quick.howToReceive"),
      id: "receive-payment",
    },
    {
      key: "viewBalance",
      question: t("support.quick.viewBalance"),
      id: "balance-check",
    },
    {
      key: "changeTheme",
      question: t("support.quick.changeTheme"),
      id: "theme-language",
    },
    {
      key: "anonymousTx",
      question: t("support.quick.anonymousTx"),
      id: "anonymous-payments",
    },
  ];

  const categories = [
    {
      key: "dashboard",
      label: t("support.category.dashboard"),
      icon: BarChart3,
      color: "bg-blue-100 text-blue-800",
    },
    {
      key: "sending",
      label: t("support.category.sending"),
      icon: CreditCard,
      color: "bg-green-100 text-green-800",
    },
    {
      key: "receiving",
      label: t("support.category.receiving"),
      icon: Download,
      color: "bg-purple-100 text-purple-800",
    },
    {
      key: "services",
      label: t("support.category.services"),
      icon: Globe,
      color: "bg-orange-100 text-orange-800",
    },
    {
      key: "profile",
      label: t("support.category.profile"),
      icon: Settings,
      color: "bg-teal-100 text-teal-800",
    },
    {
      key: "general",
      label: t("support.category.general"),
      icon: HelpCircle,
      color: "bg-gray-100 text-gray-800",
    },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: `${t("support.chatbot.welcome")}\n\n${t(
        "support.chatbot.helpTopics"
      )}\n\n${t("support.chatbot.askQuestion")}`,
      isBot: true,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const findBestMatch = (query: string): KnowledgeItem | null => {
    const lowercaseQuery = query.toLowerCase();

    // First, try exact question match
    const exactMatch = knowledgeBase.find((item) =>
      item.question.toLowerCase().includes(lowercaseQuery)
    );
    if (exactMatch) return exactMatch;

    // Then try keyword matching
    const keywordMatches = knowledgeBase.filter((item) =>
      item.keywords.some(
        (keyword) =>
          keyword.toLowerCase().includes(lowercaseQuery) ||
          lowercaseQuery.includes(keyword.toLowerCase())
      )
    );

    if (keywordMatches.length > 0) {
      // Return the best keyword match (most keyword matches)
      return keywordMatches.reduce((best, current) => {
        const bestMatches = best.keywords.filter(
          (k) =>
            k.toLowerCase().includes(lowercaseQuery) ||
            lowercaseQuery.includes(k.toLowerCase())
        ).length;
        const currentMatches = current.keywords.filter(
          (k) =>
            k.toLowerCase().includes(lowercaseQuery) ||
            lowercaseQuery.includes(k.toLowerCase())
        ).length;
        return currentMatches > bestMatches ? current : best;
      });
    }

    // Finally, try partial text matching in answers
    const answerMatch = knowledgeBase.find((item) =>
      item.answer.toLowerCase().includes(lowercaseQuery)
    );

    return answerMatch || null;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const match = findBestMatch(inputValue);

      let botResponse: string;
      if (match) {
        botResponse = match.answer;
        if (match.relatedPages && match.relatedPages.length > 0) {
          botResponse += `\n\n📍 Related pages: ${match.relatedPages.join(
            ", "
          )}`;
        }
      } else {
        botResponse = `I couldn't find a specific answer to "${inputValue}". Here are some things I can help you with:\n\n• Dashboard and balance management\n• Sending and receiving payments\n• Using platform services\n• Profile and settings\n• General platform navigation\n\nTry asking about any of these topics, or browse the help categories for more information.`;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickHelp = (itemId: string) => {
    const match = knowledgeBase.find((item) => item.id === itemId);
    if (match) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: match.question,
        isBot: false,
        timestamp: new Date(),
      };

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: match.answer,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, botMessage]);
      setCurrentView("chat");
    }
  };

  const handleCategoryClick = (categoryKey: string) => {
    const categoryItems = knowledgeBase.filter(
      (item) => item.category === categoryKey
    );
    const itemsList = categoryItems
      .map((item) => `• ${item.question}`)
      .join("\n");

    const categoryMessage: Message = {
      id: Date.now().toString(),
      text: `Here are help topics for ${
        categories.find((c) => c.key === categoryKey)?.label
      }:\n\n${itemsList}\n\nClick on any topic above or ask me directly!`,
      isBot: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, categoryMessage]);
    setCurrentView("chat");
  };

  const handleFeedback = (messageId: string, isHelpful: boolean) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, helpful: isHelpful } : msg
      )
    );

    toast({
      title: t("support.chatbot.thankYou"),
      description: isHelpful
        ? "Glad I could help!"
        : "I'll try to improve my responses.",
    });
  };

  const searchKnowledge = (query: string) => {
    if (!query.trim()) return knowledgeBase;

    const lowercaseQuery = query.toLowerCase();
    return knowledgeBase.filter(
      (item) =>
        item.question.toLowerCase().includes(lowercaseQuery) ||
        item.keywords.some((keyword) =>
          keyword.toLowerCase().includes(lowercaseQuery)
        ) ||
        item.answer.toLowerCase().includes(lowercaseQuery)
    );
  };

  const filteredKnowledge = searchKnowledge(searchQuery);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isMinimized ? "h-16" : "h-[600px]"
      } w-96 shadow-xl`}
    >
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-sm">
                {t("support.chatbot.title")}
              </CardTitle>
              {!isMinimized && (
                <p className="text-xs text-muted-foreground">
                  {t("support.chatbot.subtitle")}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        {!isMinimized && (
          <div className="flex space-x-1 mt-2">
            <Button
              variant={currentView === "chat" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentView("chat")}
              className="flex-1 h-8 text-xs"
            >
              Chat
            </Button>
            <Button
              variant={currentView === "categories" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentView("categories")}
              className="flex-1 h-8 text-xs"
            >
              {t("support.chatbot.categories")}
            </Button>
            <Button
              variant={currentView === "search" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentView("search")}
              className="flex-1 h-8 text-xs"
            >
              <Search className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-[480px] p-4 pt-0">
          {/* Chat View */}
          {currentView === "chat" && (
            <>
              <ScrollArea className="flex-1 pr-3">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.isBot ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.isBot
                            ? "bg-muted text-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.isBot && (
                            <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-line">
                              {message.text}
                            </p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {!message.isBot && (
                            <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                        </div>

                        {/* Feedback buttons for bot messages */}
                        {message.isBot && message.helpful === undefined && (
                          <div className="flex items-center justify-end space-x-1 mt-2">
                            <span className="text-xs opacity-70 mr-2">
                              {t("support.chatbot.rateHelpful")}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleFeedback(message.id, true)}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleFeedback(message.id, false)}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        {message.helpful !== undefined && (
                          <div className="flex items-center justify-end mt-2">
                            <span className="text-xs opacity-70">
                              {message.helpful ? "👍 Thanks!" : "👎 Noted"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4" />
                          <p className="text-sm">
                            {t("support.chatbot.typing")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Quick Help Buttons */}
              <div className="my-3">
                <p className="text-xs font-medium mb-2">
                  {t("support.chatbot.quickHelp")}:
                </p>
                <div className="flex flex-wrap gap-1">
                  {quickHelpItems.slice(0, 3).map((item) => (
                    <Button
                      key={item.key}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleQuickHelp(item.id)}
                    >
                      <Lightbulb className="h-3 w-3 mr-1" />
                      {item.question}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t("support.chatbot.placeholder")}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {/* Categories View */}
          {currentView === "categories" && (
            <div className="space-y-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const categoryItems = knowledgeBase.filter(
                  (item) => item.category === category.key
                );

                return (
                  <Card
                    key={category.key}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardContent
                      className="p-4"
                      onClick={() => handleCategoryClick(category.key)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${category.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">
                              {category.label}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {categoryItems.length} topics
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Search View */}
          {currentView === "search" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("support.chatbot.searchHelp")}
                  className="pl-10"
                />
              </div>

              <ScrollArea className="h-[400px]">
                {filteredKnowledge.length > 0 ? (
                  <div className="space-y-2">
                    {filteredKnowledge.map((item) => (
                      <Card
                        key={item.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <CardContent
                          className="p-3"
                          onClick={() => handleQuickHelp(item.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">
                                {item.question}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {
                                  categories.find(
                                    (c) => c.key === item.category
                                  )?.label
                                }
                              </Badge>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      {t("support.chatbot.noResults")}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default SupportChatbot;
