import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Menu, X, ChevronDown, User, Lock, LogIn, AlertCircle, Heart, Users, Bell, LogOut, Headphones, Utensils, Eye, EyeOff, Loader2, CheckCircle, Mail } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserStore } from "@/store/userStore";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { vendorLogin, saveVendorSession, getLoggedInVendor, vendorLogout, getCustomerNotifications, markAllCustomerNotificationsAsRead, clearCustomerNotification } from "@/services/supabaseService";
import { getLikedVendors } from "@/services/likedVendorsApiService";
import { CATEGORY_LIST } from "@/constants/categories";

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
  const [showCustomerSignupModal, setShowCustomerSignupModal] = useState(false);
  const [showCustomerLoginModal, setShowCustomerLoginModal] = useState(false);
  const [likedVendorsCount, setLikedVendorsCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const { customer, signOut: customerSignOut, signIn, signUp } = useCustomerAuth();
  
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
          console.log('Header: Liked vendors API response:', result);
          if (result.success && result.data && Array.isArray(result.data)) {
            const count = result.data.length;
            console.log('Header: Setting liked vendors count to:', count);
            setLikedVendorsCount(count);
          } else {
            console.log('Header: No liked vendors data or invalid structure, setting count to 0');
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
        // Refresh notifications to update the UI
        const notificationsData = await getCustomerNotifications(customer.id);
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  };

  const handleClearNotification = async (notificationId: number) => {
    try {
      const success = await clearCustomerNotification(notificationId);
      if (success) {
        // Remove the notification from the local state
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        // Update unread count
        setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await customerSignOut();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
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
    className={`fixed top-0 left-0 right-0 z-50 py-2 md:py-3 transition-all duration-300 transform
      ${scrolled ? "bg-wedding-navy/95 backdrop-blur-md shadow-lg shadow-orange-500/20" : "bg-wedding-navy/95 backdrop-blur-md"}
      ${scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"}
    `}
    style={{ zIndex: 9999, height: 'auto', minHeight: '64px', maxHeight: 'none', overflow: 'visible' }}
  >
      <div className="container-custom flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center space-x-2 md:space-x-8">
          {/* Logo with image */}
          <Link to="/" className="flex items-center">
            <img
              src="/images/logo.jpg"
              alt="HappyMoments Logo"
              className="w-8 h-8 md:w-12 md:h-12 object-contain mr-2"
            />
            <span className="text-lg md:text-2xl font-bold text-white font-playfair">
              Happy<span className="text-wedding-orange">Moments</span>
            </span>
          </Link>

          {/* Desktop Navigation - moved next to logo */}
          <nav className="hidden lg:flex items-center space-x-8">
            <div className="categories-dropdown">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center text-white hover:text-wedding-orange transition-custom">
                  Categories <ChevronDown className="ml-1 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="bg-white/95 backdrop-blur-md border border-wedding-orange/20 shadow-card p-2 rounded-xl w-64 animate-fade-in max-h-96 overflow-y-auto"
                  side="bottom"
                  align="start"
                  sideOffset={8}
                  avoidCollisions={true}
                  collisionPadding={20}
                  sticky="always"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  {CATEGORY_LIST.map((category) => {
                    // Convert category name to URL-friendly format (same as CategorySection)
                    const categorySlug = category.name.toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/\//g, '-');
                    
                    return (
                      <DropdownMenuItem 
                        key={category.code}
                        className="hover:bg-wedding-orange-light rounded-lg transition-custom cursor-pointer px-3 py-2"
                      >
                        <Link to={`/category/${categorySlug}`} className="w-full">
                          {category.name}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Donate Food Button - Prominent placement */}
            <button 
              onClick={() => {
                const element = document.getElementById('meals-of-kindness');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              title="Donate Food - Meals of Kindness"
            >
              <Heart className="h-4 w-4" />
              <span>Donate Food</span>
            </button>

          </nav>
        </div>

        {/* Right side navigation - properly aligned */}
        <div className="flex items-center z-50 relative">
          {customer ? (
            <div className="hidden md:flex items-center" style={{ gap: '16px' }}>
              {/* Liked Vendors Heart Icon */}
              <Link 
                to="/liked-vendors"
                className="relative flex items-center text-white hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/10"
                title="Liked Vendors"
              >
                <Heart className="h-5 w-5 stroke-2" />
              </Link>

              {/* Notifications Bell Icon */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative flex items-center text-white hover:text-wedding-orange transition-colors p-2 rounded-lg hover:bg-white/10"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5 stroke-2" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
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
                        notifications.map((notification) => {
                          // Check if this is a vendor status update (customer receiving from vendor)
                          const isVendorUpdate = notification.message && notification.message.includes('updated your status');
                          return (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                                isVendorUpdate
                                  ? 'bg-green-50 hover:bg-green-100'
                                  : !notification.is_read
                                    ? 'bg-orange-50'
                                    : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
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
                                <button
                                  onClick={() => handleClearNotification(notification.id)}
                                  className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors p-1"
                                  title="Clear notification"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
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

              {/* My Vendors as Text Link */}
              <Link 
                to="/my-vendors"
                className="text-white hover:text-orange-400 transition-colors font-medium text-sm px-2 py-1 rounded hover:bg-white/10 whitespace-nowrap"
                title="My Vendors"
              >
                My Vendors
              </Link>

              {/* Helpline Button */}
              <Link 
                to="/contact"
                className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/10 whitespace-nowrap border border-white/20 hover:border-orange-400/50"
                title="Contact Support"
              >
                <Headphones className="h-4 w-4" />
                <span className="hidden lg:inline">Helpline</span>
              </Link>

              {/* Profile Icon - Direct navigation to profile page */}
              <button
                onClick={() => navigate('/customer-profile')}
                className="flex items-center text-white hover:text-wedding-orange transition-colors p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-lg"
                title="My Profile"
              >
                <User className="h-6 w-6 stroke-2" />
              </button>
            </div>
          ) : (
            <>
              {/* Desktop buttons */}
              <div className="hidden md:flex items-center space-x-3">
                {/* Helpline Button for non-logged in users */}
                <Link 
                  to="/contact"
                  className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/10 border border-white/20 hover:border-orange-400/50"
                  title="Contact Support"
                >
                  <Headphones className="h-4 w-4" />
                  <span className="hidden lg:inline">Helpline</span>
                </Link>
                <button
                  onClick={() => {
                    console.log('Customer Sign Up clicked');
                    setShowCustomerSignupModal(true);
                  }}
                  className="border-2 border-wedding-orange text-wedding-orange hover:bg-wedding-orange hover:text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 text-sm"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => {
                    console.log('Customer Login clicked');
                    setShowCustomerLoginModal(true);
                  }}
                  className="border-2 border-white text-white hover:bg-white hover:text-wedding-navy px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    console.log('Vendor Login clicked');
                    setLoginType('vendor');
                    setShowLoginModal(true);
                  }}
                  className="bg-wedding-orange hover:bg-wedding-orange-hover text-white px-3 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 text-sm"
                >
                  Vendor
                </button>
              </div>
            </>
          )}
        </div>
        {/* Mobile menu button */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden rounded-full p-2 hover:bg-wedding-navy-hover transition-custom"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 md:h-6 md:w-6 text-white" />
          ) : (
            <Menu className="h-5 w-5 md:h-6 md:w-6 text-white" />
          )}
        </button>
      </div>

      {/* Mobile menu - shows only Sign Up, Login, Vendor for non-logged in users */}
      {mobileMenuOpen && !customer && (
        <div
          className={`lg:hidden absolute top-full left-0 right-0 ${
            scrolled ? "bg-wedding-navy/95" : "bg-wedding-navy/80"
          } backdrop-blur-md shadow-lg border-t border-white/10 animate-fade-in`}
        >
          <div className="container-custom py-4 flex flex-col" style={{ gap: '14px' }}>
            <button
              onClick={() => {
                navigate('/customer-signup');
                setMobileMenuOpen(false);
              }}
              className="border-2 border-wedding-orange text-wedding-orange hover:bg-wedding-orange hover:text-white px-4 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 text-center w-full"
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                navigate('/customer-login');
                setMobileMenuOpen(false);
              }}
              className="border-2 border-white text-white hover:bg-white hover:text-wedding-navy px-4 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 text-center w-full"
            >
              Login
            </button>
            <button
              onClick={() => {
                setLoginType('vendor');
                setShowLoginModal(true);
                setMobileMenuOpen(false);
              }}
              className="bg-wedding-orange hover:bg-wedding-orange-hover text-white px-4 py-3 rounded-lg font-medium shadow-lg transition-all duration-200 text-center w-full"
            >
              Vendor
            </button>
          </div>
        </div>
      )}

      {/* Mobile menu - full menu for logged in users */}
      {mobileMenuOpen && customer && (
        <div
          className={`lg:hidden absolute top-full left-0 right-0 ${
            scrolled ? "bg-wedding-navy/95" : "bg-wedding-navy/80"
          } backdrop-blur-md shadow-lg border-t border-white/10 animate-fade-in`}
        >
          <div className="container-custom py-4 flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              {/* Liked Vendors */}
              <Link
                to="/liked-vendors"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 text-white hover:text-red-400 transition-colors font-medium px-4 py-3 rounded-lg bg-white/10 border border-white/20 hover:border-red-400/50"
              >
                <Heart className="h-5 w-5" />
                Liked Vendors
              </Link>

              {/* My Vendors */}
              <Link
                to="/my-vendors"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 text-white hover:text-orange-400 transition-colors font-medium px-4 py-3 rounded-lg bg-white/10 border border-white/20 hover:border-orange-400/50"
              >
                <Users className="h-5 w-5" />
                My Vendors
              </Link>

              {/* Notifications */}
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 text-white hover:text-orange-400 transition-colors font-medium px-4 py-3 rounded-lg bg-white/10 border border-white/20 hover:border-orange-400/50"
              >
                <Bell className="h-5 w-5" />
                Notifications {unreadNotificationsCount > 0 && `(${unreadNotificationsCount})`}
              </button>

              {/* Customer Dashboard */}
              <Link
                to="/customer-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 text-white hover:text-orange-400 transition-colors font-medium px-4 py-3 rounded-lg bg-white/10 border border-white/20 hover:border-orange-400/50"
              >
                <User className="h-5 w-5" />
                Dashboard
              </Link>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="flex items-center justify-center gap-2 text-red-400 hover:text-red-300 transition-colors font-medium px-4 py-3 rounded-lg bg-red-500/10 border border-red-400/20 hover:border-red-400/50"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
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

      {/* Customer Login Modal */}
      <Dialog open={showCustomerLoginModal} onOpenChange={setShowCustomerLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-gray-800">
              Customer Login
            </DialogTitle>
          </DialogHeader>
          <CustomerLoginModalContent 
            onClose={() => setShowCustomerLoginModal(false)}
            onSwitchToSignup={() => {
              setShowCustomerLoginModal(false);
              setShowCustomerSignupModal(true);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Customer Signup Modal */}
      <Dialog open={showCustomerSignupModal} onOpenChange={setShowCustomerSignupModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-gray-800">
              Create Customer Account
            </DialogTitle>
          </DialogHeader>
          <CustomerSignupModalContent 
            onClose={() => setShowCustomerSignupModal(false)}
            onSwitchToLogin={() => {
              setShowCustomerSignupModal(false);
              setShowCustomerLoginModal(true);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-800">
              Are you sure?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Are you sure you want to logout? You will need to sign in again to access your account.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowLogoutConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Logout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

// Customer Login Modal Content Component
const CustomerLoginModalContent: React.FC<{ onClose: () => void; onSwitchToSignup: () => void }> = ({ onClose, onSwitchToSignup }) => {
  const { signIn } = useCustomerAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const { customer, error } = await signIn(formData.email.trim(), formData.password);
      if (error) {
        setErrors({ general: 'Invalid email or password' });
      } else if (customer) {
        onClose();
        navigate('/');
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <p className="text-sm text-gray-600">Access your account to manage bookings and view your event history</p>
      </div>

      {errors.general && (
        <div className="flex items-center gap-2 p-2 text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="modal-email" className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <Input
            id="modal-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter your email address"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="modal-password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <Input
              id="modal-password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter your password"
              className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>

        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Create one here
          </button>
        </p>
      </div>
    </div>
  );
};

// Customer Signup Modal Content Component
const CustomerSignupModalContent: React.FC<{ onClose: () => void; onSwitchToLogin: () => void }> = ({ onClose, onSwitchToLogin }) => {
  const { signUp } = useCustomerAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    mobileNumber: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<'unverified' | 'sending' | 'sent' | 'verified'>('unverified');
  const [emailVerificationMessage, setEmailVerificationMessage] = useState('');
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });

  useEffect(() => {
    const verified = searchParams.get('verified');
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    const name = searchParams.get('name');

    if (verified === 'true' && email && token) {
      setFormData(prev => ({ ...prev, email: email, fullName: name || prev.fullName }));
      verifyPreSignupToken(email, token);
    }
  }, [searchParams]);

  useEffect(() => {
    if (emailVerificationStatus === 'verified') {
      setCurrentStep(2);
    }
  }, [emailVerificationStatus]);

  useEffect(() => {
    if (formData.password) {
      setPasswordRequirements({
        minLength: formData.password.length >= 8,
        hasUpperCase: /[A-Z]/.test(formData.password),
        hasLowerCase: /[a-z]/.test(formData.password),
        hasNumber: /[0-9]/.test(formData.password),
      });
    } else {
      setPasswordRequirements({ minLength: false, hasUpperCase: false, hasLowerCase: false, hasNumber: false });
    }
  }, [formData.password]);

  const verifyPreSignupToken = async (email: string, token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/email/verify-pre-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setEmailVerificationStatus('verified');
        setEmailVerificationMessage('Email verified successfully!');
        setCurrentStep(2);
        setFormData(prev => ({ ...prev, fullName: result.name || prev.fullName }));
      }
    } catch (error) {
      setEmailVerificationStatus('unverified');
      setEmailVerificationMessage('Email verification failed.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (field === 'email' && emailVerificationStatus !== 'unverified') {
      setEmailVerificationStatus('unverified');
      setEmailVerificationMessage('');
      setCurrentStep(1);
    }
  };

  const handleVerifyEmail = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setEmailVerificationStatus('sending');
    try {
      const response = await fetch('http://localhost:3001/api/email/pre-signup-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim(), name: formData.fullName.trim() })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setEmailVerificationStatus('sent');
        setEmailVerificationMessage('Verification email sent! Please check your inbox.');
      } else {
        setEmailVerificationStatus('unverified');
        setEmailVerificationMessage(result.message || 'Failed to send verification email');
      }
    } catch (error) {
      setEmailVerificationStatus('unverified');
      setEmailVerificationMessage('Network error. Please try again.');
    }
  };

  const isFormValid = () => {
    if (currentStep !== 2) return false;
    if (emailVerificationStatus !== 'verified') return false;
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) return false;
    if (!formData.email.trim() || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) return false;
    if (!formData.mobileNumber.trim() || !/^[0-9]{10}$/.test(formData.mobileNumber)) return false;
    if (!formData.password || formData.password.length < 8 || !/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) return false;
    if (!formData.confirmPassword || formData.password !== formData.confirmPassword) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { customer, error } = await signUp(
        formData.fullName.trim(),
        formData.email.trim(),
        formData.password,
        formData.gender || undefined,
        formData.mobileNumber.trim(),
        emailVerificationStatus === 'verified'
      );
      if (error) {
        setErrors({ general: error.message || 'An error occurred during signup' });
      } else if (customer) {
        onClose();
        navigate('/?accountCreated=true');
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-4">
      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <div className={`flex items-center ${currentStep >= 1 ? 'text-orange-500' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
            1
          </div>
          <span className="ml-2 text-sm font-medium">Basic Details</span>
        </div>
        <div className="w-12 h-0.5 bg-gray-300"></div>
        <div className={`flex items-center ${currentStep >= 2 ? 'text-orange-500' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${currentStep >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
            2
          </div>
          <span className="ml-2 text-sm font-medium">Contact & Security</span>
        </div>
      </div>

      {errors.general && (
        <Alert variant={errors.general.includes('successfully') ? 'default' : 'destructive'}>
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1 */}
        <div className={`space-y-4 ${currentStep === 2 ? 'opacity-60' : ''}`}>
          <div className="space-y-2">
            <Label htmlFor="modal-fullName">Full Name *</Label>
            <Input
              id="modal-fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-email-signup">Email Address *</Label>
            <Input
              id="modal-email-signup"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email address"
              className={errors.email ? 'border-red-500' : ''}
              readOnly={currentStep === 2 && emailVerificationStatus === 'verified'}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}

            <div className="mt-2">
              {emailVerificationStatus === 'verified' ? (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  ✔ Verified
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={!formData.fullName.trim() || !formData.email.trim() || emailVerificationStatus === 'sending' || emailVerificationStatus === 'sent'}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {emailVerificationStatus === 'sending' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : emailVerificationStatus === 'sent' ? (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Verification Email Sent
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Verify Email
                    </>
                  )}
                </Button>
              )}
              {emailVerificationMessage && (
                <p className={`text-sm mt-2 ${emailVerificationStatus === 'sent' || emailVerificationStatus === 'verified' ? 'text-green-600' : 'text-red-500'}`}>
                  {emailVerificationMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-2">
              <Label htmlFor="modal-mobile">Mobile Number *</Label>
              <Input
                id="modal-mobile"
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className={errors.mobileNumber ? 'border-red-500' : ''}
              />
              {errors.mobileNumber && <p className="text-sm text-red-500">{errors.mobileNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-gender">Gender (Optional)</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-password-signup">Password *</Label>
              <div className="relative">
                <Input
                  id="modal-password-signup"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              {formData.password && (
                <div className="text-xs space-y-1 mt-2">
                  <div className={`flex items-center ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`h-3 w-3 mr-1 ${passwordRequirements.minLength ? '' : 'opacity-30'}`} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`h-3 w-3 mr-1 ${passwordRequirements.hasUpperCase ? '' : 'opacity-30'}`} />
                    <span>One uppercase letter</span>
                  </div>
                  <div className={`flex items-center ${passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`h-3 w-3 mr-1 ${passwordRequirements.hasLowerCase ? '' : 'opacity-30'}`} />
                    <span>One lowercase letter</span>
                  </div>
                  <div className={`flex items-center ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className={`h-3 w-3 mr-1 ${passwordRequirements.hasNumber ? '' : 'opacity-30'}`} />
                    <span>One number</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-confirm-password">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="modal-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50" 
              disabled={loading || !isFormValid()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        )}
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Header;
