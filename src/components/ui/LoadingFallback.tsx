import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Wifi, WifiOff } from 'lucide-react';
import { Button } from './Button';

interface LoadingFallbackProps {
  message?: string;
  onRetry?: () => void;
  onSkip?: () => void;
  showDiagnostics?: boolean;
}

export function LoadingFallback({ 
  message = "Loading...", 
  onRetry, 
  onSkip,
  showDiagnostics = false 
}: LoadingFallbackProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showEmergencyOptions, setShowEmergencyOptions] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Detect WebContainer environment
  const isWebContainer = window.location.hostname.includes('webcontainer') || 
                         window.location.hostname.includes('stackblitz') ||
                         window.location.hostname.includes('bolt.new') ||
                         window.location.hostname.includes('credentialless');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Show emergency options earlier for WebContainer
    const emergencyTimer = setTimeout(() => {
      setShowEmergencyOptions(true);
    }, isWebContainer ? 5000 : 8000);

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      clearTimeout(emergencyTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isWebContainer]);

  const handleDiagnostics = async () => {
    try {
      const { authDiagnostics } = await import('../../utils/authDiagnostics');
      const report = await authDiagnostics.generateReport();
      setDiagnosticInfo(report);
    } catch (error) {
      console.error('Failed to generate diagnostics:', error);
      setDiagnosticInfo({ error: 'Failed to generate diagnostics' });
    }
  };

  const handleForceReload = () => {
    console.log('🔄 Force reload triggered by user');
    window.location.reload();
  };

  const handleClearStorage = () => {
    console.log('🧹 Clearing storage triggered by user');
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const getLoadingMessage = () => {
    if (!isOnline) return "No internet connection detected";
    if (timeElapsed < 3) return "Checking authentication status...";
    if (timeElapsed < 6) return "Connecting to database...";
    if (timeElapsed < 10) return "This is taking longer than usual...";
    return "Something might be wrong...";
  };

  const getHelpText = () => {
    if (isWebContainer) {
      return "You're in a development environment. Network issues are common and expected.";
    }
    if (!isOnline) {
      return "Please check your internet connection and try again.";
    }
    return "If problems persist, try using a different browser or check your internet connection.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Main Loading State */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-4">
          {/* Connection Status Indicator */}
          <div className="flex items-center justify-center mb-4">
            {isOnline ? (
              <Wifi className="w-6 h-6 text-green-500 mr-2" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-500 mr-2" />
            )}
            <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? 'Connected' : 'Offline'}
            </span>
          </div>

          {/* Loading Spinner */}
          <div className={`w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4 ${
            isOnline 
              ? 'border-emerald-600 border-t-transparent' 
              : 'border-red-600 border-t-transparent'
          }`}></div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{message}</h2>
          <p className="text-gray-600 mb-4">
            {getLoadingMessage()}
          </p>
          
          {/* Environment Info */}
          {isWebContainer && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm">
                🔧 <strong>Development Environment</strong><br />
                You're running in WebContainer. Network delays are normal.
              </p>
            </div>
          )}
          
          <div className="text-sm text-gray-500">
            Time elapsed: {timeElapsed}s
            {timeElapsed > 10 && (
              <span className="block text-amber-600 font-medium mt-1">
                ⚠️ Unusually long loading time
              </span>
            )}
          </div>
        </div>

        {/* Emergency Options */}
        {showEmergencyOptions && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-4">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 mr-2" />
              <h3 className="text-lg font-semibold text-amber-800">
                {isWebContainer ? 'Development Environment Issues' : 'Loading is taking too long'}
              </h3>
            </div>
            
            <p className="text-amber-700 text-sm mb-4">
              {isWebContainer 
                ? "WebContainer environments can have network limitations. Try these options:"
                : "If the app is stuck loading, you can try these options:"
              }
            </p>
            
            <div className="space-y-2">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Loading
                </Button>
              )}
              
              <Button
                onClick={handleForceReload}
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
              
              <Button
                onClick={handleClearStorage}
                variant="outline"
                className="w-full text-red-600 hover:text-red-700"
              >
                Clear Cache & Reload
              </Button>
              
              {onSkip && (
                <Button
                  onClick={onSkip}
                  variant="primary"
                  className="w-full"
                >
                  Continue Anyway
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Diagnostics Section */}
        {showDiagnostics && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <Button
              onClick={handleDiagnostics}
              variant="outline"
              size="sm"
              className="w-full mb-3"
            >
              <Bug className="w-4 h-4 mr-2" />
              Run Diagnostics
            </Button>
            
            {diagnosticInfo && (
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 mb-2">Diagnostic Info:</h4>
                <div className="bg-gray-100 rounded p-3 text-xs font-mono overflow-auto max-h-40">
                  <pre>{JSON.stringify(diagnosticInfo, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 mt-4">
          <p>{getHelpText()}</p>
          {isWebContainer && (
            <p className="mt-2 text-blue-600">
              💡 Tip: In production, this loading will be much faster.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}