import { getDownloadURL, getStorage, listAll, ref } from "firebase/storage"
import { useEffect, useRef, useState } from "react"
import { app } from "../../../App"
import { IoMdArrowBack } from "react-icons/io";
import { get, getDatabase, onValue, push, ref as refdb, set } from "firebase/database";
import { SiGoogledocs } from "react-icons/si";
import Modal from 'react-modal';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { VscGitPullRequestGoToChanges } from "react-icons/vsc";
import { TiDocumentDelete } from "react-icons/ti";
import { TiDocumentAdd } from "react-icons/ti";
import handleFileChange from "../EditDependencies/changeFileComponent";
import StorageUniversalDeletion from "../StorageUniversalDeletion";
import AddingNewPhotos from "../EditDependencies/AddingNewPhotosPopUp";
import { toast } from "react-toastify";
import { HiDocumentSearch } from "react-icons/hi";
import PopUpScrapeDoc from "../../detectRetetaText/PopUpScrapeDoc";
import HostContainer from "./HostContainer";



interface doc {
    url: string;
    path: string;
}

Modal.setAppElement('#root');

const ZoomablePhoto = ({ photo, alt = 'Couldn`t load', StyleClasses }: any) => {

    const [isOpen, setIsOpen] = useState(false); // State to track modal visibility
    const [aspectRatio, setAspectRatio] = useState<number>(1); // State to hold the aspect ratio
    const [containerStyle, setContainerStyle] = useState({ width: "0px", height: "0px" });

    //this is to display the zoom in popup photo using a react-zoom-pan-pitch library

    useEffect(() => {
        const handleResize = () => {
            const vw = window.innerWidth * 0.7;
            const vh = window.innerHeight * 0.7;

            if (vw / vh > aspectRatio) {
                // Constrain by height
                setContainerStyle({
                    width: `${vh * aspectRatio}px`,
                    height: `${vh}px`,
                });
            } else {
                // Constrain by width
                setContainerStyle({
                    width: `${vw}px`,
                    height: `${vw / aspectRatio}px`,
                });
            }
        };

        handleResize(); // Call once initially
        window.addEventListener("resize", handleResize); // Adjust on window resize

        return () => window.removeEventListener("resize", handleResize); // Cleanup listener
    }, [aspectRatio]);


    useEffect(() => {
        const getAspectRatio = () => {
            const img = new Image();
            img.src = photo;

            img.onload = () => {
                // Once the image is loaded, get the width and height
                const aspRatio = img.width / img.height;
                setAspectRatio(aspRatio)
            };

            img.onerror = (err) => {
                console.error('Failed to load image:', err);
            };
        };

        getAspectRatio()
    }, [photo]);

    // Function to open the modal
    const openModal = () => setIsOpen(true);

    // Function to close the modal
    const closeModal = () => setIsOpen(false);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Clickable Image */}
            <img
                src={photo}
                alt={alt}
                onClick={openModal}
                className={StyleClasses}
            />

            {/* Modal Popup */}
            <Modal
                isOpen={isOpen}
                onRequestClose={closeModal}
                contentLabel="Zoomable Image"
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        zIndex: 2000,
                    },
                    content: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        ...containerStyle,
                        padding: '0px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        // Ensure no scrollbars
                    },
                }}
            >
                {/* Zoomable Image in Modal */}
                <TransformWrapper
                    initialScale={1}
                    minScale={1}
                    maxScale={5} // Max zoom level
                    wheel={{ step: 0.1, smoothStep: 0.001 }} // Zoom speed for mouse wheel
                    pinch={{ step: 0.1 }} // Pinch zoom for mobile
                    doubleClick={{ disabled: true }} // Optional: Disable double-click zoom
                    centerOnInit={false} // Disable automatic centering when zooming
                    limitToBounds={true}
                    smooth={true}
                >
                    {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                        <div style={{ position: 'relative', cursor: 'grab', height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <TransformComponent>
                                <img
                                    src={photo}
                                    alt={alt}
                                    style={{
                                        ...containerStyle,
                                        objectFit: 'contain',
                                    }}
                                />
                            </TransformComponent>
                        </div>
                    )}
                </TransformWrapper>
            </Modal>
        </div>
    );
};

const HostStatus = ({isActive}:any) =>{

    //the host status that is either red or green if unactive, active respectively
    return <div className={`host-status ${isActive?"active-host":"inactive-host"}`}>
        {isActive?"Host Active":"Host Inactive"}
    </div>
}

const PreviewSelectedRecord = ({ path, onBackClick, EditStatus, DeleteStatus, doctorUID, whoisee, whoami }: any) => {

    const [ReteteURI, changeReteteURI] = useState<doc[]>([])//recipes files
    const [FormularURI, changeFormularURI] = useState<doc[]>([])//medical docs files
    const [metadata, changemetadata] = useState<any>({})//metadata
    const [DocStatus, setDocStatus] = useState<string | null>("")//the status of the docs 
    const [loadingData, setloadingData] = useState<boolean>(true)//if they are loading

    //who created the docs
    const [OwnerFirstName, setOwnerFirstName] = useState<string>("")
    const [OwnerLastName, setOwnerLastName] = useState<string>("")

    const InputRef = useRef<any>(null)
    const docsContainerRef = useRef<any>(null)

    //used for delete and change functionalities to know what to delete
    const [EventPath, setEventPath] = useState<string>("")
    const [AddMoreShow, setAddMoreShow] = useState<boolean>(false)

    //for scraper a button near every recipes
    const [OpenScraperPopUp, setOpenScraperPopUp] = useState<boolean>(false)
    const [ScrapeURL, setScrapeURL] = useState<string>("")

    //if its hosted to change the "HostStatus" appearance
    const [isDocHosted,setisDocHosted] = useState<boolean>()

    useEffect(()=>{
        //a listener for the host to get back constant data
        const db = getDatabase()
        const unsub = onValue(refdb(db,`HostedReferences/HostRef/${path}`),snapshot=>{
            setisDocHosted(snapshot.exists())
        })

        return ()=>unsub()
    },[])

    useEffect(() => {
        //get the one who created the whole doc
        const db = getDatabase(app)
        const fetchname = async () => {
            setOwnerFirstName((await get(refdb(db, `users/${metadata.createdBy}/profile/FirstName`))).val())
            setOwnerLastName((await get(refdb(db, `users/${metadata.createdBy}/profile/LastName`))).val())
        }
        if (metadata.createdBy)
            fetchname()
    }, [metadata])

    const [openRetete, setopenRetete] = useState<boolean>(true)

    useEffect(() => {
        //if the Docstatus is null its been deleted and so it kicks you out
        if (DocStatus === null)
            onBackClick()
    }, [DocStatus])

    useEffect(() => {
        //listens for changes in the status of the doc to create a loading screen if anythign happens
        const db = getDatabase(app)
        const unsub = onValue(refdb(db, "MedicalDocsStatus/" + path), snapshot => {
            setDocStatus(snapshot.val())
        })
        return () => unsub()
    }, [])

    useEffect(() => {
        //this is when editing and the doc was not created by you and you are a doctor, doctors cant edit docs that are not created by them
        if ((EditStatus || DeleteStatus) &&
            doctorUID &&
            metadata.createdBy &&
            doctorUID !== metadata.createdBy) {
            toast("can't edit document without ownership")
            onBackClick()
        }
    }, [metadata, doctorUID, EditStatus, DeleteStatus])

    useEffect(() => {

        const storage = getStorage(app)

        const fetchData = async () => {
            try {//just fetches every photo and metadata
                const metadataURL = await getDownloadURL(ref(storage, `${path}/metadata`))

                try {
                    const response = await fetch(metadataURL)
                    changemetadata(await response.json())

                    let res = await listAll(ref(storage, `${path}/FormularPhotos`))//fetch the medical photos
                    let promises = res.items.map(async (item) => {
                        return {
                            url: await getDownloadURL(ref(storage, item.fullPath)),
                            path: item.fullPath,
                        }
                    })
                    changeFormularURI(await Promise.all(promises))

                    res = await listAll(ref(storage, `${path}/RetetePhotos`))//fetch the recipes photos
                    promises = res.items.map(async (item) => {
                        return {
                            url: await getDownloadURL(ref(storage, item.fullPath)),
                            path: item.fullPath,
                        }
                    })
                    changeReteteURI(await Promise.all(promises))


                } catch (err) {
                    console.error(err)
                }
            } catch (err) {
                console.error(err)
            }
        }
        if (DocStatus === "uploaded") {
            fetchData()//every time the doc is changed it loads the entire folder of files used in displaying the medical docs
            //kinda ineficient but i cant know what was changed unless i somehow program a feedback to load certain things back
            setloadingData(false)//not loading
        }
        else
            setloadingData(true)//is loading or corupted
    }, [DocStatus, path, setloadingData])

    const handleFileSelect = (event: any) => {
        const file = event.target.files[0]; // Get the selected file

        if (file) {//when changing files
            handleFileChange(file, EventPath)
            console.log("entered", file.name)
        }
    };

    const EditButtonPress = (path: string) => {
        const db = getDatabase(app)
        push(refdb(db, `users/${whoisee}/notifs`), {//sends a message yes it will be sent event if you dont accually change the doc and manually cancel the choosing of the file
            date: new Date().toString(),
            from: whoami,
            new: true,
            text: `${metadata.nameDoc} was edited by `,
            type: "EditDocMsg"
        })
        setEventPath(path)
        if (InputRef.current)
            InputRef.current.click()//pop up the select files popup built in 
    }

    const DeleteButtonPress = async (pathDeletion: string) => {
        //the deletion of a file
        const db = getDatabase(app)
        try {
            await push(refdb(db, `users/${whoisee}/notifs`), {//send message
                date: new Date().toString(),
                from: whoami,
                new: true,
                text: `${metadata.nameDoc} was edited by `,
                type: "EditDocMsg"
            })
            await set(refdb(db, "MedicalDocsStatus/" + path), "loading")//make the doc loading to refresh the page
            await StorageUniversalDeletion(pathDeletion)//delete the file
        } catch (err) {
            console.error(err)
            await set(refdb(db, "MedicalDocsStatus/" + path), "failed")
        }
        await set(refdb(db, "MedicalDocsStatus/" + path), "uploaded")//make the files viewable again
    }

    const onCloseScraper = () => {
        setOpenScraperPopUp(false)//function to close scraper
    }

    //the first few lines there are a lot of popups 
    //the other lines are just the display of the photos acompanied by the delete/change or search buttons depending on the type of photo, medical document related or recipes
    return <div>
        {loadingData ? <div>
            <div className="loader"></div>
        </div> :
            <div className="all-img-container" ref={docsContainerRef}>
                {AddMoreShow && EditStatus && <AddingNewPhotos path={EventPath} onClose={() => { setAddMoreShow(false) }} />}
                {OpenScraperPopUp && <PopUpScrapeDoc onClose={onCloseScraper} url={ScrapeURL} language={metadata.DocLanguage}/>}
                {doctorUID === ""?<HostContainer path={path}/>:<></>}
                <HostStatus isActive={isDocHosted}/>
                <input type="file" onChange={handleFileSelect} ref={InputRef} style={{ display: 'none' }} />
                <button onClick={onBackClick} className="back-btn"><IoMdArrowBack /></button>
                <div className="metadata">
                    <div className="title">{metadata.nameDoc}</div>
                    <div className="creator">{OwnerFirstName + " " + OwnerLastName}</div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                        <div className="time">Creation Time: {metadata.creationHour + ':' + metadata.creationMinute}</div>
                        <div className="date">Creation Date: {metadata.creationMonth + '.' + metadata.creationDay + '.' + metadata.creationYear}</div>
                    </div>
                </div>
                <div className="formulars-container">
                    {FormularURI.map((Doc: doc) => {
                        return <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <div className="frame">
                                <ZoomablePhoto photo={Doc.url} StyleClasses={"formular-img"} />
                            </div>
                            {EditStatus ? <button className="docevent" onClick={() => { EditButtonPress(Doc.path) }}><VscGitPullRequestGoToChanges /></button> : <></>}
                            {DeleteStatus ? <button className="docevent" onClick={() => { DeleteButtonPress(Doc.path) }}><TiDocumentDelete /></button> : <></>}
                        </div>
                    })}
                    {EditStatus ? <button className="docevent" onClick={() => {
                        setEventPath(path + "/FormularPhotos")
                        setAddMoreShow(true)
                    }}><TiDocumentAdd /></button> : <></>}
                </div>
                <div className="retete-container">
                    <button className="retete-btn" onClick={() => { setopenRetete(!openRetete) }}><SiGoogledocs /></button>
                    <div className={`retete ${openRetete ? "open-retete" : "close-retete"}`}>
                        {ReteteURI.map((Doc: doc) => {
                            return <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <ZoomablePhoto photo={Doc.url} StyleClasses={"reteta-img"} />
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                                    {EditStatus ? <button className="docevent" style={{ height: '30px', width: '30px' }} onClick={() => { EditButtonPress(Doc.path) }}><VscGitPullRequestGoToChanges /></button> : <></>}
                                    {DeleteStatus ? <button className="docevent" style={{ height: '30px', width: '30px' }} onClick={() => { DeleteButtonPress(Doc.path) }}><TiDocumentDelete /></button> : <></>}
                                    <button style={{ height: '30px', width: '30px' }} className="docevent" onClick={() => {
                                        setOpenScraperPopUp(true)
                                        setScrapeURL(Doc.url)
                                    }}><HiDocumentSearch /></button>
                                </div>
                            </div>
                        })}
                        {EditStatus ? <button className="docevent" onClick={() => {
                            setEventPath(path + "/RetetePhotos")
                            setAddMoreShow(true)
                        }}><TiDocumentAdd /></button> : <></>}
                    </div>
                </div>
            </div>
        }
    </div>
}

export default PreviewSelectedRecord