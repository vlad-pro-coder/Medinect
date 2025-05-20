import { get, getDatabase, onValue, ref } from "firebase/database"
import { memo, useEffect, useState } from "react"
import { app } from "../../App"
import { getDownloadURL, getStorage, ref as storageref } from "firebase/storage"
import { RxCross2 } from "react-icons/rx";
import { NewInvestigationGenerator } from "./InvestigationFirebaseFuncs";
import { toast } from "react-toastify";

const PacientPreview = memo(({ uid, setSelectedPacient, expandedPacientUid, setExpandedPacientUid }: any) => {
    const [photo, setphoto] = useState<string>("")
    const [fullname, setfullname] = useState<string>("")
    const [contactNumber, setcontactNumber] = useState<string>("")

    useEffect(() => {
        const storage = getStorage(app)
        const db = getDatabase(app)
        const fetchdata = async () => {
            setphoto(await getDownloadURL(storageref(storage, `profilePictures/${uid}`)))
            setfullname((await get(ref(db, `users/${uid}/profile/FirstName`))).val() + ' ' + (await get(ref(db, `users/${uid}/profile/LastName`))).val())
            setcontactNumber((await get(ref(db, `users/${uid}/profile/personal_phone_number`))).val())
        }
        fetchdata()
    }, [uid]);

    const handleClick = () => {
        setExpandedPacientUid(uid); // Set the clicked patient's UID as the expanded one
    };

    const handleDoubleClick = () => {
        setSelectedPacient(uid); // Set the selected patient on double-click
    };

    return (
        <div
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            className={`card ${expandedPacientUid === uid ? 'expanded' : ''}`} // Apply 'expanded' class if the patient is expanded
        >
            <img src={photo} alt="patient" className="photo" />
            <div className="details">
                <div className="fullname">{fullname}</div>
                <div className="contactNumber">{contactNumber}</div>
            </div>
        </div>
    );
})


const NewInvestigationPopUp = ({ uid, onClose }: any) => {
    const [pacients, setpacients] = useState<string[]>([])
    const [InvestigationTitle, setInvestigationTitle] = useState<string>("")
    const [SelectedPacient, setSelectedPacient] = useState<string>("")
    const [expandedPacientUid, setExpandedPacientUid] = useState<string | null>(null) // Track the currently expanded patient


    useEffect(() => {
        if (SelectedPacient !== "" && InvestigationTitle !== "") {
            NewInvestigationGenerator(SelectedPacient, uid, InvestigationTitle)
            onClose()
        }
        if (InvestigationTitle === "" && SelectedPacient !== "") {
            toast("The title field is mandatory")
            setSelectedPacient("")
        }
    }, [SelectedPacient, InvestigationTitle, NewInvestigationGenerator, setSelectedPacient, onClose, uid])


    useEffect(() => {
        //listen for new friends made while on this page
        const db = getDatabase(app)
        const unsub = onValue(ref(db, `users/${uid}/friends`), snapshot => {
            if (snapshot.val())
                setpacients(snapshot.val())
            else
                setpacients([])
        })

        return () => unsub()
    }, [])

    return (
        <div className="popup">
            <div className="popup-inner" style={{ justifyContent: 'space-around' }}>
                <div className="close-investigation-add-popup" onClick={onClose}><RxCross2 /></div>
                <input className="investigation-title" value={InvestigationTitle} onChange={(e: any) => { setInvestigationTitle(e.target.value) }} />
                <div className="select-investigation-pacient">
                    {pacients.map((Pacientuid: string) => {
                        return (
                            <PacientPreview
                                key={Pacientuid}
                                uid={Pacientuid}
                                setSelectedPacient={setSelectedPacient}
                                expandedPacientUid={expandedPacientUid}
                                setExpandedPacientUid={setExpandedPacientUid} // Pass down state setter
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    );
}


export default NewInvestigationPopUp