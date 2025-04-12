import { getDownloadURL, getStorage, listAll, ref } from "firebase/storage"
import { useEffect, useState, useCallback, useRef, memo } from "react"
import { app } from "../../../App"
import '../design.css'
import PreviewSelectedRecord from "./PreviewSelectedRecordPopup";
import MiniProfileView from "../../Profile/MiniProfileView";
import { endBefore, get, getDatabase, limitToLast, onChildAdded, onChildRemoved, onValue, orderByKey, push, query, ref as refdb, remove, startAfter } from "firebase/database";
import { TiDocumentDelete } from "react-icons/ti";
import StorageUniversalDeletion from "../StorageUniversalDeletion";
import {v4 as uuidv4} from 'uuid'

//the interface for doc previewing
interface DocPrev {
    imgURL: string;
    nameDoc: string;
    CreatedBy: string;
    DocLanguage: string;
    DateOfCreation: string;
    TimeOfCreation: string;
}

const limit = 10//limit per batch

const getDate = () => {
    //same as the storage encoding function it gets the current date and transforms it in a string
    const today = new Date();
    const ss = String(today.getSeconds()).padStart(2, '0');
    const mimi = String(today.getMinutes()).padStart(2, '0');
    const hh = String(today.getHours()).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = String(today.getFullYear())

    return yyyy + mm + dd + hh + mimi + ss;
}

//check for the interface cause instanceOf only checks classes, not useful now
/*class DocPreview implements DocPrev { 
    constructor(
        public imgURL: string,
        public nameDoc: string,
        public CreatedBy: string,
        public DocLanguage: string,
        public DateOfCreation: string,
        public TimeOfCreation: string,
        public fullPath: string,) {}
}*/



const DocumentPreview = memo(({ path, DeleteStatus, EditStatus, doctorUID,whoisee,whoami }: any) => {

    const [Data, setData] = useState<DocPrev | string>("files still loading")//data or message if no data
    const [Status, setStatus] = useState<string>("")

    const loadIndividual = useCallback(async (): Promise<string | DocPrev> => {

        const storage = getStorage(app)

        if (Status === "loading") return "files still loading";//you wont be able to add anything while it is loading to avoid corruption
        if (Status === "failed") return "failed loading"; // Need to add custom logic

        //the metadata for an instance of DocPrev
        let Data: DocPrev = {
            imgURL: "",
            CreatedBy: "",
            DocLanguage: "",
            nameDoc: "",
            DateOfCreation: "",
            TimeOfCreation: "",
        };

        try {
            // load the individual folder with the afferent files
            const resForm = await listAll(ref(storage, `${path}/FormularPhotos`));//medical related photos
            const photoUrl = await getDownloadURL(resForm.items[0]);//get the first one for previewing
            const metadataUrl = await getDownloadURL(ref(storage, `${path}/metadata`));//get the metadata to show details

            const response = await fetch(metadataUrl);
            const metadata = await response.json();

            //return it as a instance of DocPrev to be displayed
            Data = {
                imgURL: photoUrl,
                CreatedBy: metadata.createdBy,
                DocLanguage: metadata.DocLanguage,
                nameDoc: metadata.nameDoc,
                DateOfCreation: `${metadata.creationMonth}.${metadata.creationDay}.${metadata.creationYear}`,
                TimeOfCreation: `${metadata.creationHour}:${metadata.creationMinute}`,
            };
        } catch (error) {
            return "internal error";
        }

        return Data;

    }, [app, path, Status,whoisee])

    useEffect(() => {
        //listener for its state in the database which gives live feedback to what is happening
        const db = getDatabase(app)
        const unsub = onValue(refdb(db, "MedicalDocsStatus/" + path), snapshot => {
            setStatus(snapshot.val())
        })

        return () => unsub()
    }, [path, app,whoisee])

    useEffect(() => {
        //when instance loaded then run loadindividual to get data
        const fetchData = async () => {
            setData(await loadIndividual())
        }
        fetchData()
    }, [Status, path,whoisee])

    const DeleteWholeFormular = async (event: any) => {
        //used for when you are in the delete state
        event.stopPropagation();

        const db = getDatabase(app)
        try {
            if(typeof Data !== "string")//it gives me an error if i dont put this but basically it cant delete a loading file so that is that
                await push(refdb(db,`users/${whoisee}/notifs`),{//send message to the owner
                    date:new Date().toString(),
                    from:whoami,
                    new:true,
                    text:` deleted the document by the name of ${Data.nameDoc}`,
                    type:"DeleteDocMsg"
                })
            await remove(refdb(db, "MedicalDocsStatus/" + path))//delete database reference
            await StorageUniversalDeletion(path)//delete it whole from the storage
        } catch (err) {
            //error
            console.error(err)
        }
    }

    //this is the display bassically it displays a shadowy photo with other infos like who created it when, what title does it have
    return <div>
        {typeof Data !== "string" ? (
            <div style={{ display: 'flex', flexDirection: 'row', position: 'relative' }}>
                {(EditStatus || DeleteStatus) &&
                    doctorUID &&
                    typeof Data !== "string" &&
                    doctorUID !== Data.CreatedBy ? <div className="message-overlay" onClick={(e) => { e.stopPropagation() }}>
                    Don't have access to edit
                </div> : <></>}

                <MiniProfileView uid={Data.CreatedBy} />
                <div className="document-preview-container">
                    <div style={{textAlign:'center'}}>{Data.nameDoc}</div>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div>Creation Date: {Data.DateOfCreation}</div>
                        <div>Creation Time: {Data.TimeOfCreation}</div>
                    </div>
                    <img src={Data.imgURL} alt="Document Preview" className="document-preview-image" />
                    <div className="document-preview-gradient" />
                </div>
                {DeleteStatus &&
                    doctorUID &&
                    typeof Data !== "string" &&
                    doctorUID === Data.CreatedBy ? <button className="docevent" style={{ padding: '0px', marginTop: '25px' }} onClick={DeleteWholeFormular}><TiDocumentDelete /></button> : <></>}
                {DeleteStatus &&
                    doctorUID === "" && typeof Data !== "string" ? <button className="docevent" style={{ padding: '0px', marginTop: '25px' }} onClick={DeleteWholeFormular}><TiDocumentDelete /></button> : <></>}
            </div>
        ) : (
            <div style={{
                height: "450px",
                width: "350px",
                border: "1px solid black",
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '10px',
            }}>
                <div>{Data}</div>
                <div className="loader"></div>
            </div>
        )}
    </div>
})

const PreviewMedicalRecords = ({ doctorUID = "", whoisee, EditStatus, DeleteStatus, SelectedDoc, changeSelectedDoc,whoami }: any) => {

    const [TotalIDs, setTotalIDs] = useState<string[]>([])//the ids of the docs

    const [hasMore, sethasMore] = useState<boolean>(true)//if it dosnt have more dont bother checking and loading anything

    const [lastLoadedKey, setlastLoadedKey] = useState<string | null>(null)//last loaded key to load the next ones
    const loaderRef = useRef<any>(null)
    const timeoutRef = useRef<any>(null);
    const [loading, setLoading] = useState(false);

    const [initialDocs, setinitialDocs] = useState<string[]>([])//the initial batch
    const [newDocs, setnewDocs] = useState<string[]>([])//the new docs they can be added in iregular numbers like 12 they are not affected by the batch limit
    const [oldDocs, setoldDocs] = useState<string[]>([])//when scroling to down it will load old docs in here

    const fetchFileIDs = useCallback(async (): Promise<string[]> => {

        if (loading || !hasMore) return []
        setLoading(true);//to not start multiple "fetchFileIDs" at the same time, it could distroy the logic

        console.log("intrat in fetching")

        let files: string[] = [];

        try {
            const database = getDatabase(app)
            const userFilesRef = refdb(database, `MedicalDocsStatus/users/${whoisee}`);//the docs a user has
            let filesQuery;
            if (lastLoadedKey) {
                // Fetch files ending before the last key 
                filesQuery = query(userFilesRef, orderByKey(), endBefore(lastLoadedKey), limitToLast(limit));
            }
            else { // Fetch initial files 
                filesQuery = query(userFilesRef, orderByKey(), limitToLast(limit));
            }
            const snapshot = await get(filesQuery);//get the files
            snapshot.forEach(childSnapshot => {//storing in my variable
                files.push(childSnapshot.key as string);
            });

            const newLastKey = files[0]//update the lastloadedkey
            if (newLastKey) {
                setlastLoadedKey((prevLastKey) =>
                    !prevLastKey || newLastKey < prevLastKey ? newLastKey : prevLastKey
                );
            }

        } catch (error) {
            console.error(error)
        }
        
        if (files.length < limit)//if the batch is under the limit and not equal it means no more files to load from this point on this function wont work
            sethasMore(false)
        setLoading(false)
        return files;
    }, [loading, setLoading, lastLoadedKey, setlastLoadedKey, hasMore, sethasMore, whoisee, app])

    useEffect(() => {
        //fetch the initial upon getting loaded
        const fetchinitial = async () => {
            setinitialDocs(await fetchFileIDs())
        }
        console.log(whoisee,"in initial")
        fetchinitial()
    }, [whoisee])

    useEffect(() => {
        //observer to see if the element in the whole grid of docs gets seen why the user so to load more files
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && hasMore) {

                    if (timeoutRef.current) clearTimeout(timeoutRef.current);//clears the timeout 

                    const fetcholdIDs = async () => {//fetch the files 
                        const oldIDs = await fetchFileIDs();
                        setoldDocs((prev: string[]) => { return [...prev, ...oldIDs.reverse()] })
                    }

                    timeoutRef.current = setTimeout(() => {//sets a timeout to not make too many requests
                        fetcholdIDs()
                    }, 100);

                }
            },
            { threshold: 1.0 }//when 10% is in the users view
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);//if the loader exists then create the observer with the ref
        }

        return () => {
            //eliminate listeners after the component unloads
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current); // Clean up timeout on unmount
            }
        };
    }, [loaderRef.current, loading, lastLoadedKey, hasMore,whoisee]);

    useEffect(() => {
        //this will listen for newly added docs and when added they are given to use
        const db = getDatabase(app)
        const filesRef = refdb(db, `MedicalDocsStatus/users/${whoisee}`);

        const lastProcessedKey = getDate()

        //the onChildAdded by default first gives out the whole tree which is not ideal we want only the new ones and this solves the problem
        const filteredQuery = query(filesRef, orderByKey(), startAfter(lastProcessedKey));

        const handleNewDocs = (snapshot: any) => {
            const newFileID = snapshot.key;
            setnewDocs((prev: string[]) => [newFileID, ...prev]);
        };

        const unsub = onChildAdded(filteredQuery, handleNewDocs); // Cleanup listener on unmount 

        return () => unsub()// Cleanup listener on unmount 
    }, [whoisee])

    useEffect(() => {
        const db = getDatabase(app)

        //when a doc is deleted it can be in only one of these 3
        //if its not it will return the normal list which is not a problem
        //this doesnt load the whole tree 
        const deletechild = (snapshot: any) => {
            const key = snapshot.key
            setnewDocs((prev: string[]) => {
                return prev.filter(id => { return key !== id })
            })
            setoldDocs((prev: string[]) => {
                return prev.filter(id => { return key !== id })
            })
            setinitialDocs((prev: string[]) => {
                return prev.filter(id => { return key !== id })
            })
        }

        const unsub = onChildRemoved(refdb(db, `MedicalDocsStatus/users/${whoisee}`), deletechild)

        return () => unsub()// Cleanup listener on unmount 

    }, [whoisee])

    useEffect(() => {
        //when one gets updated update every single one
        setTotalIDs([...newDocs, ...initialDocs.slice().reverse(), ...oldDocs])
    }, [initialDocs, newDocs, oldDocs,whoisee])

    const onBackClick = () => {
        changeSelectedDoc("")
    }

    //every doc is displayed here in a 3xinfinity grid
    return <div>
        {SelectedDoc ? <PreviewSelectedRecord path={SelectedDoc} onBackClick={onBackClick} EditStatus={EditStatus} DeleteStatus={DeleteStatus} doctorUID={doctorUID} whoisee={whoisee} whoami={whoami}/> :
            <div className="scrollable-table-container">
                {TotalIDs.map((DocsID: string) => {
                    return <div onClick={() => { changeSelectedDoc(`users/${whoisee}/${DocsID}`) }} id={`users/${whoisee}/${DocsID}`}>
                        <DocumentPreview path={`users/${whoisee}/${DocsID}`} DeleteStatus={DeleteStatus} EditStatus={EditStatus} doctorUID={doctorUID} whoisee={whoisee} key={uuidv4()} whoami={whoami}/>
                    </div>
                })}
                <div ref={loaderRef} style={{ height: "20px" }} />
            </div>
        }
    </div>

}

export default PreviewMedicalRecords
