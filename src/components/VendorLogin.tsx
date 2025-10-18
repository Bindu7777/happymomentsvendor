import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { vendorLogin, saveVendorSession } from '../services/supabaseService';

interface VendorLoginProps {
  onClose?: () => void;
}

const VendorLogin: React.FC<VendorLoginProps> = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await vendorLogin(username.trim(), password);
      
      if (result.success && result.vendor) {
        // Save vendor session
        saveVendorSession(result.vendor);
        
        // Navigate to vendor dashboard
        navigate('/vendor-dashboard');
        
        // Close modal if it's a modal
        if (onClose) {
          onClose();
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <LogIn className="w-6 h-6 text-blue-600" />
          Vendor Login
        </CardTitle>
        <p className="text-gray-600">Access your vendor dashboard</p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="pl-10"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? (
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

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">Available Vendor Credentials:</p>
          <div className="text-xs text-blue-700 space-y-1">
            <div><strong>Test 6:</strong> Username: 59, Password: quPkJu</div>
            <div><strong>Test 5:</strong> Username: 58, Password: eMoWz1</div>
            <div><strong>Hima Bindu Events:</strong> Username: 48, Password: PmruCM</div>
            <div><strong>Photographer Priya:</strong> Username: 54, Password: X7REp0</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorLogin;
