// services/firestoreService.js
import {
  doc,
  getDoc,
  addDoc,
  collection,
  getFirestore,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig.js";
import Vendor, { PricingCategory } from "../models/vendor"; // Adjust the import path as necessary
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const getVendorByFieldId = async (
  id: string
): Promise<Vendor | null> => {
  try {
    const vendorsRef = collection(db, "vendors");
    const q = query(vendorsRef, where("id", "==", id));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as Vendor;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export const addVendor = async (vendorData: Vendor) => {
  try {
    const docRef = await addDoc(collection(db, "vendors"), vendorData);
    console.log("Vendor added with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding vendor: ", error);
    throw error;
  }
};

export const checkPhoneUnique = async (phone) => {
  const db = getFirestore();
  const q = query(collection(db, "vendors"), where("phone", "==", phone));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty; // true if no vendor has this phone
};
