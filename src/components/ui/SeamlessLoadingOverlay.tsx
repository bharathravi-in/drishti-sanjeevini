import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface SeamlessLoadingOverlayProps {
  message: string;
  progress: number;
  isVisible: boolean;
}

export function SeamlessLoadingOverlay({ message, progress, isVisible }: SeamlessLoadingOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!mounted) return null;

  const getIcon = () => {
    if (progress >= 100) {
      if (message.includes('timeout') || message.includes('unavailable') || message.includes('expired')) {
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      }
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <Shield className="w-5 h-5 text-blue-500 animate-pulse" />;
  };

  const getProgressColor = () => {
    if (progress >= 100) {
      if (message.includes('timeout') || message.includes('unavailable') || message.includes('expired')) {
        return 'bg-amber-500';
      }
      return 'bg-green-500';
    }
    return 'bg-blue-500';
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-sm w-full mx-4 transform transition-all duration-300">
        {/* Icon and Message */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
              {getIcon()}
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {progress >= 100 ? 'Authentication Complete' : 'Authenticating'}
          </h3>
          
          <p className="text-gray-600 text-sm">
            {message}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-500">Progress</span>
            <span className="text-xs font-medium text-gray-700">{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${getProgressColor()}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Indicators */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Session Check</span>
            <div className={`w-2 h-2 rounded-full ${
              progress >= 30 ? 'bg-green-400' : 'bg-gray-300'
            }`} />
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Profile Loading</span>
            <div className={`w-2 h-2 rounded-full ${
              progress >= 70 ? 'bg-green-400' : 'bg-gray-300'
            }`} />
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Initialization</span>
            <div className={`w-2 h-2 rounded-full ${
              progress >= 100 ? 'bg-green-400' : 'bg-gray-300'
            }`} />
          </div>
        </div>

        {/* Subtle Animation */}
        {progress < 100 && (
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}