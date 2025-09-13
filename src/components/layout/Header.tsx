import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserStore } from "@/store/userStore";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
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
          </nav>
        </div>

        {/* Auth buttons - kept on right */}
        {user == null && (
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => {
                navigate("/login");
              }}
              className="text-white hover:text-wedding-orange hover:bg-wedding-navy-hover"
            >
              Log in
            </Button>
            <Button className="bg-wedding-orange hover:bg-wedding-orange-hover text-white">
              Sign up
            </Button>
          </div>
        )}
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
                variant="ghost"
                onClick={() => {
                  console.log("navigatinfg");
                  navigate("/login");
                }}
                className="text-white hover:text-wedding-orange hover:bg-wedding-navy-hover"
              >
                Log in
              </Button>

              <Button className="justify-start bg-wedding-orange hover:bg-wedding-orange-hover text-white">
                Sign up
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
