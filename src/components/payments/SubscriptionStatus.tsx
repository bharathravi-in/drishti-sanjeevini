import React, { useState, useEffect } from 'react';
import { Crown, Calendar, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getProductByPriceId } from '../../stripe-config';

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export function SubscriptionStatus() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription:', error);
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return null; // Don't show anything if no subscription
  }

  const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : null;
  const isActive = subscription.subscription_status === 'active';
  const isPastDue = subscription.subscription_status === 'past_due';
  const isCancelled = subscription.subscription_status === 'canceled';

  const getStatusColor = () => {
    if (isActive) return 'text-green-600 dark:text-green-400';
    if (isPastDue) return 'text-yellow-600 dark:text-yellow-400';
    if (isCancelled) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getStatusIcon = () => {
    if (isActive) return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
    if (isPastDue) return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    if (isCancelled) return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    return <Crown className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Crown className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {product?.name || 'Premium Subscription'}
            </h3>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {subscription.subscription_status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isActive && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-green-800 dark:text-green-300 text-sm">
              🎉 You have access to all premium features!
            </p>
          </div>
        )}

        {isPastDue && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-yellow-800 dark:text-yellow-300 text-sm">
              ⚠️ Your payment is past due. Please update your payment method to continue enjoying premium features.
            </p>
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-800 dark:text-red-300 text-sm">
              Your subscription has been cancelled. You'll lose access to premium features at the end of your billing period.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {subscription.current_period_end && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  {subscription.cancel_at_period_end ? 'Expires:' : 'Renews:'}
                </span>
                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                  {formatDate(subscription.current_period_end)}
                </span>
              </div>
            </div>
          )}

          {subscription.payment_method_brand && subscription.payment_method_last4 && (
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-gray-600 dark:text-gray-400">Payment:</span>
                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                  {subscription.payment_method_brand.toUpperCase()} ****{subscription.payment_method_last4}
                </span>
              </div>
            </div>
          )}
        </div>

        {(isPastDue || isCancelled) && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => {
                // This would typically open a customer portal or payment update flow
                window.open('https://billing.stripe.com/p/login/test_your_portal_link', '_blank');
              }}
            >
              Manage Subscription
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}