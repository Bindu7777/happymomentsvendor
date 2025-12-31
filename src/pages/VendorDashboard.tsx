import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Edit, 
  Eye, 
  Calendar, 
  Star, 
  Phone, 
  Mail, 
  MapPin,
  Camera,
  Users,
  Clock,
  Award,
  BarChart3,
  FileText,
  MessageSquare,
  MessageCircle,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Bell,
  Settings,
  Trash2,
  X,
  UserCheck,
  Heart,
  History,
  Flag
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { getLoggedInVendor, vendorLogout, getVendorPendingChanges, getVendorRejectedChanges, getVendorNotifications, getVendorLeads, getVendorLeadStats, updateLeadStatus, deleteVendorLead, updateVendorLead, getVendorEvents, createVendorEvent, updateVendorEvent, deleteVendorEvent, getVendorCalendarStats, refreshVendorSession, markAllNotificationsAsRead } from '../services/supabaseService';
import { getVendorCustomers, updateVendorStatusForContact, updateNotesForContact, flagCustomer, unflagCustomer } from '../services/contactedVendorsApiService';
import { Vendor } from '../lib/supabase';
import AddLeadModal from '../components/AddLeadModal';
import CustomerDetailsModal from '../components/CustomerDetailsModal';
import DealPriceModal from '../components/DealPriceModal';
import VendorCalendar from '../components/VendorCalendar';
import InvoiceQuotationList from '../components/InvoiceQuotationList';
import InvoiceQuotationModal from '../components/InvoiceQuotationModal';
import InvoiceQuotationPreview from '../components/InvoiceQuotationPreview';
import { InvoiceQuotation } from '../services/invoiceService';
import { generateAndDownloadPDF } from '../services/pdfService';

const VendorDashboard: React.FC = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [renderError, setRenderError] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [rejectedChanges, setRejectedChanges] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [leadStats, setLeadStats] = useState<any>({});
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showDealPriceModal, setShowDealPriceModal] = useState(false);
  const [confirmingLead, setConfirmingLead] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<any>(null);
  
  // Invoice/Quotation states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [selectedInvoiceQuotation, setSelectedInvoiceQuotation] = useState<InvoiceQuotation | null>(null);
  const [editingInvoiceQuotation, setEditingInvoiceQuotation] = useState<InvoiceQuotation | null>(null);
  const [invoiceListRefreshTrigger, setInvoiceListRefreshTrigger] = useState(0);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    stages: [] as string[],
    eventTypes: [] as string[],
    budgetRanges: [] as string[],
    eventDateRange: { start: '', end: '' },
    lastContactedRange: { start: '', end: '' },
    quickDateFilter: '' // Today, This Week, This Month, etc.
  });
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarStats, setCalendarStats] = useState<any>({});
  
  // Customers states
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [customerStats, setCustomerStats] = useState<any>({});
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  
  // Lost and Report dialog states
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [pendingLostStatus, setPendingLostStatus] = useState<{contactId: string, status: string} | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [customerToReport, setCustomerToReport] = useState<any>(null);
  
  const navigate = useNavigate();

  // Clean filtering function: OR within categories, AND between categories
  const applyFilters = () => {
    try {
      console.log('Applying filters:', { filters, searchQuery, leadsCount: leads.length });
      let result = [...leads];
      
      // 1. Search query filter
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        result = result.filter(lead => 
          lead.customer_name?.toLowerCase().includes(query) ||
          lead.event_type?.toLowerCase().includes(query) ||
          lead.customer_phone?.includes(query) ||
          lead.initial_notes?.toLowerCase().includes(query)
        );
      }
      
      // 2. Lead stage filter (OR within category)
      if (filters.stages && filters.stages.length > 0) {
        result = result.filter(lead => filters.stages.includes(lead.status));
      }
      
      // 3. Event type filter (OR within category)
      if (filters.eventTypes && filters.eventTypes.length > 0) {
        result = result.filter(lead => 
          lead.event_type && filters.eventTypes.includes(lead.event_type)
        );
      }
      
      // 4. Budget range filter (OR within category)
      if (filters.budgetRanges && filters.budgetRanges.length > 0) {
        result = result.filter(lead => 
          lead.budget_range && filters.budgetRanges.includes(lead.budget_range)
        );
      }
      
      // 5. Event date range filter
      if (filters.eventDateRange && (filters.eventDateRange.start || filters.eventDateRange.end)) {
        result = result.filter(lead => {
          if (!lead.event_date) return false;
          try {
            const eventDate = new Date(lead.event_date);
            const startDate = filters.eventDateRange.start ? new Date(filters.eventDateRange.start) : null;
            const endDate = filters.eventDateRange.end ? new Date(filters.eventDateRange.end) : null;
            
            if (startDate && eventDate < startDate) return false;
            if (endDate && eventDate > endDate) return false;
            return true;
          } catch (error) {
            return false;
          }
        });
      }
      
      // 6. Last contacted date range filter
      if (filters.lastContactedRange && (filters.lastContactedRange.start || filters.lastContactedRange.end)) {
        result = result.filter(lead => {
          if (!lead.last_contact_date && !lead.created_at) return false;
          try {
            const contactDate = new Date(lead.last_contact_date || lead.created_at);
            const startDate = filters.lastContactedRange.start ? new Date(filters.lastContactedRange.start) : null;
            const endDate = filters.lastContactedRange.end ? new Date(filters.lastContactedRange.end) : null;
            
            if (startDate && contactDate < startDate) return false;
            if (endDate && contactDate > endDate) return false;
            return true;
          } catch (error) {
            return false;
          }
        });
      }
      
      // 7. Quick date filter
      if (filters.quickDateFilter) {
        try {
          let filterDate = null;
          const today = new Date();
          
          switch (filters.quickDateFilter) {
            case 'today':
              filterDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              break;
            case 'week':
              filterDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
              break;
            case 'month':
              filterDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
              break;
          }
          
          if (filterDate) {
            result = result.filter(lead => {
              if (!lead.event_date) return false;
              try {
                const eventDate = new Date(lead.event_date);
                return eventDate >= filterDate;
              } catch (error) {
                return false;
              }
            });
          }
        } catch (error) {
          // Silent error handling
        }
      }
      
      console.log('Filtered result:', result.length, 'leads');
      setFilteredLeads(result);
    } catch (error) {
      console.error('Error in applyFilters:', error);
      // Fallback: show all leads if filtering fails
      setFilteredLeads([...leads]);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      stages: [],
      eventTypes: [],
      budgetRanges: [],
      eventDateRange: { start: '', end: '' },
      lastContactedRange: { start: '', end: '' },
      quickDateFilter: ''
    });
  };


  const getActiveFilterCount = () => {
    return (
      (searchQuery.trim() ? 1 : 0) +
      filters.stages.length +
      filters.eventTypes.length +
      filters.budgetRanges.length +
      (filters.eventDateRange.start || filters.eventDateRange.end ? 1 : 0) +
      (filters.lastContactedRange.start || filters.lastContactedRange.end ? 1 : 0) +
      (filters.quickDateFilter ? 1 : 0)
    );
  };

  // Customer filtering function
  const applyCustomerFilters = () => {
    try {
      let result = [...customers];
      
      // Search query filter
      if (customerSearchQuery && customerSearchQuery.trim()) {
        const query = customerSearchQuery.toLowerCase().trim();
        result = result.filter(customer => 
          customer.customer_name?.toLowerCase().includes(query) ||
          customer.status?.toLowerCase().includes(query) ||
          customer.customer_phone?.includes(query) ||
          customer.customer_email?.toLowerCase().includes(query) ||
          customer.customer_location?.toLowerCase().includes(query)
        );
      }
      
      setFilteredCustomers(result);
    } catch (error) {
      console.error('Error in applyCustomerFilters:', error);
      setFilteredCustomers([...customers]);
    }
  };

  // Initialize filtered leads when leads first load
  useEffect(() => {
    if (leads.length > 0) {
      console.log('Initializing filtered leads with', leads.length, 'leads');
      setFilteredLeads([...leads]);
    }
  }, [leads.length]);

  // Initialize filtered customers when customers first load
  useEffect(() => {
    if (customers.length > 0) {
      console.log('Initializing filtered customers with', customers.length, 'customers');
      setFilteredCustomers([...customers]);
    }
  }, [customers.length]);

  // Sample data removed - now using real data from database

  // Apply filters when leads or filters change
  useEffect(() => {
    if (leads.length > 0) {
      applyFilters();
    }
  }, [leads, searchQuery, filters]);

  // Apply customer filters when customers or search query change
  useEffect(() => {
    if (customers.length > 0) {
      applyCustomerFilters();
    }
  }, [customers, customerSearchQuery]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (vendor) {
      const interval = setInterval(() => {
        loadNotifications(parseInt(vendor.vendor_id));
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [vendor]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications) {
        const target = event.target as HTMLElement;
        if (!target.closest('.notification-dropdown')) {
          setShowNotifications(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  useEffect(() => {
    const initializeDashboard = async () => {
    try {
      const loggedInVendor = getLoggedInVendor();
      
      if (!loggedInVendor) {
        setError('No vendor session found. Please login first.');
        navigate('/');
        return;
      }
      
        // Refresh vendor session to get latest approved data
        const refreshedVendor = await refreshVendorSession();
        const vendorToUse = refreshedVendor || loggedInVendor;
        
        setVendor(vendorToUse);
        loadPendingChanges(parseInt(vendorToUse.vendor_id));
        loadRejectedChanges(parseInt(vendorToUse.vendor_id));
        loadNotifications(parseInt(vendorToUse.vendor_id));
        loadLeadsData(parseInt(vendorToUse.vendor_id));
        loadCalendarData(parseInt(vendorToUse.vendor_id));
        loadCustomersData(parseInt(vendorToUse.vendor_id));
    setLoading(false);
    } catch (err) {
      console.error('Error in VendorDashboard useEffect:', err);
      setError('Error loading dashboard. Please try again.');
      setLoading(false);
    }
    };

    initializeDashboard();
  }, [navigate]);

  const loadPendingChanges = async (vendorId: number) => {
    const pending = await getVendorPendingChanges(vendorId);
    setPendingChanges(pending);
  };

  const loadRejectedChanges = async (vendorId: number) => {
    const rejected = await getVendorRejectedChanges(vendorId);
    setRejectedChanges(rejected);
  };

  const loadNotifications = async (vendorId: number) => {
    try {
      // Load all notifications for display
      const allNotifications = await getVendorNotifications(vendorId, false);
      setNotifications(allNotifications);
      
      // Load unread notifications for count
      const unreadNotifications = await getVendorNotifications(vendorId, true);
      setUnreadNotificationCount(unreadNotifications.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleNotificationClick = async () => {
    const newShowState = !showNotifications;
    setShowNotifications(newShowState);
    
    // If opening the dropdown and there are unread notifications, mark them as read
    if (newShowState && unreadNotificationCount > 0 && vendor) {
      try {
        const success = await markAllNotificationsAsRead(parseInt(vendor.vendor_id));
        if (success) {
          setUnreadNotificationCount(0); // Reset the count immediately
          // Refresh notifications to update the UI
          await loadNotifications(parseInt(vendor.vendor_id));
        }
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    }
  };

  const loadLeadsData = async (vendorId: number) => {
    try {
      const [leadsData, statsData] = await Promise.all([
        getVendorLeads(vendorId),
        getVendorLeadStats(vendorId)
      ]);
      setLeads(leadsData);
      setLeadStats(statsData);
    } catch (error) {
      console.error('Error loading leads data:', error);
    }
  };

  const loadCalendarData = async (vendorId: number) => {
    try {
      const [eventsData, calendarStatsData] = await Promise.all([
        getVendorEvents(vendorId),
        getVendorCalendarStats(vendorId)
      ]);
      setCalendarEvents(eventsData);
      setCalendarStats(calendarStatsData || {});
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  };

  const loadCustomersData = async (vendorId: number) => {
    try {
      // Get customers who contacted this vendor from contacted_vendors table
      const response = await getVendorCustomers(vendorId.toString());
      
      if (response.success && response.data) {
        setCustomers(response.data);
        
          // Calculate customer stats based on vendor_status
          const stats = {
            total_customers: response.data.length,
            admin_sent: response.data.filter(c => c.is_admin_sent).length,
            contacted: response.data.filter(c => c.vendor_status === 'Contacted').length,
            customer_interested: response.data.filter(c => c.vendor_status === 'Customer Interested').length,
            deal_made: response.data.filter(c => c.vendor_status === 'Deal Made').length,
            advance_received: response.data.filter(c => c.vendor_status === 'Advance Received').length,
            event_completed: response.data.filter(c => c.vendor_status === 'Event Completed').length,
            full_amount_settled: response.data.filter(c => c.vendor_status === 'Full Amount Settled').length,
            closed: response.data.filter(c => c.vendor_status === 'Closed').length
          };
        setCustomerStats(stats);
      } else {
        console.error('Failed to load customers:', response.error);
        setCustomers([]);
        setCustomerStats({});
      }
    } catch (error) {
      console.error('Error loading customers data:', error);
      setCustomers([]);
      setCustomerStats({});
    }
  };

  const handleStatusUpdate = async (leadId: number, newStatus: string) => {
    // If changing to confirmed_booking, show deal price modal first
    if (newStatus === 'confirmed_booking') {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        setConfirmingLead(lead);
        setShowDealPriceModal(true);
        return; // Don't update status yet, wait for deal price
      }
    }

    try {
      const result = await updateLeadStatus(leadId, newStatus);
      if (result.success && vendor) {
        // Reload leads data
        loadLeadsData(parseInt(vendor.vendor_id));
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const handleConfirmDeal = async (dealAmount: number) => {
    if (!confirmingLead) return;

    try {
      // Update lead with both status and deal amount
      const updateData = {
        status: 'confirmed_booking',
        deal_amount: dealAmount,
        converted_to_booking: true,
        conversion_date: new Date().toISOString(),
      };

      const result = await updateVendorLead(confirmingLead.id, updateData);
      if (result.success && vendor) {
        // Reload leads data
        loadLeadsData(parseInt(vendor.vendor_id));
        setShowDealPriceModal(false);
        setConfirmingLead(null);
      } else {
        console.error('Failed to confirm deal:', result.message);
        alert('Failed to confirm deal. Please try again.');
      }
    } catch (error) {
      console.error('Error confirming deal:', error);
      alert('Error confirming deal. Please try again.');
    }
  };

  const handleDeleteLead = (leadId: number, customerName: string) => {
    // Show custom delete confirmation modal
    const lead = leads.find(l => l.id === leadId);
    setLeadToDelete(lead);
    setShowDeleteModal(true);
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    
    try {
      // For now, delete from local state (replace with API call later)
      const updatedLeads = leads.filter(lead => lead.id !== leadToDelete.id);
      setLeads(updatedLeads);
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setLeadToDelete(null);
      
      // Uncomment this when using real API:
      // const result = await deleteVendorLead(leadToDelete.id);
      // if (result.success && vendor) {
      //   loadLeadsData(parseInt(vendor.vendor_id));
      // } else {
      //   console.error('Failed to delete lead:', result.error);
      // }
      } catch (error) {
      setShowDeleteModal(false);
      setLeadToDelete(null);
    }
  };

  const handleViewLeadDetails = (lead: any) => {
    setSelectedLead(lead);
    setShowCustomerDetails(true);
  };

  const handleWhatsAppChat = (lead: any) => {
    const phoneNumber = lead.customer_whatsapp || lead.customer_phone;
    if (phoneNumber) {
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      const message = `Hi ${lead.customer_name}, this is regarding your ${lead.event_type || 'event'} inquiry. How can I help you?`;
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleViewCustomerDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const handleUnreportCustomer = async (customer: any) => {
    if (!vendor) return;

    try {
      const result = await unflagCustomer(vendor.vendor_id.toString(), customer.customer_id);
      if (result.success) {
        console.log('Customer unreported successfully');
        // Reload customers to get updated report status
        loadCustomersData(parseInt(vendor.vendor_id));
      } else {
        console.error('Failed to unreport customer:', result.error);
        alert('Failed to unreport customer: ' + result.error);
      }
    } catch (error) {
      console.error('Error unreporting customer:', error);
      alert('An error occurred while unreporting the customer');
    }
  };

  const handleVendorStatusUpdate = async (contactId: string, newStatus: string) => {
    try {
      // If status is "Lost", show popup first
      if (newStatus === 'Lost') {
        setPendingLostStatus({ contactId, status: newStatus });
        setShowLostDialog(true);
        return;
      }
      
      console.log(`Updating vendor status for contact ${contactId} to: ${newStatus}`);
      
      // Get customer_id and vendor_id from the customer object
      const customerData = customers.find(c => c.contact_id?.toString() === contactId);
      const result = await updateVendorStatusForContact(
        contactId, 
        newStatus,
        customerData?.customer_id,
        customerData?.vendor_id || vendor?.vendor_id
      );
      
      if (result.success && vendor) {
        // Reload customers data to reflect the change
        loadCustomersData(parseInt(vendor.vendor_id));
      } else {
        console.error('Failed to update vendor status:', result.error);
        alert('Failed to update vendor status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating vendor status:', error);
      alert('Error updating vendor status. Please try again.');
    }
  };

  const handleLostSubmit = async () => {
    if (!lostReason.trim()) {
      alert('Please provide a reason for losing this deal.');
      return;
    }

    if (!pendingLostStatus || !vendor) return;

    try {
      // Update status with reason in notes
      const result = await updateVendorStatusForContact(pendingLostStatus.contactId, pendingLostStatus.status);
      
      if (result.success) {
        // Update notes with the reason
        await updateNotesForContact(pendingLostStatus.contactId, lostReason);
        // Reload customers data
        loadCustomersData(parseInt(vendor.vendor_id));
        setShowLostDialog(false);
        setLostReason('');
        setPendingLostStatus(null);
      } else {
        alert('Failed to update status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating lost status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const handleReportCustomer = (customer: any) => {
    setCustomerToReport(customer);
    setShowReportDialog(true);
  };

  const handleReportSubmit = async () => {
    if (!reportReason.trim()) {
      alert('Please provide a reason for reporting this customer.');
      return;
    }

    if (!customerToReport || !vendor) return;

    try {
      const result = await flagCustomer(vendor.vendor_id.toString(), customerToReport.customer_id, reportReason);
      
      if (result.success) {
        console.log('Customer reported successfully');
        // Check if customer is now blocked
        if (result.data?.is_blocked) {
          alert(`Customer reported. This customer has been blocked (reported ${result.data.flag_count} times).`);
        } else {
          alert(`Customer reported successfully. Total reports: ${result.data?.flag_count || 0}/5`);
        }
        // Reload customers to get updated report status
        loadCustomersData(parseInt(vendor.vendor_id));
        setShowReportDialog(false);
        setReportReason('');
        setCustomerToReport(null);
      } else {
        console.error('Failed to report customer:', result.error);
        alert('Failed to report customer: ' + result.error);
      }
    } catch (error) {
      console.error('Error reporting customer:', error);
      alert('An error occurred while reporting the customer');
    }
  };

  const handleNotesUpdate = async (contactId: string, notes: string) => {
    try {
      console.log(`Updating notes for contact ${contactId}:`, notes);
      
      const result = await updateNotesForContact(contactId, notes);
      
      if (result.success && vendor) {
        // Reload customers data to reflect the change
        loadCustomersData(parseInt(vendor.vendor_id));
        setEditingNotes(null);
        setNotesValue('');
      } else {
        console.error('Failed to update notes:', result.error);
        alert('Failed to update notes. Please try again.');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('Error updating notes. Please try again.');
    }
  };

  const handleStartEditingNotes = (contactId: string, currentNotes: string) => {
    setEditingNotes(contactId);
    setNotesValue(currentNotes || '');
  };

  const handleCancelEditingNotes = () => {
    setEditingNotes(null);
    setNotesValue('');
  };

  // Calendar event handlers
  const handleEventCreate = async (eventData: any) => {
    const result = await createVendorEvent(eventData);
    if (result.success) {
      if (vendor) {
        await loadCalendarData(parseInt(vendor.vendor_id));
      }
    } else {
      alert(result.error || 'Failed to create event');
    }
  };

  const handleEventUpdate = async (eventId: number, eventData: any) => {
    const result = await updateVendorEvent(eventId, eventData);
    if (result.success) {
      if (vendor) {
        await loadCalendarData(parseInt(vendor.vendor_id));
      }
    } else {
      alert(result.error || 'Failed to update event');
    }
  };

  const handleEventDelete = async (eventId: number) => {
    const result = await deleteVendorEvent(eventId);
    if (result.success) {
      if (vendor) {
        await loadCalendarData(parseInt(vendor.vendor_id));
      }
    } else {
      alert(result.error || 'Failed to delete event');
    }
  };

  const handleCalendarRefresh = async () => {
    if (vendor) {
      await loadCalendarData(parseInt(vendor.vendor_id));
    }
  };

  // Invoice/Quotation handlers
  const handleCreateInvoice = () => {
    setEditingInvoiceQuotation(null);
    setShowInvoiceModal(true);
  };

  const handleCreateQuotation = () => {
    setEditingInvoiceQuotation(null);
    setShowQuotationModal(true);
  };

  const handleEditInvoiceQuotation = (invoiceQuotation: InvoiceQuotation) => {
    setEditingInvoiceQuotation(invoiceQuotation);
    if (invoiceQuotation.type === 'invoice') {
      setShowInvoiceModal(true);
    } else {
      setShowQuotationModal(true);
    }
  };

  const handleViewInvoiceQuotation = (invoiceQuotation: InvoiceQuotation) => {
    setSelectedInvoiceQuotation(invoiceQuotation);
    setShowInvoicePreview(true);
  };

  const handleInvoiceQuotationSaved = (invoiceQuotation: InvoiceQuotation) => {
    // Refresh the list or handle the saved invoice/quotation
    console.log('Invoice/Quotation saved:', invoiceQuotation);
    setShowInvoiceModal(false);
    setShowQuotationModal(false);
    setEditingInvoiceQuotation(null);
    
    // Trigger list refresh
    setInvoiceListRefreshTrigger(prev => prev + 1);
    
    // Automatically open the preview of the saved document
    setSelectedInvoiceQuotation(invoiceQuotation);
    setShowInvoicePreview(true);
  };

  const handleDownloadPDF = async () => {
    if (!selectedInvoiceQuotation || !vendor) return;
    
    try {
      await generateAndDownloadPDF(selectedInvoiceQuotation, vendor);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleSendToCustomer = () => {
    // Implement send to customer functionality
    console.log('Send to customer:', selectedInvoiceQuotation?.customer_name);
    alert('Send to customer functionality will be implemented');
  };

  const handleLogout = () => {
    vendorLogout();
    navigate('/');
  };

  const handleViewProfile = () => {
    if (vendor) {
      navigate(`/vendor/${vendor.vendor_id}`);
    }
  };

  const handleEditProfile = () => {
    navigate('/vendor-profile-edit');
  };

  const getLeadStatusColor = (status: string) => {
    switch (status) {
      case 'new_lead': return 'text-white shadow-lg';
      case 'contacted': return 'text-white shadow-lg';
      case 'negotiation': return 'text-white shadow-lg'; 
      case 'proposal_sent': return 'text-white shadow-lg';
      case 'customer_decision_pending': return 'text-white shadow-lg';
      case 'confirmed_booking': return 'text-white shadow-lg';
      case 'advance_received': return 'text-white shadow-lg';
      case 'completed': return 'text-white shadow-lg';
      case 'lost': return 'text-white shadow-lg';
      // Legacy support
      case 'New Lead': return 'text-white shadow-lg';
      case 'Contacted': return 'text-white shadow-lg';
      case 'Negotiation': return 'text-white shadow-lg';
      case 'Proposal Sent': return 'text-white shadow-lg';
      case 'Customer Decision Pending': return 'text-white shadow-lg';
      case 'Confirmed Booking': return 'text-white shadow-lg';
      case 'Advance Received': return 'text-white shadow-lg';
      case 'Completed': return 'text-white shadow-lg';
      case 'Lost': return 'text-white shadow-lg';
      default: return 'text-white shadow-lg';
    }
  };

  const getLeadStatusStyle = (status: string) => {
    switch (status) {
      case 'new_lead': return { background: 'linear-gradient(135deg, #061D49 0%, #233A66 100%)' };
      case 'contacted': return { background: 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)' };
      case 'negotiation': return { background: 'linear-gradient(135deg, #FF8C00 0%, #FF6B00 100%)' };
      case 'proposal_sent': return { background: 'linear-gradient(135deg, #233A66 0%, #061D49 100%)' };
      case 'customer_decision_pending': return { background: 'linear-gradient(135deg, #2684FF 0%, #061D49 100%)' };
      case 'confirmed_booking': return { background: 'linear-gradient(135deg, #FFA326 0%, #32CD32 100%)' };
      case 'advance_received': return { background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)' };
      case 'completed': return { background: 'linear-gradient(135deg, #228B22 0%, #006400 100%)' };
      case 'lost': return { background: 'linear-gradient(135deg, #DC143C 0%, #8B0000 100%)' };
      default: return { background: 'linear-gradient(135deg, #061D49 0%, #233A66 100%)' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/')} className="bg-orange-500 hover:bg-orange-600 text-white">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access the vendor dashboard.</p>
          <Button onClick={() => navigate('/')} className="bg-orange-500 hover:bg-orange-600 text-white">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }


  return (
    <>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes icon-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes tab-glow {
          0%, 100% { box-shadow: 0 0 0 rgba(59, 130, 246, 0); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
        }
        @keyframes slide-up {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-icon-bounce {
          animation: icon-bounce 0.6s ease-in-out;
        }
        .animate-tab-glow {
          animation: tab-glow 2s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
        .text-glow {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
      `}</style>
      
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      
      {/* Brand-Aligned Welcome Header - Hidden on Mobile, Visible on Desktop */}
      <div className="hidden md:block shadow-2xl border-b-4 border-orange-400" style={{ backgroundColor: '#001B5E' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center py-6 md:py-8 gap-4 md:gap-0">
            
            {/* Mobile: Stack vertically, Desktop: Side by side */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
              {/* Enhanced Profile Avatar */}
              <div className="relative">
              <img
                src={vendor.avatar_url || '/images/vendor.jpeg'}
                alt={vendor.brand_name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-white/20"
              />
                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-green-500 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 md:border-3 border-white flex items-center justify-center">
                  <CheckCircle className="w-2 h-2 md:w-3 md:h-3 text-white" />
              </div>
            </div>
              
              {/* Welcome Message */}
              <div className="text-white">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-2">
                  <h1 className="text-xl md:text-3xl font-bold animate-fade-in">
                    Welcome back, {vendor.spoc_name || vendor.brand_name}! 
                  </h1>
                  <div className="animate-bounce">
                    <span className="text-xl md:text-2xl">👋</span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3 mb-3">
                  {/* Category Icon */}
                  <div className="flex items-center gap-2">
                    {(() => {
                      const categories = Array.isArray(vendor.category) 
                        ? vendor.category 
                        : (vendor.categories || (vendor.category ? [vendor.category] : []));
                      const categoryStr = categories[0] || '';
                      const hasPhoto = categoryStr.toLowerCase().includes('photo');
                      const hasEvent = categoryStr.toLowerCase().includes('event');
                      const hasDecor = categoryStr.toLowerCase().includes('decor');
                      
                      if (hasPhoto) return <Camera className="w-4 h-4 md:w-5 md:h-5 text-white/80" />;
                      if (hasEvent) return <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white/80" />;
                      if (hasDecor) return <Star className="w-4 h-4 md:w-5 md:h-5 text-white/80" />;
                      return <Award className="w-4 h-4 md:w-5 md:h-5 text-white/80" />;
                    })()}
                    
                    <p className="text-white/90 text-sm md:text-lg font-medium">
                      {(() => {
                        const categories = Array.isArray(vendor.category) 
                          ? vendor.category 
                          : (vendor.categories || (vendor.category ? [vendor.category] : []));
                        return categories.length > 0 ? categories.join(', ') : 'No Category';
                      })()} | {vendor.brand_name}
                    </p>
                  </div>
                </div>
                
              </div>
            </div>
            
            {/* Mobile-Optimized Action Buttons */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNotificationClick}
                  className="relative bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 hover:border-white/50 transition-all duration-300 rounded-lg shadow-lg px-3 md:px-4 py-2 md:py-2"
                >
                  <Bell className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Notifications</span>
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                      {unreadNotificationCount}
                    </span>
                  )}
                </Button>
                
                {/* Mobile-Optimized Notifications Dropdown */}
                {showNotifications && (
                  <div className="notification-dropdown absolute right-0 top-full mt-2 w-80 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 md:max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {notification.notification_type === 'contact' ? (
                                  <MessageCircle className="w-5 h-5 text-blue-500" />
                                ) : notification.notification_type === 'profile_view' ? (
                                  <Eye className="w-5 h-5 text-green-500" />
                                ) : notification.notification_type === 'admin_notification' ? (
                                  <UserCheck className="w-5 h-5 text-purple-500" />
                                ) : notification.notification_type === 'admin_customer' ? (
                                  <Heart className="w-5 h-5 text-pink-500" />
                                ) : (
                                  <Bell className="w-5 h-5 text-orange-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge 
                                    variant={notification.is_read ? 'secondary' : 'default'}
                                    className="text-xs"
                                  >
                                    {notification.is_read ? 'READ' : 'NEW'}
                                  </Badge>
                                  <Badge 
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {notification.notification_type.toUpperCase()}
                                  </Badge>
                                </div>
                                <h4 className="font-medium text-gray-900 mb-1">
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString()}
                                </p>
                                {notification.customers && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded">
                                    <p className="text-xs text-blue-600">
                                      Customer: {notification.customers.full_name}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No notifications yet</p>
                          <p className="text-sm">Customer contacts and updates will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-1 md:gap-2 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-red-500/20 hover:border-red-300/50 transition-all duration-300 rounded-lg shadow-lg px-3 md:px-4 py-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Brand-Aligned Navigation Tabs - Always Visible on Mobile & Desktop */}
      <div style={{ background: 'linear-gradient(135deg, #061D49 0%, #233A66 100%)' }} className="border-t border-orange-400/30 shadow-xl sticky top-0 z-40">
        <nav className="flex overflow-x-auto scrollbar-hide px-4 md:px-8 py-2 gap-2 md:gap-4 max-w-7xl mx-auto">
          {[
            { 
              id: 'profile', 
              label: 'PROFILE', 
              mobileLabel: 'Profile',
              icon: User
            },
            { 
              id: 'customers', 
              label: 'MY CUSTOMERS', 
              mobileLabel: 'Customers',
              icon: UserCheck
            },
            { 
              id: 'leads', 
              label: 'CRM & LEADS', 
              mobileLabel: 'Leads',
              icon: MessageSquare
            },
            { 
              id: 'calendar', 
              label: 'CALENDAR', 
              mobileLabel: 'Calendar',
              icon: Calendar
            },
            { 
              id: 'invoices', 
              label: 'INVOICES', 
              mobileLabel: 'Invoices',
              icon: FileText
            },
          ].map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
              className={`group flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 py-3 md:py-4 px-3 md:px-6 rounded-xl font-bold text-xs md:text-sm transition-all duration-500 transform animate-slide-up min-w-[80px] md:min-w-auto flex-shrink-0 ${
                    activeTab === tab.id
                  ? 'text-white shadow-2xl scale-105 -translate-y-1 md:-translate-y-2 animate-tab-glow text-glow'
                  : 'text-white/70 hover:text-white hover:shadow-xl hover:scale-102 hover:-translate-y-1 bg-white/5 backdrop-blur-sm hover:bg-white/10'
              }`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)' 
                  : undefined,
                boxShadow: activeTab === tab.id 
                  ? '0 0 20px rgba(255, 163, 38, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3)' 
                  : undefined
              }}
            >
              <tab.icon className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'animate-icon-bounce text-white drop-shadow-lg' 
                  : 'group-hover:scale-110 group-hover:rotate-3'
              }`} />
              <span className="tracking-wide hidden md:inline">{tab.label}</span>
              <span className="tracking-wide md:hidden text-xs">{tab.mobileLabel}</span>
              {activeTab === tab.id && (
                <div className="w-1 h-1 md:w-2 md:h-2 bg-white rounded-full animate-pulse ml-0 md:ml-1"></div>
              )}
                </button>
              ))}
            </nav>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8">
        

        {/* Profile Management Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#001B5E]" />
                  My Vendor Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Status */}
                {pendingChanges.length > 0 ? (
                  <div className="space-y-4">
                    {pendingChanges.map((change) => (
                      <div key={change.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="font-medium text-yellow-800">Profile Update Pending</p>
                            <p className="text-sm text-yellow-700">
                              Submitted {new Date(change.submitted_at).toLocaleDateString()} • 
                              Change Type: {change.change_type}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Pending Approval</Badge>
                      </div>
                    ))}
                  </div>
                ) : rejectedChanges.length > 0 ? (
                  <div className="space-y-4">
                    {rejectedChanges.map((change) => (
                      <div key={change.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="font-medium text-red-800">Profile Changes Rejected</p>
                            <p className="text-sm text-red-700">
                              Rejected {new Date(change.reviewed_at).toLocaleDateString()} • 
                              Change Type: {change.change_type}
                            </p>
                            {change.admin_comments && (
                              <p className="text-sm text-red-600 mt-1">
                                <strong>Reason:</strong> {change.admin_comments}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Your Profile is Up to Date</p>
                        <p className="text-sm text-green-700">No pending updates</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                      <p className="text-xs text-green-600 mt-1">Visible to Customers</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Button 
                      onClick={handleEditProfile}
                      className="flex items-center gap-2 h-20 bg-orange-500 hover:bg-orange-600 text-white shadow-lg w-full"
                    >
                      <Edit className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-medium">Update My Details</div>
                        <div className="text-sm opacity-90">Send for Approval</div>
                      </div>
                    </Button>
                    <p className="text-sm text-gray-600 text-center">
                      Update your details here
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={handleViewProfile}
                      variant="outline"
                      className="flex items-center gap-2 h-20 w-full"
                    >
                      <Eye className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-medium">See How Customers View You</div>
                        <div className="text-sm text-gray-600">Preview Profile (Customer View)</div>
                      </div>
                    </Button>
                    <p className="text-sm text-gray-600 text-center">
                      Check your public information and make sure everything is correct.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* My Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
        {/* Customer Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
          <Card>
            <CardContent className="p-2 md:p-4 text-center">
              <p className="text-lg md:text-2xl font-bold text-[#001B5E]">{customerStats.total_customers || 0}</p>
              <p className="text-xs md:text-sm text-gray-600">Total Contacts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 md:p-4 text-center">
              <p className="text-lg md:text-2xl font-bold text-purple-600">{customerStats.admin_sent || 0}</p>
              <p className="text-xs md:text-sm text-gray-600">👑 Admin Sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 md:p-4 text-center">
              <p className="text-lg md:text-2xl font-bold text-blue-600">{customerStats.contacted || 0}</p>
              <p className="text-xs md:text-sm text-gray-600">Contacted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 md:p-4 text-center">
              <p className="text-lg md:text-2xl font-bold text-yellow-600">{customerStats.customer_interested || 0}</p>
              <p className="text-xs md:text-sm text-gray-600">Interested</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 md:p-4 text-center">
              <p className="text-lg md:text-2xl font-bold text-green-600">{customerStats.event_completed || 0}</p>
              <p className="text-xs md:text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
        </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search customers by name, status, phone, email, or location..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
                />
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>
                Showing {filteredCustomers.length} of {customers.length} customers
                {customerSearchQuery.trim() && ` (filtered by "${customerSearchQuery}")`}
              </span>
            </div>

            {/* Customer List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredCustomers && filteredCustomers.length > 0 ? filteredCustomers.map((customer, index) => (
                <div 
                  key={customer.contact_id} 
                  className="p-4 rounded-xl transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] animate-slide-up border-2"
                  style={{ 
                    background: customer.is_admin_sent 
                      ? 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)' 
                      : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                    borderColor: customer.is_admin_sent ? '#8B5CF6' : '#FFA326',
                    boxShadow: customer.is_admin_sent 
                      ? '0 4px 20px rgba(139, 92, 246, 0.1)' 
                      : '0 4px 20px rgba(255, 163, 38, 0.1)',
                    animationDelay: `${index * 0.1}s`
                  }}
                  onMouseEnter={(e) => {
                    if (customer.is_admin_sent) {
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.2), 0 0 20px rgba(6, 29, 73, 0.1)';
                      e.currentTarget.style.borderColor = '#7C3AED';
                    } else {
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 163, 38, 0.2), 0 0 20px rgba(6, 29, 73, 0.1)';
                      e.currentTarget.style.borderColor = '#FF8C00';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (customer.is_admin_sent) {
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.1)';
                      e.currentTarget.style.borderColor = '#8B5CF6';
                    } else {
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 163, 38, 0.1)';
                      e.currentTarget.style.borderColor = '#FFA326';
                    }
                  }}
                >
                  {/* Customer Info */}
                  <div className="flex items-center gap-3 mb-3">
                    {/* Customer Avatar */}
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0"
                      style={{ 
                        background: customer.is_admin_sent 
                          ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' 
                          : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                        border: customer.is_admin_sent 
                          ? '2px solid #8B5CF6' 
                          : '2px solid #FFA326'
                      }}
                    >
                      {customer.customer_name ? customer.customer_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 
                          className="font-bold text-gray-900 text-lg cursor-pointer hover:text-orange-600 transition-colors truncate"
                          onClick={() => handleViewCustomerDetails(customer)}
                          style={{ color: '#061D49' }}
                        >
                          {customer.customer_name}
                        </h3>
                        
                        {/* Admin-sent badge */}
                        {customer.is_admin_sent && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-bold border border-purple-300">
                            👑 ADMIN SENT
                          </span>
                        )}
                        {/* Blocked badge */}
                        {customer.is_blocked && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold border border-red-300">
                            ⛔ BLOCKED
                          </span>
                        )}
                        {/* Flag count badge */}
                        {customer.flag_count > 0 && !customer.is_blocked && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold border border-orange-300">
                            🚩 {customer.flag_count} Flag{customer.flag_count > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      {/* Contact Info Pills */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="bg-[#F7941D]/20 text-[#001B5E] px-2 py-1 rounded-full text-xs font-medium">
                          📍 {customer.customer_location || 'Location TBD'}
                        </span>
                        <span className="bg-[#001B5E]/20 text-[#001B5E] px-2 py-1 rounded-full text-xs font-medium">
                          🕒 {customer.contacted_at ? new Date(customer.contacted_at).toLocaleDateString() : 'Contact Date TBD'}
                        </span>
                        {customer.customer_email && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            📧 {customer.customer_email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions Row */}
                  <div className="flex items-center justify-between gap-3">
                    {/* Vendor Status Dropdown */}
                    <div className="flex-1">
                      <select
                        value={customer.vendor_status || 'Contacted'}
                        onChange={(e) => handleVendorStatusUpdate(customer.contact_id.toString(), e.target.value)}
                        className="w-full px-3 py-2 rounded-lg font-semibold shadow-md text-white border-0 focus:ring-2 focus:ring-orange-300 transition-all"
                        style={{
                          background: customer.vendor_status === 'Event Completed' ? 
                            'linear-gradient(135deg, #228B22 0%, #006400 100%)' :
                            customer.vendor_status === 'Deal Made' ?
                            'linear-gradient(135deg, #32CD32 0%, #228B22 100%)' :
                            customer.vendor_status === 'Customer Interested' ?
                            'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' :
                            customer.vendor_status === 'Advance Received' ?
                            'linear-gradient(135deg, #4169E1 0%, #0000CD 100%)' :
                            customer.vendor_status === 'Full Amount Settled' ?
                            'linear-gradient(135deg, #9370DB 0%, #8A2BE2 100%)' :
                            customer.vendor_status === 'Closed' ?
                            'linear-gradient(135deg, #696969 0%, #2F4F4F 100%)' :
                            'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)'
                        }}
                      >
                        <option value="Customer Contacted">📞 Customer Contacted</option>
                        <option value="Discussion in Progress">💬 Discussion in Progress</option>
                        <option value="Quotation Shared">📋 Quotation Shared</option>
                        <option value="Negotiation Ongoing">🤝 Negotiation Ongoing</option>
                        <option value="Deal Confirmed">✅ Deal Confirmed</option>
                        <option value="Advance Received">💰 Advance Received</option>
                        <option value="Event Scheduled">📅 Event Scheduled</option>
                        <option value="Service in Progress">⚙️ Service in Progress</option>
                        <option value="Service Completed">🎉 Service Completed</option>
                        <option value="Payment Settled">💳 Payment Settled</option>
                        <option value="Lost">❌ Lost</option>
                      </select>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewCustomerDetails(customer);
                        }}
                        title="View Details"
                        className="p-2 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-0"
                        style={{ 
                          background: 'linear-gradient(135deg, #061D49 0%, #233A66 100%)',
                          boxShadow: '0 0 10px rgba(255, 163, 38, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #061D49 0%, #233A66 100%)';
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {customer.customer_phone && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${customer.customer_phone}`);
                          }}
                          title="Call Customer"
                          className="p-2 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-0"
                          style={{ background: 'linear-gradient(135deg, #233A66 0%, #2684FF 100%)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #233A66 0%, #2684FF 100%)';
                          }}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {(customer.customer_whatsapp || customer.customer_phone) && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWhatsAppChat(customer);
                          }}
                          title="WhatsApp"
                          className="p-2 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-0"
                          style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)';
                          }}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {/* Report Button */}
                      {customer.customer_id > 0 && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (customer.is_flagged_by_vendor) {
                              handleUnreportCustomer(customer);
                            } else {
                              handleReportCustomer(customer);
                            }
                          }}
                          title={customer.is_flagged_by_vendor ? "Unreport Customer" : "Report Customer"}
                          className="p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-0"
                          style={{ 
                            background: customer.is_flagged_by_vendor 
                              ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
                              : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = customer.is_flagged_by_vendor 
                              ? 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)'
                              : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)';
                          }}
                        >
                          <Flag className={`w-4 h-4 ${customer.is_flagged_by_vendor ? 'fill-white' : ''}`} />
                        </Button>
                      )}
                    </div>
                  </div>
                  
              {/* Notes Section */}
              <div className="mt-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">📝 Notes:</span>
                  {editingNotes !== customer.contact_id.toString() && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartEditingNotes(customer.contact_id.toString(), customer.notes || '')}
                      className="text-xs px-2 py-1 h-6 text-gray-600 hover:text-orange-600"
                    >
                      {customer.notes ? 'Edit' : 'Add'}
                    </Button>
                  )}
                </div>
                
                {editingNotes === customer.contact_id.toString() ? (
                  <div className="space-y-2">
                    <textarea
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      placeholder="Add notes about this customer..."
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleNotesUpdate(customer.contact_id.toString(), notesValue)}
                        className="text-xs px-3 py-1 h-6 bg-green-600 hover:bg-green-700 text-white"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEditingNotes}
                        className="text-xs px-3 py-1 h-6 text-gray-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 min-h-[20px]">
                    {customer.notes || 'No notes added yet'}
                  </p>
                )}
              </div>

              {/* Customer Contact Info */}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    📧 {customer.customer_email || 'No email'}
                  </span>
                  <span>
                    📞 {customer.customer_phone || 'No phone'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">
                  Contacted: {customer.contacted_at ? 
                    new Date(customer.contacted_at).toLocaleDateString() : 
                    'Date not available'
                  }
                </p>
              </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-12 px-6 rounded-xl" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)', border: '2px dashed #FFA326' }}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)' }}>
                    <UserCheck className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#061D49' }}>No customers yet</h3>
                  <p className="text-gray-600 mb-4">Customers who contact you will appear here</p>
                  <Button 
                    onClick={() => setActiveTab('leads')}
                    className="text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg py-2 px-6 font-semibold transform hover:scale-105 border-0"
                    style={{ 
                      background: 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)',
                      boxShadow: '0 0 15px rgba(255, 163, 38, 0.3)'
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Manage Leads
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced CRM & Leads Tab */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            

            {/* Header with Add Button on Right */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white">My Leads</h2>
              
              {/* Add Lead Button on Right */}
              <Button 
                onClick={() => setShowAddLeadModal(true)}
                className="text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-3 px-6 font-bold transform hover:scale-105 border-0"
                style={{ 
                  background: 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)',
                  boxShadow: '0 0 20px rgba(255, 163, 38, 0.4), 0 8px 32px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 163, 38, 0.6), 0 12px 40px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 163, 38, 0.4), 0 8px 32px rgba(0, 0, 0, 0.2)';
                }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Lead
              </Button>
            </div>

            {/* Search and Filter Controls */}
            <div className="mb-6 space-y-4">
              {/* Search Bar and Filter Toggle */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search leads by name, event type, phone, or notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="h-12 px-6 bg-white border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-all rounded-xl"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <Badge 
                      className="ml-2 text-xs px-2 py-1 text-white rounded-full"
                      style={{ backgroundColor: '#FFA326' }}
                    >
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Advanced Filters Panel */}
              {showFilters && (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg animate-fade-in">
                  {/* Filter Panel Header with Close Button */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Filter Leads</h3>
                    <Button
                      onClick={() => setShowFilters(false)}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-gray-300"
                      title="Close Filters"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Lead Stage Filter */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Lead Stage</label>
                      <div className="space-y-2">
                        {['new_lead', 'contacted', 'negotiation', 'proposal_sent', 'customer_decision_pending', 'confirmed_booking', 'advance_received', 'completed', 'lost'].map((stage) => (
                          <label key={stage} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.stages.includes(stage)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({
                                    ...prev, 
                                    stages: [...prev.stages, stage]
                                  }));
                                } else {
                                  setFilters(prev => ({
                                    ...prev, 
                                    stages: prev.stages.filter(s => s !== stage)
                                  }));
                                }
                              }}
                              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                            />
                            <span className="text-sm text-gray-700 capitalize">
                              {stage.replace(/_/g, ' ').replace('customer decision pending', 'Decision Pending').replace('confirmed booking', 'Confirmed').replace('advance received', 'Advance Received')}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Event Type Filter */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Event Type</label>
                      <div className="space-y-2">
                        {['Wedding', 'Birthday Party', 'Anniversary', 'Corporate Event', 'Engagement', 'Baby Shower', 'Other'].map((type) => (
                          <label key={type} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.eventTypes.includes(type)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({ ...prev, eventTypes: [...prev.eventTypes, type] }));
                                } else {
                                  setFilters(prev => ({ ...prev, eventTypes: prev.eventTypes.filter(t => t !== type) }));
                                }
                              }}
                              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                            />
                            <span className="text-sm text-gray-700">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Budget Range Filter */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Budget Range</label>
                      <div className="space-y-2">
                        {['under_25k', '25k_50k', '50k_1l', '1l_2l', '2l_5l', 'above_5l'].map((range) => (
                          <label key={range} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.budgetRanges.includes(range)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters(prev => ({ ...prev, budgetRanges: [...prev.budgetRanges, range] }));
                                } else {
                                  setFilters(prev => ({ ...prev, budgetRanges: prev.budgetRanges.filter(r => r !== range) }));
                                }
                              }}
                              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                            />
                            <span className="text-sm text-gray-700">
                              {range.replace('_', '-').replace('k', 'K').replace('l', 'L')}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Quick Date Filters */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Quick Date Filter</label>
                      <div className="space-y-2">
                        {[
                          { value: 'today', label: 'Today' },
                          { value: 'week', label: 'This Week' },
                          { value: 'month', label: 'This Month' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="quickDateFilter"
                              checked={filters.quickDateFilter === option.value}
                              onChange={() => setFilters(prev => ({ ...prev, quickDateFilter: option.value }))}
                              className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-400"
                            />
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
            </div>

                    {/* Event Date Range */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Event Date Range</label>
                      <div className="space-y-3">
                        <Input
                          type="date"
                          placeholder="Start Date"
                          value={filters.eventDateRange.start}
                          onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            eventDateRange: { ...prev.eventDateRange, start: e.target.value }
                          }))}
                          className="h-10 border-gray-300 rounded-lg focus:border-orange-400 focus:ring-orange-200"
                        />
                        <Input
                          type="date"
                          placeholder="End Date"
                          value={filters.eventDateRange.end}
                          onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            eventDateRange: { ...prev.eventDateRange, end: e.target.value }
                          }))}
                          className="h-10 border-gray-300 rounded-lg focus:border-orange-400 focus:ring-orange-200"
                        />
                      </div>
                    </div>

                    {/* Last Contacted Range */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Last Contacted Range</label>
                      <div className="space-y-3">
                        <Input
                          type="date"
                          placeholder="Start Date"
                          value={filters.lastContactedRange.start}
                          onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            lastContactedRange: { ...prev.lastContactedRange, start: e.target.value }
                          }))}
                          className="h-10 border-gray-300 rounded-lg focus:border-orange-400 focus:ring-orange-200"
                        />
                        <Input
                          type="date"
                          placeholder="End Date"
                          value={filters.lastContactedRange.end}
                          onChange={(e) => setFilters(prev => ({ 
                            ...prev, 
                            lastContactedRange: { ...prev.lastContactedRange, end: e.target.value }
                          }))}
                          className="h-10 border-gray-300 rounded-lg focus:border-orange-400 focus:ring-orange-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                    >
                      Clear All Filters
                    </Button>
                    <Button
                      onClick={() => setShowFilters(false)}
                      className="text-white"
                      style={{ backgroundColor: '#FFA326' }}
                    >
                      Close Filters
                    </Button>
                  </div>
                </div>
              )}

              {/* Active Filter Pills */}
              {getActiveFilterCount() > 0 && (
                <div className="flex flex-wrap gap-2">
                  {searchQuery.trim() && (
                    <Badge 
                      className="flex items-center gap-2 px-3 py-1 text-white rounded-full cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: '#FFA326' }}
                      onClick={() => setSearchQuery('')}
                    >
                      Search: "{searchQuery}"
                      <X className="w-3 h-3" />
                    </Badge>
                  )}
                  
                  {filters.stages.map(stage => (
                    <Badge 
                      key={stage}
                      className="flex items-center gap-2 px-3 py-1 text-white rounded-full cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: '#061D49' }}
                      onClick={() => setFilters(prev => ({ ...prev, stages: prev.stages.filter(s => s !== stage) }))}
                    >
                      {stage.replace('_', ' ')}
                      <X className="w-3 h-3" />
                    </Badge>
                  ))}

                  {filters.eventTypes.map(type => (
                    <Badge 
                      key={type}
                      className="flex items-center gap-2 px-3 py-1 text-white rounded-full cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: '#2563EB' }}
                      onClick={() => setFilters(prev => ({ ...prev, eventTypes: prev.eventTypes.filter(t => t !== type) }))}
                    >
                      {type}
                      <X className="w-3 h-3" />
                    </Badge>
                  ))}

                  {filters.budgetRanges.map(range => (
                    <Badge 
                      key={range}
                      className="flex items-center gap-2 px-3 py-1 text-white rounded-full cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: '#059669' }}
                      onClick={() => setFilters(prev => ({ ...prev, budgetRanges: prev.budgetRanges.filter(r => r !== range) }))}
                    >
                      {range.replace('_', '-').replace('k', 'K').replace('l', 'L')}
                      <X className="w-3 h-3" />
                    </Badge>
                  ))}

                  {filters.quickDateFilter && (
                    <Badge 
                      className="flex items-center gap-2 px-3 py-1 text-white rounded-full cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: '#7C3AED' }}
                      onClick={() => setFilters(prev => ({ ...prev, quickDateFilter: '' }))}
                    >
                      {filters.quickDateFilter === 'today' ? 'Today' : 
                       filters.quickDateFilter === 'week' ? 'This Week' : 'This Month'}
                      <X className="w-3 h-3" />
                    </Badge>
                  )}
                </div>
              )}

              {/* Results Summary */}
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>
                  Showing {filteredLeads.length} of {leads.length} leads
                  {getActiveFilterCount() > 0 && ` (${getActiveFilterCount()} filters active)`}
                </span>
              </div>
            </div>


            {/* Compact Multi-Column Lead Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderError ? (
                <div className="col-span-full text-center py-12 px-6 rounded-xl bg-red-50 border-2 border-red-200">
                  <h3 className="text-xl font-bold mb-2 text-red-800">Rendering Error</h3>
                  <p className="text-red-600 mb-4">{renderError}</p>
                  <Button onClick={() => setRenderError('')} className="bg-red-600 hover:bg-red-700 text-white">
                    Try Again
                  </Button>
                </div>
              ) : (
                <>
                  {filteredLeads && filteredLeads.length > 0 ? filteredLeads.map((lead, index) => {
                    try {
                      if (!lead || !lead.id) {
                        console.error('Invalid lead data:', lead);
                        return null;
                      }
                      return (
                <div 
                  key={lead.id} 
                  className="p-4 rounded-xl transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] animate-slide-up border-2"
                  style={{ 
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                    borderColor: '#FFA326',
                    boxShadow: '0 4px 20px rgba(255, 163, 38, 0.1)',
                    animationDelay: `${index * 0.1}s`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(255, 163, 38, 0.2), 0 0 20px rgba(6, 29, 73, 0.1)';
                    e.currentTarget.style.borderColor = '#FF8C00';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 163, 38, 0.1)';
                    e.currentTarget.style.borderColor = '#FFA326';
                  }}
                >
                  {/* Compact Lead Info */}
                  <div className="flex items-center gap-3 mb-3">
                    {/* Brand-Aligned Avatar */}
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0"
                      style={{ 
                        background: 'linear-gradient(135deg, #061D49 0%, #233A66 100%)',
                        border: '2px solid #FFA326'
                      }}
                    >
                      {lead.customer_name ? lead.customer_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'NA'}
            </div>

                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-bold text-gray-900 text-lg cursor-pointer hover:text-orange-600 transition-colors truncate"
                        onClick={() => handleViewLeadDetails(lead)}
                        style={{ color: '#061D49' }}
                      >
                        {lead.customer_name}
                      </h3>
                      
                      {/* Compact Event Info Pills */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="bg-[#F7941D]/20 text-[#001B5E] px-2 py-1 rounded-full text-xs font-medium">
                          📅 {lead.event_type || 'Event TBD'}
                        </span>
                        <span className="bg-[#001B5E]/20 text-[#001B5E] px-2 py-1 rounded-full text-xs font-medium">
                          🕒 {lead.event_date ? new Date(lead.event_date).toLocaleDateString() : 'Date TBD'}
                        </span>
                        {lead.budget_range && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            💰 {lead.budget_range.replace('_', '-').replace('k', 'K').replace('l', 'L')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions Row */}
                  <div className="flex items-center justify-between gap-3">
                    {/* Compact Status Dropdown */}
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                      className={`flex-1 text-sm px-3 py-2 rounded-lg border-0 font-semibold shadow-md transition-all duration-200 cursor-pointer ${getLeadStatusColor(lead.status)}`}
                      style={getLeadStatusStyle(lead.status)}
                        >
                          <option value="new_lead">New Lead</option>
                          <option value="contacted">Contacted</option>
                          <option value="negotiation">Negotiation</option>
                          <option value="proposal_sent">Proposal Sent</option>
                      <option value="customer_decision_pending">Decision Pending</option>
                          <option value="confirmed_booking">Confirmed</option>
                          <option value="advance_received">Advance Received</option>
                          <option value="completed">Completed</option>
                          <option value="lost">Lost</option>
                        </select>
                    
                    {/* Compact Action Buttons */}
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewLeadDetails(lead);
                            }}
                        title="View Details & Budget"
                        className="p-2 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-0"
                        style={{ 
                          background: 'linear-gradient(135deg, #061D49 0%, #233A66 100%)',
                          boxShadow: '0 0 10px rgba(255, 163, 38, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #061D49 0%, #233A66 100%)';
                        }}
                      >
                        <Eye className="w-4 h-4" />
                          </Button>
                      
                          {lead.customer_phone && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`tel:${lead.customer_phone}`);
                              }}
                              title="Call Customer"
                          className="p-2 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-0"
                          style={{ background: 'linear-gradient(135deg, #233A66 0%, #2684FF 100%)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #233A66 0%, #2684FF 100%)';
                          }}
                        >
                          <Phone className="w-4 h-4" />
                            </Button>
                          )}
                      
                          {(lead.customer_whatsapp || lead.customer_phone) && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWhatsAppChat(lead);
                              }}
                          title="WhatsApp"
                          className="p-2 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-0"
                          style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)';
                          }}
                        >
                          <MessageCircle className="w-4 h-4" />
                            </Button>
                          )}

                          {/* Delete Lead Button */}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLead(lead.id, lead.customer_name);
                            }}
                            title="Delete Lead"
                            className="p-2 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border-0"
                            style={{ background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                  
                  {/* Last Contact Info */}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                      Last contact: {lead.last_contact_date ? 
                        new Date(lead.last_contact_date).toLocaleDateString() : 
                        new Date(lead.created_at).toLocaleDateString()
                      }
                    </p>
                    </div>
                    </div>
                      );
                    } catch (error) {
                      console.error('Error rendering lead:', error, lead);
                      setRenderError(`Error rendering lead: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      return null;
                    }
                  }) : (
                  <div className="col-span-full text-center py-12 px-6 rounded-xl" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)', border: '2px dashed #FFA326' }}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)' }}>
                      {leads.length === 0 ? (
                        <MessageSquare className="w-8 h-8 text-white" />
                      ) : (
                        <Filter className="w-8 h-8 text-white" />
                  )}
                </div>
                    {leads.length === 0 ? (
                      <>
                        <h3 className="text-xl font-bold mb-2" style={{ color: '#061D49' }}>Ready to grow your business?</h3>
                        <p className="text-gray-600 mb-4">Start building your customer pipeline by adding your first lead</p>
                          <Button 
                          onClick={() => setShowAddLeadModal(true)}
                          className="text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg py-2 px-6 font-semibold transform hover:scale-105 border-0"
                          style={{ 
                            background: 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)',
                            boxShadow: '0 0 15px rgba(255, 163, 38, 0.3)'
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Lead
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold mb-2" style={{ color: '#061D49' }}>No leads match your filters</h3>
                        <p className="text-gray-600 mb-4">Try adjusting your search criteria or clearing some filters to see more results</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button 
                            onClick={clearFilters}
                            variant="outline"
                            className="text-gray-600 hover:text-orange-600 hover:border-orange-400 hover:bg-orange-50 border-2"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear All Filters
                          </Button>
                          <Button 
                            onClick={() => setShowAddLeadModal(true)}
                            className="text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg py-2 px-6 font-semibold transform hover:scale-105 border-0"
                            style={{ 
                              background: 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)',
                              boxShadow: '0 0 15px rgba(255, 163, 38, 0.3)'
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Lead
                          </Button>
                        </div>
                      </>
                    )}
                    </div>
                  )}
                </>
                  )}
                </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Calendar Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-[#001B5E]">{calendarStats.total_events || 0}</p>
                  <p className="text-sm text-gray-600">Total Events</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{calendarStats.confirmed_bookings || 0}</p>
                  <p className="text-sm text-gray-600">Confirmed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{calendarStats.tentative_bookings || 0}</p>
                  <p className="text-sm text-gray-600">Tentative</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{calendarStats.blocked_days || 0}</p>
                  <p className="text-sm text-gray-600">Blocked Days</p>
                </CardContent>
              </Card>
            </div>

            {/* Calendar Component */}
            <VendorCalendar
              vendorId={parseInt(vendor.vendor_id)}
              events={calendarEvents}
              onEventCreate={handleEventCreate}
              onEventUpdate={handleEventUpdate}
              onEventDelete={handleEventDelete}
              onEventsRefresh={handleCalendarRefresh}
            />
          </div>
        )}


        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <InvoiceQuotationList
              vendor={vendor}
              onEdit={handleEditInvoiceQuotation}
              onView={handleViewInvoiceQuotation}
              onCreateNew={(type) => {
                if (type === 'invoice') {
                  handleCreateInvoice();
                } else {
                  handleCreateQuotation();
                }
              }}
              refreshTrigger={invoiceListRefreshTrigger}
            />
          </div>
        )}

      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && vendor && (
        <AddLeadModal
          vendorId={parseInt(vendor.vendor_id)}
          onClose={() => setShowAddLeadModal(false)}
          onLeadAdded={() => {
            loadLeadsData(parseInt(vendor.vendor_id));
            setShowAddLeadModal(false);
          }}
        />
      )}

      {/* Customer Details Modal */}
      {showCustomerDetails && (selectedLead || selectedCustomer) && (
        <CustomerDetailsModal
          lead={selectedLead || selectedCustomer}
          onClose={() => {
            setShowCustomerDetails(false);
            setSelectedLead(null);
            setSelectedCustomer(null);
          }}
          onLeadUpdated={() => {
            if (vendor) {
              loadLeadsData(parseInt(vendor.vendor_id));
            }
          }}
        />
      )}

      {/* Deal Price Modal */}
      {showDealPriceModal && confirmingLead && (
        <DealPriceModal
          lead={confirmingLead}
          onClose={() => {
            setShowDealPriceModal(false);
            setConfirmingLead(null);
          }}
          onConfirm={handleConfirmDeal}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && leadToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl rounded-xl border-0">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6" />
                  <CardTitle className="text-xl font-bold">Delete Lead</CardTitle>
    </div>
                <Button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setLeadToDelete(null);
                  }}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Are you sure you want to delete this lead?
                  </h3>
                  <p className="text-gray-600 mb-1">
                    <strong>{leadToDelete.customer_name}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    {leadToDelete.event_type} • {leadToDelete.status?.replace('_', ' ')}
                  </p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ This action cannot be undone
                  </p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setLeadToDelete(null);
                    }}
                    variant="outline"
                    className="flex-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDeleteLead}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Lead
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && vendor && (
        <InvoiceQuotationModal
          isOpen={showInvoiceModal}
          onClose={() => {
            setShowInvoiceModal(false);
            setEditingInvoiceQuotation(null);
          }}
          onSave={handleInvoiceQuotationSaved}
          vendor={vendor}
          type="invoice"
          editData={editingInvoiceQuotation}
        />
      )}

      {/* Quotation Modal */}
      {showQuotationModal && vendor && (
        <InvoiceQuotationModal
          isOpen={showQuotationModal}
          onClose={() => {
            setShowQuotationModal(false);
            setEditingInvoiceQuotation(null);
          }}
          onSave={handleInvoiceQuotationSaved}
          vendor={vendor}
          type="quotation"
          editData={editingInvoiceQuotation}
        />
      )}

      {/* Invoice/Quotation Preview Modal */}
      {showInvoicePreview && selectedInvoiceQuotation && vendor && (
        <InvoiceQuotationPreview
          invoiceQuotation={selectedInvoiceQuotation}
          vendor={vendor}
          onClose={() => {
            setShowInvoicePreview(false);
            setSelectedInvoiceQuotation(null);
          }}
          onEdit={() => {
            setShowInvoicePreview(false);
            handleEditInvoiceQuotation(selectedInvoiceQuotation);
          }}
          onDownload={handleDownloadPDF}
          onSend={handleSendToCustomer}
        />
      )}
      
      {/* Brand-Aligned Floating Action Button */}
      {activeTab === 'leads' && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            onClick={() => setShowAddLeadModal(true)}
            className="w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 border-0 text-white"
            title="Quick Add Lead"
            style={{ 
              background: 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)',
              boxShadow: '0 0 30px rgba(255, 163, 38, 0.4), 0 12px 40px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 163, 38, 0.6), 0 16px 50px rgba(0, 0, 0, 0.4)';
              e.currentTarget.style.transform = 'scale(1.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 163, 38, 0.4), 0 12px 40px rgba(0, 0, 0, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Plus className="w-8 h-8 text-white drop-shadow-lg" />
          </Button>
    </div>
      )}

      {/* Lost Status Dialog */}
      <Dialog open={showLostDialog} onOpenChange={setShowLostDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Why did you lose this deal?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Please provide a reason for losing this deal. This helps us improve our services.
            </p>
            <Textarea
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              placeholder="Please tell us why this deal was lost..."
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowLostDialog(false);
                  setLostReason('');
                  setPendingLostStatus(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLostSubmit}
                disabled={!lostReason.trim()}
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Customer Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Report Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Please provide a reason for reporting this customer. Customers with 5 or more reports will be automatically blocked.
            </p>
            {customerToReport && (
              <p className="text-sm font-medium text-gray-800">
                Reporting: {customerToReport.customer_name}
              </p>
            )}
            <Textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please provide a reason for reporting this customer..."
              className="min-h-[120px] resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReportDialog(false);
                  setReportReason('');
                  setCustomerToReport(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReportSubmit}
                disabled={!reportReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                Report Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};

export default VendorDashboard;
