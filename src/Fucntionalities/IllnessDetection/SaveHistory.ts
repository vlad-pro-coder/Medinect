import { get, getDatabase, push, ref, set } from "firebase/database"
import { app } from "../../App"
import { getStorage,ref as stgref, uploadBytes, uploadString } from "firebase/storage"
import { v4 as uuidv4 } from 'uuid'
import StorageUniversalDeletion from "../MedicalDocuments/StorageUniversalDeletion"

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

export const DeleteOldHistory = async (ListOfOldHistory:string[],FromWho:string) =>{

    if(ListOfOldHistory.length === 0)
      return 
    const db = getDatabase(app)

    const HistoryOfUser = (await get(ref(db,`users/${FromWho}/IllnessRequests`))).val()

    let toDetelekey:string[] = []
    Object.keys(HistoryOfUser).forEach((key:string)=>{
        if(ListOfOldHistory.includes(HistoryOfUser[key]))
            toDetelekey.push(key)
    })

    await Promise.all(toDetelekey.map(async (key:string)=>{
        return await set(ref(db,`users/${FromWho}/IllnessRequests/${key}`),null)
    }))

    await Promise.all(ListOfOldHistory.map(async (key:string)=>{
      return await StorageUniversalDeletion(`IllnessDetectorRequests/${FromWho}/${key}`)
  }))


}