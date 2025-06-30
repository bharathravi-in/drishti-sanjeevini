import React from 'react';
import { ArrowLeft, Shield, Eye, Database, Lock, Globe } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
            <p className="text-gray-600 dark:text-gray-400">Last updated: December 2024</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Eye className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Our Commitment to Privacy</h2>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                At DRiSHTi SANjEEViNi, we believe privacy is a fundamental right. This Privacy Policy explains how we collect, use, protect, and share your personal information when you use our platform.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                We are committed to transparency and giving you control over your personal data. This policy applies to all users of our platform and services.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Database className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Information We Collect</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Information You Provide</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>Account Information:</strong> Name, email address, password, and profile details</li>
                    <li><strong>Profile Content:</strong> Photos, interests, location, and biographical information</li>
                    <li><strong>Posts and Messages:</strong> Content you share, comments, and private messages</li>
                    <li><strong>Payment Information:</strong> Payment methods for donations (processed by third parties)</li>
                    <li><strong>Support Communications:</strong> Messages you send to our support team</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Information We Collect Automatically</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>Usage Data:</strong> How you interact with our platform and features</li>
                    <li><strong>Device Information:</strong> Device type, operating system, browser information</li>
                    <li><strong>Log Data:</strong> IP address, access times, pages viewed</li>
                    <li><strong>Cookies:</strong> Small files stored on your device for functionality and analytics</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Information from Third Parties</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li><strong>Authentication Services:</strong> If you sign up using social media accounts</li>
                    <li><strong>Payment Processors:</strong> Transaction information from payment providers</li>
                    <li><strong>Analytics Services:</strong> Aggregated usage statistics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">How We Use Your Information</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">We use your information to:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Platform Services</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>Provide and maintain our services</li>
                      <li>Enable user interactions and messaging</li>
                      <li>Process donations and payments</li>
                      <li>Customize your experience</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Safety & Security</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>Detect and prevent fraud</li>
                      <li>Enforce our Terms of Service</li>
                      <li>Moderate content and behavior</li>
                      <li>Protect user safety</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Communication</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>Send notifications and updates</li>
                      <li>Respond to support requests</li>
                      <li>Share important announcements</li>
                      <li>Provide customer support</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Improvement</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>Analyze usage patterns</li>
                      <li>Improve our services</li>
                      <li>Develop new features</li>
                      <li>Conduct research</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Globe className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">How We Share Information</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>We may share your information in the following circumstances:</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">With Other Users</h4>
                    <p className="text-sm">Profile information, posts, and comments are visible to other users as part of the platform's social features.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Service Providers</h4>
                    <p className="text-sm">We work with trusted third parties who help us operate our platform, such as hosting providers, payment processors, and analytics services.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Legal Requirements</h4>
                    <p className="text-sm">We may disclose information when required by law, to protect our rights, or to ensure user safety.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Business Transfers</h4>
                    <p className="text-sm">In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction.</p>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-green-800 dark:text-green-300 text-sm">
                    <strong>We never sell your personal information to third parties for marketing purposes.</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Lock className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Data Security</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>We implement industry-standard security measures to protect your information:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Encryption:</strong> Data is encrypted in transit and at rest</li>
                  <li><strong>Access Controls:</strong> Limited access to personal data on a need-to-know basis</li>
                  <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                  <li><strong>Secure Infrastructure:</strong> Hosted on secure, monitored servers</li>
                  <li><strong>Staff Training:</strong> Regular privacy and security training for our team</li>
                </ul>
                <p className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300">
                  <strong>Important:</strong> While we implement strong security measures, no system is 100% secure. Please use strong passwords and keep your account information confidential.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Your Privacy Rights</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>You have the following rights regarding your personal information:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Access</h4>
                      <p className="text-sm">Request a copy of your personal data</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Correction</h4>
                      <p className="text-sm">Update or correct inaccurate information</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Deletion</h4>
                      <p className="text-sm">Request deletion of your account and data</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Portability</h4>
                      <p className="text-sm">Export your data in a readable format</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Restriction</h4>
                      <p className="text-sm">Limit how we process your information</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Objection</h4>
                      <p className="text-sm">Object to certain types of processing</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm">To exercise these rights, please contact us through our support channels or account settings.</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Data Retention</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>We retain your information for as long as necessary to provide our services and comply with legal obligations:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Account Data:</strong> Until you delete your account</li>
                  <li><strong>Posts and Comments:</strong> Until you delete them or your account</li>
                  <li><strong>Messages:</strong> Until deleted by you or as required by law</li>
                  <li><strong>Log Data:</strong> Typically 12-24 months for security and analytics</li>
                  <li><strong>Payment Data:</strong> As required by financial regulations</li>
                </ul>
                <p>When you delete your account, we will remove your personal information within 30 days, except where retention is required by law.</p>
              </div>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Children's Privacy</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
                </p>
                <p>
                  If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately so we can delete such information.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* International Users */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">International Data Transfers</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Our services are hosted globally, and your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers.
                </p>
                <p>
                  For users in the European Union, we comply with GDPR requirements for data transfers outside the EU.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Changes to This Policy</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  We may update this Privacy Policy from time to time. When we make significant changes, we will notify you through the platform or by email.
                </p>
                <p>
                  We encourage you to review this policy periodically to stay informed about how we protect your information.
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
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p><strong>Privacy Officer:</strong> privacy@drishtisanjeevini.com</p>
                  <p><strong>Data Protection:</strong> dpo@drishtisanjeevini.com</p>
                  <p><strong>General Support:</strong> Through our in-app help center</p>
                  <p><strong>Address:</strong> DRiSHTi SANjEEViNi Privacy Department</p>
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