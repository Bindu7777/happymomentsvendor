import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, Youtube, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-wedding-navy py-16 text-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <h3 className="text-2xl font-bold text-white">Happy<span className="text-wedding-orange">Moments</span></h3>
            </Link>
            <p className="text-white/80 text-sm">
              Your ultimate event planner and tools provider
            </p>
            <div className="flex space-x-4">
              <Link 
                to="/" 
                className="text-white/80 hover:text-wedding-orange transition-custom p-2 bg-wedding-navy-hover rounded-full"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <a 
                href="https://www.instagram.com/happymomentsupaya" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/80 hover:text-wedding-orange transition-custom p-2 bg-wedding-navy-hover rounded-full"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <Link 
                to="/" 
                className="text-white/80 hover:text-wedding-orange transition-custom p-2 bg-wedding-navy-hover rounded-full"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                to="/" 
                className="text-white/80 hover:text-wedding-orange transition-custom p-2 bg-wedding-navy-hover rounded-full"
                aria-label="Youtube"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          {/* About/Team Section */}
          <div>
            <h4 className="font-semibold text-lg text-white mb-6">About/Team</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/team" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Our Team
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/80 hover:text-wedding-orange transition-custom">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Platform Features Section */}
          <div>
            <h4 className="font-semibold text-lg text-white mb-6">Platform Features</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/categories" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/meals-of-kindness" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Meals of Kindness
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal and Help Section */}
          <div>
            <h4 className="font-semibold text-lg text-white mb-6">Legal & Help</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/privacy" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Navigation Section */}
          <div>
            <h4 className="font-semibold text-lg text-white mb-6">Navigation</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/vendors" className="text-white/80 hover:text-wedding-orange transition-custom">
                  View All Vendors
                </Link>
              </li>
              <li>
                <Link to="/vendor-login" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Vendor Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <div className="text-white/70 text-sm">
            © {new Date().getFullYear()} Happy Moments. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
