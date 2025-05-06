import { getDatabase, push, ref } from "firebase/database"
import { app } from "../../App"
import { getStorage,ref as stgref, uploadBytes, uploadString } from "firebase/storage"
import { v4 as uuidv4 } from 'uuid'

export const SaveFileAndResults = async (uid:string,photo:File,results:boolean[]) =>{

    const db = getDatabase(app);
    const storage = getStorage(app);
  
    // Generate a unique request ID
    const requestID = uuidv4();
  
    try {
      // Push the request ID to the user's illness requests
      await push(ref(db, `users/${uid}/IllnessRequests`), requestID);
  
      // Define the storage path for the photo and results
      const storagePath = `IllnessDetectorRequests/${uid}/${requestID}`;
  
      // Save the photo to Firebase Storage
      const photoRef = stgref(storage, `${storagePath}/photo`);
      await uploadBytes(photoRef, photo);
  
      // Prepare the results JSON
      const resultsData = {
        Results: results,
        Timestamp: (new Date()).toISOString(), // Add a timestamp for when the request was saved
      };
  
      // Save the results JSON to Firebase Storage
      const jsonRef = stgref(storage, `${storagePath}/data.json`);
      await uploadString(jsonRef, JSON.stringify(resultsData));
  
      console.log("Photo and results saved successfully.");
    } catch (error) {
      console.error("Error saving file and results:", error);
    }
}