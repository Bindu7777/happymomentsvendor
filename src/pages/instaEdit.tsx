import Header from "@/components/layout/Header";
import React, { useState } from "react";
import { useCustomerAuth } from '../contexts/CustomerAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { User, Lock, ArrowRight } from 'lucide-react';

const packages = [
  {
    icon: "⭐",
    title: "Insta Mini",
    price: "₹4,999",
    bestFor: "Small events & celebrations",
    features: [
      "2 Reels + 5 Posts / Stories",
      "Social Media Handling (1-platform)",
      "Same-day editing & delivery",
      "Simple edits & trending music",
    ],
    iconColor: "text-yellow-500",
    bestseller: false,
  },
  {
    icon: "🪶",
    title: "Insta Pro",
    price: "₹6,999",
    bestFor: "Weddings, Grand Celebrations & Brands",
    features: [
      "5 Reels + 8 Posts / Stories",
      "Social Media Handling (2-3 platforms)",
      "Same-day editing & delivery",
      "Premium edits with color grading",
      "Captions & basic hashtag research",
    ],
    iconColor: "text-orange-400",
    bestseller: true,
  },
  {
    icon: "👑",
    title: "Insta Elite",
    price: "₹11,999",
    bestFor: "Weddings, Grand Celebrations & Brands",
    features: [
      "5 Reels + 8 Posts / Stories",
      "Social Media Handling (2-3 platforms)",
      "Same-day editing & delivery",
      "Cinematic edits with advanced color grading",
      "Branding & visual consistency across platforms",
    ],
    iconColor: "text-yellow-600",
    bestseller: false,
  },
];
const phoneNumber = "+917330732710";

const openWhatsApp = (pkg: string, customer: any, setShowAuthModal: (show: boolean) => void) => {
  if (!customer) {
    setShowAuthModal(true);
    return;
  }
  
  const message = `Hello, I would like to book the Insta Edit ${pkg} Package I saw on your website.`;
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;
  window.open(url, "_blank");
};


export default function InstaEditPackages() {
  const { customer } = useCustomerAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-bl to-pink-300 from-white p-4 sm:p-8">
      {" "}
      <Header />
      <div className="flex items-center justify-center mb-10 mt-20">
        <h1 className="text-2xl sm:text-4xl font-bold text-center">
          Insta Edit Packages
        </h1>
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.title}
            className="relative bg-white shadow-lg rounded-2xl p-5 sm:p-6 mb-4 hover:shadow-2xl transition-shadow duration-300 
            w-full sm:w-[80vw] md:w-[45vw] lg:w-[30vw] xl:w-[24vw] max-w-xs sm:max-w-none flex flex-col"
          >
            {/* Bestseller Badge */}
            {pkg.bestseller && (
              <span className="absolute -top-3 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Bestseller
              </span>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`text-2xl mr-2 ${pkg.iconColor}`}>
                  {pkg.icon}
                </span>
                <span className="text-xl sm:text-2xl font-semibold mb-2">
                  {pkg.title.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="text-sm sm:text-md text-gray-600 font-semibold mb-2 sm:mb-4">
              Best for:{" "}
              <span className="text-md sm:text-md text-black font-normal">
                {pkg.bestFor}
              </span>
            </div>
            <span className=" flex text-xl sm:text-xl font-bold rounded-2xl bg-orange-200 px-2 py-1 mb-4 mr-44 justify-center text-center text-black/80 font-montserrat">
              {pkg.price}
            </span>
            <ul className="space-y-2 flex-grow">
              {pkg.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-800 text-base sm:text-lg">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            {/* Buttons */}
            <div className="mt-6 flex space-x-4">
              <button
                type="button"
                className="flex-1 bg-white hover:bg-black/80 hover:text-white border-black border-[1.4px] text-black font-semibold py-2 rounded-lg transition"
                onClick={() => openWhatsApp(pkg.title, customer, setShowAuthModal)}
              >
                Book Now
              </button>
              <a
                href={`tel:${phoneNumber}`}
                className="flex-1 border border-orange-500 text-orange-600 font-semibold py-2 rounded-lg text-center hover:bg-orange-100 transition"
              >
                Call
              </a>
              <a href=""></a>
            </div>
          </div>
        ))}
      </div>

      {/* Auth Required Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Lock className="h-6 w-6 text-orange-500" />
              Login Required
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <p className="text-gray-600 mb-2">
                You need to be logged in to book Insta Edit packages.
              </p>
              <p className="text-sm text-gray-500">
                Login to contact our team and access all booking features.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setShowAuthModal(false);
                  window.location.href = '/customer-login';
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <User className="h-5 w-5" />
                Login to Your Account
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-gray-500">or</span>
              </div>
              
              <Button 
                onClick={() => {
                  setShowAuthModal(false);
                  window.location.href = '/customer-signup';
                }}
                variant="outline" 
                className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Create New Account
              </Button>
            </div>
            
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                By logging in, you can book packages, track orders, and access exclusive features.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
