import { Link } from 'react-router-dom';
import { Mic, MessageCircle, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SmartRequestSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Zap className="h-4 w-4" />
              AI-Powered
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              🎙 Smart Request – Your Personal Event Assistant
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Simply type or record your requirement, like{' '}
              <span className="font-semibold text-orange-600">
                "I need a makeup artist for my wedding in Hyderabad on Dec 10, budget 1L"
              </span>
              , and we'll instantly match you with the right vendors.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mic className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Voice Input</h3>
              <p className="text-gray-600 text-sm">
                Speak naturally and let our AI understand your exact needs
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Text Input</h3>
              <p className="text-gray-600 text-sm">
                Type your requirements in plain English, just like chatting
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Matching</h3>
              <p className="text-gray-600 text-sm">
                Get perfect vendor matches based on your specific requirements
              </p>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-orange-200 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Try these examples:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400">
                <p className="text-gray-700">
                  <strong>"Wedding photographer in Mumbai, budget 50k, traditional style"</strong>
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400">
                <p className="text-gray-700">
                  <strong>"Birthday party decorator for 50 guests, Delhi, next month"</strong>
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400">
                <p className="text-gray-700">
                  <strong>"Corporate event caterer, vegetarian, 200 people, Bangalore"</strong>
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border-l-4 border-orange-400">
                <p className="text-gray-700">
                  <strong>"Mehendi artist for wedding, traditional designs, Hyderabad"</strong>
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Link to="/smart-request">
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto">
              <Mic className="h-5 w-5" />
              <MessageCircle className="h-4 w-4" />
              Make a Smart Request
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SmartRequestSection;
