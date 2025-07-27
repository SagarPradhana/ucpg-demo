# 🌟 Theme & Multilingual System Guide

This guide explains how to use the new **Dark/Light Theme** and **Multilingual** system implemented in your Anonymous Crypto Platform.

## 🎨 Theme System

### Features
- **Light Theme**: Clean, bright interface
- **Dark Theme**: Easy on the eyes, modern dark interface  
- **System Theme**: Automatically follows your OS preference
- **Smooth Transitions**: Animated theme switching
- **Persistent**: Your theme choice is saved across sessions

### How to Use Theme System

#### 1. In Components
```tsx
import { useTheme } from "@/contexts/ThemeContext";

const MyComponent = () => {
  const { theme, setTheme, actualTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Actual theme (resolved): {actualTheme}</p>
      <button onClick={() => setTheme('dark')}>Switch to Dark</button>
    </div>
  );
};
```

#### 2. Theme Toggle Component
```tsx
import ThemeToggle from '@/components/ThemeToggle';

<ThemeToggle 
  variant="outline" 
  size="sm" 
  showLabel={true} 
/>
```

#### 3. User Profile Integration
The theme selector is already integrated into the UserProfile dropdown menu with:
- Visual indicators (🌙/☀️)
- Check marks for current selection
- Toast notifications for theme changes

## 🌍 Multilingual System

### Supported Languages
- 🇺🇸 **English** (en) - Default
- 🇷🇺 **Russian** (ru) - Русский
- 🇹🇷 **Turkish** (tr) - Türkçe

### How to Use Translation System

#### 1. In Components
```tsx
import { useLanguage } from "@/contexts/LanguageContext";

const MyComponent = () => {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      <p>{t("dashboard.subtitle")}</p>
      <button onClick={() => setLanguage('ru')}>
        Switch to Russian
      </button>
    </div>
  );
};
```

#### 2. Translation with Parameters
```tsx
// In your component
const { t } = useLanguage();

// Usage with parameters
<p>{t("profile.themeChangedTo", { mode: "dark" })}</p>
<p>{t("message.paymentReceivedDescription", { transactionId: "ABC123" })}</p>
```

#### 3. Language Toggle Component
```tsx
import LanguageToggle from '@/components/LanguageToggle';

<LanguageToggle 
  variant="outline" 
  size="sm" 
  showLabel={true} 
/>
```

## 📁 File Structure

```
src/
├── contexts/
│   ├── ThemeContext.tsx      # Theme management
│   └── LanguageContext.tsx   # Language management
├── translations/
│   ├── en.ts                 # English translations
│   ├── ru.ts                 # Russian translations
│   ├── tr.ts                 # Turkish translations
│   └── index.ts              # Export all translations
└── components/
    ├── ThemeToggle.tsx       # Standalone theme toggle
    ├── LanguageToggle.tsx    # Standalone language toggle
    └── UserProfile.tsx       # Integrated theme & language menu
```

## 🔧 How to Add New Translations

### 1. Add to Translation Files
Add new keys to all language files:

**en.ts**
```tsx
export const en = {
  // ... existing translations
  "myNewFeature.title": "My New Feature",
  "myNewFeature.description": "This is a new feature with {{count}} items",
};
```

**ru.ts**
```tsx
export const ru = {
  // ... existing translations
  "myNewFeature.title": "Моя новая функция",
  "myNewFeature.description": "Это новая функция с {{count}} элементами",
};
```

**tr.ts**
```tsx
export const tr = {
  // ... existing translations
  "myNewFeature.title": "Yeni Özelliğim",
  "myNewFeature.description": "Bu, {{count}} öğesi olan yeni bir özelliktir",
};
```

### 2. Use in Components
```tsx
const MyComponent = () => {
  const { t } = useLanguage();
  
  return (
    <div>
      <h2>{t("myNewFeature.title")}</h2>
      <p>{t("myNewFeature.description", { count: 5 })}</p>
    </div>
  );
};
```

## 🚀 Converting Existing Components

To convert existing components to use translations:

### Before:
```tsx
const MyComponent = () => {
  return (
    <div>
      <h1>Send Payment</h1>
      <p>Send cryptocurrency anonymously</p>
      <button>Process Payment</button>
    </div>
  );
};
```

### After:
```tsx
import { useLanguage } from "@/contexts/LanguageContext";

const MyComponent = () => {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t("send.title")}</h1>
      <p>{t("send.subtitle")}</p>
      <button>{t("send.processPayment")}</button>
    </div>
  );
};
```

## 🎯 Key Features in UserProfile

The UserProfile component now includes:

### Theme Submenu:
- Light/Dark/System options
- Visual indicators showing current theme
- Smooth transitions
- Toast notifications

### Language Submenu:
- All supported languages with flags
- Current language indicator
- Instant language switching
- Persistent language preference

### Access:
1. Click on your profile avatar (top right)
2. Select "Theme" to change theme
3. Select "Language" to change language

## 💾 Persistence

Both theme and language preferences are automatically:
- Saved to localStorage
- Restored when you reload the page
- Applied immediately when changed

## 🔄 System Integration

The theme system is fully integrated with:
- Tailwind CSS dark mode classes
- CSS variables for smooth transitions
- All existing UI components
- Proper contrast and accessibility

The language system provides:
- Fallback to English if translation missing
- Parameter substitution ({{paramName}})
- Type-safe translation keys
- Document language attribute updates

## 📖 Available Translation Keys

Key categories available:
- `nav.*` - Navigation items
- `auth.*` - Authentication 
- `profile.*` - User profile
- `theme.*` - Theme options
- `language.*` - Language options
- `dashboard.*` - Dashboard content
- `send.*` - Send payment page
- `receive.*` - Receive payment page
- `payment.*` - Payment methods
- `currency.*` - Currency options
- `security.*` - Security notices
- `message.*` - Toast messages
- `common.*` - Common UI elements

This system is now ready to use throughout your entire application! 🚀