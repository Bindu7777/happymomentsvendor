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
import Signup from "./pages/signup";
import ForgotPassword from "./pages/forgot-password";
import AddVendor from "./pages/addVendor";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVendorEdit from "./pages/AdminVendorEdit";
import { AdminRoute } from "./pages/adminRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { CustomerAuthProvider } from "./contexts/CustomerAuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { VendorProtectedRoute } from "./components/auth/VendorProtectedRoute";
import AuthRequired from "./components/AuthRequired";
import ErrorBoundary from "./components/ErrorBoundary";
import Mandapas from "./pages/mandapas";
import GuestTracker from "./pages/guest";
import InstaEditPackages from "./pages/instaEdit";
import BeautyVendor from "./pages/beautyVendor";
import VendorProfile from "./pages/VendorProfile";
import DecorProfile from "./pages/DecorProfile";
import PhotographyVendors from "./pages/PhotographyVendors";
import CategoryVendors from "./pages/CategoryVendors";
import VendorDashboard from "./pages/VendorDashboard";
import VendorProfileEdit from "./pages/VendorProfileEdit";
import ImageUploadTestPage from "./pages/ImageUploadTestPage";
import SmartRequest from "./pages/SmartRequest";
import SmartVoiceRequest from "./pages/SmartVoiceRequest";
import VendorsPage from "./pages/vendors";
import TestSignup from "./pages/TestSignup";
import SimpleSignup from "./pages/SimpleSignup";
import WorkingSignup from "./pages/WorkingSignup";
import TestPage from "./pages/TestPage";
import CustomerSignup from "./pages/CustomerSignup";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerProfile from "./pages/CustomerProfile";
import EmailVerification from "./pages/EmailVerification";
import EmailChangeVerification from "./pages/EmailChangeVerification";
import LikedVendors from "./pages/LikedVendors";
import MyVendors from "./pages/MyVendors";
import Contact from "./pages/Contact";
import ComingSoon from "./pages/ComingSoon";
const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <PrimeReactProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CustomerAuthProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
              <Routes>
                <Route path="/" element={<Index />} />
                
                {/* Auth Routes - Redirect if already authenticated */}
                <Route 
                  path="/login" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Login />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/signup" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <WorkingSignup />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/forgot-password" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <ForgotPassword />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Customer Auth Routes */}
                <Route 
                  path="/customer-signup" 
                  element={<CustomerSignup />} 
                />
                <Route 
                  path="/customer-login" 
                  element={<CustomerLogin />} 
                />
                <Route 
                  path="/verify-email" 
                  element={<EmailVerification />} 
                />
                <Route 
                  path="/verify-email-change" 
                  element={<EmailChangeVerification />} 
                />
                <Route 
                  path="/customer-dashboard" 
                  element={<CustomerDashboard />} 
                />
                <Route 
                  path="/customer-profile" 
                  element={<CustomerProfile />} 
                />
                <Route 
                  path="/liked-vendors" 
                  element={<LikedVendors />} 
                />
                <Route 
                  path="/my-vendors" 
                  element={<MyVendors />} 
                />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/vendor/new" element={<AddVendor />} />
                <Route path="/admin/vendor/:vendorId/edit" element={<AdminVendorEdit />} />
                
                {/* Protected Vendor Routes */}
                <Route 
                  path="/vendor-dashboard" 
                  element={
                    <VendorProtectedRoute>
                      <VendorDashboard />
                    </VendorProtectedRoute>
                  } 
                />
                <Route 
                  path="/vendor-profile-edit" 
                  element={
                    <VendorProtectedRoute>
                      <VendorProfileEdit />
                    </VendorProtectedRoute>
                  } 
                />
                
                {/* Test Routes (remove in production) */}
                <Route path="/test/image-upload" element={<ImageUploadTestPage />} />
                <Route path="/test/signup" element={<TestSignup />} />
                <Route path="/test" element={<TestPage />} />
                
                {/* Category pages - No auth required, users can browse */}
                <Route
                  path="/category/:category"
                  element={<CategoryVendors />}
                />
                <Route path="/categories" element={<Navigate to="/" />} />
                
                {/* Vendor pages - Viewable without login, actions require login */}
                <Route path="/vendor/:vendorId" element={<VendorDetails />} />
                <Route path="/vendor" element={<VendorDetails />} />
                <Route path="/vendor-profile" element={<VendorProfile />} />
                <Route path="/decor-profile" element={
                  <AuthRequired>
                    <DecorProfile />
                  </AuthRequired>
                } />
                <Route path="/photography-vendors" element={<PhotographyVendors />} />
                <Route path="/photography-profile/:vendorId" element={<VendorProfile />} />
                <Route path="/mandapas" element={<Mandapas />} />
                <Route path="/guestTracker" element={
                  <AuthRequired>
                    <GuestTracker />
                  </AuthRequired>
                } />
                <Route path="/insta-edit-packages" element={<InstaEditPackages />} />
                <Route path="/beautyvendor" element={<BeautyVendor />} />
                <Route path="/vendors" element={<VendorsPage />} />
                <Route path="/smart-request" element={<SmartRequest />} />
                <Route path="/voice-search" element={<SmartVoiceRequest />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/coming-soon" element={<ComingSoon />} />
                
                {/* Redirect blog pages to home for now */}
                <Route path="/blog/:blogId" element={<Navigate to="/" />} />
                <Route path="/blog" element={<Navigate to="/" />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              </BrowserRouter>
              </TooltipProvider>
            </CustomerAuthProvider>
          </AuthProvider>
        </QueryClientProvider>
      </PrimeReactProvider>
    </ErrorBoundary>
  );
};

export default App;
