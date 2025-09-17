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
  AlertTriangle,
  Download,
  Upload
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
  const navigate = useNavigate();

  useEffect(() => {
    // Check admin authentication
    const isAdminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!isAdminLoggedIn) {
      navigate("/admin/login");
      return;
    }

    fetchVendors();
    fetchPendingChanges();
  }, [navigate]);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, filterStatus, filterCategory]);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/vendor/new")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Vendors
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalVendors}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Verified
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.verifiedVendors}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeVendors}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Featured
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.featuredVendors}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              disabled={selectedVendors.length === 0}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Bulk Actions ({selectedVendors.length})
            </button>
          </div>

          {/* Bulk Actions */}
          {showBulkActions && selectedVendors.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkAction("verify")}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Verify Selected
                </button>
                <button
                  onClick={() => handleBulkAction("unverify")}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  Unverify Selected
                </button>
                <button
                  onClick={() => handleBulkAction("activate")}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Activate Selected
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                >
                  Deactivate Selected
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vendors Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Vendors ({filteredVendors.length})
              </h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedVendors.length === filteredVendors.length && filteredVendors.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Select All</label>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.vendor_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedVendors.includes(vendor.vendor_id)}
                        onChange={() => handleVendorSelection(vendor.vendor_id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={vendor.avatar_url || "/images/vendor-placeholder.jpg"}
                            alt={vendor.brand_name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {vendor.brand_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vendor.spoc_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {vendor.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vendor.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {vendor.verified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Unverified
                          </span>
                        )}
                        {vendor.currently_available ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {vendor.rating || "N/A"}
                        <span className="text-gray-500 ml-1">
                          ({vendor.review_count || 0})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/admin/vendor/${vendor.vendor_id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/vendor/${vendor.vendor_id}/edit`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(vendor.vendor_id, vendor.brand_name)}
                          className="text-red-600 hover:text-red-900"
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
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== "all" || filterCategory !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding a new vendor."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
