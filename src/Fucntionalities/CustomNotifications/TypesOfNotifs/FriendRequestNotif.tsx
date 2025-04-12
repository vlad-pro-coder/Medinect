import { get, getDatabase, ref, set } from 'firebase/database';
import '../design.css'
import { MdDelete } from "react-icons/md";
import { VscCheck } from "react-icons/vsc";
import { VscChromeClose } from "react-icons/vsc";
import { app } from '../../../App';
import { one_to_one_chat_creation } from '../../RealTimeChat/ChatCreation';
import { TiUserAdd } from "react-icons/ti";
import { useEffect, useState } from 'react';
import timeSince from '../TimePastConverter';
import { toast } from 'react-toastify';

//notification for when friend requests are sent 
const FriendRequestNotif = ({ data, index, deleteNotif, uid }: any) => {

    const [timepassed,settimepassed] = useState<string>(timeSince(data.date))

    const AcceptButtons = async () => {
        //there are multiple setups to take into account
        const db = getDatabase(app)

        //get their friends and make sure they are not already friends
        const doctorfriends: any[] = ((await get(ref(db, `users/${uid}/friends`))).val() || [])
        const pacientfriends: any[] = ((await get(ref(db, `users/${data.from}/friends`))).val() || [])

        if (pacientfriends.includes(uid) && doctorfriends.includes(data.from)) {
            //if they are delete the notif no use
            toast("already friends")
            deleteNotif(index)
            return;
        }

        //every new friend needs a chat instance and so we create it
        one_to_one_chat_creation(uid, data.from)

        //if they are not friends push the new friends to each list
        pacientfriends.push(uid)//the doctor accepts the request so we should put our uid if we are a doctor
        doctorfriends.push(data.from)//request sent from pacient it should be in the "data.from" field
        try {
            //update the friends
            await set(ref(db, `users/${uid}/friends`), doctorfriends)
            await set(ref(db, `users/${data.from}/friends`), pacientfriends)
        } catch (error) {
            console.error(error)
        }
        //delete the notif anyway
        deleteNotif(index)
    }

    const [senderName,setsenderName] = useState<string>("")

    useEffect(()=>{
        //get the sender name for display purposes
        const db = getDatabase(app)
        const fetchdb = async () =>{
            setsenderName((await get(ref(db,`users/${data.from}/profile/LastName`))).val() + " " + (await get(ref(db,`users/${data.from}/profile/FirstName`))).val())
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
            <p style={{textAlign:'center'}}><strong>{senderName}</strong> sent you a friend request.</p>
        </div>
        <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
            <button onClick={AcceptButtons} className='friendReq-btn'><VscCheck /></button>
            <button onClick={() => { deleteNotif(index) }} className='friendReq-btn'><VscChromeClose /></button>
        </div>
        </div>
    </div>
}

export default FriendRequestNotif