// src/hooks/useVendorDetails.ts
import { useEffect, useState } from "react";
import { Vendor } from "@/lib/supabase";
import { getVendorByFieldId } from "@/services/supabaseService";

export const useVendorDetails = (vendorId?: string) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      if (!vendorId) {
        setLoading(false);
        return;
      }

      try {
        const vendorData = await getVendorByFieldId(vendorId);
        setVendor(vendorData);
      } catch (error) {
        console.error("Error fetching vendor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [vendorId]);

  return { vendor, loading };
};