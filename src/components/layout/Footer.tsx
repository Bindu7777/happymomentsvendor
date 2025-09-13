import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, Youtube, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-wedding-navy py-16 text-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
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
              <Link 
                to="/" 
                className="text-white/80 hover:text-wedding-orange transition-custom p-2 bg-wedding-navy-hover rounded-full"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
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
          
          <div>
            <h4 className="font-semibold text-lg text-white mb-6">For Couples</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-white/80 hover:text-wedding-orange transition-custom">
                  How it Works
                </Link>
              </li>
              <li>
                <Link to="/vendors" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Browse Vendors
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Wedding Planning Tools
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Wedding Ideas & Inspiration
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Real Weddings
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg text-white mb-6">For Vendors</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Join as Vendor
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Marketing Resources
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg text-white mb-6">Company</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-white/80 hover:text-wedding-orange transition-custom">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/80 hover:text-wedding-orange transition-custom">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <div className="text-white/70 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} HappyMoments. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <a href="mailto:happymomentsforindia.com" className="text-white/70 hover:text-wedding-orange flex items-center text-sm transition-custom">
              <Mail className="h-4 w-4 mr-2" />
              happymomentsforindia.com
            </a>
            <a href="tel:+1234567890" className="text-white/70 hover:text-wedding-orange flex items-center text-sm transition-custom">
              <Phone className="h-4 w-4 mr-2" />
              +91 7330732710
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
