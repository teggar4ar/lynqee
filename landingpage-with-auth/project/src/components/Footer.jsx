import React from 'react';
import { Instagram, Linkedin, Mail, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-deep-forest text-mint-cream py-12" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-golden-yellow mb-4">
              Lynqee
            </h3>
            <p className="text-mint-cream/80 leading-body mb-6 max-w-md">
              Empowering creators and businesses to showcase their digital presence 
              with beautiful, customizable link pages that drive engagement and growth.
            </p>
            
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-mint-cream/10 rounded-full flex items-center justify-center hover:bg-golden-yellow hover:text-deep-forest transition-all duration-200"
                aria-label="Follow us on Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-mint-cream/10 rounded-full flex items-center justify-center hover:bg-golden-yellow hover:text-deep-forest transition-all duration-200"
                aria-label="Connect with us on LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-mint-cream/10 rounded-full flex items-center justify-center hover:bg-golden-yellow hover:text-deep-forest transition-all duration-200"
                aria-label="Follow us on Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-golden-yellow mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-mint-cream/80 hover:text-golden-yellow transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-mint-cream/80 hover:text-golden-yellow transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-mint-cream/80 hover:text-golden-yellow transition-colors duration-200">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-mint-cream/80 hover:text-golden-yellow transition-colors duration-200">
                  API Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-golden-yellow mb-4">
              Contact
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-mint-cream/80 hover:text-golden-yellow transition-colors duration-200">
                  Support
                </a>
              </li>
              <li>
                <a 
                  href="mailto:hello@lynqee.com" 
                  className="text-mint-cream/80 hover:text-golden-yellow transition-colors duration-200 flex items-center"
                >
                  <Mail size={16} className="mr-2" />
                  hello@lynqee.com
                </a>
              </li>
              <li>
                <a href="#" className="text-mint-cream/80 hover:text-golden-yellow transition-colors duration-200">
                  Feature Requests
                </a>
              </li>
              <li>
                <a href="#" className="text-mint-cream/80 hover:text-golden-yellow transition-colors duration-200">
                  Partner With Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-mint-cream/20 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-mint-cream/60 text-sm mb-4 md:mb-0">
              © {currentYear} Lynqee. All rights reserved.
            </p>
            <p className="text-mint-cream/60 text-sm">
              Built with ❤️ for creators worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;