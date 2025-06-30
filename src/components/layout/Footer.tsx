import React from 'react';
import { Sparkles, Heart, Shield, Mail, MapPin, Phone } from 'lucide-react';

interface FooterProps {
  onTermsClick: () => void;
  onPrivacyClick: () => void;
}

export function Footer({ onTermsClick, onPrivacyClick }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">DRiSHTi SANjEEViNi</h3>
                <p className="text-gray-400 text-sm">Building Communities That Care</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4 max-w-md">
              Connecting people who need help with those who want to help, fostering genuine community support and meaningful connections.
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Made with love</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure & Private</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">Community Feed</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Explore</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Create Post</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Messages</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Help Center</a>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="font-semibold mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <button 
                  onClick={onTermsClick}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={onPrivacyClick}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Community Guidelines</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Safety Center</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Contact Support</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>support@drishtisanjeevini.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>+91 (800) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Building Communities Worldwide</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © {currentYear} DRiSHTi SANjEEViNi. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <button 
              onClick={onTermsClick}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Terms
            </button>
            <button 
              onClick={onPrivacyClick}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Privacy
            </button>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}