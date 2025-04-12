import { getDownloadURL, getStorage, ref as refstg } from "firebase/storage"
import { useContext, useEffect, useState } from "react"
import { app } from "../../App"
import { get, getDatabase, ref, set } from "firebase/database"
import { FaMessage } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { SwicthTabContext } from "../homePage/Home";

const FriendPreview = ({ uid,myid }: any) => {

    const {setselectedTab,setDefaultSelectedChat}:any = useContext(SwicthTabContext)

    const [name, setname] = useState<string>("")
    const [photo, setphoto] = useState<string>("")
    const [status, setstatus] = useState<string>("")
    const [date, setdate] = useState<string>("")
    const [loading, setloading] = useState<boolean>(true)
    const [email,setemail] = useState<string>("")

    const navigate = useNavigate()

    useEffect(() => {
        const storage = getStorage(app)
        const db = getDatabase(app)

        const fetchData = async () => {

            try{
                //gets the name, profile picture, status, birth date and email for display for the users
                setname((await get(ref(db, `users/${uid}/profile/FirstName`))).val() + " " + (await get(ref(db, `users/${uid}/profile/LastName`))).val())
                setphoto(await getDownloadURL(refstg(storage, `profilePictures/${uid}`)))
                setstatus((await get(ref(db, `users/${uid}/status`))).val())
                setdate((await get(ref(db, `users/${uid}/profile/date`))).val())
                setemail((await get(ref(db, `users/${uid}/profile/email`))).val())
            }catch(err){
                console.error(err)
            }


            setloading(false)
        }
        fetchData()
    }, [uid])

    const removeFriend = async () =>{
        //removes the friend from the pacient or the doctor based on who pressed the unfriend button
        const db = getDatabase(app)
        
        const chatuid = uid < myid ? uid +"_"+ myid : myid +"_"+ uid
        await set(ref(db,`chats/${chatuid}/ActiveChat`),false)//deactivates the chat does not delete it

        let friends = (await get(ref(db, `users/${myid}/friends`))).val()
        friends = friends.filter((id:string)=>{return id !== uid})//deletes the friend from the one who press
        await set(ref(db, `users/${myid}/friends`),friends)

        friends = (await get(ref(db, `users/${uid}/friends`))).val()
        friends = friends.filter((id:string)=>{return id !== myid})//deletes the friend from the opposite one
        await set(ref(db, `users/${uid}/friends`),friends)
    }

    //data displayed
    return <div>
        {
            !loading ? <div className="container-friend">
                <div className="enter-messages" onClick={()=>{
                    setselectedTab("chat")
                    setDefaultSelectedChat(uid < myid ? uid +"_"+ myid : myid +"_"+ uid)
                }}><FaMessage /></div>

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
                <hr className="separator-friends"/>
                <div className="small-info">
                    <div className="slim-type">Joined: {date}</div>
                    <div className="action-btns">
                        <button className="action-btn profile-btn" onClick={()=>{
                            navigate('/home/ProfilePreview', { state: { uid: uid } })
                        }}>Profile</button>
                        <button className="action-btn remove-btn" onClick={removeFriend}>Remove</button>
                    </div>
                </div>
                </div>

            </div> : <div className="loader"></div>
        }
    </div>


}
export default FriendPreview