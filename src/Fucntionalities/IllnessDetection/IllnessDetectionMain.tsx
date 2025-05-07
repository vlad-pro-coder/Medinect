import { getDatabase, onValue, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { app } from "../../App"
import { getDownloadURL, getStorage, ref as refstg } from "firebase/storage"
import FirstHalfPhoto from "./FirstHalfPhoto"
import SecondHalfDiagnostic from "./SecondHalfDiagnostic"
import './IllnessDesign.css'
import { DeleteOldHistory, SaveFileAndResults } from "./SaveHistory"
import { MdArrowLeft } from "react-icons/md";
import ZoomablePhoto from "../MedicalDocuments/dependencies/ZoomableImage"

export const IndexToIllness = ['Atelectasis', 'Cardiomegaly', 'Consolidation', 'Edema', 'Effusion', 'Emphysema', 'Fibrosis', 'Hernia', 'Infiltration', 'Mass', 'No Finding', 'Nodule', 'Pleural_Thickening', 'Pneumonia', 'Pneumothorax'];

const GetDistanceOfDays = (LastDate:string) =>{
    const givenDate = new Date(LastDate); // Parse the input date(iso)
    const today = new Date(); // Get today's date
    const timeDifference = today.getTime() - givenDate.getTime(); // Difference in milliseconds
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert to days
    return daysDifference;
}

interface HistoryRecord{
    photoURL: string;
    PredictedIllnesses: any[];
    Time: string;
    RequestID:string;
}

const HistoryOfScans = ({ uid }: any) => {

    const [History, setHistory] = useState<HistoryRecord[]>([])
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
                    RequestID:IDRequest,
                };
            } catch (error) {
                console.error("Error fetching photo and JSON:", error);
                throw error;
            }
        };

        const handleHistoryCleanup = async (data: any, uid: string) => {
            try {
                const List = Object.keys(data).map((key: string) => data[key]);
                
                // Fetch photo and results concurrently
                const promises = List.map((IDRequest) => fetchPhotoAndResults(IDRequest));
                const History = await Promise.all(promises);
                
                // Filter out history older than a day
                const HistoryDue = History.filter((elem: HistoryRecord) => GetDistanceOfDays(elem.Time) > 0);
                console.log("Filtered Old History:", HistoryDue);
                
                // Delete old history
                if (HistoryDue.length > 0) {
                    await DeleteOldHistory(HistoryDue.map((elem: HistoryRecord) => elem.RequestID), uid);
                }
                
                setHistory(History); // Update state
            } catch (error) {
                console.error("Error in handling history cleanup:", error);
            }
        };

        const unsub = onValue(ref(db, `users/${uid}/IllnessRequests`),snapshot => {
            if (snapshot.exists())
                handleHistoryCleanup(snapshot.val(), uid); // Separate logic into a function
            else 
                setHistory([]);
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