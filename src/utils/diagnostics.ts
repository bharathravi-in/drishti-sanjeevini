// Diagnostic utilities for debugging loading issues
export const diagnostics = {
  // Log browser information
  logBrowserInfo: () => {
    console.group('🌐 Browser Information');
    console.log('User Agent:', navigator.userAgent);
    console.log('Browser:', navigator.appName);
    console.log('Version:', navigator.appVersion);
    console.log('Platform:', navigator.platform);
    console.log('Language:', navigator.language);
    console.log('Online:', navigator.onLine);
    console.log('Cookies Enabled:', navigator.cookieEnabled);
    console.groupEnd();
  },

  // Log environment variables
  logEnvironment: () => {
    console.group('🔧 Environment Variables');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'Present' : 'Missing');
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
    console.log('Mode:', import.meta.env.MODE);
    console.log('Dev:', import.meta.env.DEV);
    console.groupEnd();
  },

  // Log storage state
  logStorageState: () => {
    console.group('💾 Storage State');
    
    // Local Storage
    console.log('Local Storage Items:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        console.log(`  ${key}:`, value?.substring(0, 100) + (value && value.length > 100 ? '...' : ''));
      }
    }
    
    // Session Storage
    console.log('Session Storage Items:');
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        console.log(`  ${key}:`, value?.substring(0, 100) + (value && value.length > 100 ? '...' : ''));
      }
    }
    
    console.groupEnd();
  },

  // Log network requests
  logNetworkRequests: () => {
    console.group('🌐 Network Monitoring');
    
    // Override fetch to log requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [resource, config] = args;
      console.log('🔄 Fetch Request:', {
        url: resource,
        method: config?.method || 'GET',
        headers: config?.headers,
        timestamp: new Date().toISOString()
      });
      
      try {
        const response = await originalFetch(...args);
        console.log('✅ Fetch Response:', {
          url: resource,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          timestamp: new Date().toISOString()
        });
        return response;
      } catch (error) {
        console.error('❌ Fetch Error:', {
          url: resource,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    };
    
    console.groupEnd();
  },

  // Performance monitoring
  logPerformance: () => {
    console.group('⚡ Performance Metrics');
    
    if (performance.navigation) {
      console.log('Navigation Type:', performance.navigation.type);
      console.log('Redirect Count:', performance.navigation.redirectCount);
    }
    
    if (performance.timing) {
      const timing = performance.timing;
      console.log('Page Load Time:', timing.loadEventEnd - timing.navigationStart, 'ms');
      console.log('DOM Ready Time:', timing.domContentLoadedEventEnd - timing.navigationStart, 'ms');
      console.log('DNS Lookup Time:', timing.domainLookupEnd - timing.domainLookupStart, 'ms');
      console.log('Server Response Time:', timing.responseEnd - timing.requestStart, 'ms');
    }
    
    console.groupEnd();
  },

  // Start comprehensive monitoring
  startMonitoring: () => {
    console.log('🔍 Starting Diagnostic Monitoring...');
    diagnostics.logBrowserInfo();
    diagnostics.logEnvironment();
    diagnostics.logStorageState();
    diagnostics.logNetworkRequests();
    diagnostics.logPerformance();
    
    // Monitor for unhandled errors
    window.addEventListener('error', (event) => {
      console.error('🚨 Unhandled Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: new Date().toISOString()
      });
    });
    
    // Monitor for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled Promise Rejection:', {
        reason: event.reason,
        promise: event.promise,
        timestamp: new Date().toISOString()
      });
    });
  }
};