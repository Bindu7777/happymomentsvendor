import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Send, 
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Phone,
  Mail,
  MoreVertical
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  getVendorInvoicesQuotations, 
  deleteInvoiceQuotation, 
  InvoiceQuotation 
} from '../services/invoiceService';

interface InvoiceQuotationListProps {
  vendor: any;
  onEdit: (invoiceQuotation: InvoiceQuotation) => void;
  onView: (invoiceQuotation: InvoiceQuotation) => void;
  onCreateNew: (type: 'invoice' | 'quotation') => void;
  refreshTrigger?: number; // Add this to trigger refresh
}

const InvoiceQuotationList: React.FC<InvoiceQuotationListProps> = ({
  vendor,
  onEdit,
  onView,
  onCreateNew,
  refreshTrigger
}) => {
  const [invoicesQuotations, setInvoicesQuotations] = useState<InvoiceQuotation[]>([]);
  const [filteredData, setFilteredData] = useState<InvoiceQuotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'invoice' | 'quotation'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent' | 'paid' | 'overdue'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadInvoicesQuotations();
  }, [vendor, refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [invoicesQuotations, searchQuery, typeFilter, statusFilter]);

  const loadInvoicesQuotations = async () => {
    try {
      setLoading(true);
      const result = await getVendorInvoicesQuotations(vendor.vendor_id);
      if (result.success && result.data) {
        setInvoicesQuotations(result.data);
      } else {
        console.error('Failed to load invoices/quotations:', result.error);
      }
    } catch (error) {
      console.error('Error loading invoices/quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoicesQuotations];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.customer_name.toLowerCase().includes(query) ||
        item.customer_mobile.includes(query) ||
        item.customer_email?.toLowerCase().includes(query) ||
        item.number.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredData(filtered);
  };

  const handleDelete = async (id: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete the invoice/quotation for ${customerName}?`)) {
      try {
        const result = await deleteInvoiceQuotation(id);
        if (result.success) {
          setInvoicesQuotations(prev => prev.filter(item => item.id !== id));
        } else {
          alert('Failed to delete. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Error deleting. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return <FileText className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices & Quotations</h2>
          <p className="text-gray-600">Manage your billing documents</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onCreateNew('quotation')}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            New Quotation
          </Button>
          <Button
            onClick={() => onCreateNew('invoice')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by customer name, mobile, email, or document number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="border-gray-300"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="invoice">Invoices Only</option>
                    <option value="quotation">Quotations Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {filteredData.length} of {invoicesQuotations.length} documents
        </span>
        {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
          <Button
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('all');
              setStatusFilter('all');
            }}
            variant="outline"
            size="sm"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Documents Grid */}
      {filteredData.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {invoicesQuotations.length === 0 ? 'No documents yet' : 'No documents match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {invoicesQuotations.length === 0 
                ? 'Create your first invoice or quotation to get started'
                : 'Try adjusting your search criteria or clearing filters'
              }
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => onCreateNew('quotation')}
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Quotation
              </Button>
              <Button
                onClick={() => onCreateNew('invoice')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              You can download or share invoices and quotations with your customers
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.type)}
                    <CardTitle className="text-lg capitalize">{item.type}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(item.status || 'draft')}>
                    {item.status || 'draft'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 font-mono">{item.number}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{item.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{item.customer_mobile}</span>
                  </div>
                  {item.customer_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{item.customer_email}</span>
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(item.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {formatDate(item.date)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => onView(item)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    onClick={() => onEdit(item)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id!, item.customer_name)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoiceQuotationList;
