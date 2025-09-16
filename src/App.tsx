import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VendorDetails from "./pages/vendor";
import { PrimeReactProvider } from "primereact/api";
import Login from "./pages/login";
import AddVendor from "./pages/addVendor";
import { AdminRoute } from "./pages/adminRoute";
import { useUserStore } from "./store/userStore";
import { User } from "firebase/auth";
import Mandapas from "./pages/mandapas";
import GuestTracker from "./pages/guest";
import InstaEditPackages from "./pages/instaEdit";
import BeautyVendor from "./pages/beautyVendor";
import VendorProfile from "./pages/VendorProfile";
import DecorProfile from "./pages/DecorProfile";
import PhotographyVendors from "./pages/PhotographyVendors";
const queryClient = new QueryClient();

const App = () => {
  const user: User = useUserStore((state) => state.user); //
  return (
    <PrimeReactProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              {/* Redirect category pages to home for now */}
              <Route
                path="/category/:categoryName"
                element={<Navigate to="/" />}
              />
              <Route path="/categories" element={<Navigate to="/" />} />
              {/* Redirect vendor pages to home for now */}
              <Route path="/vendor/:vendorId" element={<VendorDetails />} />

              <Route path="/vendor" element={<VendorDetails />} />
              {/* Redirect blog pages to home for now */}
              <Route path="/blog/:blogId" element={<Navigate to="/" />} />
              <Route path="/blog" element={<Navigate to="/" />} />
              <Route
                path="/addVendor"
                element={
                  <AdminRoute user={user}>
                    <AddVendor />
                  </AdminRoute>
                }
              />
              <Route path="/vendor" element={<VendorDetails />} />
              <Route path="/vendor-profile" element={<VendorProfile />} />
              <Route path="/decor-profile" element={<DecorProfile />} />
              <Route path="/photography-vendors" element={<PhotographyVendors />} />
              <Route path="/photography-profile/:vendorId" element={<VendorProfile />} />
              <Route path="/mandapas" element={<Mandapas />} />
              <Route path="/guestTracker" element={<GuestTracker />} />
              <Route
                path="/insta-edit-packages"
                element={<InstaEditPackages />}
              />
              {/* Redirect blog pages to home for now */}
              <Route path="/blog/:blogId" element={<Navigate to="/" />} />
              <Route path="/blog" element={<Navigate to="/" />} />
               <Route path="/beautyvendor" element={<BeautyVendor />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </PrimeReactProvider>
  );
};

export default App;
