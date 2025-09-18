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
import { getLoggedInVendor, vendorLogout, getVendorPendingChanges, getVendorNotifications, getVendorLeads, getVendorLeadStats, updateLeadStatus, deleteVendorLead, updateVendorLead, getVendorEvents, createVendorEvent, updateVendorEvent, deleteVendorEvent, getVendorCalendarStats, refreshVendorSession, markAllNotificationsAsRead } from '../services/supabaseService';
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
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
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
    const initializeDashboard = async () => {
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
      
        // Refresh vendor session to get latest approved data
        const refreshedVendor = await refreshVendorSession();
        const vendorToUse = refreshedVendor || loggedInVendor;
        
        setVendor(vendorToUse);
        loadPendingChanges(parseInt(vendorToUse.vendor_id));
        loadNotifications(parseInt(vendorToUse.vendor_id));
        loadLeadsData(parseInt(vendorToUse.vendor_id));
        loadCalendarData(parseInt(vendorToUse.vendor_id));
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
          console.log('All notifications marked as read');
          setUnreadNotificationCount(0); // Reset the count immediately
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
      
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #061D49 0%, #233A66 50%, #2684FF 100%)' }}>
      
      {/* Brand-Aligned Welcome Header */}
      <div style={{ background: 'linear-gradient(135deg, #061D49 0%, #233A66 100%)', borderBottomColor: '#FFA326' }} className="shadow-2xl border-b-4">
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
                    {vendor.category?.toLowerCase().includes('photo') && <Camera className="w-4 h-4 md:w-5 md:h-5 text-blue-200" />}
                    {vendor.category?.toLowerCase().includes('event') && <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-200" />}
                    {vendor.category?.toLowerCase().includes('decor') && <Star className="w-4 h-4 md:w-5 md:h-5 text-blue-200" />}
                    {!vendor.category?.toLowerCase().includes('photo') && !vendor.category?.toLowerCase().includes('event') && !vendor.category?.toLowerCase().includes('decor') && <Award className="w-4 h-4 md:w-5 md:h-5 text-blue-200" />}
                    
                    <p className="text-blue-100 text-sm md:text-lg font-medium">
                      {vendor.category} | {vendor.brand_name}
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
                className="flex items-center gap-1 md:gap-2 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-red-500/20 hover:border-red-300/50 transition-all duration-300 rounded-lg shadow-lg px-3 md:px-4 py-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Brand-Aligned Navigation Tabs */}
          <div style={{ background: 'linear-gradient(135deg, #061D49 0%, #233A66 100%)' }} className="border-t border-orange-400/30 shadow-xl">
            <nav className="flex overflow-x-auto scrollbar-hide px-4 md:px-8 py-2 gap-2 md:gap-4">
              {[
                { 
                  id: 'profile', 
                  label: 'PROFILE', 
                  mobileLabel: 'Profile',
                  icon: User
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
                  id: 'analytics', 
                  label: 'ANALYTICS', 
                  mobileLabel: 'Analytics',
                  icon: TrendingUp
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
                  className={`group flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 py-3 md:py-4 px-3 md:px-6 rounded-xl font-bold text-xs md:text-sm transition-all duration-500 transform animate-slide-up min-w-[80px] md:min-w-auto ${
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8">
        

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


            {/* Compact Multi-Column Lead Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {leads.length > 0 ? leads.map((lead, index) => (
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
                        onClick={() => handleViewCustomerDetails(lead)}
                        style={{ color: '#061D49' }}
                      >
                        {lead.customer_name}
                      </h3>
                      
                      {/* Compact Event Info Pills */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          📅 {lead.event_type || 'Event TBD'}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
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
                              handleViewCustomerDetails(lead);
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
                  )) : (
                  <div className="col-span-full text-center py-12 px-6 rounded-xl" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)', border: '2px dashed #FFA326' }}>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFA326 0%, #FF8C00 100%)' }}>
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
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
                    </div>
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
    </div>
    </>
  );
};

export default VendorDashboard;
