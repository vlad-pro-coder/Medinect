import { deleteObject, getDownloadURL, getMetadata, getStorage, listAll, ref } from "firebase/storage";
import { memo, useEffect, useState } from "react"
import { app } from "../../../App";
import {  Unsupported } from "./FilesDisplay";
import FileUpload from "../../MedicalDocuments/dependencies/FileUpload";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";
import { AddFilesToNode } from "../InvestigationFirebaseFuncs";
import { getDatabase, onValue, ref as refdb, set } from "firebase/database";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import { TiDocumentDelete } from "react-icons/ti";
import { FaFolder } from "react-icons/fa";
import ZoomablePhoto from "../../MedicalDocuments/dependencies/ZoomableImage";

const AddFilePopUp = ({ onClose, NodeID, WhoDidTheChange, MasterID, NodeFullPath }: any) => {

    const [selectedFiles, setselectedFiles] = useState<File[]>([])
    //console.log(selectedFiles, WhoDidTheChange, NodeID, MasterID, NodeFullPath)

    return <div className="popup">
        <div className="popup-inner add-files-popup-overwrite" style={{ justifyContent: 'space-around',alignContent:'center' }}>
            <div onClick={onClose} className="close-btn"><RxCross2 /></div>
            <FileUpload selectedFiles={selectedFiles} setSelectedFiles={setselectedFiles}>
                Add new files to this node
            </FileUpload>
            <div className="submit-button" style={{textAlign:'center'}} onClick={() => {
                onClose()
                if (selectedFiles.length !== 0)
                    AddFilesToNode(selectedFiles, WhoDidTheChange, NodeID, MasterID, NodeFullPath)
                else
                    toast("No files selected, Node unchanged")
            }}>
                Add Selected Files</div>
        </div>
    </div>
}

const DisplayFile = memo(({ url,EditMode,MasterID,NodeID,storageRef }: any) => {

    const [fileType,setfileType] = useState<string>("default")

    const getFileType = async () => {
        try {
            const storage = getStorage(app)
            const metadata = await getMetadata(ref(storage,storageRef)); // Fetch the file metadata
            const mimeType = metadata.contentType; // MIME type is in contentType

            console.log(mimeType,"mime")
    
            if (mimeType) {
                if (mimeType.includes('image')) return 'image';
                if (mimeType.includes('pdf')) return 'pdf';
                if (mimeType.includes('audio')) return 'audio';
                if (mimeType.includes('video')) return 'video';
                if (mimeType.includes('word') || mimeType.includes('excel')) return 'document';
            }
    
            return 'default'; // Fallback to default if no match
        } catch (error) {
            console.error("Error fetching metadata:", error);
            return 'default'; // Fallback in case of an error
        }
    };

    useEffect(() => {
        const fetchFileType = async () => {
            setfileType(await getFileType());
        };
    
        fetchFileType();
    }, []);

    console.log(fileType)

    const DeleteFiles = async () =>{
        try {
            // Extract the file path from the URL
            const storagePath = decodeURIComponent(url.split("/o/")[1].split("?")[0]);
    
            // Initialize Firebase Storage
            const storage = getStorage(app);
            const db = getDatabase(app)
    
            // Create a reference to the file
            const fileRef = ref(storage, storagePath);
    
            // Delete the file
            await set(refdb(db, `InvestigationNodesFilesStatus/${MasterID}/${NodeID}`), "uploading")
            await deleteObject(fileRef);
            await set(refdb(db, `InvestigationNodesFilesStatus/${MasterID}/${NodeID}`), "uploaded")
            console.log("File deleted successfully!");
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    }

    return <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around',alignItems:'center',width:'150px' }}>
        {fileType === "image" ? <ZoomablePhoto photo={url} StyleClasses={"formular-img-tree"}/> : <Unsupported url={url} additionalStyleClass="unsupported-files-overwrite"/>}
        {EditMode?<button 
            className="docevent" 
            style={{ height: '30px', width: '30px' }} 
            onClick={DeleteFiles}
            ><TiDocumentDelete /></button>:<></>}
        </div>

})

const ResourceButton = ({ NodeID, MasterID, uid, NodeFullPath,EditMode,status }: any) => {

    const [files, setFiles] = useState<{url:string,stgref:string}[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [addFile, setaddFile] = useState<boolean>(false)
    const [openFiles, setopenFiles] = useState<boolean>(false)

    console.log(files)

    useEffect(() => {

        const db = getDatabase(app)
        const unsub = onValue(refdb(db, `InvestigationNodesFilesStatus/${MasterID}/${NodeID}`), snapshot => {
            const status = snapshot.val()
            if (status === "uploaded")
                fetchFiles()
        })

        const fetchFiles = async () => {
            setLoading(true);
            const storage = getStorage(app);
            const folderRef = ref(storage, `InvestigationsStorage/${MasterID}/${NodeID}`);

            try {
                const result = await listAll(folderRef);
                const urls = await Promise.all(
                    result.items.map(async (itemRef) => {return {url:await getDownloadURL(itemRef),stgref:itemRef.fullPath}})
                );
                setFiles(urls);
            } catch (error) {
                console.error("Error fetching files:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();

        return () => unsub()
    }, [NodeID]);

    console.log(addFile)


    return <div>
        {addFile ? <AddFilePopUp onClose={()=>{setaddFile(false)}} NodeID={NodeID} WhoDidTheChange={uid} MasterID={MasterID} NodeFullPath={NodeFullPath} /> : <></>}
        <div onClick={() => { setopenFiles(!openFiles) }} className="resource-button">
            <FaFolder />
        </div>
        <div className={`resources-container ${openFiles ? "expanded" : "noshow"}`}>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="loader"></div></div>
            ) : (
                <div className="resource-files">
                    {files.map((fileInfo) => {
                        return <DisplayFile url={fileInfo.url} storageRef={fileInfo.stgref} EditMode={EditMode} MasterID={MasterID} NodeID={NodeID}/>
                    })}
                    {status==="doctor"?<div onClick={() => { setaddFile(true) }} className="add-files-button">
                        <HiOutlineDocumentAdd />
                    </div>:<></>}
                </div>
            )}
        </div>
    </div>


}

export default ResourceButton