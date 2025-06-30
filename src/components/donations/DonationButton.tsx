import React, { useState } from 'react';
import { Heart, CreditCard, Gift, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';

interface DonationButtonProps {
  recipientName: string;
  recipientId: string;
  upiId?: string;
  paypalEmail?: string;
  bankAccount?: string;
  className?: string;
}

export function DonationButton({ 
  recipientName, 
  recipientId, 
  upiId, 
  paypalEmail, 
  bankAccount,
  className = '' 
}: DonationButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'paypal' | 'bank' | null>(null);
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(`${type} copied to clipboard!`);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const generateUPILink = () => {
    if (!upiId || !amount) return '';
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) return '';
    
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(recipientName)}&am=${amountValue}&cu=INR&tn=${encodeURIComponent(`Support for ${recipientName} via DRiSHTi SANjEEViNi`)}`;
  };

  const generatePayPalLink = () => {
    if (!paypalEmail || !amount) return '';
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) return '';
    
    return `https://www.paypal.com/paypalme/${paypalEmail}/${amountValue}`;
  };

  const availableMethods = [
    upiId && { type: 'upi' as const, label: 'UPI Payment', icon: '💳', value: upiId },
    paypalEmail && { type: 'paypal' as const, label: 'PayPal', icon: '🌐', value: paypalEmail },
    bankAccount && { type: 'bank' as const, label: 'Bank Transfer', icon: '🏦', value: bankAccount }
  ].filter(Boolean);

  if (availableMethods.length === 0) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        className={`text-pink-600 hover:text-pink-700 hover:border-pink-300 hover:bg-pink-50 ${className}`}
      >
        <Heart className="w-4 h-4" />
        Support
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                    <Gift className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Support {recipientName}</h3>
                    <p className="text-sm text-gray-600">Choose your preferred payment method</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="p-1 h-6 w-6"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (Optional)
                  </label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to let the supporter choose the amount
                  </p>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Methods
                  </label>
                  
                  {availableMethods.map((method) => (
                    <div
                      key={method.type}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedMethod === method.type
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-300 hover:border-pink-300'
                      }`}
                      onClick={() => setSelectedMethod(method.type)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{method.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{method.label}</p>
                            <p className="text-sm text-gray-600">{method.value}</p>
                          </div>
                        </div>
                        {selectedMethod === method.type && (
                          <div className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                {selectedMethod && (
                  <div className="space-y-3 pt-4 border-t">
                    {selectedMethod === 'upi' && (
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleCopy(upiId!, 'UPI ID')}
                          variant="outline"
                          className="w-full"
                        >
                          {copied === 'UPI ID' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          Copy UPI ID
                        </Button>
                        {amount && (
                          <Button
                            onClick={() => {
                              const upiLink = generateUPILink();
                              if (upiLink) {
                                window.open(upiLink, '_blank');
                              } else {
                                toast.error('Please enter a valid amount');
                              }
                            }}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Pay ₹{amount} via UPI
                          </Button>
                        )}
                      </div>
                    )}

                    {selectedMethod === 'paypal' && (
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleCopy(paypalEmail!, 'PayPal Email')}
                          variant="outline"
                          className="w-full"
                        >
                          {copied === 'PayPal Email' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          Copy PayPal Email
                        </Button>
                        {amount && (
                          <Button
                            onClick={() => {
                              const paypalLink = generatePayPalLink();
                              if (paypalLink) {
                                window.open(paypalLink, '_blank');
                              } else {
                                toast.error('Please enter a valid amount');
                              }
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Pay ${amount} via PayPal
                          </Button>
                        )}
                      </div>
                    )}

                    {selectedMethod === 'bank' && (
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleCopy(bankAccount!, 'Bank Account')}
                          variant="outline"
                          className="w-full"
                        >
                          {copied === 'Bank Account' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          Copy Bank Details
                        </Button>
                        <p className="text-xs text-gray-500 text-center">
                          Use your banking app to transfer funds
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                  <p className="text-yellow-800 text-xs">
                    <strong>Important:</strong> All donations are voluntary. DRiSHTi SANjEEViNi does not process payments directly and is not responsible for transaction disputes. Please verify recipient details before sending money.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}