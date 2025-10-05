import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth, CustomerSearchFilter, CustomerSearchHistory } from '@/contexts/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogOut, Search, Filter, Trash2, Edit, Plus, Mic, MousePointer, Zap, Clock } from 'lucide-react';
import { format } from 'date-fns';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { customer, loading, signOut, getSearchFilters, deleteSearchFilter, getSearchHistory } = useCustomerAuth();
  const [savedFilters, setSavedFilters] = useState<CustomerSearchFilter[]>([]);
  const [searchHistory, setSearchHistory] = useState<CustomerSearchHistory[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      loadSavedFilters();
      loadSearchHistory();
    }
  }, [customer]);

  const loadSavedFilters = async () => {
    if (!customer) return;
    
    setFiltersLoading(true);
    const { filters, error } = await getSearchFilters();
    
    if (error) {
      setError('Failed to load saved filters');
    } else {
      setSavedFilters(filters);
    }
    setFiltersLoading(false);
  };

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

  const handleDeleteFilter = async (filterId: string) => {
    if (!window.confirm('Are you sure you want to delete this saved filter?')) {
      return;
    }

    const { error } = await deleteSearchFilter(filterId);
    if (error) {
      setError('Failed to delete filter');
    } else {
      setSavedFilters(prev => prev.filter(filter => filter.id !== filterId));
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleApplyFilter = (filterData: any) => {
    // Navigate to vendors page with the saved filter applied
    const queryParams = new URLSearchParams();
    Object.entries(filterData).forEach(([key, value]) => {
      if (value) {
        queryParams.set(key, String(value));
      }
    });
    navigate(`/vendors?${queryParams.toString()}`);
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {customer.full_name}!</h1>
              <p className="text-gray-600">Manage your search preferences and find vendors</p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate('/vendors')} variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Browse Vendors
              </Button>
              <Button onClick={handleLogout} variant="ghost">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details and login history</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-sm text-gray-900">{customer.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{customer.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                  <p className="text-sm text-gray-900">{customer.mobile_number}</p>
                </div>
                {customer.gender && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-sm text-gray-900">{customer.gender}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-sm text-gray-900">
                    {format(new Date(customer.created_at), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Login Count</label>
                  <p className="text-sm text-gray-900">{customer.login_count || 0} times</p>
                </div>
                {customer.last_login_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Login</label>
                    <p className="text-sm text-gray-900">
                      {format(new Date(customer.last_login_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Saved Search Filters */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Saved Search Filters</CardTitle>
                    <CardDescription>Your saved search preferences for quick access</CardDescription>
                  </div>
                  <Button onClick={() => navigate('/smart-request')} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filtersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : savedFilters.length === 0 ? (
                  <div className="text-center py-8">
                    <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No saved filters yet</h3>
                    <p className="text-gray-500 mb-4">
                      Save your search preferences to quickly find vendors that match your needs.
                    </p>
                    <Button onClick={() => navigate('/smart-request')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Filter
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedFilters.map((filter) => (
                      <div
                        key={filter.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {filter.filter_name}
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {Object.entries(filter.filter_data).map(([key, value]) => {
                                if (!value || value === '') return null;
                                return (
                                  <Badge key={key} variant="secondary" className="text-xs">
                                    {key}: {String(value)}
                                  </Badge>
                                );
                              })}
                            </div>
                            <p className="text-xs text-gray-500">
                              Saved on {format(new Date(filter.created_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplyFilter(filter.filter_data)}
                            >
                              <Search className="h-4 w-4 mr-1" />
                              Apply
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteFilter(filter.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Search History */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Searches
                </CardTitle>
                <CardDescription>Your recent search activity</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : searchHistory.length === 0 ? (
                  <div className="text-center py-6">
                    <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No recent searches found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchHistory.map((search) => (
                      <div
                        key={search.id}
                        className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-0.5">
                              {getSearchTypeIcon(search.search_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
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
                                <p className="text-sm text-gray-600 truncate">
                                  "{search.search_query}"
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                {format(new Date(search.created_at), 'MMM dd, HH:mm')}
                              </p>
                            </div>
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
      </div>
    </div>
  );
};

export default CustomerDashboard;
