import { ArrowLeft, Clock, Sparkles, Wrench, Users, CheckCircle, Rocket, Users2, Palette, DollarSign, Crown, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ComingSoon = () => {
  const [showContent, setShowContent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger entrance animations
    const timer1 = setTimeout(() => setShowContent(true), 300);
    const timer2 = setTimeout(() => setShowConfetti(true), 800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const features = [
    { icon: Users, title: 'Guest Tracking', delay: 0 },
    { icon: Palette, title: 'Designs & Themes', delay: 100 },
    { icon: CheckCircle, title: 'Smart Checklists', delay: 200 },
    { icon: DollarSign, title: 'Budget Tracker', delay: 300 },
    { icon: Rocket, title: 'Last-Min Vendor Finding', delay: 400 },
    { icon: Crown, title: 'Concepts & Themes', delay: 500 },
    { icon: Users2, title: 'Seating Arrangements', delay: 600 },
    { icon: ClipboardList, title: 'Task Manager', delay: 700 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Confetti */}
        {showConfetti && (
          <>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full animate-bounce opacity-60 ${
                  i % 4 === 0 ? 'bg-orange-400' : 
                  i % 4 === 1 ? 'bg-amber-400' : 
                  i % 4 === 2 ? 'bg-yellow-400' : 'bg-orange-300'
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </>
        )}
        
        {/* Floating Ribbons */}
        <div className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-r from-orange-200 to-amber-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-1/4 right-20 w-12 h-12 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute bottom-1/4 left-1/4 w-8 h-8 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full opacity-35 animate-pulse"></div>
        
        {/* Sparkles */}
        <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-orange-400 rounded-full animate-ping"></div>
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-amber-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Back Button - Far Left with Enhanced Styling */}
          <div className="mb-8 text-left">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-gray-700 hover:text-wedding-orange transition-all duration-300 transform hover:scale-105 hover:-translate-x-2 group text-lg font-medium"
            >
              <ArrowLeft className="h-6 w-6 transition-transform duration-300 group-hover:-translate-x-1" />
              Back to Home
            </Link>
          </div>

          {/* Main Icon with Enhanced Animation */}
          <div className={`flex justify-center mb-8 transition-all duration-1000 ${showContent ? 'animate-bounce' : 'opacity-0 scale-0'}`}>
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-full p-8 shadow-2xl animate-pulse hover:animate-none hover:scale-110 transition-all duration-300 group">
              <Wrench className="h-24 w-24 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>

          {/* Coming Soon Badge with Animation */}
          <div className={`inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 px-6 py-3 rounded-full border border-orange-200 mb-6 transition-all duration-700 ${showContent ? 'animate-wobble' : 'opacity-0 -translate-y-4'}`}>
            <Clock className="h-5 w-5 animate-spin" />
            <span className="font-semibold">Coming Soon</span>
          </div>

          {/* Main Heading with Typewriter Effect */}
          <div className="mb-6">
            <h1 className={`text-4xl md:text-6xl font-bold text-gray-800 transition-all duration-1000 ${showContent ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
              <span className="inline-block animate-typewriter">Ultimate Free Event Tools</span>
            </h1>
          </div>

          {/* Subheading with Staggered Animation */}
          <p className={`text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed transition-all duration-1000 delay-300 ${showContent ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
            We're working hard to bring you amazing event planning tools that will make your celebrations even more special!
          </p>

          {/* Features Preview with Enhanced Animations */}
          <div className={`bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 transition-all duration-1000 delay-500 ${showContent ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">What's Coming:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 group cursor-pointer transition-all duration-500 hover:scale-105 hover:bg-orange-50 p-3 rounded-lg ${showContent ? 'animate-slide-in-left' : 'opacity-0 -translate-x-8'}`}
                    style={{
                      animationDelay: `${600 + feature.delay}ms`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div className="bg-orange-100 rounded-full p-3 group-hover:bg-orange-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                      <IconComponent className="h-5 w-5 text-orange-600 group-hover:text-orange-700 transition-all duration-300" />
                    </div>
                    <span className="text-gray-700 group-hover:text-orange-700 font-medium transition-colors duration-300">{feature.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Call to Action with Enhanced Animations */}
          <div className={`space-y-4 transition-all duration-1000 delay-700 ${showContent ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
            <p className="text-gray-600 mb-6">
              Stay tuned for these amazing tools that will revolutionize your event planning experience!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <Sparkles className="h-5 w-5 group-hover:animate-spin" />
                Explore Our Vendors
              </Link>
              
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 group"
              >
                <span className="group-hover:animate-pulse">Get Updates</span>
              </Link>
            </div>
          </div>

          {/* Enhanced Decorative Elements */}
          <div className={`mt-12 flex justify-center space-x-4 transition-all duration-1000 delay-1000 ${showContent ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}>
            <div className="w-3 h-3 bg-orange-300 rounded-full animate-pulse hover:animate-bounce cursor-pointer"></div>
            <div className="w-3 h-3 bg-amber-300 rounded-full animate-pulse hover:animate-bounce cursor-pointer" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-3 h-3 bg-orange-300 rounded-full animate-pulse hover:animate-bounce cursor-pointer" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes wobble {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-5px) rotate(-5deg); }
          30% { transform: translateX(5px) rotate(3deg); }
          45% { transform: translateX(-3px) rotate(-3deg); }
          60% { transform: translateX(2px) rotate(2deg); }
          75% { transform: translateX(-1px) rotate(-1deg); }
        }
        
        .animate-typewriter {
          overflow: hidden;
          border-right: 3px solid orange;
          white-space: nowrap;
          animation: typewriter 3s steps(30, end), blink-caret 0.5s step-end infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out forwards;
        }
        
        .animate-wobble {
          animation: wobble 1s ease-in-out;
        }
        
        @keyframes blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: orange; }
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;
