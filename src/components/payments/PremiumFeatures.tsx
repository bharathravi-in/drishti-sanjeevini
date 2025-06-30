import React from 'react';
import { Crown, Star, Shield, Zap, Heart, Users } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { ProductCard } from './ProductCard';
import { stripeProducts } from '../../stripe-config';

export function PremiumFeatures() {
  const features = [
    {
      icon: <Crown className="w-6 h-6 text-yellow-500" />,
      title: 'Premium Badge',
      description: 'Stand out in the community with your exclusive premium badge'
    },
    {
      icon: <Star className="w-6 h-6 text-purple-500" />,
      title: 'Priority Support',
      description: 'Get faster response times and dedicated support from our team'
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      title: 'Enhanced Privacy',
      description: 'Advanced privacy controls and secure messaging features'
    },
    {
      icon: <Zap className="w-6 h-6 text-orange-500" />,
      title: 'Advanced Features',
      description: 'Access to beta features and advanced customization options'
    },
    {
      icon: <Heart className="w-6 h-6 text-red-500" />,
      title: 'Exclusive Content',
      description: 'Access to premium content and community resources'
    },
    {
      icon: <Users className="w-6 h-6 text-green-500" />,
      title: 'VIP Community',
      description: 'Join our exclusive premium member community'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Unlock Premium Features
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Enhance your DRiSHTi SANjEEViNi experience with premium features designed to help you connect better and get more support from our community.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {stripeProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Trust Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Trusted by Our Community
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Secure payments with Stripe</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span>Join 1000+ premium members</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}