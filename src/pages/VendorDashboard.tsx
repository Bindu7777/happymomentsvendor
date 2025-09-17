import React, { useState, useEffect } from 'react';
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
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Bell,
  Settings,
  Trash2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { getLoggedInVendor, vendorLogout, getVendorPendingChanges, getVendorNotifications, getVendorLeads, getVendorLeadStats, updateLeadStatus, deleteVendorLead, updateVendorLead, getVendorEvents, createVendorEvent, updateVendorEvent, deleteVendorEvent, getVendorCalendarStats } from '../services/supabaseService';
import { Vendor } from '../lib/supabase';
import AddLeadModal from '../components/AddLeadModal';
import CustomerDetailsModal from '../components/CustomerDetailsModal';
import DealPriceModal from '../components/DealPriceModal';
import VendorCalendar from '../components/VendorCalendar';

const VendorDashboard: React.FC = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('leads');
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [leadStats, setLeadStats] = useState<any>({});
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showDealPriceModal, setShowDealPriceModal] = useState(false);
  const [confirmingLead, setConfirmingLead] = useState<any>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarStats, setCalendarStats] = useState<any>({});
  const [analytics] = useState({
    profileViews: 1250,
    whatsappClicks: 89,
    callClicks: 67,
    emailClicks: 34,
  });
  const navigate = useNavigate();

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
    console.log('VendorDashboard useEffect triggered');
    try {
      const loggedInVendor = getLoggedInVendor();
      console.log('Logged in vendor:', loggedInVendor);
      
      if (!loggedInVendor) {
        console.log('No vendor logged in, redirecting to home');
        setError('No vendor session found. Please login first.');
        navigate('/');
        return;
      }
      
    setVendor(loggedInVendor);
    loadPendingChanges(loggedInVendor.vendor_id);
    loadNotifications(loggedInVendor.vendor_id);
    loadLeadsData(loggedInVendor.vendor_id);
    loadCalendarData(loggedInVendor.vendor_id);
    setLoading(false);
    } catch (err) {
      console.error('Error in VendorDashboard useEffect:', err);
      setError('Error loading dashboard. Please try again.');
      setLoading(false);
    }
  }, [navigate]);

  const loadPendingChanges = async (vendorId: number) => {
    const pending = await getVendorPendingChanges(vendorId);
    setPendingChanges(pending);
  };

  const loadNotifications = async (vendorId: number) => {
    try {
      const notifications = await getVendorNotifications(vendorId);
      setNotifications(notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
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
        loadLeadsData(vendor.vendor_id);
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
        loadLeadsData(vendor.vendor_id);
        setShowDealPriceModal(false);
        setConfirmingLead(null);
      } else {
        console.error('Failed to confirm deal:', result.error);
        alert('Failed to confirm deal. Please try again.');
      }
    } catch (error) {
      console.error('Error confirming deal:', error);
      alert('Error confirming deal. Please try again.');
    }
  };

  const handleDeleteLead = async (leadId: number, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete the lead for "${customerName}"? This action cannot be undone.`)) {
      try {
        const result = await deleteVendorLead(leadId);
        if (result.success && vendor) {
          // Reload leads data
          loadLeadsData(vendor.vendor_id);
        } else {
          console.error('Failed to delete lead:', result.error);
          alert('Failed to delete lead. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Error deleting lead. Please try again.');
      }
    }
  };

  const handleViewCustomerDetails = (lead: any) => {
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

  // Calendar event handlers
  const handleEventCreate = async (eventData: any) => {
    const result = await createVendorEvent(eventData);
    if (result.success) {
      if (vendor) {
        await loadCalendarData(vendor.vendor_id);
      }
    } else {
      alert(result.error || 'Failed to create event');
    }
  };

  const handleEventUpdate = async (eventId: number, eventData: any) => {
    const result = await updateVendorEvent(eventId, eventData);
    if (result.success) {
      if (vendor) {
        await loadCalendarData(vendor.vendor_id);
      }
    } else {
      alert(result.error || 'Failed to update event');
    }
  };

  const handleEventDelete = async (eventId: number) => {
    const result = await deleteVendorEvent(eventId);
    if (result.success) {
      if (vendor) {
        await loadCalendarData(vendor.vendor_id);
      }
    } else {
      alert(result.error || 'Failed to delete event');
    }
  };

  const handleCalendarRefresh = async () => {
    if (vendor) {
      await loadCalendarData(vendor.vendor_id);
    }
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
      case 'new_lead': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'negotiation': return 'bg-orange-100 text-orange-800';
      case 'proposal_sent': return 'bg-purple-100 text-purple-800';
      case 'customer_decision_pending': return 'bg-indigo-100 text-indigo-800';
      case 'confirmed_booking': return 'bg-green-100 text-green-800';
      case 'advance_received': return 'bg-emerald-100 text-emerald-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'lost': return 'bg-red-100 text-red-800';
      // Legacy support
      case 'New Lead': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Negotiation': return 'bg-orange-100 text-orange-800';
      case 'Proposal Sent': return 'bg-purple-100 text-purple-800';
      case 'Customer Decision Pending': return 'bg-indigo-100 text-indigo-800';
      case 'Confirmed Booking': return 'bg-green-100 text-green-800';
      case 'Advance Received': return 'bg-emerald-100 text-emerald-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    console.log('VendorDashboard is in loading state');
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
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!vendor) {
    console.log('No vendor found, showing access denied');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access the vendor dashboard.</p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  console.log('Rendering VendorDashboard with vendor:', vendor);
  console.log('Active tab:', activeTab);
  console.log('Leads:', leads);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border-b border-yellow-200 p-2 text-xs">
          <strong>Debug:</strong> Vendor ID: {vendor?.vendor_id}, Brand: {vendor?.brand_name}, Leads: {leads.length}
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <img
                src={vendor.avatar_url || '/images/vendor.jpeg'}
                alt={vendor.brand_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{vendor.brand_name}</h1>
                <p className="text-gray-600">{vendor.category} • {vendor.spoc_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  {notifications.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="notification-dropdown absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Profile Change Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {notification.status === 'approved' ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                  )}
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    notification.status === 'approved' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {notification.status === 'approved' ? 'APPROVED' : 'REJECTED'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-900 font-medium">
                                  Profile Update {notification.status === 'approved' ? 'Approved' : 'Rejected'}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Submitted: {new Date(notification.submitted_at).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Reviewed: {new Date(notification.reviewed_at).toLocaleDateString()}
                                </p>
                                {notification.admin_comments && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                    <span className="font-medium text-gray-700">Admin Comments:</span>
                                    <p className="text-gray-600 mt-1">{notification.admin_comments}</p>
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
                          <p className="text-sm">Profile change updates will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'leads', label: 'CRM & Leads', icon: MessageSquare },
                { id: 'profile', label: 'Profile Management', icon: User },
                { id: 'calendar', label: 'Calendar', icon: Calendar },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'invoices', label: 'Invoices', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Profile Management Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Profile Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pending Changes Status */}
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
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Profile Up to Date</p>
                        <p className="text-sm text-green-700">No pending changes</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button 
                    onClick={handleEditProfile}
                    className="flex items-center gap-2 h-20 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-medium">Edit Profile</div>
                      <div className="text-sm opacity-90">Submit changes for approval</div>
                    </div>
                  </Button>

                  <Button 
                    onClick={handleViewProfile}
                    variant="outline"
                    className="flex items-center gap-2 h-20"
                  >
                    <Eye className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-medium">View Public Profile</div>
                      <div className="text-sm text-gray-600">See how customers see you</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CRM & Leads Tab */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">CRM & Leads Management</h2>
              <Button 
                onClick={() => setShowAddLeadModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>

            {/* Lead Pipeline Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3">
              {[
                { stage: 'New Lead', count: leadStats.new_leads || 0, color: 'bg-blue-100 text-blue-800' },
                { stage: 'Contacted', count: leadStats.contacted_leads || 0, color: 'bg-yellow-100 text-yellow-800' },
                { stage: 'Negotiation', count: leadStats.negotiation_leads || 0, color: 'bg-orange-100 text-orange-800' },
                { stage: 'Proposal Sent', count: leadStats.proposal_sent_leads || 0, color: 'bg-purple-100 text-purple-800' },
                { stage: 'Decision Pending', count: leadStats.customer_decision_pending_leads || 0, color: 'bg-indigo-100 text-indigo-800' },
                { stage: 'Confirmed', count: leadStats.confirmed_bookings || 0, color: 'bg-green-100 text-green-800' },
                { stage: 'Advance Received', count: leadStats.advance_received_leads || 0, color: 'bg-emerald-100 text-emerald-800' },
                { stage: 'Completed', count: leadStats.completed_leads || 0, color: 'bg-gray-100 text-gray-800' },
                { stage: 'Lost', count: leadStats.lost_leads || 0, color: 'bg-red-100 text-red-800' },
              ].map((stage) => (
                <Card key={stage.stage}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{stage.count}</p>
                    <p className="text-sm text-gray-600">{stage.stage}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Leads Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Leads</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.length > 0 ? leads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleViewCustomerDetails(lead)}
                      >
                        <h3 className="font-medium text-gray-900 hover:text-blue-600">{lead.customer_name}</h3>
                        <p className="text-sm text-gray-600">
                          {lead.event_type || 'Event Type TBD'} • {
                            lead.event_date ? 
                              new Date(lead.event_date).toLocaleDateString() : 
                              lead.event_date_flexibility ? 
                                lead.event_date_flexibility.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                                'Date TBD'
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          Last contact: {lead.last_contact_date ? 
                            new Date(lead.last_contact_date).toLocaleDateString() : 
                            new Date(lead.created_at).toLocaleDateString()
                          } • Click to view details
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusUpdate(lead.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded border ${getLeadStatusColor(lead.status)}`}
                        >
                          <option value="new_lead">New Lead</option>
                          <option value="contacted">Contacted</option>
                          <option value="negotiation">Negotiation</option>
                          <option value="proposal_sent">Proposal Sent</option>
                          <option value="customer_decision_pending">Customer Decision Pending</option>
                          <option value="confirmed_booking">Confirmed</option>
                          <option value="advance_received">Advance Received</option>
                          <option value="completed">Completed</option>
                          <option value="lost">Lost</option>
                        </select>
                        <div className="text-sm font-medium text-gray-900">
                          {/* Show deal amount if confirmed, otherwise show budget */}
                          {lead.status === 'confirmed_booking' && lead.deal_amount ? (
                            <div className="flex flex-col">
                              <span className="text-green-600 font-semibold">Deal: ₹{lead.deal_amount.toLocaleString()}</span>
                              <span className="text-xs text-gray-500">
                                Budget: {lead.budget_range ? 
                                  lead.budget_range.replace('_', ' - ').replace('k', 'K').replace('l', 'L') : 
                                  'Not specified'
                                }
                              </span>
                            </div>
                          ) : (
                            <span>
                              {lead.budget_range ? 
                                lead.budget_range.replace('_', ' - ').replace('k', 'K').replace('l', 'L') : 
                                lead.budget_min ? 
                                  `₹${lead.budget_min.toLocaleString()}${lead.budget_max && lead.budget_max !== lead.budget_min ? `-${lead.budget_max.toLocaleString()}` : ''}` :
                                  'Budget TBD'
                              }
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewCustomerDetails(lead);
                            }}
                            title="View/Edit Customer Details"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-3 h-3" />
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
                            >
                              <Phone className="w-3 h-3" />
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
                              title="WhatsApp Customer"
                              className="text-green-600 hover:text-green-700"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLead(lead.id, lead.customer_name);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No leads yet</p>
                      <p className="text-sm">Start adding leads to track your customer pipeline</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Calendar Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{calendarStats.total_events || 0}</p>
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
              vendorId={vendor.vendor_id}
              events={calendarEvents}
              onEventCreate={handleEventCreate}
              onEventUpdate={handleEventUpdate}
              onEventDelete={handleEventDelete}
              onEventsRefresh={handleCalendarRefresh}
            />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
            
            {/* Engagement Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Profile Views</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.profileViews}</p>
                    </div>
                    <Eye className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">WhatsApp Clicks</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.whatsappClicks}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Call Clicks</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.callClicks}</p>
                    </div>
                    <Phone className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email Clicks</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.emailClicks}</p>
                    </div>
                    <Mail className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conversion Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Leads</span>
                      <span className="font-medium">{leadStats.total_leads || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Converted</span>
                      <span className="font-medium text-green-600">{leadStats.confirmed_bookings || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversion Rate</span>
                      <span className="font-medium text-blue-600">{leadStats.conversion_rate || 0}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <p className="text-3xl font-bold text-gray-900">₹{(leadStats.total_revenue || 0).toLocaleString()}</p>
                    <p className="text-gray-600">Total Revenue</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Invoice & Quotation Maker</h2>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-800 mb-2">Create Quotation</h3>
                  <p className="text-gray-600 text-sm mb-4">Generate professional quotations for potential clients</p>
                  <Button variant="outline">Coming Soon</Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-800 mb-2">Create Invoice</h3>
                  <p className="text-gray-600 text-sm mb-4">Generate invoices for confirmed bookings</p>
                  <Button variant="outline">Coming Soon</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Other tabs placeholder */}
        {(activeTab === 'profile' && activeTab !== 'overview' && activeTab !== 'leads' && activeTab !== 'analytics' && activeTab !== 'invoices') && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</h3>
            <p className="text-gray-600 mb-4">This feature is coming soon</p>
            <Button variant="outline">Coming Soon</Button>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && vendor && (
        <AddLeadModal
          vendorId={vendor.vendor_id}
          onClose={() => setShowAddLeadModal(false)}
          onLeadAdded={() => {
            loadLeadsData(vendor.vendor_id);
            setShowAddLeadModal(false);
          }}
        />
      )}

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedLead && (
        <CustomerDetailsModal
          lead={selectedLead}
          onClose={() => {
            setShowCustomerDetails(false);
            setSelectedLead(null);
          }}
          onLeadUpdated={() => {
            if (vendor) {
              loadLeadsData(vendor.vendor_id);
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
    </div>
  );
};

export default VendorDashboard;
