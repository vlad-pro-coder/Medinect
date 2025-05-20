import { get, getDatabase, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { app } from "../../../App"
import { getDownloadURL, getStorage,ref as refstg } from "firebase/storage"
import { useNavigate } from "react-router-dom"
import { IoIosPeople } from "react-icons/io";


export const SummarizedDoctor = ({uid}:any) =>{

    const [fullname,setfullname] = useState<string>("")
    const [profileIMG,setprofileIMG] = useState<string>("")
    const navigate = useNavigate()
    useEffect(()=>{
        const db = getDatabase(app)
        const storage = getStorage(app)

        const getData = async() => {
            setfullname((await get(ref(db, `users/${uid}/profile/FirstName`))).val() + " " + (await get(ref(db, `users/${uid}/profile/LastName`))).val())
            setprofileIMG(await getDownloadURL(refstg(storage,`profilePictures/${uid}`)))
        }
        getData()
    },[uid])

    return <div onClick = {()=>{navigate('/home/ProfilePreview', { state: { uid: uid } })}} className="doctor-profile">
        <img src={profileIMG}/>
        <div>{fullname}</div>
    </div>
}
const BlameButton = ({DoctorsWhoEdited}:any) =>{

    const [ShowDoctors,setShowDoctors] = useState<boolean>(false)

    return <div className="blame-button-container">
    <div className={`blame-summary ${ShowDoctors?"expanded":"noshow"}`} style={{color:'#333333'}}>
        <h4>Involved Doctors</h4>
        {DoctorsWhoEdited.map((uid: string) => (
            <div key={uid} className="doctor-summary">
                <SummarizedDoctor uid={uid} />
            </div>
        ))}
    </div>
    <div className="blame-button" onClick={(e)=>{
        e.stopPropagation()
        setShowDoctors(!ShowDoctors)
        }}><IoIosPeople/></div>
</div>
}

export default BlameButton