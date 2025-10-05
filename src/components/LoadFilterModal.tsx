import React, { useState, useEffect } from 'react';
import { useCustomerAuth, CustomerSearchFilter } from '@/contexts/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Filter, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';

interface LoadFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (filterData: any) => void;
}

const LoadFilterModal: React.FC<LoadFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilter
}) => {
  const { customer, getSearchFilters, deleteSearchFilter } = useCustomerAuth();
  const [savedFilters, setSavedFilters] = useState<CustomerSearchFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && customer) {
      loadFilters();
    }
  }, [isOpen, customer]);

  const loadFilters = async () => {
    if (!customer) return;
    
    setLoading(true);
    setError(null);
    
    const { filters, error: loadError } = await getSearchFilters();
    
    if (loadError) {
      setError('Failed to load saved filters');
    } else {
      setSavedFilters(filters);
    }
    setLoading(false);
  };

  const handleApplyFilter = (filterData: any) => {
    onApplyFilter(filterData);
    onClose();
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

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Load Saved Filter
          </DialogTitle>
          <DialogDescription>
            Select a saved search filter to apply to your current search.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : savedFilters.length === 0 ? (
            <div className="text-center py-8">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved filters</h3>
              <p className="text-gray-500">
                You haven't saved any search filters yet. Create and save filters to quickly apply them later.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
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
                              {key.replace(/_/g, ' ')}: {String(value)}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoadFilterModal;
