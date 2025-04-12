import { useState } from "react";
import FileUpload from "../dependencies/FileUpload";
import '../design.css'
import { getDatabase, ref, set } from "firebase/database";
import { getStorage, uploadBytes, ref as refstg } from "firebase/storage";
import { app } from "../../../App";
import { v4 as uuidv4 } from 'uuid'

function AddingNewPhotos({ onClose, path }: any) {

    const [selectedFiles, setselectedFiles] = useState<File[]>([])

    const UploadToExistingDoc = async () => {
        const db = getDatabase(app)
        const storage = getStorage(app)

        const parts = path.split('/');
        // Rejoin everything up to the second last occurrence
        const AbstractPath = parts.slice(0,parts.length - 1).join('/')

        await set(ref(db, "MedicalDocsStatus/" + AbstractPath), "loading")

        try {
            //send multiple new files to an already existing doc
            const promises = selectedFiles.map(async (file: File) => {
                await uploadBytes(refstg(storage, path + "/" + uuidv4()), file)
            })

            await Promise.all(promises)
        } catch (error) {
            console.error(error)
            await set(ref(db, "MedicalDocsStatus/" + AbstractPath), "failed")
        }

        await set(ref(db, "MedicalDocsStatus/" + AbstractPath), "uploaded")
    }

    //the popup which takes multiples photos and adds them to the medical photos or recipes photos
    return (
        <div className="popup">
            <div className="popup-inner" style={{ justifyContent: 'space-around'}}>
                <button className="close-btn" onClick={onClose}>X</button>
                <h2 style={{ textAlign: 'center' }}>Select or drag and drop your desired files to add to the selected document</h2>
                <div style={{ display: 'flex', flexDirection: 'row',justifyContent:'center',width:'100%'}}>
                    <FileUpload selectedFiles={selectedFiles} setSelectedFiles={setselectedFiles} >
                        Select or drag new photos
                    </FileUpload>
                </div>
                <button className="submit-button" onClick={()=>{
                    UploadToExistingDoc()
                    onClose()
                    }}>Submit</button>
            </div>
        </div>
    );
}

export default AddingNewPhotos