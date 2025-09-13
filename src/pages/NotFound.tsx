
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex items-center justify-center bg-white py-20">
        <div className="container-custom text-center px-4">
          <div className="inline-block mb-6 px-3 py-1 bg-wedding-red/10 text-wedding-red rounded-full text-sm font-medium">
            404 Error
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-wedding-dark mb-6">Page Not Found</h1>
          <p className="text-lg text-wedding-gray mb-8 max-w-lg mx-auto">
            We're sorry, the page you're looking for doesn't exist or has been moved.
          </p>
          <Button 
            className="bg-wedding-red hover:bg-wedding-red-hover text-white px-8 py-6"
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
