import { getDatabase, onValue, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { app } from "../../App"
import FriendPreview from "./FriendPreview"
import "./design.css"
import Popup from "./addDoctorPopup"
import { IoMdAdd } from "react-icons/io";


const FriendListManager = ({ uid,status }: any) => {

    const [friends, setfriends] = useState<string[]>([])
    const [popupState, setIsPopupOpen] = useState<boolean>(false);

    //open and close popup for friend request field
    const handleOpenPopup = () => {
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
    }

    useEffect(() => {
        //listen for new friends made while on this page
        const db = getDatabase(app)
        const unsub = onValue(ref(db, `users/${uid}/friends`), snapshot => {
            if(snapshot.val())
            setfriends(snapshot.val())
            else
            setfriends([])
        })

        return () => unsub()
    }, [])

    //display the friends
    return <div className="friendswhole">
        <h1 style={{textAlign:'center'}}>{status == "pacient"?"Doctors":"Pacients"} List</h1>
        {popupState && <Popup onClose={handleClosePopup} Useruid={uid} />}
        {status === "pacient" && <button onClick={handleOpenPopup}
        style={{
            height:'30px',
            width:'30px',
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            position:'absolute',
            top:'10px',
            right:'10px',
            border:'0px',
            borderRadius:'50%',
            backgroundColor:'#4CAF50'
        }}
        ><IoMdAdd/></button>}

        <div className="container-friends">
            {
                friends.map((userUID) => {
                    return <FriendPreview uid={userUID} myid={uid} />
                })
            }
        </div>
    </div>
}

export default FriendListManager