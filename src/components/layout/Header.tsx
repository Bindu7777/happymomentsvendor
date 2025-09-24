import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown, User, Lock, LogIn, AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserStore } from "@/store/userStore";
import { vendorLogin, saveVendorSession, getLoggedInVendor, vendorLogout } from "@/services/supabaseService";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vendorUsername, setVendorUsername] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');
  const [vendorLoginLoading, setVendorLoginLoading] = useState(false);
  const [vendorLoginError, setVendorLoginError] = useState('');
  const [loggedInVendor, setLoggedInVendor] = useState(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  // Check if vendor is logged in on component mount
  useEffect(() => {
    const vendor = getLoggedInVendor();
    setLoggedInVendor(vendor);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleVendorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vendorUsername.trim() || !vendorPassword.trim()) {
      setVendorLoginError('Please enter both username and password');
      return;
    }

    setVendorLoginLoading(true);
    setVendorLoginError('');

    try {
      const result = await vendorLogin(vendorUsername.trim(), vendorPassword);
      
      if (result.success && result.vendor) {
        saveVendorSession(result.vendor);
        setLoggedInVendor(result.vendor);
        setVendorUsername('');
        setVendorPassword('');
        navigate('/vendor-dashboard');
      } else {
        setVendorLoginError(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setVendorLoginError('An error occurred during login. Please try again.');
    } finally {
      setVendorLoginLoading(false);
    }
  };

  const handleVendorLogout = () => {
    vendorLogout();
    setLoggedInVendor(null);
    navigate('/');
  };
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
  
      if (currentScrollY > lastScrollY && currentScrollY > 20) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
      }
  
      setLastScrollY(currentScrollY);
      setScrolled(currentScrollY > 20);
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);
  
  return (
    <header
    className={`fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 transform
      ${scrolled ? "bg-wedding-navy/95 backdrop-blur-md shadow-sm" : "bg-wedding-navy/95 backdrop-blur-md"}
      ${scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"}
    `}
  >
      <div className=" container-custom flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* Logo with image - updated with white background */}
          <Link to="/" className="flex items-center">
            <div className="bg-white rounded-full mx-1 h-8 w-8 flex items-center justify-center shadow-md">
              <img
                src="/favicon.ico"
                alt="HappyMoments Logo"
                // className="w-8 rounded-full h-8"
              />
            </div>
            <span className="text-2xl font-bold text-white font-playfair">
              Happy<span className="text-wedding-orange">Moments</span>
            </span>
          </Link>

          {/* Desktop Navigation - moved next to logo */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/smart-request"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              🎯 Smart Request
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-white hover:text-wedding-orange transition-custom">
                Categories <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white/95 backdrop-blur-md border border-wedding-orange/20 shadow-card p-2 rounded-xl w-56 animate-fade-in">
              <DropdownMenuItem className="hover:bg-wedding-orange-light rounded-lg transition-custom cursor-pointer px-3 py-2">
                  <Link to="/mandapas" className="w-full">
                    Mandapas
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-wedding-orange-light rounded-lg transition-custom cursor-pointer px-3 py-2">
                  <Link to="/category/photography" className="w-full">
                    Photography
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-wedding-orange-light rounded-lg transition-custom cursor-pointer px-3 py-2">
                  <Link to="/category/venues" className="w-full">
                    Venues
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-wedding-orange-light rounded-lg transition-custom cursor-pointer px-3 py-2">
                  <Link to="/category/catering" className="w-full">
                    Catering
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-wedding-orange-light rounded-lg transition-custom cursor-pointer px-3 py-2">
                  <Link to="/category/decor-design" className="w-full">
                    Decor & Design
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-wedding-orange-light rounded-lg transition-custom cursor-pointer px-3 py-2">
                  <Link to="/category/attire-accessories" className="w-full">
                    Attire & Accessories
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/vendors"
              className="text-white hover:text-wedding-orange transition-custom"
            >
              All Vendors
            </Link>
            <Link
              to="/guestTracker"
              className="text-white hover:text-wedding-orange transition-custom"
            >
              Guests Tracker
            </Link>
            <Link
              to="/login"
              className="text-white hover:text-wedding-orange transition-custom"
            >
              Login
            </Link>
          </nav>
        </div>

        {/* Auth buttons - kept on right */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Vendor Login/Dashboard */}
          {loggedInVendor ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-white hover:text-wedding-orange transition-custom">
                <User className="w-4 h-4 mr-2" />
                {loggedInVendor.brand_name}
                <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white/95 backdrop-blur-md border border-wedding-orange/20 shadow-card p-2 rounded-xl w-56 animate-fade-in">
                <DropdownMenuItem 
                  className="hover:bg-wedding-orange-light rounded-lg transition-custom cursor-pointer px-3 py-2"
                  onClick={() => navigate('/vendor-dashboard')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-red-50 rounded-lg transition-custom cursor-pointer px-3 py-2 text-red-600"
                  onClick={handleVendorLogout}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-white hover:text-wedding-orange transition-custom">
                <User className="w-4 h-4 mr-2" />
                Vendor Login
                <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white/95 backdrop-blur-md border border-wedding-orange/20 shadow-card p-4 rounded-xl w-80 animate-fade-in">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-800">Vendor Login</h3>
                    <p className="text-sm text-gray-600">Access your vendor dashboard</p>
                  </div>
                  
                  {vendorLoginError && (
                    <div className="flex items-center gap-2 p-2 text-red-700 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{vendorLoginError}</span>
                    </div>
                  )}
                  
                  <form onSubmit={handleVendorLogin} className="space-y-3">
                    <div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="text"
                          value={vendorUsername}
                          onChange={(e) => setVendorUsername(e.target.value)}
                          placeholder="Username"
                          className="pl-10 h-9"
                          disabled={vendorLoginLoading}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="password"
                          value={vendorPassword}
                          onChange={(e) => setVendorPassword(e.target.value)}
                          placeholder="Password"
                          className="pl-10 h-9"
                          disabled={vendorLoginLoading}
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9"
                      disabled={vendorLoginLoading}
                    >
                      {vendorLoginLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Logging in...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <LogIn className="w-4 h-4" />
                          Login
                        </div>
                      )}
                    </Button>
                  </form>

                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800 font-medium mb-1">Demo:</p>
                    <div className="text-xs text-blue-700">
                      <div><strong>User:</strong> HMP002</div>
                      <div><strong>Pass:</strong> HMP002@777</div>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {user == null && (
            <Button
              onClick={() => {
                navigate("/login");
              }}
              className="bg-wedding-orange hover:bg-wedding-orange-hover text-white px-6 py-2 rounded-lg font-semibold"
            >
              Sign In
            </Button>
          )}
        </div>
        {user && (
          <div className="hidden md:flex items-center space-x-4">
            <Button
              onClick={() => navigate("/addVendor")}
              className="bg-wedding-orange hover:bg-wedding-orange-hover text-white"
            >
              Add Vendor
            </Button>
          </div>
        )}
        {/* Mobile menu button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden rounded-full p-2 hover:bg-wedding-navy-hover transition-custom"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Menu className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      {/* Mobile menu - matching desktop transparency effect */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden absolute top-full left-0 right-0 ${
            scrolled ? "bg-wedding-navy/95" : "bg-wedding-navy/80"
          } backdrop-blur-md shadow-lg border-t border-white/10 animate-fade-in`}
        >
          <div className="container-custom py-4 flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/smart-request"
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-3 rounded-lg font-semibold text-center transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                🎯 Smart Request
              </Link>
              <div className="py-2">
                <div className="font-medium mb-2 text-white">Categories</div>
                <div className="ml-4 flex flex-col space-y-2">
                  <Link
                    to="/category/photography"
                    className="text-white hover:text-wedding-orange transition-custom py-1"
                  >
                    Photography
                  </Link>
                  <Link
                    to="/category/venues"
                    className="text-white hover:text-wedding-orange transition-custom py-1"
                  >
                    Venues
                  </Link>
                  <Link
                    to="/category/catering"
                    className="text-white hover:text-wedding-orange transition-custom py-1"
                  >
                    Catering
                  </Link>
                  <Link
                    to="/category/decor-design"
                    className="text-white hover:text-wedding-orange transition-custom py-1"
                  >
                    Decor & Design
                  </Link>
                  <Link
                    to="/category/attire-accessories"
                    className="text-white hover:text-wedding-orange transition-custom py-1"
                  >
                    Attire & Accessories
                  </Link>
                </div>
              </div>
              <Link
                to="/vendors"
                className="text-white hover:text-wedding-orange transition-custom py-2"
              >
                All Vendors
              </Link>
            </div>
            <div className="flex flex-col space-y-2 pt-2 border-t border-white/10">
              <Button
                onClick={() => {
                  navigate("/login");
                  setMobileMenuOpen(false);
                }}
                className="bg-wedding-orange hover:bg-wedding-orange-hover text-white px-6 py-3 rounded-lg font-semibold text-center"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
