import { get, getDatabase, onValue, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { app } from "../../App"
import { FaPlus } from "react-icons/fa";
import NewInvestigationPopUp from "./NewInvestigationPopUp";
import { ImExit } from "react-icons/im";
import { DeleteInvestigation, LeaveInvestigation } from "./InvestigationFirebaseFuncs";

interface Investigation {
    InvestigationName: string;
    LastEdit: string;
    DateOfCreation: string;
    DoctorParticipants: string;
    Pacient: string;
    InvestigationID: string;//also the root node id
}

const DisplayInvestigations = ({ InvestigationMetadata, status, currentInvestigation, setcurrentInvestigation, PacientNames, uid }: any) => {

    const [IsHovered, setIsHovered] = useState<boolean>(false)

    if (status == "pacient")
        return <div className="investigation-with-leave"
        >
            <div
                key={InvestigationMetadata.InvestigationID}
                className={`investigation-item ${currentInvestigation === InvestigationMetadata.InvestigationID ? 'active' : ''} ${!InvestigationMetadata.DoctorParticipants ? 'hover-over-width' : 'not-hover-over-width'}`}
                onClick={() => { setcurrentInvestigation(InvestigationMetadata.InvestigationID) }}
            >
                <div className="investigation-name">
                    {InvestigationMetadata.InvestigationName}
                </div>
                <div className="investigation-summary">
                    <div>Created: {new Date(InvestigationMetadata.DateOfCreation).toLocaleDateString()} {new Date(InvestigationMetadata.DateOfCreation).toLocaleTimeString()}</div>
                    <div>For: {PacientNames[InvestigationMetadata.Pacient]}</div>
                </div>
            </div>
            {!InvestigationMetadata.DoctorParticipants ? <button
                className="docevent"
                style={{ height: '40px', width: '40px', backgroundColor: "#EF4444" }}
                onClick={() => { DeleteInvestigation(InvestigationMetadata.InvestigationID) }}
            ><ImExit /></button> : <></>}
        </div>

    return <div className="investigation-with-leave"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
        <div
            key={InvestigationMetadata.InvestigationID}
            className={`investigation-item ${currentInvestigation === InvestigationMetadata.InvestigationID ? 'active' : ''} ${IsHovered ? 'hover-over-width' : 'not-hover-over-width'}`}
            onClick={() => { setcurrentInvestigation(InvestigationMetadata.InvestigationID) }}
        >
            <div className="investigation-name">
                {InvestigationMetadata.InvestigationName}
            </div>
            <div className="investigation-summary">
                <div>Created: {new Date(InvestigationMetadata.DateOfCreation).toLocaleDateString()} {new Date(InvestigationMetadata.DateOfCreation).toLocaleTimeString()}</div>
                <div>For: {PacientNames[InvestigationMetadata.Pacient]}</div>
            </div>
        </div>
        {IsHovered ? <button
            className="docevent"
            style={{ height: '40px', width: '40px', backgroundColor: "#EF4444" }}
            onClick={() => { LeaveInvestigation(InvestigationMetadata.InvestigationID, uid) }}
        ><ImExit /></button> : <></>}
    </div>
}

const InvestigationsPreview = ({ uid, status, setcurrentInvestigation, currentInvestigation }: any) => {

    const [InvestigationsMetadata, setInvestigationsMetadata] = useState<Investigation[]>([])

    const [IsOpenAddInvestigationPopUp, setIsOpenAddInvestigationPopUp] = useState<boolean>(false)
    const [PacientNames, setPacientNames] = useState<{ [key: string]: string }>({})

    useEffect(() => {
        const db = getDatabase(app);
        let unsub1: any = () => { }; // Default no-op function for cleanup

        const fetchInvestigationsMetadata = async (investigations: string[]) => {
            const investigationMetadataPromises = investigations.map(async (InvestigationID) => {
                const refPath = ref(db, `Investigations/${InvestigationID}`);
                const investigationSnapshot = await get(refPath);
                if (investigationSnapshot.exists()) {
                    const investigationData = investigationSnapshot.val();
                    investigationData.InvestigationID = InvestigationID; // Include ID for filtering later
                    return investigationData;
                }
                return null;
            });

            // Resolve all metadata fetches and filter out null values
            const resolvedMetadata = (await Promise.all(investigationMetadataPromises)).filter(Boolean);
            setInvestigationsMetadata(resolvedMetadata);
        };

        try {
            unsub1 = onValue(ref(db, `users/${uid}/ParticipatingInvestigations`), (snapshot) => {
                if (snapshot.exists()) {
                    const investigations = Object.keys(snapshot.val()).map((key) => snapshot.val()[key]);
                    fetchInvestigationsMetadata(investigations); // Fetch metadata asynchronously
                } else {
                    setInvestigationsMetadata([]); // Clear metadata if no investigations
                }
            });
        } catch (err) {
            console.log("Cannot load investigations or metadata", err);
        }

        return () => {
            // Cleanup the listener
            if (unsub1) unsub1();
        };
    }, [uid]); // Only depends on `uid`

    console.log(InvestigationsMetadata)

    useEffect(() => {
        const db = getDatabase(app)

        const fetchdata = async (pacientID: string): Promise<string> => {
            const firstName = await get(ref(db, `users/${pacientID}/profile/FirstName`)).then(snapshot => snapshot.val());
            const lastName = await get(ref(db, `users/${pacientID}/profile/LastName`)).then(snapshot => snapshot.val());
            return `${firstName} ${lastName}`;
        };

        const fetchAllNames = async (InvestigationsMetadata: { Pacient: string }[]) => {
            const namesPacient: { [key: string]: string } = {};
            // Create an array of promises
            const fetchPromises = InvestigationsMetadata.map(async (Investigation) => {
                const name = await fetchdata(Investigation.Pacient);
                namesPacient[Investigation.Pacient] = name;
            });

            // Wait for all promises to resolve
            await Promise.all(fetchPromises);

            // Return the populated namesPacient object
            return namesPacient;
        };

        // Example usage:
        (async () => {
            setPacientNames(await fetchAllNames(InvestigationsMetadata))
        })();

    }, [InvestigationsMetadata])

    if (status == "pacient")
        return (
            <div className="investigation-list">
                {InvestigationsMetadata.length === 0 ? (
                    <div className="no-investigations">
                        No investigations in progress
                    </div>
                ) : (
                    InvestigationsMetadata.map((InvestigationMetadata: Investigation) => {
                        return (
                            <DisplayInvestigations
                                InvestigationMetadata={InvestigationMetadata}
                                status={status}
                                currentInvestigation={currentInvestigation}
                                setcurrentInvestigation={setcurrentInvestigation}
                                PacientNames={PacientNames}
                                uid={uid}
                            />
                        );
                    })
                )}
            </div>
        );

    return <div className="investigation-list">
        <div className="add-investigation" onClick={() => { setIsOpenAddInvestigationPopUp(true) }}>
            <FaPlus /> Add Investigation
        </div>
        {IsOpenAddInvestigationPopUp && (
            <NewInvestigationPopUp
                uid={uid}
                onClose={() => { setIsOpenAddInvestigationPopUp(false) }}
            />
        )}
        {InvestigationsMetadata.length === 0 ? (
            <div className="no-investigations">
                No investigations in progress
            </div>
        ) : (
            InvestigationsMetadata.map((InvestigationMetadata: Investigation) => {
                return (
                    <DisplayInvestigations
                        InvestigationMetadata={InvestigationMetadata}
                        status={status}
                        currentInvestigation={currentInvestigation}
                        setcurrentInvestigation={setcurrentInvestigation}
                        PacientNames={PacientNames}
                        uid={uid}
                    />
                );
            })
        )}
    </div>
}

export default InvestigationsPreview