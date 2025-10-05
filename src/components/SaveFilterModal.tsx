import React, { useState } from 'react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save } from 'lucide-react';

interface SaveFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterData: any;
  onSuccess?: () => void;
}

const SaveFilterModal: React.FC<SaveFilterModalProps> = ({
  isOpen,
  onClose,
  filterData,
  onSuccess
}) => {
  const { customer, saveSearchFilter } = useCustomerAuth();
  const [filterName, setFilterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!customer) {
      setError('Please log in to save filters');
      return;
    }

    if (!filterName.trim()) {
      setError('Please enter a name for this filter');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { filter, error: saveError } = await saveSearchFilter(filterData, filterName.trim());
      
      if (saveError) {
        setError(saveError.message || 'Failed to save filter');
      } else {
        onSuccess?.();
        onClose();
        setFilterName('');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFilterName('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Search Filter
          </DialogTitle>
          <DialogDescription>
            Save your current search preferences for quick access later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="filterName">Filter Name</Label>
            <Input
              id="filterName"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Enter a name for this filter"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Current Filter Settings</Label>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              {Object.entries(filterData).map(([key, value]) => {
                if (!value || value === '') return null;
                return (
                  <div key={key} className="text-sm">
                    <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                    <span className="text-gray-600">{String(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !filterName.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Filter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveFilterModal;
