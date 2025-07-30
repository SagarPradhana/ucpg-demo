// Utility to debug localStorage issues and ensure theme/language persistence

export class StorageDebugger {
  private static instance: StorageDebugger;
  
  private constructor() {}
  
  static getInstance(): StorageDebugger {
    if (!StorageDebugger.instance) {
      StorageDebugger.instance = new StorageDebugger();
    }
    return StorageDebugger.instance;
  }
  
  // Log current localStorage state
  logStorageState(context: string) {
    if (import.meta.env.MODE === 'development') {
      console.log(`🔍 Storage Debug - ${context}:`, {
        theme: localStorage.getItem('ucpg-theme'),
        language: localStorage.getItem('ucpg-language'),
        sessionToken: localStorage.getItem('sessionToken') ? 'present' : 'missing',
        refreshToken: localStorage.getItem('refreshToken') ? 'present' : 'missing',
        allKeys: Object.keys(localStorage),
      });
    }
  }
  
  // Ensure theme and language are preserved
  preserveUserPreferences() {
    const theme = localStorage.getItem('ucpg-theme');
    const language = localStorage.getItem('ucpg-language');
    
    return {
      theme,
      language,
      restore: () => {
        if (theme && !localStorage.getItem('ucpg-theme')) {
          localStorage.setItem('ucpg-theme', theme);
          console.log('🎨 Restored theme:', theme);
        }
        if (language && !localStorage.getItem('ucpg-language')) {
          localStorage.setItem('ucpg-language', language);
          console.log('🌍 Restored language:', language);
        }
      }
    };
  }
  
  // Safe logout that definitely preserves preferences
  safeLogout() {
    this.logStorageState('Before Logout');
    
    // Preserve preferences
    const preferences = this.preserveUserPreferences();
    
    // Clear only authentication data
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('refreshToken');
    
    // Immediately restore preferences
    preferences.restore();
    
    this.logStorageState('After Logout');
  }
  
  // Monitor localStorage changes
  monitorStorage() {
    if (import.meta.env.MODE === 'development') {
      const originalSetItem = localStorage.setItem;
      const originalRemoveItem = localStorage.removeItem;
      const originalClear = localStorage.clear;
      
      localStorage.setItem = function(key: string, value: string) {
        console.log('📝 localStorage.setItem:', key, value);
        return originalSetItem.apply(this, [key, value]);
      };
      
      localStorage.removeItem = function(key: string) {
        console.log('🗑️ localStorage.removeItem:', key);
        return originalRemoveItem.apply(this, [key]);
      };
      
      localStorage.clear = function() {
        console.warn('⚠️ localStorage.clear() called - this will remove theme/language settings!');
        console.trace('Clear called from:');
        return originalClear.apply(this);
      };
    }
  }
  
  // Initialize with defaults if missing (only for language now)
  initializeDefaults() {
    // No longer initialize theme in localStorage since public pages always use light
    // Theme is only saved for authenticated users
    
    if (!localStorage.getItem('ucpg-language')) {
      localStorage.setItem('ucpg-language', 'en');
      console.log('🌍 Initialized default language: en');
    }
  }
}

export default StorageDebugger;