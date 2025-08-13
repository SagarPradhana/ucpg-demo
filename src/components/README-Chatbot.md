# SupportChatbot Component

A customizable, ready-to-use chatbot component for React applications. This component provides an interactive chat interface that can be easily integrated into any React project.

## Features

- 💬 **Instant Integration**: Drop-in component that works out of the box
- 🎨 **Highly Customizable**: Appearance, position, and behavior can be customized
- 📱 **Responsive Design**: Works on all device sizes
- 🧠 **Extensible Knowledge Base**: Default responses can be extended or replaced
- 🔌 **Custom Response Handlers**: Support for API integration and custom logic
- 🌓 **Theme Support**: Adapts to light/dark mode

## Installation

The component is already part of your project. Simply import it from:

```jsx
import { SupportChatbot } from './components/SupportChatbot';
```

## Basic Usage

```jsx
import React from 'react';
import { SupportChatbot } from './components/SupportChatbot';

const MyApp = () => {
  return (
    <div>
      {/* Your app content */}
      
      <SupportChatbot />
    </div>
  );
};

export default MyApp;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | "Support Chat" | Title displayed in the chatbot header |
| `greeting` | string | "Hello! How can I help you today?" | Initial greeting message from the bot |
| `placeholder` | string | "Type your message here..." | Placeholder text for the input field |
| `customKnowledgeBase` | object | `{}` | Custom knowledge base to extend or replace the default one |
| `fallbackMessage` | string | "I'm sorry, I don't have information about that topic yet..." | Message shown when no relevant response is found |
| `position` | string | "bottom-right" | Position of the chatbot on the screen ("bottom-right", "bottom-left", "top-right", "top-left") |
| `icon` | ReactNode | `<MessageCircle />` | Custom icon for the chatbot trigger button |
| `accentColor` | string | "#3b82f6" | Accent color for the chatbot UI elements |
| `initiallyOpen` | boolean | false | Whether the chatbot should be initially open |
| `onUserMessage` | function | undefined | Optional callback when user sends a message |
| `getCustomResponse` | function | undefined | Optional callback to override the default bot response |

## Advanced Usage

### Custom Knowledge Base

You can provide a custom knowledge base to extend or replace the default responses:

```jsx
const customKnowledge = {
  products: {
    crypto: "We support trading in Bitcoin, Ethereum, and over 50 other cryptocurrencies.",
    fees: "Our trading fees start at 0.1% and decrease based on your trading volume."
  },
  support: {
    contact: "You can reach our support team 24/7 via email at help@example.com."
  }
};

<SupportChatbot customKnowledgeBase={customKnowledge} />
```

### Custom Response Handler

You can provide a custom response handler to override the default responses:

```jsx
const getCustomResponse = (message) => {
  // You could implement API calls to a backend service here
  if (message.toLowerCase().includes('api')) {
    return "Our API documentation is available at api.example.com";
  }
  
  // Return null to fall back to the default response system
  return null;
};

<SupportChatbot getCustomResponse={getCustomResponse} />
```

### Styling

You can customize the appearance of the chatbot:

```jsx
<SupportChatbot 
  title="Help Center"
  accentColor="#8b5cf6" // Purple color
  position="bottom-left"
  icon={<QuestionMarkCircle />} // Custom icon
/>
```

## Example

See the `ChatbotExample.tsx` component for a complete example of how to use the SupportChatbot with various customizations.

## License

This component is part of your project and follows the same licensing terms.