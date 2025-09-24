
import { useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import CategorySection from '../components/home/CategorySection';
import TrendingSection from '../components/home/TrendingSection';
import VendorSection from '../components/home/VendorSection';
import TestimonialSection from '../components/home/TestimonialSection';
import { Link } from 'react-router-dom';
import 'primeicons/primeicons.css';




const Index = () => {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, [])  ;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <Hero />
        <CategorySection />
        <TrendingSection />
        <VendorSection />
        <TestimonialSection />
        
        {/* Blog section preview */}
        <section className="py-16 bg-wedding-light">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-wedding-navy mb-4">Wedding Planning Tips</h2>
              <p className="text-wedding-gray max-w-2xl mx-auto">Latest articles to help you plan the perfect wedding</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  id: 1,
                  title: "5 Wedding Photography Tips",
                  excerpt: "Expert advice to ensure you get the perfect wedding photos.",
                  image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                },
                {
                  id: 2,
                  title: "How to Choose the Perfect Venue",
                  excerpt: "Find the ideal wedding venue with these simple steps.",
                  image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                },
                {
                  id: 3,
                  title: "Top Wedding Food Trends",
                  excerpt: "Explore the latest culinary trends for your reception.",
                  image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                }
              ].map((blog, index) => (
                <div 
                  key={blog.id}
                  className="bg-white rounded-2xl shadow-subtle border border-wedding-orange/10 overflow-hidden transition-all duration-300 hover:shadow-card animate-fade-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2 text-wedding-navy">{blog.title}</h3>
                    <p className="text-wedding-gray mb-4">{blog.excerpt}</p>
                    <Link 
                      to="/" 
                      className="text-wedding-orange font-medium inline-flex items-center hover:text-wedding-orange-hover transition-custom"
                    >
                      Read more
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-wedding-navy mb-6">Ready to Plan Your Celebrations?</h2>
              <p className="text-wedding-gray mb-8 max-w-2xl mx-auto">
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              
                <Link to="/categories" className="btn-secondary text-base font-medium px-8 py-3 inline-block text-center">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
