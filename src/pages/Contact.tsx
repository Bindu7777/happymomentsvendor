import { Phone, Mail, MessageCircle, ArrowLeft, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const phoneNumber = '7330732710';
  const email = 'helpine@gmail.com';
  const whatsappNumber = '917330732710';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-wedding-orange transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-full p-6 shadow-xl">
              <Headphones className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Contact us for any help
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            If you need assistance with anything, our team is here to help.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Phone Card */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:scale-105">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 rounded-full p-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
              Call Us
            </h3>
            <p className="text-gray-600 mb-6 text-center text-lg font-semibold">
              {phoneNumber}
            </p>
            <a
              href={`tel:${phoneNumber}`}
              className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold text-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            >
              <Phone className="h-5 w-5 inline mr-2" />
              Call Now
            </a>
          </div>

          {/* WhatsApp Card */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:scale-105">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4">
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
              WhatsApp
            </h3>
            <p className="text-gray-600 mb-6 text-center text-lg font-semibold">
              {phoneNumber}
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-xl font-semibold text-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            >
              <MessageCircle className="h-5 w-5 inline mr-2" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Email Card */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:scale-105">
            <div className="flex justify-center mb-6">
              <div className="bg-orange-100 rounded-full p-4">
                <Mail className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
              Email Us
            </h3>
            <p className="text-gray-600 mb-6 text-center text-lg font-semibold break-all">
              {email}
            </p>
            <a
              href={`mailto:${email}`}
              className="block w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-3 px-6 rounded-xl font-semibold text-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            >
              <Mail className="h-5 w-5 inline mr-2" />
              Email Us
            </a>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            We're Here to Help!
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Our support team is available to assist you with:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="flex items-start">
              <div className="bg-orange-100 rounded-full p-2 mr-3 mt-1">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              </div>
              <p className="text-gray-700">Vendor inquiries and bookings</p>
            </div>
            <div className="flex items-start">
              <div className="bg-orange-100 rounded-full p-2 mr-3 mt-1">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              </div>
              <p className="text-gray-700">Event planning assistance</p>
            </div>
            <div className="flex items-start">
              <div className="bg-orange-100 rounded-full p-2 mr-3 mt-1">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              </div>
              <p className="text-gray-700">Technical support</p>
            </div>
            <div className="flex items-start">
              <div className="bg-orange-100 rounded-full p-2 mr-3 mt-1">
                <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              </div>
              <p className="text-gray-700">General questions and feedback</p>
            </div>
          </div>
        </div>

        {/* Quick Response Time Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full shadow-lg">
            <span className="relative flex h-3 w-3 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="font-semibold">Quick Response Time - We're Online!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

