import React from 'react';
import { ArrowLeft, Shield, Users, AlertTriangle, Scale } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
            <p className="text-gray-600 dark:text-gray-400">Last updated: December 2024</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Introduction</h2>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Welcome to DRiSHTi SANjEEViNi ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our platform and services. By accessing or using DRiSHTi SANjEEViNi, you agree to be bound by these Terms.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                Our platform is designed to build communities that care, connecting people who need help with those who want to help. We are committed to maintaining a safe, supportive, and inclusive environment for all users.
              </p>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Acceptable Use</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">You agree to:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Use the platform for legitimate community support and connection</li>
                    <li>Provide accurate and truthful information in your profile and posts</li>
                    <li>Respect other users and maintain a supportive environment</li>
                    <li>Report inappropriate content or behavior</li>
                    <li>Comply with all applicable laws and regulations</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">You agree NOT to:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Post spam, promotional content, or unsolicited advertisements</li>
                    <li>Share hate speech, discriminatory content, or harassment</li>
                    <li>Engage in fraudulent activities or scams</li>
                    <li>Share false information or misleading content</li>
                    <li>Violate others' privacy or intellectual property rights</li>
                    <li>Use the platform for illegal activities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Content */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">User-Generated Content</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  You retain ownership of the content you post on DRiSHTi SANjEEViNi. However, by posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content on our platform.
                </p>
                <p>
                  You are responsible for the content you post and must ensure it complies with these Terms and applicable laws. We reserve the right to remove content that violates our community guidelines.
                </p>
                <p>
                  We do not endorse or guarantee the accuracy of user-generated content. Users should exercise their own judgment when interacting with content and other users.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Privacy and Data Protection</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using our platform, you consent to our data practices as described in our Privacy Policy.
                </p>
                <p>
                  We implement appropriate security measures to protect your data, but no system is 100% secure. You are responsible for maintaining the confidentiality of your account credentials.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Moderation */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Content Moderation</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  We employ both automated systems and human moderators to maintain community standards. We reserve the right to:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Remove content that violates these Terms</li>
                  <li>Suspend or terminate accounts for violations</li>
                  <li>Investigate reports of misconduct</li>
                  <li>Cooperate with law enforcement when necessary</li>
                </ul>
                <p>
                  If you believe content has been removed in error, you may appeal our decision through our support channels.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Donations and Payments */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Donations and Financial Transactions</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Our platform may facilitate donations and financial support between community members. Please note:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>All donations are voluntary and at your own discretion</li>
                  <li>We are not responsible for the fulfillment of donation promises</li>
                  <li>Payment processing is handled by third-party providers</li>
                  <li>You are responsible for any tax implications of donations</li>
                  <li>We do not guarantee the legitimacy of fundraising requests</li>
                </ul>
                <p>
                  Always exercise caution when making financial transactions and report suspicious activity.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Disclaimers and Limitations</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  DRiSHTi SANjEEViNi is provided "as is" without warranties of any kind. We do not guarantee:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Uninterrupted or error-free service</li>
                  <li>The accuracy or reliability of user content</li>
                  <li>The safety or legitimacy of user interactions</li>
                  <li>The availability of specific features or services</li>
                </ul>
                <p>
                  We are not liable for any damages arising from your use of the platform, including but not limited to direct, indirect, incidental, or consequential damages.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Changes to These Terms</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  We may update these Terms from time to time. When we make changes, we will notify users through the platform and update the "Last updated" date at the top of this document.
                </p>
                <p>
                  Your continued use of the platform after changes are posted constitutes acceptance of the new Terms.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Contact Us</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p><strong>Email:</strong> legal@drishtisanjeevini.com</p>
                  <p><strong>Address:</strong> DRiSHTi SANjEEViNi Legal Department</p>
                  <p><strong>Support:</strong> Through our in-app help center</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
          <p>© 2024 DRiSHTi SANjEEViNi. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}