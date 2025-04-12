import { getDatabase, ref, set } from "firebase/database";
import { getStorage, ref as refstg, uploadBytes } from "firebase/storage";
import { app } from "../../../App";

//this is just for a file change not adding whole new photos
const handleFileChange = async (SelectedFile: File,path:string) => {
  const file = SelectedFile

  const db = getDatabase(app)
  const storage = getStorage(app)

  const parts = path.split('/');
  // Rejoin everything up to the second last occurrence
  const AbstractPath = parts.slice(0,parts.length - 2).join('/')

  //set that the whole doc is loading
  await set(ref(db, "MedicalDocsStatus/" + AbstractPath), "loading")

  try {
    //upload in storage to the new photo
    await uploadBytes(refstg(storage, path), file)
  } catch (error) {
    console.error(error)
    //failed upload
    await set(ref(db, "MedicalDocsStatus/" + AbstractPath), "failed")
  }

  //unblock the doc for further viewing
  await set(ref(db, "MedicalDocsStatus/" + AbstractPath), "uploaded")
};

export default handleFileChange