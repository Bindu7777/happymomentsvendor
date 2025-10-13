
import { useEffect } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import CategorySection from '../components/home/CategorySection';
import MealsOfKindness from '../components/home/MealsOfKindness';
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
        <MealsOfKindness />
        <TestimonialSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
