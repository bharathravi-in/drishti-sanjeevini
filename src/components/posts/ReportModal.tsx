import React, { useState } from 'react';
import { Flag, AlertTriangle, X, Send, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface ReportModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: () => void;
}

const REPORT_REASONS = [
  {
    value: 'spam',
    label: 'Spam',
    description: 'Repetitive, unwanted, or promotional content',
    icon: '🚫'
  },
  {
    value: 'hate',
    label: 'Hate Speech',
    description: 'Content that promotes hatred or discrimination',
    icon: '⚠️'
  },
  {
    value: 'scam',
    label: 'Scam or Fraud',
    description: 'Suspicious financial requests or fraudulent activity',
    icon: '💰'
  },
  {
    value: 'false_info',
    label: 'False Information',
    description: 'Misleading or factually incorrect content',
    icon: '❌'
  },
  {
    value: 'inappropriate',
    label: 'Inappropriate Content',
    description: 'Content that violates community guidelines',
    icon: '🔞'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Something else that concerns you',
    icon: '📝'
  }
];

export function ReportModal({ postId, isOpen, onClose, onReportSubmitted }: ReportModalProps) {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    if (errors.reason) {
      setErrors(prev => ({ ...prev, reason: '' }));
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (errors.message) {
      setErrors(prev => ({ ...prev, message: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedReason) {
      newErrors.reason = 'Please select a reason for reporting';
    }

    if (!message.trim()) {
      newErrors.message = 'Please describe the issue';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Please provide more details (at least 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('reports')
        .insert({
          post_id: postId,
          user_id: user.id,
          reason: selectedReason,
          message: message.trim()
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already reported this post');
          onClose();
          return;
        }
        throw error;
      }

      toast.success('Report submitted successfully. Thank you for keeping our community safe.');
      
      onReportSubmitted();
      onClose();
      
      // Reset form
      setSelectedReason('');
      setMessage('');
      setErrors({});

    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setSelectedReason('');
      setMessage('');
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Flag className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Report Post</h3>
                <p className="text-sm text-gray-600">Help us keep the community safe</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClose}
              disabled={submitting}
              className="p-1 h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Warning Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 text-sm">Important</h4>
                  <p className="text-sm text-amber-700">
                    False reports may result in account restrictions. Please only report content that genuinely violates our guidelines.
                  </p>
                </div>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Why are you reporting this post? *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason.value}
                    type="button"
                    onClick={() => handleReasonSelect(reason.value)}
                    className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                      selectedReason === reason.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-lg flex-shrink-0">{reason.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{reason.label}</h4>
                        <p className="text-sm text-gray-600">{reason.description}</p>
                      </div>
                      {selectedReason === reason.value && (
                        <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {errors.reason && (
                <p className="text-sm text-red-600">{errors.reason}</p>
              )}
            </div>

            {/* Message Input */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Describe the issue *
              </label>
              <textarea
                value={message}
                onChange={handleMessageChange}
                placeholder="Please provide specific details about why this post violates our community guidelines..."
                rows={3}
                maxLength={500}
                className={`
                  w-full p-2 border border-gray-300 rounded-lg resize-none text-sm
                  focus:ring-2 focus:ring-orange-500 focus:border-transparent
                  transition-all duration-200 bg-white placeholder-gray-400
                  ${errors.message ? 'border-red-500 focus:ring-red-500' : ''}
                `}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {message.length}/500 characters
                </span>
                {errors.message && (
                  <p className="text-sm text-red-600">
                    {errors.message}
                  </p>
                )}
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 text-sm">Privacy & Review</h4>
                  <p className="text-sm text-blue-700">
                    Your report will be reviewed by our team. Reports are confidential and the user won't know who submitted it.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={!selectedReason || !message.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Send className="w-4 h-4" />
                Submit Report
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}