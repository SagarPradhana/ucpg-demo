# UCPG Support Chatbot Documentation

## Overview
The UCPG Support Chatbot is an intelligent, multilingual support assistant that provides comprehensive help for all platform features. It appears on all pages except authentication and admin pages.

## Features

### 🤖 **Intelligent Q&A System**
- Comprehensive knowledge base covering all platform features
- Natural language processing for user queries
- Context-aware responses with related page suggestions
- Fallback responses for unmatched queries

### 🌍 **Multi-language Support**
- **English (EN)**: Full support with comprehensive help topics
- **Russian (RU)**: Complete translations for Russian users
- **Turkish (TR)**: Full Turkish language support
- Automatically adapts to user's selected language

### 🎯 **Smart Knowledge Base**
Covers all available pages and features:
- **Dashboard**: Balance management, wallet address, quick actions
- **Send Payments**: Currency conversion, payment methods, exchange rates
- **Receive Payments**: Payment link generation, QR codes, anonymous processing
- **Services**: Platform integrations, service browsing, anonymous purchases
- **Profile**: Account management, theme/language settings, security
- **General**: Platform navigation, anonymous payments, global coverage

### 📱 **Interactive UI Components**
- **Chat Interface**: Real-time conversation with typing indicators
- **Categories View**: Browse help topics by category
- **Search Function**: Find specific help topics quickly
- **Quick Help Buttons**: One-click access to common questions
- **Feedback System**: Rate responses and provide feedback

### 🔍 **Advanced Search & Filtering**
- Real-time search across knowledge base
- Keyword matching and partial text search
- Category-based filtering
- Related page suggestions

## Pages Where Chatbot Appears

### ✅ **Included Pages**
- **Home Page (`/`)**: Platform introduction and overview
- **Dashboard (`/dashboard`)**: Main user interface and controls
- **Send (`/send`)**: Payment processing and crypto conversion
- **Receive (`/receive`)**: Payment link generation and receiving
- **Services (`/services`)**: Platform integrations and services
- **Profile (`/profile`)**: Account settings and preferences
- **Not Found (`/*`)**: Error page assistance

### ❌ **Excluded Pages**
- **Login (`/login`)**: Authentication flow
- **Signup (`/signup`)**: Registration process
- **Forgot Password (`/forgotpassword`)**: Password recovery
- **Admin (`/admin`)**: Administrative interface

## Technical Implementation

### **Component Architecture**
```
SupportChatbot.tsx
├── Chat Interface
├── Knowledge Base Engine
├── Search & Filter System
├── Multi-language Support
├── Feedback System
└── UI State Management
```

### **Integration**
- Integrated into `App.tsx` with conditional rendering
- Uses `useLocation` hook to exclude specific pages
- Fully integrated with existing UI component system
- Leverages theme and language contexts

### **Knowledge Base Structure**
Each knowledge item contains:
- Unique ID for tracking
- Question and comprehensive answer
- Category classification
- Keywords for search matching
- Related page references

## Usage Instructions

### **For Users**
1. **Open Chat**: Click the floating chat button (bottom-right)
2. **Ask Questions**: Type questions naturally or use quick help buttons
3. **Browse Categories**: Click "Help Categories" to explore topics
4. **Search Help**: Use search tab to find specific information
5. **Provide Feedback**: Rate responses to improve assistance
6. **Minimize/Close**: Use header controls to manage chatbot visibility

### **For Developers**
1. **Adding New Help Topics**: Edit knowledge base in `SupportChatbot.tsx`
2. **Translations**: Add translations to `en.ts`, `ru.ts`, `tr.ts` files
3. **UI Customization**: Modify component styling and behavior
4. **Page Exclusions**: Update `excludedPaths` array in `App.tsx`

## Knowledge Base Categories

### 🏠 **Dashboard (dashboard)**
- Balance checking and management
- Wallet address operations
- Transaction viewing
- Quick action navigation
- Real-time data refresh

### 💸 **Sending Payments (sending)**
- Payment processing workflow
- Currency selection and conversion
- Exchange rate information
- Payment method options
- Transaction completion

### 📥 **Receiving Payments (receiving)**
- Payment link generation
- QR code creation and sharing
- Anonymous payment processing
- Link expiration and security

### 🌐 **Services (services)**
- Service browsing and selection
- Anonymous purchasing
- Service integration usage
- Rating and review system

### 👤 **Profile & Settings (profile)**
- Account information management
- Password and security settings
- Theme and language preferences
- Profile customization

### ❓ **General Help (general)**
- Platform navigation
- Anonymous payment explanation
- Global coverage information
- Security and privacy features

## Customization Options

### **Adding New Knowledge Items**
```typescript
{
  id: 'unique-identifier',
  question: 'User-facing question',
  answer: 'Comprehensive answer with details',
  category: 'category-key',
  keywords: ['search', 'keywords', 'array'],
  relatedPages: ['/related', '/pages']
}
```

### **Translation Support**
Add new translations to all language files:
```typescript
"support.chatbot.newKey": "Translation text"
```

### **Page Exclusions**
Modify the exclusion list in `App.tsx`:
```typescript
const excludedPaths = ['/login', '/signup', '/forgotpassword', '/admin'];
```

## Benefits

### **For Users**
- ✨ Instant help without leaving the page
- 🌍 Native language support
- 🎯 Contextual, relevant answers
- 📱 Intuitive, mobile-friendly interface
- 🔍 Powerful search capabilities

### **For Platform**
- 📉 Reduced support ticket volume
- 📈 Improved user experience
- 🎯 Better user onboarding
- 📊 Feedback collection mechanism
- 🔧 Self-service support solution

## Future Enhancements

### **Planned Features**
- Integration with live chat support
- Advanced analytics and usage tracking
- Machine learning response improvement
- Voice interaction capabilities
- Custom help topic suggestions

### **Extensibility**
- Plugin system for additional features
- API integration for dynamic content
- User-specific help personalization
- Advanced search algorithms
- Multi-modal interaction support

---

## Support & Maintenance

The chatbot is designed to be maintainable and extensible. Regular updates to the knowledge base ensure users receive current, accurate information about platform features and functionality.

For technical issues or enhancement requests, please refer to the project's main documentation or contact the development team.