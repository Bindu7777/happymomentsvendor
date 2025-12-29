
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Building2, Utensils, Flower2, ShoppingBag, Music, Users, Sparkles, Mic, Car, Tent } from 'lucide-react';
import { CATEGORY_LIST } from '@/constants/categories';
import { useState, useEffect } from 'react';
import { getVendorCounts } from '@/services/supabaseService';

// Icon mapping for categories
const categoryIcons = {
  'Event Planners': Users,
  'Venues': Building2,
  'Photography/Videography': Camera,
  'Decorators': Flower2,
  'Caterers': Utensils,
  'Makeup Artists': Sparkles,
  'DJs, Lighting, and Entertainment': Music,
  'Anchors': Mic,
  'Transportation Services': Car,
  'Fashion/Costume Designers': ShoppingBag,
  'Tent & Equipment Rentals': Tent
};

const CategorySection = () => {
  const [vendorCounts, setVendorCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Generate categories from constants with icons and styling
  const categories = CATEGORY_LIST.map((category, index) => ({
    id: parseInt(category.code),
    title: category.name,
    icon: categoryIcons[category.name as keyof typeof categoryIcons] || Users,
    color: 'bg-wedding-orange-light',
    iconColor: 'text-wedding-orange',
    count: vendorCounts[category.name] || 0
  }));

  // Fetch vendor counts for each category
  useEffect(() => {
    const fetchVendorCounts = async () => {
      try {
        setLoading(true);
        console.log('Fetching vendor counts...');
        const counts = await getVendorCounts();
        console.log('Vendor counts by category:', counts);
        setVendorCounts(counts);
      } catch (error) {
        console.error('Error fetching vendor counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorCounts();
  }, []);
  const planPulseTools = [
    { title: 'Guest Tracking', icon: '👥', link: 'https://www.happymomentsindia.com/guestTracker' },
    { title: 'Designs & Themes', icon: '🎨', link: 'https://www.happymomentsindia.com/designs-themes' },
    { title: 'Checklists', icon: '✅', link: 'https://www.happymomentsindia.com/checklists' },
    { title: 'Budget Tracker', icon: '💰', link: 'https://www.happymomentsindia.com/budget-tracker' },
    { title: 'Last-Min Vendor Finding', icon: '🚀', link: 'https://www.happymomentsindia.com/lastmin-vendor' },
    { title: 'Concepts & Themes', icon: '🌟', link: 'https://www.happymomentsindia.com/concepts-themes' },
    { title: 'Seating Arrangements', icon: '🪑', link: 'https://www.happymomentsindia.com/seating-arrangements' },
    { title: 'Task Manager', icon: '📝', link: 'https://www.happymomentsindia.com/task-manager' },
  ];

  return (
    <section id="categories" className="py-20 bg-wedding-light">
      <div className="container-custom">

        {/* Find Vendors Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-wedding-navy mb-4">Find By Category</h2>
          <p className="text-wedding-gray max-w-2xl mx-auto">Find the perfect vendors for every aspect of your wedding day.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20">
          {categories.map((category, index) => (
            <Link 
              key={category.id}
              to={`/category/${category.title.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-')}`}
              className="group rounded-2xl border border-wedding-orange/10 bg-white p-6 text-center transition-all hover:shadow-card overflow-hidden relative animate-fade-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${category.color} transition-all duration-300 group-hover:scale-110`}>
                <category.icon className={`h-7 w-7 ${category.iconColor}`} />
              </div>
              <h3 className="mb-1 font-semibold text-wedding-navy group-hover:text-wedding-orange transition-custom">{category.title}</h3>
              <p className="text-sm text-wedding-gray">
                {loading ? 'Loading...' : `${category.count} vendors`}
              </p>

              {/* Background hover effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-wedding-orange/0 to-wedding-orange/0 opacity-0 group-hover:opacity-5 transition-all duration-300"></div>
            </Link>
          ))}
        </div>

        {/* PlanPulse Tools Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-600 mb-4">Ultimate Free Event Tools</h2>
          <p className="text-wedding-gray max-w-2xl mx-auto">Smarter planning, happier celebrations!</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {planPulseTools.map((tool, index) => (
            <button 
              key={index}
              onClick={() => navigate('/coming-soon')}
              className="group rounded-2xl border border-navy-300 bg-white p-6 text-center transition-all hover:shadow-card overflow-hidden relative animate-fade-up cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-100 text-navy-600 text-2xl transition-all duration-300 group-hover:scale-110">
                {tool.icon}
              </div>
              <h3 className="mb-1 font-semibold text-navy-700 group-hover:text-navy-500 transition-custom">{tool.title}</h3>

              {/* Background hover effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-100/0 to-navy-200/0 opacity-0 group-hover:opacity-5 transition-all duration-300"></div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategorySection;
