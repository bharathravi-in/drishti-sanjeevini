import React from 'react';
import { Check, Star } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { PaymentButton } from './PaymentButton';
import { StripeProduct } from '../../stripe-config';

interface ProductCardProps {
  product: StripeProduct;
  className?: string;
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const features = [
    'Enhanced community features',
    'Priority support',
    'Advanced profile customization',
    'Exclusive content access',
    'Premium badge',
  ];

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* Premium Badge */}
      <div className="absolute top-4 right-4">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
          <Star className="w-3 h-3" />
          <span>Premium</span>
        </div>
      </div>

      <CardHeader className="text-center pb-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {product.description}
        </p>
        <div className="text-center">
          <span className="text-4xl font-bold text-green-600 dark:text-green-400">
            {product.price}
          </span>
          {product.mode === 'subscription' && (
            <span className="text-gray-500 dark:text-gray-400 ml-2">/month</span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Features List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">What's included:</h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment Button */}
        <PaymentButton
          priceId={product.priceId}
          mode={product.mode}
          productName={product.name}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
        >
          {product.mode === 'subscription' ? 'Subscribe Now' : 'Purchase Now'}
        </PaymentButton>

        {/* Trust Indicators */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>🔒 Secure payment with Stripe</p>
          <p>💳 All major cards accepted</p>
          <p>✨ Instant activation</p>
        </div>
      </CardContent>
    </Card>
  );
}