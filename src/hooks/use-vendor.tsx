// src/hooks/useVendorDetails.ts
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig.js"; 

interface Vendor {
  name: string;
  description: string;
  Price: string;
  experts: string[];
  rating: number;
}

export const useVendorDetails = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const docRef = doc(db, "vendors", "details");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setVendor(docSnap.data() as Vendor);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching vendor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, []);

  return { vendor, loading };
};
