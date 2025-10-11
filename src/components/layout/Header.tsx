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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Menu, X, ChevronDown, User, Lock, LogIn, AlertCircle, Mic, MessageCircle, Heart, Users, Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserStore } from "@/store/userStore";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { vendorLogin, saveVendorSession, getLoggedInVendor, vendorLogout, getCustomerNotifications, markAllCustomerNotificationsAsRead } from "@/services/supabaseService";
import { getLikedVendors } from "@/services/likedVendorsApiService";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vendorUsername, setVendorUsername] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');
  const [vendorLoginLoading, setVendorLoginLoading] = useState(false);
  const [vendorLoginError, setVendorLoginError] = useState('');
  const [loggedInVendor, setLoggedInVendor] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginType, setLoginType] = useState<'customer' | 'vendor'>('customer');
  const [likedVendorsCount, setLikedVendorsCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const { customer, signOut: customerSignOut } = useCustomerAuth();
  
  // Debug: Log user state
  console.log('Header - User state:', user);

  // Check if vendor is logged in on component mount
  useEffect(() => {
    const vendor = getLoggedInVendor();
    setLoggedInVendor(vendor);
  }, []);

  // Fetch liked vendors count when customer is logged in
  useEffect(() => {
    const fetchLikedVendorsCount = async () => {
      if (customer) {
        try {
          const result = await getLikedVendors(customer.id);
          if (result.success && result.data) {
            setLikedVendorsCount(result.data.length);
          } else {
            setLikedVendorsCount(0);
          }
        } catch (error) {
          console.error('Error fetching liked vendors count:', error);
          setLikedVendorsCount(0);
        }
      } else {
        setLikedVendorsCount(0);
      }
    };

    fetchLikedVendorsCount();

    // Listen for like/unlike events to update count
    const handleLikeChange = () => {
      fetchLikedVendorsCount();
    };

    window.addEventListener('vendorLiked', handleLikeChange);
    window.addEventListener('vendorUnliked', handleLikeChange);

    return () => {
      window.removeEventListener('vendorLiked', handleLikeChange);
      window.removeEventListener('vendorUnliked', handleLikeChange);
    };
  }, [customer]);

  // Fetch customer notifications when customer is logged in
  useEffect(() => {
    const fetchCustomerNotifications = async () => {
      if (customer) {
        try {
          const notificationsData = await getCustomerNotifications(customer.id);
          setNotifications(notificationsData);
          
          // Count unread notifications
          const unreadCount = notificationsData.filter(notification => !notification.is_read).length;
          setUnreadNotificationsCount(unreadCount);
        } catch (error) {
          console.error('Error fetching customer notifications:', error);
          setNotifications([]);
          setUnreadNotificationsCount(0);
        }
      } else {
        setNotifications([]);
        setUnreadNotificationsCount(0);
      }
    };

    fetchCustomerNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchCustomerNotifications, 30000);
    return () => clearInterval(interval);
  }, [customer]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications && !(event.target as Element).closest('.notifications-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

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

  const handleMarkAllNotificationsAsRead = async () => {
    if (customer) {
      try {
        await markAllCustomerNotificationsAsRead(customer.id);
        setUnreadNotificationsCount(0);
        // Update notifications to mark all as read
        setNotifications(prev => prev.map(notification => ({ ...notification, is_read: true })));
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
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
      <div className="container-custom flex items-center justify-between">
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
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <Mic className="h-5 w-5" />
              <MessageCircle className="h-4 w-4" />
              Smart Request
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

          </nav>
        </div>

        {/* Auth buttons - kept on right */}
        <div className="flex items-center space-x-3 z-50 relative">
          {customer ? (
            <div className="flex items-center space-x-3">

              {/* Customer Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center text-white hover:text-wedding-orange transition-custom">
                  <User className="h-4 w-4 mr-2" />
                  {customer.full_name}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/95 backdrop-blur-md border border-wedding-orange/20 shadow-card p-2 rounded-xl w-48 animate-fade-in">
                  <DropdownMenuItem className="hover:bg-wedding-orange-light rounded-lg transition-custom cursor-pointer px-3 py-2">
                    <Link to="/customer-dashboard" className="w-full flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-wedding-orange-light rounded-lg transition-custom cursor-pointer px-3 py-2">
                    <Link to="/liked-vendors" className="w-full flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      Liked Vendors
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-wedding-orange-light rounded-lg transition-custom cursor-pointer px-3 py-2">
                    <Link to="/my-vendors" className="w-full flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      My Vendors
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Liked Vendors Heart Icon */}
              <Link 
                to="/liked-vendors"
                className="relative flex items-center text-white hover:text-red-400 transition-colors"
                title="Liked Vendors"
              >
                <Heart className="h-5 w-5" />
                {likedVendorsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {likedVendorsCount > 99 ? '99+' : likedVendorsCount}
                  </span>
                )}
              </Link>

              {/* Notifications Bell Icon */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative flex items-center text-white hover:text-wedding-orange transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="notifications-dropdown absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadNotificationsCount > 0 && (
                          <button
                            onClick={handleMarkAllNotificationsAsRead}
                            className="text-xs text-orange-600 hover:text-orange-800 font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div key={notification.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notification.is_read ? 'bg-orange-50' : ''}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Bell className="w-4 h-4 text-orange-600" />
                                  {!notification.is_read && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-900 font-medium">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                      {notification.vendors && notification.vendors.brand_name && (
                        <p className="text-xs text-gray-500 mt-1">
                          Vendor: {notification.vendors.brand_name}
                        </p>
                      )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No notifications yet</p>
                          <p className="text-sm">Vendor status updates will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* My Vendors Link */}
              <Link 
                to="/my-vendors"
                className="text-white hover:text-orange-400 transition-colors font-medium"
                title="My Vendors - Vendors I've contacted"
              >
                My Vendors
              </Link>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  console.log('Customer Sign Up clicked');
                  navigate('/customer-signup');
                }}
                className="border-2 border-wedding-orange text-wedding-orange hover:bg-wedding-orange hover:text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-200"
              >
                Customer Sign Up
              </button>
              <button
                onClick={() => {
                  console.log('Customer Login clicked');
                  navigate('/customer-login');
                }}
                className="border-2 border-white text-white hover:bg-white hover:text-wedding-navy px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-200"
              >
                Customer Login
              </button>
              <button
                onClick={() => {
                  console.log('Vendor Login clicked');
                  setLoginType('vendor');
                  setShowLoginModal(true);
                }}
                className="bg-wedding-orange hover:bg-wedding-orange-hover text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-200"
              >
                Vendor Login
              </button>
            </>
          )}
        </div>
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
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-3 rounded-lg font-bold text-center transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Mic className="h-5 w-5" />
                <MessageCircle className="h-4 w-4" />
                Smart Request
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
            </div>
            <div className="flex flex-col space-y-2 pt-2 border-t border-white/10">
              <Button
                onClick={() => {
                  navigate('/signup');
                  setMobileMenuOpen(false);
                }}
                variant="outline"
                className="border-wedding-orange text-wedding-orange hover:bg-wedding-orange hover:text-white px-4 py-3 rounded-lg font-medium text-center"
              >
                Sign Up
              </Button>
              <Button
                onClick={() => {
                  setLoginType('customer');
                  setShowLoginModal(true);
                  setMobileMenuOpen(false);
                }}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-wedding-navy px-4 py-3 rounded-lg font-medium text-center"
              >
                Customer Login
              </Button>
              <Button
                onClick={() => {
                  setLoginType('vendor');
                  setShowLoginModal(true);
                  setMobileMenuOpen(false);
                }}
                className="bg-wedding-orange hover:bg-wedding-orange-hover text-white px-4 py-3 rounded-lg font-medium text-center"
              >
                Vendor Login
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-gray-800">
              {loginType === 'customer' ? 'Customer Login' : 'Vendor Login'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">

            {/* Customer Login */}
            {loginType === 'customer' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Access your account to manage bookings and view your event history</p>
                </div>
                <Button
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/login');
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Continue to Customer Login
                </Button>
              </div>
            )}

            {/* Vendor Login */}
            {loginType === 'vendor' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Access your vendor dashboard to manage bookings and update your profile</p>
                </div>
                
                {vendorLoginError && (
                  <div className="flex items-center gap-2 p-2 text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{vendorLoginError}</span>
                  </div>
                )}
                
                <form onSubmit={handleVendorLogin} className="space-y-3">
                  <div>
                    <Input
                      type="text"
                      placeholder="Vendor Username"
                      value={vendorUsername}
                      onChange={(e) => setVendorUsername(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={vendorPassword}
                      onChange={(e) => setVendorPassword(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={vendorLoginLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {vendorLoginLoading ? 'Signing In...' : 'Sign In as Vendor'}
                  </Button>
                </form>
                
                <div className="text-center">
                  <p className="text-xs text-blue-800 font-medium mb-1">Demo Credentials:</p>
                  <div className="text-xs text-blue-700">
                    <div><strong>User:</strong> HMP002</div>
                    <div><strong>Pass:</strong> HMP002@777</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
