
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject, getMetadata, SettableMetadata } from "firebase/storage";
import { storage } from "./firebaseConfig";

export interface StorageFile {
  name: string;
  url: string;
  fullPath: string;
  type: 'image' | 'video' | 'unknown';
  uploadedBy: string;
  timeCreated: string;
}

/**
 * Uploads a file to Firebase Storage with metadata and returns the download URL.
 * @param file The file object to upload
 * @param path The folder path (e.g., 'projects', 'gallery')
 * @returns Promise resolving to the download URL
 */
export const uploadFile = async (file: File, path: string = 'uploads'): Promise<string> => {
    // If storage isn't initialized (e.g. bad config), fall back to local object URL for preview only
    if (!storage) {
        console.warn("Storage not connected. Using local ObjectURL.");
        return URL.createObjectURL(file);
    }

    try {
        // Create a unique filename: timestamp_filename
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const uniqueName = `${Date.now()}_${sanitizedName}`;
        const storageRef = ref(storage, `${path}/${uniqueName}`);
        
        // Add metadata to track who uploaded it
        const metadata: SettableMetadata = {
            customMetadata: {
                'uploadedBy': 'Admin' // Hardcoded as per requirement
            }
        };
        
        const snapshot = await uploadBytes(storageRef, file, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

/**
 * Lists all files in a specific folder, including metadata
 */
export const getFiles = async (folder: string): Promise<StorageFile[]> => {
  if (!storage) return [];
  try {
      const listRef = ref(storage, folder);
      const res = await listAll(listRef);
      
      const filePromises = res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        let metadata;
        
        try {
            metadata = await getMetadata(itemRef);
        } catch (e) {
            console.warn("Could not fetch metadata for", itemRef.name);
            metadata = { timeCreated: new Date().toISOString(), customMetadata: {} };
        }

        const isVideo = itemRef.name.toLowerCase().match(/\.(mp4|mov|webm|avi)$/);
        const isImage = itemRef.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg)$/);
        
        let type: 'image' | 'video' | 'unknown' = 'unknown';
        if (isVideo) type = 'video';
        if (isImage) type = 'image';

        return {
          name: itemRef.name,
          url: url,
          fullPath: itemRef.fullPath,
          type: type,
          uploadedBy: metadata.customMetadata?.uploadedBy || 'Unknown',
          timeCreated: metadata.timeCreated
        };
      });

      return Promise.all(filePromises);
  } catch (error) {
      console.warn(`Folder ${folder} empty or not found, or permission denied.`);
      return [];
  }
};

/**
 * Deletes a file by its full path
 */
export const deleteFile = async (fullPath: string): Promise<void> => {
  if (!storage) return;
  try {
      const fileRef = ref(storage, fullPath);
      await deleteObject(fileRef);
  } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
  }
};
