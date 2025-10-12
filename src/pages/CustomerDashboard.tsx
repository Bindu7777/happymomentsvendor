import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth, CustomerSearchHistory } from '@/contexts/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogOut, Search, Mic, MousePointer, Zap, Clock, ArrowLeft, Heart, Users, Bell, Settings } from 'lucide-react';
import { format } from 'date-fns';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { customer, loading, signOut, getSearchHistory } = useCustomerAuth();
  const [searchHistory, setSearchHistory] = useState<CustomerSearchHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      loadSearchHistory();
    }
  }, [customer]);

  const loadSearchHistory = async () => {
    if (!customer) return;
    
    setHistoryLoading(true);
    const { history, error } = await getSearchHistory(10); // Load last 10 searches
    
    if (error) {
      setError('Failed to load search history');
    } else {
      setSearchHistory(history);
    }
    setHistoryLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getSearchTypeIcon = (searchType: string) => {
    switch (searchType) {
      case 'voice':
        return <Mic className="h-4 w-4" />;
      case 'manual':
        return <MousePointer className="h-4 w-4" />;
      case 'smart_request':
        return <Zap className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getSearchTypeLabel = (searchType: string) => {
    switch (searchType) {
      case 'voice':
        return 'Voice Search';
      case 'manual':
        return 'Manual Search';
      case 'smart_request':
        return 'Smart Request';
      default:
        return 'Search';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription>
                Please log in to access your dashboard.
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => navigate('/customer-login')} className="flex-1">
                Login
              </Button>
              <Button onClick={() => navigate('/customer-signup')} variant="outline" className="flex-1">
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {customer.full_name}!</h1>
                <p className="text-gray-600">Manage your search preferences and find vendors</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate('/vendors')} variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Browse Vendors
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-wedding-orange" />
              Quick Actions
            </CardTitle>
            <CardDescription>Quick access to your favorite features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => navigate('/liked-vendors')}
              >
                <Heart className="h-4 w-4" />
                View Liked Vendors
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => navigate('/my-vendors')}
              >
                <Users className="h-4 w-4" />
                My Vendors
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3 h-12"
                onClick={() => navigate('/smart-request')}
              >
                <Bell className="h-4 w-4" />
                Make Smart Request
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Search History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Searches
            </CardTitle>
            <CardDescription>Your recent search activity</CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : searchHistory.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent searches found</h3>
                <p className="text-gray-500 mb-6">
                  Start searching for vendors to see your recent activity here.
                </p>
                <Button onClick={() => navigate('/smart-request')} className="bg-wedding-orange hover:bg-wedding-orange-hover">
                  <Search className="h-4 w-4 mr-2" />
                  Start Searching
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {searchHistory.map((search) => (
                  <div
                    key={search.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getSearchTypeIcon(search.search_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {getSearchTypeLabel(search.search_type)}
                          </span>
                          {search.search_results_count > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {search.search_results_count} results
                            </Badge>
                          )}
                        </div>
                        {search.search_query && (
                          <p className="text-sm text-gray-600 mb-2">
                            "{search.search_query}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {format(new Date(search.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDashboard;
