import React from 'react';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface PaymentCancelledProps {
  onRetry: () => void;
  onGoBack: () => void;
}

export function PaymentCancelled({ onRetry, onGoBack }: PaymentCancelledProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your payment was cancelled. No charges have been made to your account.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-orange-800 dark:text-orange-300 text-sm">
              💡 You can try again anytime. Your cart items are still saved.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onRetry}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <CreditCard className="w-4 h-4" />
              Try Payment Again
            </Button>
            
            <Button
              onClick={onGoBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back to Products
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>Need help? Contact our support team</p>
            <p>📧 support@drishtisanjeevini.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}