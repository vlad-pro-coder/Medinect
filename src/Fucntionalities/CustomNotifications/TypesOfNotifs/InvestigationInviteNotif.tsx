import { get, getDatabase, push, ref, set } from 'firebase/database';
import '../design.css'
import { MdDelete } from "react-icons/md";
import { VscCheck } from "react-icons/vsc";
import { VscChromeClose } from "react-icons/vsc";
import { app } from '../../../App';
import { TiUserAdd } from "react-icons/ti";
import { useEffect, useState } from 'react';
import timeSince from '../TimePastConverter';
import { toast } from 'react-toastify';

const InvestigationInviteNotif = ({ data, index, deleteNotif, uid }: any) =>{

    const [timepassed,settimepassed] = useState<string>(timeSince(data.date))
    const [InvestigationName,setInvestigationName] = useState<string>()
    const [InvestigationPacient,setInvestigationPacient] = useState<string>()

    const AcceptButtons = async () => {
        const db = getDatabase(app)
        const participatingDoctors:string[] = (await get(ref(db,`Investigations/${data.IDofInvestigation}/DoctorParticipants`))).val()
        participatingDoctors.push(uid)
        await set(ref(db,`Investigations/${data.IDofInvestigation}/DoctorParticipants`),participatingDoctors)
        await push(ref(db,`users/${uid}/ParticipatingInvestigations`),data.IDofInvestigation)

        toast("You have joined a new Investigation")
        deleteNotif(index)
    }

    const [senderName,setsenderName] = useState<string>("")

    useEffect(()=>{
        //get the sender name for display purposes
        const db = getDatabase(app)
        const fetchdb = async () =>{
            setsenderName((await get(ref(db,`users/${data.from}/profile/LastName`))).val() + " " + (await get(ref(db,`users/${data.from}/profile/FirstName`))).val())
            setInvestigationName((await get(ref(db,`Investigations/${data.IDofInvestigation}/InvestigationName`))).val())
            const idofpacient:string = (await get(ref(db,`Investigations/${data.IDofInvestigation}/Pacient`))).val()
            setInvestigationPacient((await get(ref(db, `users/${idofpacient}/profile/FirstName`))).val() + " " + (await get(ref(db, `users/${idofpacient}/profile/LastName`))).val())
        }
        fetchdb()
    },[data])

    //the display
    return <div className={`notification-item ${data.new ? "notification-new" : ""}`} id={`${index}`}>
        <div className="ico">
            <TiUserAdd/>
        </div>
        <div className="timesinceupload slim-type">{timepassed}</div>
        <button onClick={() => { deleteNotif(index) }} className='deleteBTN'><MdDelete /></button>
        <div style={{paddingTop:'35px'}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <p style={{textAlign:'center'}}><strong>{senderName}</strong> wants to add you to the <strong>{InvestigationName}</strong> investigation regarding pacient <strong>{InvestigationPacient}</strong> </p>
        </div>
        <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
            <button onClick={AcceptButtons} className='friendReq-btn'><VscCheck /></button>
            <button onClick={() => { deleteNotif(index) }} className='friendReq-btn'><VscChromeClose /></button>
        </div>
        </div>
    </div>
    
}

export default InvestigationInviteNotif