import { getDownloadURL, getStorage, ref as refstg } from "firebase/storage"
import { useEffect, useState } from "react"
import { app } from "../../App"
import { get, getDatabase, onValue, ref, set } from "firebase/database"
import { useNavigate } from "react-router-dom";


const DoctorAccountPreview = ({ uid, myid }: any) => {

    const [name, setname] = useState<string>("")
    const [photo, setphoto] = useState<string>("")
    const [status, setstatus] = useState<string>("")
    const [date, setdate] = useState<string>("")
    const [loading, setloading] = useState<boolean>(true)
    const [email,setemail] = useState<string>("")

    const [DisableStatus, setDisableStatus] = useState<boolean>(false)

    useEffect(() => {
        //listen for more updates
        const db = getDatabase(app)
        const unsub = onValue(ref(db, `users/${uid}/SuspendedAccount`), snapshot => {
            setDisableStatus(snapshot.val())
        })

        return () => unsub()//unsub on unmount
    }, [])

    const navigate = useNavigate()

    useEffect(() => {
        const storage = getStorage(app)
        const db = getDatabase(app)

        const fetchData = async () => {

            try {
                //gets the name, profile picture, status, birth date and email for display for the users
                setname((await get(ref(db, `users/${uid}/profile/FirstName`))).val() + " " + (await get(ref(db, `users/${uid}/profile/LastName`))).val())
                setphoto(await getDownloadURL(refstg(storage, `profilePictures/${uid}`)))
                setstatus((await get(ref(db, `users/${uid}/status`))).val())
                setdate((await get(ref(db, `users/${uid}/profile/date`))).val())
                setemail((await get(ref(db, `users/${uid}/profile/email`))).val())
            } catch (err) {
                console.error(err)
            }


            setloading(false)
        }
        fetchData()
    }, [uid])

    console.log(loading)

    const disableAccount = async () => {
        const db = getDatabase(app)//for organization only to disable account

        await set(ref(db, `users/${uid}/SuspendedAccount`), !DisableStatus)
    }

    //data displayed
    return <div>
        {
            !loading ? <div className="container-friend">

                {/*first data*/}
                <div className="big-info">
                    <img src={photo} className="profile-photo-changed" />
                    <div className="strong-type">{name}</div>
                    <div className="slim-type">{status}</div>
                    
                </div>
                <hr className="separator-friends"/>
                
                {/*future data*/}
                <div style={{paddingBottom:'5px',flexDirection:'column'}} className="small-info">
                    <div className="slim-type" style={{fontSize:'16px'}}>Email: {email}</div>
                </div>

                {/*small data*/}
                <div>
                    <hr className="separator-friends" />
                    <div className="small-info">
                        <div className="slim-type">Joined: {date}</div>
                        <div className="action-btns">
                            <button className="action-btn profile-btn" onClick={() => {
                                navigate('/home/ProfilePreview', { state: { uid: uid } })
                            }}>Profile</button>
                            <button className="action-btn" onClick={disableAccount} style={{backgroundColor:`${!DisableStatus?"#ff4d4d":"#6fe6bb"}`}}>{!DisableStatus?"Disable":"Enable"}</button>
                        </div>
                    </div>
                </div>

            </div> : <div className="loader"></div>
        }
    </div>


}
export default DoctorAccountPreview