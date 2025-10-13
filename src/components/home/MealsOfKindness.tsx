import { Heart, Phone, MessageCircle, Package, Truck } from 'lucide-react';

const MealsOfKindness = () => {
  const phoneNumber = '7330732710';
  const whatsappNumber = '917330732710';

  return (
    <section id="meals-of-kindness" className="py-16 bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-200 hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            {/* Header with Icon */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-center relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-4 left-4 w-12 h-12 bg-white/20 rounded-full animate-pulse"></div>
              <div className="absolute top-6 right-6 w-8 h-8 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-4 left-8 w-6 h-6 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              
              {/* Main Content */}
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="bg-white rounded-full p-4 shadow-lg">
                    <Heart className="h-12 w-12 text-orange-500 animate-pulse" />
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Meals of Kindness
                </h2>
                <p className="text-orange-100 text-lg">
                  Turning leftover food into hope for those in need
                </p>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              {/* Description */}
              <div className="text-center mb-8">
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  If you have extra food at your event, let us know! Our team will collect and pack it, then deliver it to a local NGO—no quantity is too small.
                </p>
                <p className="text-orange-600 font-semibold">
                  Please inform us at least 30 minutes before your event ends.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <Package className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Free Packing</h3>
                  <p className="text-sm text-gray-600">We provide all containers and packing materials</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <Truck className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Free Pickup</h3>
                  <p className="text-sm text-gray-600">Our team collects from your venue</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-xl">
                  <Heart className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 mb-1">Free Delivery</h3>
                  <p className="text-sm text-gray-600">Direct delivery to local NGOs</p>
                </div>
              </div>

              {/* Quick Note */}
              <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-4 mb-8 text-center">
                <p className="text-gray-700 font-medium">
                  💝 Give a missed call or WhatsApp message—our team will handle the rest!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=Hi! I have leftover food from my event that I'd like to donate. Please help arrange pickup.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
                >
                  <MessageCircle className="h-6 w-6 group-hover:animate-bounce" />
                  Contact via WhatsApp
                </a>
                
                <a
                  href={`tel:${phoneNumber}`}
                  className="group bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white p-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
                >
                  <Phone className="h-6 w-6 group-hover:animate-pulse" />
                  Contact via Phone
                </a>
              </div>

              {/* Additional Info */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  📞 <strong>{phoneNumber}</strong> | 🌟 Available 24/7 for food donations
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MealsOfKindness;
