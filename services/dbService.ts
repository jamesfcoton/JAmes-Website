
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { CatalogData, MarqueeItem } from "../types";

const COLLECTION_NAME = "app_data";
const CATALOG_DOC_ID = "catalog";
const MARQUEE_DOC_ID = "marquee";

// --- CATALOG DATA ---

export const getCatalogData = async (): Promise<CatalogData | null> => {
  // Fallback to LocalStorage if Firebase is not configured
  if (!db) {
    const local = localStorage.getItem('jamesfcoton_catalog');
    return local ? JSON.parse(local) : null;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, CATALOG_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as CatalogData;
    } else {
      console.log("No such catalog document in Firebase!");
      return null;
    }
  } catch (error) {
    console.error("Error getting catalog from Firebase:", error);
    // Fallback on error
    const local = localStorage.getItem('jamesfcoton_catalog');
    return local ? JSON.parse(local) : null;
  }
};

export const saveCatalogData = async (data: CatalogData): Promise<void> => {
  // Always save to LocalStorage as backup/cache
  localStorage.setItem('jamesfcoton_catalog', JSON.stringify(data));

  if (!db) return;

  try {
    await setDoc(doc(db, COLLECTION_NAME, CATALOG_DOC_ID), data);
    console.log("Catalog saved to Firebase");
  } catch (error) {
    console.error("Error saving catalog to Firebase:", error);
    alert("Error saving to Cloud Database. Saved locally only.");
  }
};

// --- MARQUEE DATA ---

export const getMarqueeData = async (): Promise<MarqueeItem[] | null> => {
    if (!db) {
        const local = localStorage.getItem('jamesfcoton_marquee');
        return local ? JSON.parse(local) : null;
    }

    try {
        const docRef = doc(db, COLLECTION_NAME, MARQUEE_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().items as MarqueeItem[];
        }
        return null;
    } catch (error) {
        return null;
    }
};

export const saveMarqueeData = async (items: MarqueeItem[]): Promise<void> => {
    localStorage.setItem('jamesfcoton_marquee', JSON.stringify(items));
    
    if (!db) return;

    try {
        await setDoc(doc(db, COLLECTION_NAME, MARQUEE_DOC_ID), { items });
    } catch (e) {
        console.error("Error saving marquee to Firebase", e);
    }
}
