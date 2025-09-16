import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import Vendor from "@/models/vendor";
import CustomCarousel from "@/components/CustomCaorousal";
import DynamicIcon from "@/components/dynamic-icons";
import { getVendorByFieldId } from "../services/supabaseService";
import { AppConstants } from "@/AppConstants";
import Header from "@/components/layout/Header";
import Tabview from "@/components/ui/tabview";

// Enhanced types for better type safety
interface MediaFile {
  id: string;
  name: string;
  mimeType: string;
  url?: string; // Pre-built URL for faster access
  cachedAt?: number; // Timestamp for cache expiration
}

interface MediaCache {
  images: MediaFile[];
  videos: MediaFile[];
  timestamp: number;
  vendorId: string;
}

interface CacheManager {
  get: (key: string) => MediaCache | null;
  set: (key: string, data: MediaCache) => void;
  clear: (key?: string) => void;
  isExpired: (data: MediaCache, maxAge?: number) => boolean;
}

// Global cache manager
declare global {
  interface Window {
    _vendorMediaCache?: { [key: string]: MediaCache };
  }
}

// Cache configuration
const CACHE_CONFIG = {
  MAX_AGE: 30 * 60 * 1000, // 30 minutes
  STORAGE_KEY_PREFIX: 'vendorMedia_',
  MAX_MEMORY_CACHE_SIZE: 50, // Maximum number of vendors to cache in memory
};

export default function VendorDetails() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const apiKey = AppConstants.DRIVE_API_KEY;

  // State management
  const [vendor, setVendor] = useState<Vendor>();
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<MediaFile[]>([]);
  const [videos, setVideos] = useState<MediaFile[]>([]);
  const [mediaLoadingState, setMediaLoadingState] = useState<{
    images: boolean;
    videos: boolean;
  }>({ images: false, videos: false });
  const [error, setError] = useState<string | null>(null);

  // Initialize cache manager
  const cacheManager: CacheManager = useMemo(() => ({
    get: (key: string) => {
      // Try in-memory first
      const memoryCache = window._vendorMediaCache?.[key];
      if (memoryCache && !cacheManager.isExpired(memoryCache)) {
        return memoryCache;
      }

      // Try localStorage
      const storageCache = localStorage.getItem(CACHE_CONFIG.STORAGE_KEY_PREFIX + key);
      if (storageCache) {
        try {
          const parsed: MediaCache = JSON.parse(storageCache);
          if (!cacheManager.isExpired(parsed)) {
            // Store in memory for faster access
            window._vendorMediaCache = {
              ...(window._vendorMediaCache || {}),
              [key]: parsed,
            };
            return parsed;
          } else {
            // Remove expired cache
            localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY_PREFIX + key);
          }
        } catch (e) {
          console.warn('Failed to parse cache:', e);
          localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY_PREFIX + key);
        }
      }

      return null;
    },

    set: (key: string, data: MediaCache) => {
      // Store in memory
      if (!window._vendorMediaCache) {
        window._vendorMediaCache = {};
      }

      // Limit memory cache size
      const cacheKeys = Object.keys(window._vendorMediaCache);
      if (cacheKeys.length >= CACHE_CONFIG.MAX_MEMORY_CACHE_SIZE) {
        // Remove oldest entries
        const sortedKeys = cacheKeys.sort((a, b) => 
          (window._vendorMediaCache![a]?.timestamp || 0) - 
          (window._vendorMediaCache![b]?.timestamp || 0)
        );
        
        for (let i = 0; i < 10; i++) { // Remove 10 oldest entries
          delete window._vendorMediaCache[sortedKeys[i]];
        }
      }

      window._vendorMediaCache[key] = data;

      // Store in localStorage
      try {
        localStorage.setItem(
          CACHE_CONFIG.STORAGE_KEY_PREFIX + key, 
          JSON.stringify(data)
        );
      } catch (e) {
        console.warn('Failed to store in localStorage:', e);
        // If localStorage is full, clear old entries
        cacheManager.clear();
        try {
          localStorage.setItem(
            CACHE_CONFIG.STORAGE_KEY_PREFIX + key, 
            JSON.stringify(data)
          );
        } catch (e2) {
          console.error('Failed to store in localStorage after clearing:', e2);
        }
      }
    },

    clear: (key?: string) => {
      if (key) {
        delete window._vendorMediaCache?.[key];
        localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY_PREFIX + key);
      } else {
        // Clear all cache
        window._vendorMediaCache = {};
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith(CACHE_CONFIG.STORAGE_KEY_PREFIX)) {
            localStorage.removeItem(k);
          }
        });
      }
    },

    isExpired: (data: MediaCache, maxAge = CACHE_CONFIG.MAX_AGE) => {
      return Date.now() - data.timestamp > maxAge;
    }
  }), []);

  // Optimized media fetching with better error handling
  const fetchDriveMedia = useCallback(async (
    vendorData: Vendor, 
    forceRefresh = false
  ): Promise<{ images: MediaFile[]; videos: MediaFile[] }> => {
    if (!vendorData?.folderId) {
      return { images: [], videos: [] };
    }

    const cacheKey = vendorData.folderId;

    // Check cache first
    if (!forceRefresh) {
      const cached = cacheManager.get(cacheKey);
      if (cached) {
        console.log('📦 Using cached media for vendor:', vendorData.name);
        return { images: cached.images, videos: cached.videos };
      }
    }

    console.log('🔄 Fetching fresh media for vendor:', vendorData.name);
    setMediaLoadingState({ images: true, videos: true });

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${vendorData.folderId}'+in+parents+and+(mimeType contains 'image/' or mimeType contains 'video/')&key=${apiKey}&fields=files(id,name,mimeType,size,modifiedTime)&pageSize=1000`
      );

      if (!response.ok) {
        throw new Error(`Drive API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.files || !Array.isArray(data.files)) {
        throw new Error("Invalid response format from Drive API");
      }

      // Process files and pre-build URLs
      const processedFiles: MediaFile[] = data.files.map((file) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        url: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${apiKey}`,
        cachedAt: Date.now()
      }));

      const images = processedFiles.filter(f => f.mimeType.startsWith("image/"));
      const videos = processedFiles.filter(f => f.mimeType.startsWith("video/"));

      const mediaCache: MediaCache = {
        images,
        videos,
        timestamp: Date.now(),
        vendorId: vendorData.id || vendorId!
      };

      // Cache the results
      cacheManager.set(cacheKey, mediaCache);

      console.log(`✅ Fetched ${images.length} images and ${videos.length} videos`);
      return { images, videos };

    } catch (error) {
      console.error("Drive media fetch failed:", error);
      setError(`Failed to load media: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { images: [], videos: [] };
    } finally {
      setMediaLoadingState({ images: false, videos: false });
    }
  }, [apiKey, vendorId, cacheManager]);

  // Main effect for loading vendor data
  useEffect(() => {
    if (!vendorId) return;

    const loadVendorData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const vendorData = await getVendorByFieldId(vendorId);
        
        if (!vendorData) {
          throw new Error("Vendor not found");
        }

        setVendor(vendorData);

        // Load media
        const media = await fetchDriveMedia(vendorData);
        setImages(media.images);
        setVideos(media.videos);

      } catch (err) {
        console.error("Failed to fetch vendor details:", err);
        setError(err instanceof Error ? err.message : 'Failed to load vendor details');
      } finally {
        setIsLoading(false);
      }
    };

    loadVendorData();
  }, [vendorId, fetchDriveMedia]);

  // Refresh media function
  const refreshMedia = useCallback(async () => {
    if (vendor) {
      const media = await fetchDriveMedia(vendor, true);
      setImages(media.images);
      setVideos(media.videos);
    }
  }, [vendor, fetchDriveMedia]);

  // Clear cache function
  const clearCache = useCallback(() => {
    if (vendor?.folderId) {
      cacheManager.clear(vendor.folderId);
      console.log('🗑️ Cache cleared for vendor:', vendor.name);
    }
  }, [vendor, cacheManager]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-lg text-gray-600">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Vendor not found
  if (!vendor) {
    return <Navigate to="/" />;
  }

  const experts = vendor?.category || ["SFX", "Fireworks", "Lighting"];
  const rating = vendor?.rating ?? 4;

  return (
    <div className="font-volte min-h-screen px-[2vw]">
      <div className="h-24"></div>
      <Header />
      
      {/* Debug/Admin controls - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 rounded-lg mb-4 flex gap-2 items-center">
          <button 
            onClick={refreshMedia}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            disabled={mediaLoadingState.images || mediaLoadingState.videos}
          >
            {mediaLoadingState.images || mediaLoadingState.videos ? 'Refreshing...' : 'Refresh Media'}
          </button>
          <button 
            onClick={clearCache}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Clear Cache
          </button>
          <span className="text-sm text-gray-600">
            📷 {images.length} images, 🎥 {videos.length} videos
          </span>
        </div>
      )}

      <CustomCarousel images={images} />
      
      <section className="bg-white w-full px-6 md:px-16 py-2 rounded-3xl shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-2 mt-10 gap-10 items-start">
          {/* Info Section */}
          <div>
            <h1 className="text-5xl font-bold text-[#001f3f] mb-4">
              {vendor.name || "Vendor Name"}
            </h1>
            <p className="text-gray-700 text-lg mb-6">
              {vendor.description || "No description available."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-600 mb-1">
                  Experts In
                </h4>
                <div className="flex flex-wrap gap-2">
                  {experts.map((expert, index) => (
                    <span
                      key={index}
                      className="flex-col justify-center align-middle bg-orange-200 text-orange-900 px-4 py-1 rounded-full text-lg font-medium border-black border-[1.4px] hover:bg-orange-200 transition-all cursor-pointer"
                    >
                      {expert.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-600 mb-1">
                  Location
                </h4>
                <p className="text-black text-xl font-medium">
                  {vendor.location || "Unknown Location"}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-600 mb-1">
                  Price starting from
                </h4>
                <p className="text-black text-xl font-semibold font-montserrat">
                  ₹ {vendor.price ?? "N/A"}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-600 mb-1">
                  Rating
                </h4>
                <div className="flex items-center gap-1">
                  {Array.from({ length: rating }, (_, i) => (
                    <DynamicIcon
                      key={i}
                      name="star"
                      color="orange"
                      size={"lg"}
                    />
                  ))}
                  {Array.from({ length: 5 - rating }, (_, i) => (
                    <DynamicIcon key={i} name="star" color="gray" size={"sm"} />
                  ))}
                </div>
              </div>
            </div>

            <button className="mt-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-md transition">
              Book Now
            </button>
          </div>

          {/* Video Section */}
          <div className="bg-[url(/images/background.jpg)] bg-cover bg-center p-4 rounded-2xl">
            {mediaLoadingState.videos ? (
              <div className="text-center text-gray-500 font-medium">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                Loading videos...
              </div>
            ) : videos?.length > 0 ? (
              <div
                className={`grid gap-2 ${
                  videos.length === 1
                    ? "grid-cols-1"
                    : videos.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-2 grid-rows-2"
                }`}
              >
                {videos.slice(0, videos.length > 4 ? 3 : 4).map((video, i) => (
                  <video
                    key={video.id}
                    controls
                    className="w-full h-[32vh] object-cover rounded-lg"
                    src={video.url}
                    preload="metadata"
                  />
                ))}
                {videos.length > 4 && (
                  <div className="relative w-full h-[32vh] bg-black/70 text-white rounded-lg flex items-center justify-center text-xl font-semibold">
                    +{videos.length - 3}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 font-medium">
                No videos available
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <Tabview videos={vendor.videos} />
      </section>
    </div>
  );
}