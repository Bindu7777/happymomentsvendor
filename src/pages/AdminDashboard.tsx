import React, { useState, useEffect } from "react";
import { 
  Users, 
  TrendingUp, 
  Star, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  LogOut,
  Shield,
  CheckCircle,
  XCircle,
  Heart,
  Download,
  Zap,
  Sparkles,
  Sword,
  Crown,
  RefreshCw,
  Archive,
  Send,
  Bot
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Vendor } from "@/lib/supabase";
import { getAllVendorsForAdmin, updateVendor, deleteVendor, getAllPendingChanges, reviewVendorProfileChange } from "@/services/supabaseService";
import { adminSendCustomerToVendor } from "@/services/adminApiService";
import ConfirmationModal from "@/components/ConfirmationModal";
import SuccessModal from "@/components/SuccessModal";
import InputModal from "@/components/InputModal";
import AdminSendCustomerModal from "@/components/AdminSendCustomerModal";
import MomoChat from "@/components/MomoChat";

interface DashboardStats {
  totalVendors: number;
  verifiedVendors: number;
  activeVendors: number;
  featuredVendors: number;
}

const AdminDashboard = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [activeTab, setActiveTab] = useState("vendors");
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [reviewingChange, setReviewingChange] = useState<number | null>(null);
  const [currentGreeting, setCurrentGreeting] = useState("");
  const [demonControlLevel, setDemonControlLevel] = useState(0);
  const [adminName, setAdminName] = useState("");
  const navigate = useNavigate();

  // Modal states
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'warning' | 'danger' | 'success' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {}
  });

  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const [inputModal, setInputModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    placeholder: string;
    onConfirm: (input: string) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
    onConfirm: () => {}
  });

  const [sendCustomerModal, setSendCustomerModal] = useState<{
    isOpen: boolean;
    vendor: Vendor | null;
  }>({
    isOpen: false,
    vendor: null
  });


  // Demon-themed admin names and greetings
  const demonNames = [
    "Muzan Kibutsuji", 
    "Event Management Expert", 
    "Supreme Event Overlord", 
    "Demon of Vendor Control", 
    "Master of Event Realms"
  ];
  
  const demonGreetings = [
    "Ready to control your event demons today?",
    "Time to summon some vendor magic!",
    "Let's make events successful!",
    "Ready to slay some event challenges?",
    "Time to rule the event kingdom!",
    "Let's manage events efficiently!"
  ];

  const getRandomGreeting = () => {
    const randomGreeting = demonGreetings[Math.floor(Math.random() * demonGreetings.length)];
    setCurrentGreeting(randomGreeting);
  };

  const setRandomAdminName = () => {
    setAdminName("Muichiro Tokito");
  };

  useEffect(() => {
    // Check admin authentication
    const isAdminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isAdminLoggedIn) {
      navigate("/admin/login");
      return;
    }

    fetchVendors();
    fetchPendingChanges();
    getRandomGreeting();
    setRandomAdminName();
    
    // Calculate demon control level based on completed tasks
    const completedTasks = vendors.filter(v => v.verified).length + 
                          vendors.filter(v => v.currently_available).length;
    setDemonControlLevel(Math.min(completedTasks * 5, 100));
  }, [navigate, vendors]);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, filterStatus, filterCategory]);


  const fetchVendors = async () => {
    try {
      const vendorData = await getAllVendorsForAdmin();
      console.log('Fetched vendors for admin:', vendorData);
      console.log('Sample vendor data:', vendorData[0]);
      setVendors(vendorData);
      // Don't set filteredVendors here - let the useEffect handle it
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setLoading(false);
    }
  };


  const fetchPendingChanges = async () => {
    try {
      const pending = await getAllPendingChanges();
      setPendingChanges(pending);
    } catch (error) {
      console.error("Error fetching pending changes:", error);
    }
  };

  const filterVendors = () => {
    if (!vendors || vendors.length === 0) {
      setFilteredVendors([]);
      return;
    }
    
    let filtered = vendors;

    // Search filter - search by vendor ID, brand name, or contact person name
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      
      filtered = filtered.filter(vendor => 
        // Search by vendor ID (exact match or partial)
        vendor.vendor_id.toString().includes(searchTerm) ||
        // Search by brand name
        vendor.brand_name.toLowerCase().includes(searchLower) ||
        // Search by contact person name (spoc_name)
        (vendor.spoc_name && vendor.spoc_name.toLowerCase().includes(searchLower)) ||
        // Search by category (handle both string and array)
        (Array.isArray(vendor.category) 
          ? vendor.category.some(cat => cat.toLowerCase().includes(searchLower))
          : (vendor.category?.toLowerCase().includes(searchLower) || false)) ||
        (Array.isArray(vendor.categories) 
          ? vendor.categories.some(cat => cat.toLowerCase().includes(searchLower))
          : (vendor.categories?.toLowerCase().includes(searchLower) || false)) ||
        // Search by email
        (vendor.email && vendor.email.toLowerCase().includes(searchLower)) ||
        // Search by phone number
        (vendor.phone_number && vendor.phone_number.includes(searchTerm))
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(vendor => {
        switch (filterStatus) {
          case "verified":
            return vendor.verified;
          case "unverified":
            return !vendor.verified;
          case "active":
            return vendor.currently_available;
          case "inactive":
            return !vendor.currently_available;
          case "archived":
            return !vendor.currently_available; // Archived vendors are inactive
          default:
            return true;
        }
      });
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(vendor => vendor.category === filterCategory);
    }

    setFilteredVendors(filtered);
  };

  const handleVendorSelection = (vendorId: string) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVendors.length === filteredVendors.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(filteredVendors.map(v => v.vendor_id));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedVendors.length === 0) return;

    try {
      for (const vendorId of selectedVendors) {
        switch (action) {
          case "verify":
            await updateVendor(vendorId, { verified: true });
            break;
          case "unverify":
            await updateVendor(vendorId, { verified: false });
            break;
          case "activate":
            await updateVendor(vendorId, { currently_available: true });
            break;
          case "deactivate":
            await updateVendor(vendorId, { currently_available: false });
            break;
          case "delete":
            if (window.confirm("Are you sure you want to delete these vendors?")) {
              await deleteVendor(vendorId);
            }
            break;
        }
      }
      await fetchVendors();
      setSelectedVendors([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error("Error performing bulk action:", error);
    }
  };

  const handleDeleteVendor = (vendorId: string, vendorName: string) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Vendor',
      message: `Are you sure you want to permanently delete ${vendorName}? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteVendor(vendorId);
          await fetchVendors();
          setConfirmationModal({ ...confirmationModal, isOpen: false });
          setSuccessModal({
            isOpen: true,
            title: 'Vendor Deleted',
            message: `${vendorName} has been deleted successfully!`
          });
        } catch (error) {
          console.error("Error deleting vendor:", error);
          setConfirmationModal({ ...confirmationModal, isOpen: false });
          setSuccessModal({
            isOpen: true,
            title: 'Error',
            message: 'Error deleting vendor. Please try again.'
          });
        }
      }
    });
  };

  const handleArchiveVendor = (vendorId: string, vendorName: string) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Archive Vendor',
      message: `Are you sure you want to archive ${vendorName}? This will make their profile inactive and they won't be visible to customers.`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await updateVendor(vendorId, { currently_available: false });
          await fetchVendors();
          setConfirmationModal({ ...confirmationModal, isOpen: false });
          setSuccessModal({
            isOpen: true,
            title: 'Vendor Archived',
            message: `${vendorName} has been archived successfully!`
          });
        } catch (error) {
          console.error("Error archiving vendor:", error);
          setConfirmationModal({ ...confirmationModal, isOpen: false });
          setSuccessModal({
            isOpen: true,
            title: 'Error',
            message: 'Error archiving vendor. Please try again.'
          });
        }
      }
    });
  };

  const handleSendCustomer = (vendor: Vendor) => {
    setSendCustomerModal({
      isOpen: true,
      vendor: vendor
    });
  };

  const handleSendCustomerSubmit = async (customerData: { name: string; phone: string }) => {
    if (!sendCustomerModal.vendor) return;

    try {
      const result = await adminSendCustomerToVendor({
        vendor_id: sendCustomerModal.vendor.vendor_id,
        customer_name: customerData.name,
        customer_phone: customerData.phone
      });

      if (result.success) {
        setSuccessModal({
          isOpen: true,
          title: "Customer Sent Successfully!",
          message: result.message || `Customer ${customerData.name} has been sent to ${sendCustomerModal.vendor.brand_name}`
        });
        setSendCustomerModal({ isOpen: false, vendor: null });
      } else {
        setConfirmationModal({
          isOpen: true,
          title: "Error Sending Customer",
          message: result.error || "Failed to send customer. Please try again.",
          type: 'danger',
          onConfirm: () => setConfirmationModal({ ...confirmationModal, isOpen: false })
        });
      }
    } catch (error) {
      console.error('Error sending customer:', error);
      setConfirmationModal({
        isOpen: true,
        title: "Error Sending Customer",
        message: "An unexpected error occurred. Please try again.",
        type: 'danger',
        onConfirm: () => setConfirmationModal({ ...confirmationModal, isOpen: false })
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const handleApproveChange = (changeId: number, vendorId: number, proposedChanges: any) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Approve Changes',
      message: 'Are you sure you want to approve these vendor profile changes? This will update the vendor\'s profile with the proposed changes.',
      type: 'success',
      onConfirm: async () => {
        setReviewingChange(changeId);
        try {
          const result = await reviewVendorProfileChange(
            changeId, 
            'approved', 
            'admin',
            'Changes approved by admin'
          );
          
          if (result.success) {
            await fetchVendors();
            await fetchPendingChanges();
            setConfirmationModal({ ...confirmationModal, isOpen: false });
            setSuccessModal({
              isOpen: true,
              title: 'Changes Approved',
              message: 'Vendor profile changes have been approved successfully!'
            });
          } else {
            setConfirmationModal({ ...confirmationModal, isOpen: false });
            setSuccessModal({
              isOpen: true,
              title: 'Error',
              message: 'Failed to approve changes: ' + (result.message || 'Unknown error')
            });
          }
        } catch (error) {
          console.error('Error approving change:', error);
          setConfirmationModal({ ...confirmationModal, isOpen: false });
          setSuccessModal({
            isOpen: true,
            title: 'Error',
            message: 'Error approving changes. Please try again.'
          });
        } finally {
          setReviewingChange(null);
        }
      }
    });
  };

  const handleRejectChange = (changeId: number) => {
    setInputModal({
      isOpen: true,
      title: 'Reject Changes',
      message: 'Please provide a reason for rejecting these vendor profile changes (optional):',
      placeholder: 'Enter rejection reason...',
      onConfirm: async (reason: string) => {
        setReviewingChange(changeId);
        try {
          const result = await reviewVendorProfileChange(
            changeId, 
            'rejected', 
            'admin',
            reason || 'Changes rejected by admin'
          );
          
          if (result.success) {
            await fetchPendingChanges();
            setSuccessModal({
              isOpen: true,
              title: 'Changes Rejected',
              message: 'Vendor profile changes have been rejected successfully!'
            });
          } else {
            setSuccessModal({
              isOpen: true,
              title: 'Error',
              message: 'Failed to reject changes: ' + (result.message || 'Unknown error')
            });
          }
        } catch (error) {
          console.error('Error rejecting change:', error);
          setSuccessModal({
            isOpen: true,
            title: 'Error',
            message: 'Error rejecting changes. Please try again.'
          });
        } finally {
          setReviewingChange(null);
        }
      }
    });
  };

  const stats: DashboardStats = {
    totalVendors: vendors.length,
    verifiedVendors: vendors.filter(v => v.verified).length,
    activeVendors: vendors.filter(v => v.currently_available).length,
    featuredVendors: vendors.filter(v => v.verified && v.currently_available).length,
  };

  const categories = [...new Set(vendors.map(v => v.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Enhanced Mist Falling Animation Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* CSS for smooth mist animations */}
        <style>{`
          @keyframes mistFall {
            0% {
              transform: translateY(-100vh) translateX(0px);
              opacity: 0;
            }
            10% {
              opacity: 0.4;
            }
            90% {
              opacity: 0.1;
            }
            100% {
              transform: translateY(100vh) translateX(20px);
              opacity: 0;
            }
          }
          
          @keyframes mistDrift {
            0% {
              transform: translateY(-50vh) translateX(-50px);
              opacity: 0;
            }
            20% {
              opacity: 0.3;
            }
            80% {
              opacity: 0.1;
            }
            100% {
              transform: translateY(50vh) translateX(50px);
              opacity: 0;
            }
          }
          
          @keyframes mistFloat {
            0% {
              transform: translateX(-100px) translateY(0px);
              opacity: 0;
            }
            25% {
              opacity: 0.2;
            }
            75% {
              opacity: 0.05;
            }
            100% {
              transform: translateX(calc(100vw + 100px)) translateY(-30px);
              opacity: 0;
            }
          }
          
          .mist-particle {
            animation: mistFall linear infinite;
            background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            border-radius: 50%;
            filter: blur(1px);
          }
          
          .mist-drift {
            animation: mistDrift linear infinite;
            background: linear-gradient(45deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
            border-radius: 50%;
            filter: blur(2px);
          }
          
          .mist-float {
            animation: mistFloat linear infinite;
            background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
            border-radius: 50%;
            filter: blur(3px);
          }
        `}</style>
        
        {/* Small mist particles falling from top */}
        {[...Array(25)].map((_, i) => (
          <div
            key={`mist-${i}`}
            className="mist-particle absolute"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${20 + Math.random() * 10}s`,
            }}
          />
        ))}
        
        {/* Medium mist particles drifting */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`drift-${i}`}
            className="mist-drift absolute"
            style={{
              width: `${4 + Math.random() * 6}px`,
              height: `${4 + Math.random() * 6}px`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${25 + Math.random() * 15}s`,
            }}
          />
        ))}
        
        {/* Large mist clouds floating horizontally */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`float-${i}`}
            className="mist-float absolute"
            style={{
              width: `${20 + Math.random() * 30}px`,
              height: `${20 + Math.random() * 30}px`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 25}s`,
              animationDuration: `${30 + Math.random() * 20}s`,
            }}
          />
        ))}
        
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/5 pointer-events-none"></div>
      </div>
      
      {/* Floating Pleasant Mascot */}
      <div className="fixed bottom-8 right-8 z-50 group">
        <div className="bg-gradient-to-br from-wedding-orange to-wedding-navy rounded-full p-4 shadow-2xl hover:shadow-wedding-orange/50 transition-all duration-300 hover:scale-110 cursor-pointer">
          <Heart className="h-6 w-6 text-white" />
        </div>
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-wedding-navy/90 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          🌸 Peaceful vibes! 🌸
        </div>
      </div>
      
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-xl shadow-2xl border-b border-white/20 relative z-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center">
              <div>
                <h1 
                  className="text-4xl font-extrabold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight"
                >
                  Welcome back, {adminName}
                </h1>
                <p className="text-slate-500 text-sm font-medium mt-1">Admin Command Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Demon Control Level Progress Bar */}
              <div className="hidden md:block bg-white/70 backdrop-blur-sm rounded-2xl p-4 mr-6 shadow-lg border border-white/30">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <Sword className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="w-24 bg-slate-200 rounded-full h-2 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out shadow-sm"
                        style={{ width: `${demonControlLevel}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1">Control Level: {demonControlLevel}%</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate("/admin/vendor/new")}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-2xl flex items-center shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Summon Vendor
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-3 rounded-2xl flex items-center shadow-lg hover:shadow-slate-500/25 hover:scale-105 transition-all duration-300 font-semibold"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout with Vertical Sidebar */}
      <div className="flex h-screen">
        {/* Left Vertical Sidebar with Muichiro Tokito Image */}
        <div className="w-96 flex-shrink-0 bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-xl shadow-2xl border-r border-white/30 h-screen overflow-hidden relative z-10">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-white/20">
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent text-center">Muichiro Tokito</h2>
              <p className="text-slate-500 text-sm font-medium text-center mt-1">Mist Hashira</p>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <img 
                src="/tokito.jpeg" 
                alt="Muichiro Tokito - Mist Hashira" 
                className="w-full h-full object-contain rounded-2xl shadow-2xl border-4 border-white/40"
                style={{
                  imageRendering: 'auto'
                }}
                onError={(e) => {
                  // Fallback to other tokito images if tokito.jpeg is not found
                  if (e.currentTarget.src.includes('tokito.jpeg')) {
                    e.currentTarget.src = "/tokito-hq.png";
                  } else if (e.currentTarget.src.includes('tokito-hq.png')) {
                    e.currentTarget.src = "/tokito.png";
                  } else {
                    e.currentTarget.src = "/images/logo.jpg";
                    e.currentTarget.alt = "Muichiro Tokito - Mist Hashira (Placeholder)";
                  }
                }}
              />
            </div>
            <div className="p-4 border-t border-white/20">
              <div className="text-center">
                <p className="text-sm text-slate-600 italic mb-3 font-medium">
                  "I'll cut through any demon that stands in my way."
                </p>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50 shadow-lg">
                  <h3 className="font-bold text-slate-800 text-sm mb-2">Admin Leader</h3>
                  <p className="text-xs text-slate-600">
                    Commanding with precision and determination.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto relative z-10">
          <div className="max-w-none px-3 sm:px-4 lg:px-6 py-6">

        {/* Tab Navigation */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl mb-8 overflow-hidden">
          <div className="border-b border-white/20">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab("vendors")}
                className={`py-6 px-4 border-b-3 font-semibold text-sm transition-all duration-300 rounded-t-2xl ${
                  activeTab === "vendors"
                    ? "border-blue-500 text-slate-800 bg-gradient-to-b from-blue-50 to-transparent"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Users className="w-5 h-5 inline-block mr-3" />
                Vendor Management ({vendors.length})
              </button>
              <button
                onClick={() => setActiveTab("approvals")}
                className={`py-6 px-4 border-b-3 font-semibold text-sm relative transition-all duration-300 rounded-t-2xl ${
                  activeTab === "approvals"
                    ? "border-red-500 text-slate-800 bg-gradient-to-b from-red-50 to-transparent"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Sparkles className="w-5 h-5 inline-block mr-3" />
                Pending Approvals ({pendingChanges.length})
                {pendingChanges.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-lg font-bold">
                    {pendingChanges.length > 9 ? '9+' : pendingChanges.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("momo")}
                className={`py-6 px-4 border-b-3 font-semibold text-sm transition-all duration-300 rounded-t-2xl ${
                  activeTab === "momo"
                    ? "border-purple-500 text-slate-800 bg-gradient-to-b from-purple-50 to-transparent"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Bot className="w-5 h-5 inline-block mr-3" />
                Momo AI Advisor
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filters */}
        {activeTab === "vendors" && (
        <>
        <div className="bg-white/80 backdrop-blur-md border border-wedding-orange/20 shadow-lg rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-wedding-orange" />
              <input
                type="text"
                placeholder="Search by ID, name, contact person, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-3 bg-white border border-wedding-orange/50 rounded-lg w-full focus:ring-wedding-orange focus:border-wedding-orange text-wedding-navy placeholder-wedding-gray transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-3 h-4 w-4 text-wedding-orange hover:text-wedding-navy transition-colors duration-200"
                  title="Clear search"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>


            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-3 bg-white border border-wedding-orange/50 rounded-lg focus:ring-wedding-orange focus:border-wedding-orange text-wedding-navy transition-all duration-200"
            >
              <option value="all">All Vendor Status</option>
              <option value="verified">Verified Vendors</option>
              <option value="unverified">Unverified Vendors</option>
              <option value="active">Active Vendors</option>
              <option value="inactive">Inactive Vendors</option>
              <option value="archived">Archived Vendors</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-3 bg-white border border-wedding-orange/50 rounded-lg focus:ring-wedding-orange focus:border-wedding-orange text-wedding-navy transition-all duration-200"
            >
              <option value="all">All Vendor Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              disabled={selectedVendors.length === 0}
              className="px-4 py-3 bg-wedding-orange hover:bg-wedding-orange-hover text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-wedding-orange/25 hover:scale-105 transition-all duration-200"
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Mass Rituals ({selectedVendors.length})
            </button>
          </div>

          {/* Bulk Actions */}
          {showBulkActions && selectedVendors.length > 0 && (
            <div className="mt-6 p-4 bg-wedding-orange-light border border-wedding-orange/30 rounded-lg">
              <div className="flex items-center mb-3">
                <Zap className="w-5 h-5 text-wedding-orange mr-2" />
                <span className="text-wedding-navy font-medium">Bulk Actions - {selectedVendors.length} Vendors Selected</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleBulkAction("verify")}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Verify Selected
                </button>
                <button
                  onClick={() => handleBulkAction("unverify")}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Unverify Selected
                </button>
                <button
                  onClick={() => handleBulkAction("activate")}
                  className="px-4 py-2 bg-wedding-navy hover:bg-wedding-navy-hover text-white rounded-lg text-sm shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Activate Selected
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Put to Sleep
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vendors Table */}
        <div className="bg-white/80 backdrop-blur-md border border-wedding-orange/20 shadow-lg overflow-hidden rounded-xl">
          <div className="px-6 py-5 border-b border-wedding-orange/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Crown className="h-6 w-6 text-wedding-orange mr-3" />
                <h3 className="text-xl leading-6 font-bold text-wedding-navy">
                  Vendor Directory ({filteredVendors.length})
              </h3>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedVendors.length === filteredVendors.length && filteredVendors.length > 0}
                  onChange={handleSelectAll}
                  className="h-5 w-5 text-wedding-orange focus:ring-wedding-orange border-wedding-orange/50 rounded bg-white"
                />
                <label className="ml-2 text-sm text-wedding-gray">Select All Vendors</label>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-w-full">
            <table className="min-w-full divide-y divide-wedding-orange/20">
              <thead className="bg-wedding-orange-light">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-wedding-navy uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-wedding-navy uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-wedding-navy uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-wedding-navy uppercase tracking-wider">
                    Powers
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-wedding-navy uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-wedding-navy uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-wedding-orange/20">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.vendor_id} className="hover:bg-wedding-orange-light transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedVendors.includes(vendor.vendor_id)}
                        onChange={() => handleVendorSelection(vendor.vendor_id)}
                        className="h-5 w-5 text-wedding-orange focus:ring-wedding-orange border-wedding-orange/50 rounded bg-white"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 relative">
                          <img
                            className="h-12 w-12 rounded-full border-2 border-wedding-orange/50"
                            src={vendor.avatar_url || "/images/vendor-placeholder.jpg"}
                            alt={vendor.brand_name}
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-wedding-orange rounded-full border-2 border-white"></div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-wedding-navy flex items-center gap-2">
                            {vendor.brand_name}
                            {!vendor.currently_available && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                                Archived
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-wedding-gray">
                            {vendor.spoc_name} • ID: {vendor.vendor_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-wedding-navy text-white shadow-lg">
                        {vendor.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        {vendor.verified ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white shadow-lg">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-lg">
                            <XCircle className="h-3 w-3 mr-1" />
                            Unverified
                          </span>
                        )}
                        {vendor.currently_available ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-wedding-navy text-white shadow-lg">
                            Awake
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-600 text-white shadow-lg">
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-wedding-gray">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-bold text-wedding-navy">{vendor.rating || "N/A"}</span>
                        <span className="text-wedding-gray ml-1">
                          {vendor.review_count && vendor.review_count > 0 
                            ? `(${vendor.review_count})`
                            : '(No reviews)'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/vendor/${vendor.vendor_id}`, '_blank')}
                          className="p-2 bg-wedding-navy hover:bg-wedding-navy-hover text-white rounded-lg shadow-lg hover:scale-110 transition-all duration-200"
                          title="View Vendor Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/vendor/${vendor.vendor_id}/edit`)}
                          className="p-2 bg-wedding-orange hover:bg-wedding-orange-hover text-white rounded-lg shadow-lg hover:scale-110 transition-all duration-200"
                          title="Edit Vendor Profile"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSendCustomer(vendor)}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg hover:scale-110 transition-all duration-200"
                          title="Send Customer to Vendor"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleArchiveVendor(vendor.vendor_id, vendor.brand_name)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg hover:scale-110 transition-all duration-200"
                          title="Archive Vendor"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredVendors.length === 0 && (
            <div className="text-center py-12">
              <Crown className="mx-auto h-16 w-16 text-wedding-orange" />
              <h3 className="mt-4 text-xl font-bold text-wedding-navy">
                No Vendors Found
              </h3>
              <p className="mt-2 text-sm text-wedding-gray">
                {searchTerm || filterStatus !== "all" || filterCategory !== "all"
                  ? "Your hunt came up empty! Try different search criteria."
                  : "Ready to add your first vendor?"}
              </p>
            </div>
          )}
        </div>
        </>
        )}

        {/* Approvals Tab */}
        {activeTab === "approvals" && (
          <div className="bg-white/80 backdrop-blur-md border border-red-500/30 shadow-lg rounded-xl">
            <div className="px-6 py-4 border-b border-red-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Sparkles className="h-6 w-6 text-red-500 mr-3" />
                  <h3 className="text-xl font-bold text-wedding-navy">
                  Pending Vendor Profile Changes
                </h3>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {pendingChanges.length} Awaiting Judgment
                  </span>
                  <button
                    onClick={fetchPendingChanges}
                    className="bg-wedding-orange hover:bg-wedding-orange-hover text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    Refresh Data
                  </button>
                </div>
              </div>
              
              {/* Color Legend */}
              <div className="mt-4 p-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Change Legend:</h4>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3 shadow-lg"></div>
                    <span className="text-gray-700 font-medium">Proposed Changes</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-3 shadow-lg"></div>
                    <span className="text-gray-700 font-medium">🆕 New Powers</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mr-3 shadow-lg"></div>
                    <span className="text-gray-700 font-medium">Modified Abilities</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mr-3 shadow-lg"></div>
                    <span className="text-gray-700 font-medium">Current State</span>
                  </div>
                </div>
              </div>
            </div>

            {pendingChanges.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h3 className="mt-4 text-xl font-bold text-wedding-navy">
                  All Changes Processed!
                </h3>
                <p className="mt-2 text-sm text-wedding-gray">
                  No vendor profile changes pending your approval!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-red-500/20 relative">
                {pendingChanges.map((change) => (
                  <div key={change.id} className="p-6 border-l-4 border-gradient-to-b from-red-500 to-pink-500 bg-gradient-to-r from-red-900/20 to-pink-900/20">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex-shrink-0 relative">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                              <Sparkles className="w-6 h-6 text-white" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-wedding-navy">
                              {change.vendor_brand_name || `Vendor ID: ${change.vendor_id}`}
                            </h4>
                            <p className="text-sm text-wedding-gray">
                              {change.change_type === 'profile_update' ? 'Vendor Profile Update Request' : change.change_type} • 
                              ⏰ Submitted {new Date(change.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Clean Side-by-Side Changes Comparison */}
                        <div className="mt-4 space-y-4">
                          {Object.entries(change.proposed_changes)
                            .filter(([key, newValue]) => {
                              // Only show fields that actually changed
                              const currentValue = change.current_data?.[key];
                              // Skip special fields that are handled separately
                              if (key === 'catalog_images' || key === 'highlight_status_changes') {
                                return true; // Always show these as they have special handling
                              }
                              // For other fields, only show if they actually differ
                              if (currentValue === undefined) {
                                return true; // New field
                              }
                              // Deep comparison
                              return JSON.stringify(currentValue) !== JSON.stringify(newValue);
                            })
                            .map(([key, newValue]) => {
                              const currentValue = change.current_data?.[key];
                            const isChanged = currentValue !== undefined && JSON.stringify(currentValue) !== JSON.stringify(newValue);
                              const isNew = currentValue === undefined;
                              
                              // Better field name mapping for display
                              const getFieldDisplayName = (fieldKey: string) => {
                                const fieldNames: Record<string, string> = {
                                  'brand_name': 'Brand Name',
                                  'spoc_name': 'Contact Person Name',
                                'category': 'Category',
                                'subcategory': 'Subcategory',
                                'brand_logo_url': 'Brand Logo',
                                'contact_person_image_url': 'Contact Person Image',
                                  'phone_number': 'Phone Number',
                                'alternate_number': 'Alternate Number',
                                  'whatsapp_number': 'WhatsApp Number',
                                'email': 'Email Address',
                                'instagram': 'Instagram Handle',
                                'experience': 'Experience',
                                'quick_intro': 'Quick Intro',
                                'caption': 'Caption',
                                'detailed_intro': 'Detailed Intro',
                                'highlight_features': 'Highlight Features',
                                'services': 'Services',
                                'packages': 'Packages',
                                'deliverables': 'Deliverables',
                                'customer_reviews': 'Customer Reviews',
                                'booking_policies': 'Booking Policies',
                                'additional_info': 'Additional Information',
                                'currently_available': 'Currently Available',
                                'catalog_images': 'Catalog Images',
                                'highlight_status_changes': 'Image Highlight Changes'
                                };
                                return fieldNames[fieldKey] || fieldKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                              };
                              
                            const formatValue = (value: any, fieldKey: string) => {
                              if (!value && value !== false) return <span className="text-gray-400 italic">Empty</span>;
                              
                              if (fieldKey.includes('_url') && value) {
                                return (
                                  <div className="flex items-center gap-2">
                                    <img src={value} alt="Preview" className="w-12 h-12 object-cover rounded border" 
                                         onError={(e) => (e.target as HTMLElement).style.display = 'none'} />
                                    <span className="text-xs text-gray-600 break-all">{value}</span>
                                  </div>
                                );
                              }
                              
                              if (fieldKey === 'catalog_images') {
                                // Handle new structured format for catalog images changes
                                if (value && typeof value === 'object' && value.added && value.removed) {
                                  return (
                                    <div className="space-y-3">
                                      {value.removed && value.removed.length > 0 && (
                                        <div>
                                          <span className="text-xs font-medium text-red-600">Removed Images:</span>
                                          <div className="grid grid-cols-2 gap-2 mt-1">
                                            {value.removed.slice(0, 4).map((imgUrl, i) => (
                                              <div key={i} className="relative opacity-60">
                                                <img 
                                                  src={imgUrl} 
                                                  alt={`Removed ${i + 1}`} 
                                                  className="w-full h-20 object-cover rounded border border-red-300"
                                                  onError={(e) => (e.target as HTMLElement).style.display = 'none'}
                                                />
                                                <div className="absolute inset-0 bg-red-100 bg-opacity-50 flex items-center justify-center">
                                                  <span className="text-xs text-red-600 font-bold">REMOVED</span>
                                                </div>
                                              </div>
                                            ))}
                                            {value.removed.length > 4 && (
                                              <div className="flex items-center justify-center bg-red-100 rounded border border-red-300 text-xs text-red-600">
                                                +{value.removed.length - 4} more removed
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {value.added && value.added.length > 0 && (
                                        <div>
                                          <span className="text-xs font-medium text-green-600">Added Images:</span>
                                          <div className="grid grid-cols-2 gap-2 mt-1">
                                            {value.added.slice(0, 4).map((imgUrl, i) => (
                                              <div key={i} className="relative">
                                                <img 
                                                  src={imgUrl} 
                                                  alt={`Added ${i + 1}`} 
                                                  className="w-full h-20 object-cover rounded border border-green-300"
                                                  onError={(e) => (e.target as HTMLElement).style.display = 'none'}
                                                />
                                                <div className="absolute inset-0 bg-green-100 bg-opacity-50 flex items-center justify-center">
                                                  <span className="text-xs text-green-600 font-bold">ADDED</span>
                                                </div>
                                              </div>
                                            ))}
                                            {value.added.length > 4 && (
                                              <div className="flex items-center justify-center bg-green-100 rounded border border-green-300 text-xs text-green-600">
                                                +{value.added.length - 4} more added
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      
                                      <div className="text-xs text-gray-500">
                                        Count: {value.current_count || 0} → {value.new_count || 0}
                                      </div>
                                    </div>
                                  );
                                }
                                
                                // Handle legacy array format
                                if (Array.isArray(value)) {
                                return (
                                  <div className="grid grid-cols-2 gap-2">
                                    {value.slice(0, 4).map((imgUrl, i) => (
                                      <div key={i} className="relative">
                                        <img 
                                          src={imgUrl} 
                                          alt={`Catalog ${i + 1}`} 
                                          className="w-full h-20 object-cover rounded border"
                                          onError={(e) => (e.target as HTMLElement).style.display = 'none'}
                                        />
                                      </div>
                                    ))}
                                    {value.length > 4 && (
                                      <div className="flex items-center justify-center bg-gray-100 rounded border text-xs text-gray-600">
                                        +{value.length - 4} more
                                      </div>
                                    )}
                                  </div>
                                );
                                }
                              }

                              if (fieldKey === 'highlight_status_changes' && value?.changed_images) {
                                return (
                                  <div className="space-y-2">
                                    <div className="text-sm font-medium text-blue-600">
                                      {value.changed_images.length} image(s) highlight status changed
                                    </div>
                                    {value.changed_images.map((img: any, i: number) => (
                                      <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                        <img 
                                          src={img.media_url} 
                                          alt={`Changed image ${i + 1}`} 
                                          className="w-12 h-12 object-cover rounded border"
                                          onError={(e) => (e.target as HTMLElement).style.display = 'none'}
                                        />
                                        <div className="flex-1">
                                          <div className="text-sm">
                                            {img.is_highlighted ? (
                                              <span className="text-yellow-600 font-medium">
                                                Now Highlighted
                                              </span>
                                            ) : (
                                              <span className="text-gray-600">
                                                Highlight Removed
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              
                              if (Array.isArray(value)) {
                                if (value.length === 0) return <span className="text-gray-400 italic">No items</span>;
                                
                                if (value.length > 0 && typeof value[0] === 'object') {
                                  if (fieldKey === 'services') {
                                    return (
                                      <div className="space-y-1">
                                        {value.map((item, i) => (
                                          <div key={i} className="text-sm bg-gray-50 p-2 rounded">
                                            <strong>{item.name}</strong>
                                            {item.price && <span className="text-green-600 ml-2">₹{item.price}</span>}
                                            {item.description && <div className="text-xs text-gray-600 mt-1">{item.description}</div>}
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  } else if (fieldKey === 'packages') {
                                    return (
                                      <div className="space-y-1">
                                        {value.map((item, i) => (
                                          <div key={i} className="text-sm bg-gray-50 p-2 rounded">
                                            <strong>{item.name}</strong>
                                            {item.price && <span className="text-green-600 ml-2">₹{item.price}</span>}
                                            {item.description && <div className="text-xs text-gray-600 mt-1">{item.description}</div>}
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  } else if (fieldKey === 'customer_reviews') {
                                    return (
                                      <div className="space-y-1">
                                        {value.map((item, i) => (
                                          <div key={i} className="text-sm bg-gray-50 p-2 rounded">
                                            <strong>{item.customer_name}</strong>
                                            <span className="text-yellow-600 ml-2">{'★'.repeat(item.rating || 0)}</span>
                                            {item.review && <div className="text-xs text-gray-600 mt-1 italic">"{item.review}"</div>}
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  }
                                }
                                return (
                                  <div className="flex flex-wrap gap-1">
                                    {value.map((item, i) => (
                                      <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                        {typeof item === 'string' ? item : JSON.stringify(item)}
                                  </span>
                                    ))}
                                  </div>
                                );
                              }
                              
                              if (typeof value === 'object' && value !== null) {
                                return (
                                  <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                                    {Object.entries(value).map(([k, v]) => (
                                      <div key={k}>
                                        <strong className="capitalize">{k.replace(/_/g, ' ')}:</strong> {Array.isArray(v) ? v.join(', ') : String(v)}
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              
                              if (typeof value === 'boolean') {
                                return <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{value ? 'Yes' : 'No'}</span>;
                              }
                              
                              return <span className="text-sm">{String(value)}</span>;
                            };
                            
                            return (
                              <div key={key} className="border rounded-lg overflow-hidden">
                                <div className="bg-gray-100 px-3 py-2 border-b">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-800 text-sm">
                                      {getFieldDisplayName(key)}
                                  </span>
                                    <div className="flex gap-1">
                                  {isNew && (
                                        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">NEW</span>
                                  )}
                                  {isChanged && (
                                        <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">CHANGED</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-200">
                                  {/* Current Value */}
                                  <div className="p-3 bg-red-50">
                                    <div className="text-xs font-medium text-red-700 mb-2 flex items-center">
                                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                      CURRENT
                                    </div>
                                    <div className="text-sm">
                                      {formatValue(currentValue, key)}
                                    </div>
                                  </div>
                                  
                                  {/* New Value */}
                                  <div className="p-3 bg-green-50">
                                    <div className="text-xs font-medium text-green-700 mb-2 flex items-center">
                                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                      PROPOSED
                                    </div>
                                    <div className="text-sm">
                                      {formatValue(newValue, key)}
                                    </div>
                                  </div>
                                </div>
                                </div>
                              );
                            })}
                          </div>



                        {change.admin_comments && (
                          <div className="mt-3 bg-red-50 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-red-700 mb-1">Admin Comments:</h5>
                            <p className="text-sm text-red-600">{change.admin_comments}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - Always Visible */}
                      <div className="flex-shrink-0 lg:ml-6">
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border-2 border-wedding-orange/30 shadow-lg">
                          <h6 className="text-sm font-bold text-wedding-navy mb-4 text-center">Admin Actions</h6>
                          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                          <button
                            onClick={() => handleApproveChange(change.id, change.vendor_id, change.proposed_changes)}
                            disabled={reviewingChange === change.id}
                              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px] shadow-lg hover:scale-105 transition-all duration-200"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {reviewingChange === change.id ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleRejectChange(change.id)}
                            disabled={reviewingChange === change.id}
                              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px] shadow-lg hover:scale-105 transition-all duration-200"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                          <button
                            onClick={() => window.open(`/vendor/${change.vendor_id}`, '_blank')}
                              className="bg-wedding-navy hover:bg-wedding-navy-hover text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center justify-center min-w-[140px] shadow-lg hover:scale-105 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Inspect
                          </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Momo AI Advisor Tab */}
        {activeTab === "momo" && (
          <div className="h-[calc(100vh-250px)]">
            <MomoChat vendors={vendors} />
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
      />

      <InputModal
        isOpen={inputModal.isOpen}
        onClose={() => setInputModal({ ...inputModal, isOpen: false })}
        onConfirm={inputModal.onConfirm}
        title={inputModal.title}
        message={inputModal.message}
        placeholder={inputModal.placeholder}
      />

      {sendCustomerModal.vendor && (
        <AdminSendCustomerModal
          isOpen={sendCustomerModal.isOpen}
          onClose={() => setSendCustomerModal({ isOpen: false, vendor: null })}
          vendor={sendCustomerModal.vendor}
          onSendCustomer={handleSendCustomerSubmit}
        />
      )}

    </div>
  );
};

export default AdminDashboard;
