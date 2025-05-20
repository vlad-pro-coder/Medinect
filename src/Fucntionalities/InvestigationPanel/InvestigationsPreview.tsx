import { get, getDatabase, onValue, ref } from "firebase/database"
import { memo, useEffect, useState } from "react"
import { app } from "../../App"
import { FaPlus } from "react-icons/fa";
import NewInvestigationPopUp from "./NewInvestigationPopUp";
import { ImExit } from "react-icons/im";
import { DeleteInvestigation, LeaveInvestigation } from "./InvestigationFirebaseFuncs";

interface Investigation {
    InvestigationName: string;
    LastEdit: string;
    DateOfCreation: string;
    DoctorParticipants: string[];
    Pacient: string;
    InvestigationID: string;//also the root node id
}

const DisplayInvestigations = memo(({ InvestigationID, status, currentInvestigation, setcurrentInvestigation, PacientNames, uid }: any) => {

    const [IsHovered, setIsHovered] = useState<boolean>(false)
    const [Metadata, setMetadata] = useState<Investigation>({
        InvestigationName: "",
        LastEdit: "",
        DateOfCreation: "",
        DoctorParticipants: [],
        Pacient: "",
        InvestigationID: ""//also the root node id
    })

    useEffect(() => {

        const db = getDatabase()

        const fetchdata = async (pacientID: string): Promise<string> => {
            const firstName = await get(ref(db, `users/${pacientID}/profile/FirstName`)).then(snapshot => snapshot.val());
            const lastName = await get(ref(db, `users/${pacientID}/profile/LastName`)).then(snapshot => snapshot.val());
            return `${firstName} ${lastName}`;
        };

        const unsub = onValue(ref(db, `Investigations/${InvestigationID}`), async snapshot => {
            if (snapshot.exists()) {
                let temp: Investigation = snapshot.val()
                temp.Pacient = await fetchdata(temp.Pacient)
                setMetadata(temp)
            }
            else
                setMetadata({
                    InvestigationName: "",
                    LastEdit: "",
                    DateOfCreation: "",
                    DoctorParticipants: [],
                    Pacient: "",
                    InvestigationID: ""//also the root node id
                })
        })

        return () => unsub()

    }, [uid, InvestigationID])

    if (status == "pacient")
        return <div className="investigation-with-leave"
        >
            <div
                key={Metadata.InvestigationID}
                className={`investigation-item ${currentInvestigation === Metadata.InvestigationID ? 'active' : ''} ${!Metadata.DoctorParticipants ? 'hover-over-width' : 'not-hover-over-width'}`}
                onClick={() => { setcurrentInvestigation(Metadata.InvestigationID) }}
            >
                <div className="investigation-name">
                    {Metadata.InvestigationName}
                </div>
                <div className="investigation-summary">
                    <div>Created: {new Date(Metadata.DateOfCreation).toLocaleDateString()} {new Date(Metadata.DateOfCreation).toLocaleTimeString()}</div>
                    <div>For: {Metadata.Pacient}</div>
                </div>
            </div>
            {!Metadata.DoctorParticipants ? <button
                className="docevent"
                style={{ height: '40px', width: '40px', backgroundColor: "#EF4444" }}
                onClick={() => { DeleteInvestigation(Metadata.InvestigationID) }}
            ><ImExit /></button> : <></>}
        </div>

    return <div className="investigation-with-leave"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
        <div
            key={Metadata.InvestigationID}
            className={`investigation-item ${currentInvestigation === Metadata.InvestigationID ? 'active' : ''} ${IsHovered ? 'hover-over-width' : 'not-hover-over-width'}`}
            onClick={() => { setcurrentInvestigation(Metadata.InvestigationID) }}
        >
            <div className="investigation-name">
                {Metadata.InvestigationName}
            </div>
            <div className="investigation-summary">
                <div>Created: {new Date(Metadata.DateOfCreation).toLocaleDateString()} {new Date(Metadata.DateOfCreation).toLocaleTimeString()}</div>
                <div>For: {Metadata.Pacient}</div>
            </div>
        </div>
        {IsHovered ? <button
            className="docevent"
            style={{ height: '40px', width: '40px', backgroundColor: "#EF4444" }}
            onClick={() => { LeaveInvestigation(Metadata.InvestigationID, uid) }}
        ><ImExit /></button> : <></>}
    </div>
})

const InvestigationsPreview = ({ uid, status, setcurrentInvestigation, currentInvestigation }: any) => {

    const [Investigations, setInvestigations] = useState<string[]>([])

    const [IsOpenAddInvestigationPopUp, setIsOpenAddInvestigationPopUp] = useState<boolean>(false)

    useEffect(() => {
        const db = getDatabase(app);
        let unsub1: any = () => { }; // Default no-op function for cleanup

        try {
            unsub1 = onValue(ref(db, `users/${uid}/ParticipatingInvestigations`), (snapshot) => {
                if (snapshot.exists()) {
                    console.log(snapshot.val(), 'check for refresh')
                    const investigations = Object.keys(snapshot.val()).map((key) => snapshot.val()[key]);
                    setInvestigations(investigations)
                } else {
                    setInvestigations([]); // Clear metadata if no investigations
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

    if (status == "pacient")
        return (
            <div className="investigation-list">
                {Investigations.length === 0 ? (
                    <div className="no-investigations">
                        No investigations in progress
                    </div>
                ) : (
                    Investigations.map((InvestigationID: string) => {
                        return (
                            <DisplayInvestigations
                                InvestigationID={InvestigationID}
                                status={status}
                                currentInvestigation={currentInvestigation}
                                setcurrentInvestigation={setcurrentInvestigation}
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
        {Investigations.length === 0 ? (
            <div className="no-investigations">
                No investigations in progress
            </div>
        ) : (
            Investigations.map((InvestigationID: string) => {
                return (
                    <DisplayInvestigations
                        InvestigationID={InvestigationID}
                        status={status}
                        currentInvestigation={currentInvestigation}
                        setcurrentInvestigation={setcurrentInvestigation}
                        uid={uid}
                    />
                );
            })
        )}
    </div>
}

export default InvestigationsPreview