// Authentication-specific diagnostic utilities
export const authDiagnostics = {
  // Track authentication flow steps
  trackAuthFlow: (step: string, data?: any) => {
    console.log(`🔐 Auth Flow: ${step}`, {
      timestamp: new Date().toISOString(),
      step,
      data: data ? JSON.stringify(data, null, 2) : 'No data',
      userAgent: navigator.userAgent.substring(0, 50) + '...'
    });
  },

  // Monitor session state changes
  monitorSessionState: () => {
    let sessionCheckCount = 0;
    let lastSessionState = null;

    return {
      logSessionCheck: (hasSession: boolean, error?: any) => {
        sessionCheckCount++;
        const currentState = { hasSession, error: error?.message };
        
        console.log(`📋 Session Check #${sessionCheckCount}:`, {
          hasSession,
          error: error?.message,
          changed: JSON.stringify(currentState) !== JSON.stringify(lastSessionState),
          timestamp: new Date().toISOString()
        });
        
        lastSessionState = currentState;
        
        // Alert if too many session checks
        if (sessionCheckCount > 5) {
          console.warn('⚠️ Excessive session checks detected - possible infinite loop');
        }
      }
    };
  },

  // Test Supabase connection
  testSupabaseConnection: async () => {
    console.group('🔍 Supabase Connection Test');
    
    try {
      const startTime = performance.now();
      
      // Import supabase client
      const { supabase } = await import('../lib/supabase');
      
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (error) {
        console.error('❌ Connection test failed:', {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          duration: `${duration.toFixed(2)}ms`
        });
        return false;
      } else {
        console.log('✅ Connection test successful:', {
          duration: `${duration.toFixed(2)}ms`,
          data: data ? 'Data received' : 'No data'
        });
        return true;
      }
    } catch (error: any) {
      console.error('💥 Connection test error:', {
        message: error.message,
        stack: error.stack
      });
      return false;
    } finally {
      console.groupEnd();
    }
  },

  // Generate diagnostic report
  generateReport: async () => {
    console.group('📊 Authentication Diagnostic Report');
    
    const report = {
      timestamp: new Date().toISOString(),
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        online: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled
      },
      environment: {
        mode: import.meta.env.MODE,
        dev: import.meta.env.DEV,
        hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      },
      storage: {
        localStorageItems: localStorage.length,
        sessionStorageItems: sessionStorage.length,
        supabaseSession: localStorage.getItem('sb-' + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token') ? 'Present' : 'Missing'
      },
      connection: await authDiagnostics.testSupabaseConnection()
    };
    
    console.log('Report:', report);
    console.groupEnd();
    
    return report;
  }
};