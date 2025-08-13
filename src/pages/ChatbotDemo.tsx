import React, { useState } from 'react';
import { SupportChatbot } from '../components/SupportChatbot';
import { Button } from '../components/ui/button';

const ChatbotDemo = () => {
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  const [color, setColor] = useState('#3b82f6');
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Chatbot Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Customization Options</h2>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Position</h3>
            <div className="flex flex-wrap gap-2">
              {(['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const).map((pos) => (
                <Button 
                  key={pos}
                  variant={position === pos ? 'default' : 'outline'}
                  onClick={() => setPosition(pos)}
                  className="text-xs"
                >
                  {pos.replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Color</h3>
            <div className="flex gap-2">
              {['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'].map((clr) => (
                <button
                  key={clr}
                  onClick={() => setColor(clr)}
                  className={`w-8 h-8 rounded-full ${color === clr ? 'ring-2 ring-offset-2' : ''}`}
                  style={{ backgroundColor: clr }}
                  aria-label={`Set color to ${clr}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Implementation</h2>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
{`<SupportChatbot 
  title="Help Center"
  position="${position}"
  accentColor="${color}"
  customKnowledgeBase={{
    products: {
      features: "Our platform offers real-time trading, 
               portfolio management, and market insights."
    }
  }}
/>`}
          </pre>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-disc list-inside">
          <li>Fully customizable appearance</li>
          <li>Responsive design for all devices</li>
          <li>Extensible knowledge base</li>
          <li>Custom response handlers</li>
          <li>Theme-aware styling</li>
          <li>Position anywhere on screen</li>
          <li>Callback support for integration</li>
          <li>Simple drop-in implementation</li>
        </ul>
      </div>
      
      <SupportChatbot 
        title="Help Center"
        greeting="Hello! 👋 Welcome to the demo. Try asking about our features or services."
        position={position}
        accentColor={color}
        customKnowledgeBase={{
          products: {
            features: "Our platform offers real-time trading, portfolio management, and market insights.",
            pricing: "We offer flexible pricing plans starting at $9.99/month. Enterprise plans are available for larger organizations."
          },
          services: {
            support: "Our support team is available 24/7 to help with any questions or issues you may have.",
            training: "We offer free training sessions for all new users to help you get the most out of our platform."
          }
        }}
      />
    </div>
  );
};

export default ChatbotDemo;