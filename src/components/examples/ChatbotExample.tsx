import React, { useState } from 'react';
import { SupportChatbot } from '../SupportChatbot';
import { Button } from '../ui/button';

const ChatbotExample: React.FC = () => {
  const [chatbotVisible, setChatbotVisible] = useState(true);
  
  // Example of a custom knowledge base
  const customKnowledge = {
    products: {
      crypto: "We support trading in Bitcoin, Ethereum, and over 50 other cryptocurrencies.",
      fees: "Our trading fees start at 0.1% and decrease based on your trading volume.",
      limits: "Withdrawal limits depend on your verification level. Basic accounts can withdraw up to $5,000 daily."
    },
    support: {
      contact: "You can reach our support team 24/7 via email at help@example.com or through live chat.",
      verification: "To increase your account limits, please complete the verification process in your account settings.",
      security: "We recommend enabling two-factor authentication (2FA) for additional account security."
    }
  };
  
  // Example of a custom response handler
  const getCustomResponse = (message: string) => {
    // You could implement API calls to a backend service here
    if (message.toLowerCase().includes('api')) {
      return "Our API documentation is available at api.example.com. You'll need to generate an API key from your account settings.";
    }
    return null; // Return null to fall back to the default response system
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Chatbot Integration Example</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Controls</h2>
        <Button 
          onClick={() => setChatbotVisible(!chatbotVisible)}
          className="mb-4"
        >
          {chatbotVisible ? 'Hide Chatbot' : 'Show Chatbot'}
        </Button>
        
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-medium mb-2">Implementation Notes:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>The chatbot can be positioned in any corner of the screen</li>
            <li>Custom knowledge base can be provided to extend default responses</li>
            <li>Custom response handlers can override the default behavior</li>
            <li>Appearance is customizable (colors, icons, etc.)</li>
            <li>Responsive design works on all device sizes</li>
          </ul>
        </div>
      </div>
      
      {chatbotVisible && (
        <SupportChatbot 
          title="Help Assistant"
          greeting="Hello! I'm your custom assistant. How can I help you today?"
          placeholder="Ask me anything..."
          customKnowledgeBase={customKnowledge}
          position="bottom-right"
          accentColor="#8b5cf6" // Purple color
          initiallyOpen={false}
          onUserMessage={(msg) => console.log('User sent:', msg)}
          getCustomResponse={getCustomResponse}
        />
      )}
    </div>
  );
};

export default ChatbotExample;