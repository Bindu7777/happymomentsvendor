import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { X, Mail, Phone, MapPin, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { customer, updateProfile } = useCustomerAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile_number: '',
    secondary_phone_number: '',
    location: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer && isOpen) {
      setFormData({
        full_name: customer.full_name || '',
        email: customer.email || '',
        mobile_number: customer.mobile_number || '',
        secondary_phone_number: customer.secondary_phone_number || '',
        location: customer.location || ''
      });
      setErrors({});
      setMessage(null);
    }
  }, [customer, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobile_number.replace(/[^0-9]/g, ''))) {
      newErrors.mobile_number = 'Please enter a valid 10-digit phone number';
    }

    if (formData.secondary_phone_number && !/^[0-9]{10}$/.test(formData.secondary_phone_number.replace(/[^0-9]/g, ''))) {
      newErrors.secondary_phone_number = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const updates: any = {
        full_name: formData.full_name.trim(),
        mobile_number: formData.mobile_number.replace(/[^0-9]/g, ''),
        secondary_phone_number: formData.secondary_phone_number.trim() || null,
        location: formData.location.trim() || null
      };

      // Only include email if it changed
      if (formData.email.trim() !== customer?.email) {
        updates.email = formData.email.trim();
      }

      const result = await updateProfile(updates);

      if (result.error) {
        setMessage({ type: 'error', text: result.message || result.error.message || 'Failed to update profile' });
      } else {
        if (result.requiresVerification) {
          setMessage({ 
            type: 'success', 
            text: 'Profile updated! Please check your new email for a verification link. Your email will be updated once verified.' 
          });
          // Keep modal open to show the message
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 3000);
        } else {
          setMessage({ type: 'success', text: result.message || 'Profile updated successfully!' });
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 1500);
        }
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!customer) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-wedding-orange" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your personal information. Email changes require verification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'bg-green-50 border-green-200' : ''}>
              {message.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : ''}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              Full Name *
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter your full name"
              className={errors.full_name ? 'border-red-500' : ''}
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              Email Address *
              {formData.email !== customer.email && (
                <span className="text-xs text-orange-600 font-normal">(Change requires verification)</span>
              )}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email address"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
            {formData.email !== customer.email && formData.email && !errors.email && (
              <p className="text-sm text-orange-600">
                A verification email will be sent to your new email address
              </p>
            )}
          </div>

          {/* Primary Phone */}
          <div className="space-y-2">
            <Label htmlFor="mobile_number" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              Primary Phone Number *
            </Label>
            <Input
              id="mobile_number"
              type="tel"
              value={formData.mobile_number}
              onChange={(e) => handleInputChange('mobile_number', e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter 10-digit phone number"
              maxLength={10}
              className={errors.mobile_number ? 'border-red-500' : ''}
            />
            {errors.mobile_number && (
              <p className="text-sm text-red-500">{errors.mobile_number}</p>
            )}
          </div>

          {/* Secondary Phone */}
          <div className="space-y-2">
            <Label htmlFor="secondary_phone_number" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              Secondary Phone Number (Optional)
            </Label>
            <Input
              id="secondary_phone_number"
              type="tel"
              value={formData.secondary_phone_number}
              onChange={(e) => handleInputChange('secondary_phone_number', e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Enter 10-digit phone number (optional)"
              maxLength={10}
              className={errors.secondary_phone_number ? 'border-red-500' : ''}
            />
            {errors.secondary_phone_number && (
              <p className="text-sm text-red-500">{errors.secondary_phone_number}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              Location (Optional)
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter your location/address"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-wedding-orange hover:bg-wedding-orange/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;

