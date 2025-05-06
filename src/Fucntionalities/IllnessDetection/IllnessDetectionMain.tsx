import { getDatabase, onValue, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { app } from "../../App"
import { getDownloadURL, getStorage, ref as refstg } from "firebase/storage"
import FirstHalfPhoto from "./FirstHalfPhoto"
import SecondHalfDiagnostic from "./SecondHalfDiagnostic"
import './IllnessDesign.css'
import { SaveFileAndResults } from "./SaveHistory"
import { MdArrowLeft } from "react-icons/md";
import ZoomablePhoto from "../MedicalDocuments/dependencies/ZoomableImage"

export const IndexToIllness = ['Atelectasis', 'Cardiomegaly', 'Consolidation', 'Edema', 'Effusion', 'Emphysema', 'Fibrosis', 'Hernia', 'Infiltration', 'Mass', 'No Finding', 'Nodule', 'Pleural_Thickening', 'Pneumonia', 'Pneumothorax'];

const HistoryOfScans = ({ uid }: any) => {

    const [History, setHistory] = useState<{ photoURL: string, PredictedIllnesses: any[], Time: string }[]>([])
    const [OpenStatus, setOpenStatus] = useState<boolean>(true)

    useEffect(() => {

        const db = getDatabase(app)
        const storage = getStorage(app)
        const fetchPhotoAndResults = async (IDRequest: string) => {
            const storagePath = `IllnessDetectorRequests/${uid}/${IDRequest}`
            try {
                // References for the photo and JSON
                const photoRef = refstg(storage, `${storagePath}/photo`); // Assume photo filename
                const jsonRef = refstg(storage, `${storagePath}/data.json`); // Assume JSON filename

                // Get download URLs
                const photoUrl = await getDownloadURL(photoRef);
                const jsonUrl = await getDownloadURL(jsonRef);

                // Fetch the JSON content
                const response = await fetch(jsonUrl);
                if (!response.ok) {
                    throw new Error("Failed to fetch JSON file.");
                }
                const jsonData = await response.json();

                // Validate and extract data
                const results = jsonData.Results ?? []; // Fallback to an empty list if "Results" is missing
                const time: string = jsonData.Timestamp ?? "Unknown time"; // Fallback to "Unknown time" if "Time" is missing

                if (!Array.isArray(results)) {
                    throw new Error("'Results' in JSON is not a list.");
                }

                return {
                    photoURL: photoUrl,
                    PredictedIllnesses: results,
                    Time: time,
                };
            } catch (error) {
                console.error("Error fetching photo and JSON:", error);
                throw error;
            }
        };

        const unsub = onValue(ref(db, `users/${uid}/IllnessRequests`), async snapshot => {
            if (snapshot.exists()) {
                const List = Object.keys(snapshot.val()).map((key: string) => { return snapshot.val()[key] })
                const promises = List.map(async (IDRequest) => { return await fetchPhotoAndResults(IDRequest) })
                setHistory(await Promise.all(promises))
            }
            else
                setHistory([])
        })

        return () => unsub()

    }, [uid])


    return <div className={`history-container ${OpenStatus ? "close-history" : ""}`}>
        <div className="open-history-btn" onClick={() => { setOpenStatus(!OpenStatus) }}><MdArrowLeft /></div>
        <div className="elements-of-history">
            <h4 style={{ padding: "5px", textAlign: 'center', fontSize: '1.2rem' }}>History</h4>
            {
                History.map((Instance) => {
                    return <div className="whole-record">
                        <ZoomablePhoto photo={Instance.photoURL} StyleClasses="history-photo" />
                        <div className="illnesses">
                            {
                                Instance.PredictedIllnesses.map((truthValue, index) => {
                                    if (!truthValue) return <></>
                                    return <div className="illness">{IndexToIllness[index]}</div>
                                })
                            }
                        </div>
                        <div className="time-of-record">{new Date(Instance.Time).toLocaleDateString()}</div>
                    </div>
                })
            }
        </div>
    </div>
}

const IllnessDetectionMain = ({ uid }: any) => {

    const [PhotoFile, setPhotoFile] = useState<File | null>(null)
    const [PhotoIsLoading, setPhotoIsLoading] = useState<boolean>(false)
    const [Results, setResults] = useState<boolean[] | null>(null)

    useEffect(()=>{
        if(PhotoFile && Results)
            SaveFileAndResults(uid,PhotoFile,Results)
    },[Results,PhotoFile])

    const [showWarning, setShowWarning] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true); // Start the fade-out effect after 4 seconds
        }, 5000); // 4 seconds

        // Cleanup the timeout when the component unmounts
        return () => clearTimeout(timer);
    }, []);

    // After the fade-out is complete, hide the element from the DOM
    useEffect(() => {
        if (fadeOut) {
            const timer = setTimeout(() => {
                setShowWarning(false); // Remove from DOM after the fade-out transition
            }, 500); // Delay matches the fade-out duration (0.5s)
            return () => clearTimeout(timer);
        }
    }, [fadeOut]);

    return <div className="main-detection-container">
        <HistoryOfScans uid={uid} />
        <FirstHalfPhoto PhotoFile={PhotoFile} setPhotoFile={setPhotoFile} PhotoIsLoading={PhotoIsLoading} setPhotoIsLoading={setPhotoIsLoading} setResults={setResults} />
        <SecondHalfDiagnostic Illnesses={Results} PhotoFile={PhotoFile} />
        {showWarning && (
                <div className={`warning-message ${fadeOut ? 'fade-out' : 'fade-in'}`}>
                    <p><strong>Warning:</strong> The results provided by this AI model should only be used as suggestions. Please research symptoms and consult a medical professional for an accurate diagnosis.</p>
                </div>
            )}
    </div>
}

export default IllnessDetectionMain