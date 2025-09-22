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
  Upload,
  Zap,
  Sparkles,
  Sword,
  Flower2,
  Crown,
  Rainbow,
  Sun,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Vendor } from "@/lib/supabase";
import { getAllVendorsForAdmin, updateVendor, deleteVendor, getAllPendingChanges, reviewVendorProfileChange } from "@/services/supabaseService";

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
  const [countUpValues, setCountUpValues] = useState({
    totalVendors: 0,
    verifiedVendors: 0,
    activeVendors: 0,
    featuredVendors: 0
  });
  const navigate = useNavigate();

  // Demon-themed admin names and greetings
  const demonNames = [
    "Muzan Kibutsuji 👹", 
    "Lord of Event Chaos 🦹‍♂️", 
    "Supreme Event Overlord 👑", 
    "Demon of Vendor Control 🔥", 
    "Master of Event Realms 🌟"
  ];
  
  const demonGreetings = [
    "Ready to control your event demons today?",
    "Time to summon some vendor magic! ✨",
    "Let's make events legendary! 🎉",
    "Ready to slay some event challenges? 🗡️",
    "Time to rule the event kingdom! 👑",
    "Let's create some chaos... organized chaos! 😈"
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

  // Count-up animation effect
  useEffect(() => {
    const stats = {
      totalVendors: vendors.length,
      verifiedVendors: vendors.filter(v => v.verified).length,
      activeVendors: vendors.filter(v => v.currently_available).length,
      featuredVendors: vendors.filter(v => v.verified && v.currently_available).length,
    };

    const animateCountUp = () => {
      const duration = 1000; // 1 second
      const steps = 60;
      const stepDuration = duration / steps;
      
      Object.keys(stats).forEach(key => {
        const targetValue = stats[key as keyof typeof stats];
        const startValue = countUpValues[key as keyof typeof countUpValues];
        const increment = (targetValue - startValue) / steps;
        
        let currentStep = 0;
        const timer = setInterval(() => {
          currentStep++;
          const newValue = Math.round(startValue + (increment * currentStep));
          
          setCountUpValues(prev => ({
            ...prev,
            [key]: newValue
          }));
          
          if (currentStep >= steps) {
            clearInterval(timer);
            setCountUpValues(prev => ({
              ...prev,
              [key]: targetValue
            }));
          }
        }, stepDuration);
      });
    };

    if (vendors.length > 0) {
      animateCountUp();
    }
  }, [vendors.length]);

  const fetchVendors = async () => {
    try {
      const vendorData = await getAllVendorsForAdmin();
      console.log('Fetched vendors for admin:', vendorData);
      setVendors(vendorData);
      setFilteredVendors(vendorData);
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
    let filtered = vendors;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.address?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDeleteVendor = async (vendorId: string, vendorName: string) => {
    if (window.confirm(`Are you sure you want to delete ${vendorName}?`)) {
      try {
        await deleteVendor(vendorId);
        await fetchVendors();
      } catch (error) {
        console.error("Error deleting vendor:", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const handleApproveChange = async (changeId: number, vendorId: number, proposedChanges: any) => {
    setReviewingChange(changeId);
    try {
      // Approve the change and update vendor profile
      const result = await reviewVendorProfileChange(
        changeId, 
        'approved', 
        'admin', // adminUsername
        'Changes approved by admin' // adminComments
      );
      
      if (result.success) {
        // Refresh both vendors and pending changes
        await fetchVendors();
        await fetchPendingChanges();
        
        alert('Changes approved and vendor profile updated successfully!');
      } else {
        alert('Failed to approve changes: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error approving change:', error);
      alert('Error approving changes. Please try again.');
    } finally {
      setReviewingChange(null);
    }
  };

  const handleRejectChange = async (changeId: number) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    
    setReviewingChange(changeId);
    try {
      const result = await reviewVendorProfileChange(
        changeId, 
        'rejected', 
        'admin', // adminUsername
        reason || 'Changes rejected by admin' // adminComments
      );
      
      if (result.success) {
        await fetchPendingChanges();
        alert('Changes rejected successfully.');
      } else {
        alert('Failed to reject changes: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error rejecting change:', error);
      alert('Error rejecting changes. Please try again.');
    } finally {
      setReviewingChange(null);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-wedding-light via-wedding-orange-light to-wedding-navy-light relative overflow-hidden">
      {/* Mist Falling Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Mist particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full blur-sm animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.3 + Math.random() * 0.4
            }}
          />
        ))}
        {/* Larger mist particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`large-${i}`}
            className="absolute w-4 h-4 bg-white/15 rounded-full blur-md animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              opacity: 0.2 + Math.random() * 0.3
            }}
          />
        ))}
        {/* Floating mist clouds */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`cloud-${i}`}
            className="absolute w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              opacity: 0.1 + Math.random() * 0.2
            }}
          />
        ))}
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
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-wedding-orange/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div>
                <h1 
                  className="text-3xl font-bold text-wedding-navy"
                >
                  Welcome back, {adminName}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Demon Control Level Progress Bar */}
              <div className="hidden md:block bg-white/80 rounded-full p-2 mr-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Sword className="h-4 w-4 text-wedding-orange" />
                  <div className="w-20 bg-wedding-gray-light rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-wedding-orange to-wedding-navy h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${demonControlLevel}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-wedding-gray">{demonControlLevel}%</span>
                </div>
                <p className="text-xs text-wedding-gray text-center mt-1">Demon Control</p>
              </div>
              
              <button
                onClick={() => navigate("/admin/vendor/new")}
                className="bg-wedding-orange hover:bg-wedding-orange-hover text-white px-6 py-3 rounded-lg flex items-center shadow-lg hover:shadow-wedding-orange/25 hover:scale-105 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Summon Vendor
              </button>
              <button
                onClick={handleLogout}
                className="bg-wedding-navy hover:bg-wedding-navy-hover text-white px-6 py-3 rounded-lg flex items-center shadow-lg hover:shadow-wedding-navy/25 hover:scale-105 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Banish Session
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout with Vertical Sidebar */}
      <div className="flex h-screen">
        {/* Left Vertical Sidebar with Muichiro Tokito Image */}
        <div className="w-96 flex-shrink-0 bg-gradient-to-b from-white/90 to-white/70 backdrop-blur-md shadow-lg border-r border-wedding-orange/20 h-screen overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="p-2 border-b border-wedding-orange/20">
              <h2 className="text-lg font-bold text-wedding-navy text-center">Muichiro Tokito</h2>
              <p className="text-wedding-gray text-xs text-center">Mist Hashira</p>
            </div>
            <div className="flex-1 flex items-center justify-center p-2">
              <img 
                src="/images/tokito-hq.png" 
                alt="Muichiro Tokito - Mist Hashira" 
                className="w-full h-full object-contain rounded-lg shadow-lg border-2 border-wedding-orange"
                style={{
                  imageRendering: 'high-quality',
                  imageRendering: '-webkit-optimize-contrast'
                }}
                onError={(e) => {
                  // Fallback to a placeholder or existing image if tokito.png is not found
                  e.currentTarget.src = "/one.jpg";
                  e.currentTarget.alt = "Muichiro Tokito - Mist Hashira (Placeholder)";
                }}
              />
            </div>
            <div className="p-2 border-t border-wedding-orange/20">
              <div className="text-center">
                <p className="text-xs text-wedding-gray italic mb-2">
                  "I'll cut through any demon that stands in my way."
                </p>
                <div className="p-2 bg-wedding-orange-light rounded-lg border border-wedding-orange/30">
                  <h3 className="font-bold text-wedding-navy text-xs mb-1">⚔️ Slayer Corps Leader</h3>
                  <p className="text-xs text-wedding-gray">
                    Commanding with precision.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-none px-3 sm:px-4 lg:px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/80 backdrop-blur-sm border border-wedding-orange/20 overflow-hidden shadow-lg rounded-xl hover:shadow-wedding-orange/25 hover:scale-105 transition-all duration-300">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 relative">
                  <Flower2 className="h-8 w-8 text-wedding-orange" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-wedding-gray truncate">
                      Your Slayer Corps Today ⚔️
                    </dt>
                    <dd className="text-2xl font-bold text-wedding-navy">
                      {countUpValues.totalVendors}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-green-500/20 overflow-hidden shadow-lg rounded-xl hover:shadow-green-500/25 hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 relative">
                  <Sun className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-wedding-gray truncate">
                      Blessed Slayer Corps ✨
                    </dt>
                    <dd className="text-2xl font-bold text-wedding-navy">
                      {countUpValues.verifiedVendors}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-wedding-navy/20 overflow-hidden shadow-lg rounded-xl hover:shadow-wedding-navy/25 hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 relative">
                  <Rainbow className="h-8 w-8 text-wedding-navy" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-wedding-gray truncate">
                      Active Warriors ⚡
                    </dt>
                    <dd className="text-2xl font-bold text-wedding-navy">
                      {countUpValues.activeVendors}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="bg-white/80 backdrop-blur-sm border border-red-500/20 overflow-hidden shadow-lg rounded-xl hover:shadow-red-500/25 hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={() => setActiveTab("approvals")}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 relative">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-wedding-gray truncate">
                      Chaos Controlled 🎯
                    </dt>
                    <dd className="text-2xl font-bold text-wedding-navy flex items-center">
                      {pendingChanges.length}
                      {pendingChanges.length > 0 && (
                        <span className="ml-3 bg-wedding-orange text-white text-xs px-3 py-1 rounded-full shadow-lg">
                          ⚡ Action Required
                        </span>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-md border border-wedding-orange/20 shadow-lg rounded-xl mb-6 overflow-hidden">
          <div className="border-b border-wedding-orange/20">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("vendors")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === "vendors"
                    ? "border-wedding-orange text-wedding-navy bg-wedding-orange/10"
                    : "border-transparent text-wedding-gray hover:text-wedding-navy hover:border-wedding-orange/50"
                }`}
              >
                <Users className="w-4 h-4 inline-block mr-2" />
                Slayer Corps Army ({vendors.length}) ⚔️
              </button>
              <button
                onClick={() => setActiveTab("approvals")}
                className={`py-4 px-1 border-b-2 font-medium text-sm relative transition-all duration-200 ${
                  activeTab === "approvals"
                    ? "border-red-500 text-wedding-navy bg-red-500/10"
                    : "border-transparent text-wedding-gray hover:text-wedding-navy hover:border-red-500/50"
                }`}
              >
                <Sparkles className="w-4 h-4 inline-block mr-2" />
                Chaos Queue ({pendingChanges.length}) ⚡
                {pendingChanges.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-wedding-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                    {pendingChanges.length > 9 ? '9+' : pendingChanges.length}
                  </span>
                )}
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
                placeholder="🔍 Hunt for slayer corps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white border border-wedding-orange/50 rounded-lg w-full focus:ring-wedding-orange focus:border-wedding-orange text-wedding-navy placeholder-wedding-gray transition-all duration-200"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-3 bg-white border border-wedding-orange/50 rounded-lg focus:ring-wedding-orange focus:border-wedding-orange text-wedding-navy transition-all duration-200"
            >
              <option value="all">⚡ All Slayer Corps Powers</option>
              <option value="verified">✨ Blessed Slayer Corps</option>
              <option value="unverified">👻 Unblessed Souls</option>
              <option value="active">🔥 Active Warriors</option>
              <option value="inactive">💤 Sleeping Demons</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-3 bg-white border border-wedding-orange/50 rounded-lg focus:ring-wedding-orange focus:border-wedding-orange text-wedding-navy transition-all duration-200"
            >
              <option value="all">🎭 All Slayer Corps Types</option>
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
                <span className="text-wedding-navy font-medium">Mass Ritual Powers - {selectedVendors.length} Slayer Corps Selected</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleBulkAction("verify")}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm shadow-lg hover:scale-105 transition-all duration-200"
                >
                  ✨ Bless Selected
                </button>
                <button
                  onClick={() => handleBulkAction("unverify")}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm shadow-lg hover:scale-105 transition-all duration-200"
                >
                  👻 Unbless Selected
                </button>
                <button
                  onClick={() => handleBulkAction("activate")}
                  className="px-4 py-2 bg-wedding-navy hover:bg-wedding-navy-hover text-white rounded-lg text-sm shadow-lg hover:scale-105 transition-all duration-200"
                >
                  ⚡ Awaken Selected
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm shadow-lg hover:scale-105 transition-all duration-200"
                >
                  💤 Put to Sleep
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm shadow-lg hover:scale-105 transition-all duration-200"
                >
                  🗡️ Banish Selected
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
                  Slayer Corps Army Roster ({filteredVendors.length})
              </h3>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedVendors.length === filteredVendors.length && filteredVendors.length > 0}
                  onChange={handleSelectAll}
                  className="h-5 w-5 text-wedding-orange focus:ring-wedding-orange border-wedding-orange/50 rounded bg-white"
                />
                <label className="ml-2 text-sm text-wedding-gray">Select All Slayer Corps</label>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-w-full">
            <table className="min-w-full divide-y divide-wedding-orange/20">
              <thead className="bg-wedding-orange-light">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-wedding-navy uppercase tracking-wider">
                    ⚡ Select
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-wedding-navy uppercase tracking-wider">
                    ⚔️ Slayer Corps
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-wedding-navy uppercase tracking-wider">
                    🎭 Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-wedding-navy uppercase tracking-wider">
                    🏰 Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-wedding-navy uppercase tracking-wider">
                    ✨ Powers
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-wedding-navy uppercase tracking-wider">
                    ⭐ Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-wedding-navy uppercase tracking-wider">
                    🗡️ Actions
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
                          <div className="text-sm font-bold text-wedding-navy">
                            {vendor.brand_name}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-wedding-gray">
                      {vendor.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        {vendor.verified ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white shadow-lg">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            ✨ Blessed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-lg">
                            <XCircle className="h-3 w-3 mr-1" />
                            👻 Unblessed
                          </span>
                        )}
                        {vendor.currently_available ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-wedding-navy text-white shadow-lg">
                            ⚡ Awake
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-600 text-white shadow-lg">
                            💤 Sleeping
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-wedding-gray">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-bold text-wedding-navy">{vendor.rating || "N/A"}</span>
                        <span className="text-wedding-gray ml-1">
                          ({vendor.review_count || 0})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/admin/vendor/${vendor.vendor_id}`)}
                          className="p-2 bg-wedding-navy hover:bg-wedding-navy-hover text-white rounded-lg shadow-lg hover:scale-110 transition-all duration-200"
                          title="👁️ Inspect Slayer Corps"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/vendor/${vendor.vendor_id}/edit`)}
                          className="p-2 bg-wedding-orange hover:bg-wedding-orange-hover text-white rounded-lg shadow-lg hover:scale-110 transition-all duration-200"
                          title="✏️ Modify Slayer Corps"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(vendor.vendor_id, vendor.brand_name)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg hover:scale-110 transition-all duration-200"
                          title="🗡️ Banish Slayer Corps"
                        >
                          <Trash2 className="h-4 w-4" />
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
                No Slayer Corps Found 👻
              </h3>
              <p className="mt-2 text-sm text-wedding-gray">
                {searchTerm || filterStatus !== "all" || filterCategory !== "all"
                  ? "🔍 Your hunt came up empty! Try different search criteria."
                  : "⚡ Ready to summon your first slayer corps?"}
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
                    Chaos Queue - Pending Slayer Corps Transformations
                </h3>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {pendingChanges.length} ⚡ Awaiting Judgment
                  </span>
                  <button
                    onClick={fetchPendingChanges}
                    className="bg-wedding-orange hover:bg-wedding-orange-hover text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    🔄 Refresh Chaos
                  </button>
                </div>
              </div>
              
              {/* Color Legend */}
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-800/30 to-blue-800/30 border border-purple-500/30 rounded-lg">
                <h4 className="text-sm font-bold text-purple-200 mb-3">🎭 Transformation Legend:</h4>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mr-3 shadow-lg"></div>
                    <span className="text-purple-200">✨ Proposed Transformations</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mr-3 shadow-lg"></div>
                    <span className="text-purple-200">🆕 New Powers</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mr-3 shadow-lg"></div>
                    <span className="text-purple-200">⚡ Modified Abilities</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mr-3 shadow-lg"></div>
                    <span className="text-purple-200">🔥 Current State</span>
                  </div>
                </div>
              </div>
            </div>

            {pendingChanges.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <h3 className="mt-4 text-xl font-bold text-wedding-navy">
                  ✨ All Chaos Controlled!
                </h3>
                <p className="mt-2 text-sm text-wedding-gray">
                  🎉 No slayer corps transformations pending your divine judgment!
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
                              {change.vendor_brand_name || `Slayer Corps ID: ${change.vendor_id}`} 👹
                            </h4>
                            <p className="text-sm text-wedding-gray">
                              {change.change_type === 'profile_update' ? '🔄 Slayer Corps Transformation Request' : change.change_type} • 
                              ⏰ Submitted {new Date(change.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Clean Side-by-Side Changes Comparison */}
                        <div className="mt-4 space-y-4">
                          {Object.entries(change.proposed_changes)
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
                                'address': 'Address',
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
                              
                              if (fieldKey === 'catalog_images' && Array.isArray(value)) {
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
                                                ⭐ Now Highlighted
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
                          <h6 className="text-sm font-bold text-wedding-navy mb-4 text-center">⚡ Divine Judgment</h6>
                          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                          <button
                            onClick={() => handleApproveChange(change.id, change.vendor_id, change.proposed_changes)}
                            disabled={reviewingChange === change.id}
                              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px] shadow-lg hover:scale-105 transition-all duration-200"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {reviewingChange === change.id ? '✨ Blessing...' : '✨ Bless'}
                          </button>
                          <button
                            onClick={() => handleRejectChange(change.id)}
                            disabled={reviewingChange === change.id}
                              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px] shadow-lg hover:scale-105 transition-all duration-200"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            🗡️ Banish
                          </button>
                          <button
                            onClick={() => window.open(`/vendor/${change.vendor_id}`, '_blank')}
                              className="bg-wedding-navy hover:bg-wedding-navy-hover text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center justify-center min-w-[140px] shadow-lg hover:scale-105 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            👁️ Inspect
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
