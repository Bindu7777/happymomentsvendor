
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Search, MapPin } from 'lucide-react';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'photography', label: 'Photography' },
  { value: 'venues', label: 'Venues' },
  { value: 'catering', label: 'Catering' },
  { value: 'decor', label: 'Decor & Design' },
  { value: 'attire', label: 'Attire & Accessories' },
  { value: 'makeup', label: 'Makeup & Hair' },
  { value: 'music', label: 'Music & Entertainment' },
];

const locations = [
  { value: 'all', label: 'All Locations' },
  { value: 'new-york', label: 'New York, NY' },
  { value: 'los-angeles', label: 'Los Angeles, CA' },
  { value: 'chicago', label: 'Chicago, IL' },
  { value: 'miami', label: 'Miami, FL' },
  { value: 'dallas', label: 'Dallas, TX' },
];

interface SearchBarProps {
  onCategoryChange?: (category: string) => void;
}

const SearchBar = ({ onCategoryChange }: SearchBarProps) => {
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const navigate = useNavigate();

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    if (onCategoryChange) {
      onCategoryChange(value);
    }
  };

  const handleSearch = () => {
    console.log('Searching for:', { category, location });
    // Navigate to search results page (currently redirects to home)
    navigate('/vendors');
  };

  return (
    <div className="w-full max-w-5xl mx-auto glass-panel rounded-2xl p-2 md:p-3 flex flex-col md:flex-row items-center">
      <div className="flex-1 md:border-r border-gray-200 p-2 md:pr-4">
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="border-0 shadow-none bg-transparent h-12 px-3">
            <div className="flex items-center">
              <Search className="mr-2 h-5 w-5 text-wedding-orange" />
              <SelectValue placeholder="Select a category" />
            </div>
          </SelectTrigger>
          <SelectContent position="popper" className="bg-white/95 backdrop-blur-md border border-wedding-orange/20 shadow-card p-2 rounded-xl animate-fade-in">
            {categories.map((cat) => (
              <SelectItem 
                key={cat.value} 
                value={cat.value}
                className="hover:bg-wedding-orange-light rounded-lg transition-custom cursor-pointer py-2"
              >
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 p-2 md:px-4">
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="border-0 shadow-none bg-transparent h-12 px-3">
            <div className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-wedding-orange" />
              <SelectValue placeholder="Select a location" />
            </div>
          </SelectTrigger>
          <SelectContent position="popper" className="bg-white/95 backdrop-blur-md border border-wedding-orange/20 shadow-card p-2 rounded-xl animate-fade-in">
            {locations.map((loc) => (
              <SelectItem 
                key={loc.value} 
                value={loc.value}
                className="hover:bg-wedding-orange-light rounded-lg transition-custom cursor-pointer py-2"
              >
                {loc.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="p-2 w-full md:w-auto">
        <Button 
          onClick={handleSearch}
          className="w-full md:w-auto bg-wedding-orange hover:bg-wedding-orange-hover text-white px-10 h-12 text-base font-medium shadow-md"
        >
          Search
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
