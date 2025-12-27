import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EditProfileModal from '@/components/EditProfileModal';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ArrowLeft,
  Edit,
  LogOut
} from 'lucide-react';

const CustomerProfile = () => {
  const { customer, signOut } = useCustomerAuth();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
            <Button onClick={() => navigate('/customer-login')}>
              Go to Login
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-8 sm:px-12 pt-28 pb-8 max-w-4xl">
        {/* Profile Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400 bg-white shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-wedding-orange">
              My Profile
            </h1>
          </div>
          
          {/* Profile Card */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-wedding-orange text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white">{customer.full_name}</CardTitle>
                    <p className="text-white/90 mt-1">Happy Moments Customer</p>
                    <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
                      Active Member
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 bg-white">
              <div className="max-w-2xl">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-wedding-orange flex items-center gap-2">
                    <User className="h-5 w-5 text-wedding-orange" />
                    Personal Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2 bg-wedding-orange/10 rounded-lg">
                        <Mail className="h-4 w-4 text-wedding-orange" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 font-medium">Email</p>
                        <p className="font-medium text-gray-900">{customer.email || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2 bg-wedding-orange/10 rounded-lg">
                        <Phone className="h-4 w-4 text-wedding-orange" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 font-medium">Primary Phone</p>
                        <p className="font-medium text-gray-900">{customer.mobile_number || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    {/* Secondary Phone - Always shown */}
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2 bg-wedding-orange/10 rounded-lg">
                        <Phone className="h-4 w-4 text-wedding-orange" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 font-medium">Secondary Phone (Optional)</p>
                        <p className="font-medium text-gray-900">{customer.secondary_phone_number || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    {/* Location - Always shown */}
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2 bg-wedding-orange/10 rounded-lg">
                        <MapPin className="h-4 w-4 text-wedding-orange" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 font-medium">Location (Optional)</p>
                        <p className="font-medium text-gray-900">{customer.location || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2 bg-wedding-orange/10 rounded-lg">
                        <Calendar className="h-4 w-4 text-wedding-orange" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 font-medium">Member Since</p>
                        <p className="font-medium text-gray-900">
                          {customer.created_at ? formatDate(customer.created_at) : 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Logout Button */}
              <div className="mt-6 pt-6 border-t border-orange-200">
                <Button
                  variant="outline"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shadow-sm hover:shadow-md transition-all"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </main>
      
      <Footer />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          // Refresh customer data if needed
          window.location.reload(); // Simple refresh - could be optimized
        }}
      />

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-800">
              Are you sure?
            </DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to logout? You will need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => setShowLogoutConfirm(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setShowLogoutConfirm(false);
                await signOut();
                navigate('/');
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerProfile;
