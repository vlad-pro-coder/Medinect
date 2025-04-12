import { useEffect, useState } from 'react';
import './design.css';
import { getDatabase, onValue, ref, remove, set } from 'firebase/database';
import { app } from '../../App';
import FriendRequestNotif from './TypesOfNotifs/FriendRequestNotif';
import { IoMdNotifications } from "react-icons/io";
import TimeIntervalRequestNotif from './TypesOfNotifs/TimeIntervalRequestNotif';
import AvarageTextMsg from './TypesOfNotifs/AvarageTextMesage';
import DeleteDocMessage from './TypesOfNotifs/DeleteDocMessage';
import EditDocMessage from './TypesOfNotifs/EditDocMessage';
import NewDocMessage from './TypesOfNotifs/NewDocMessage';

const getNrNewNotifs = (data: any) => {
//gets how many of the loaded notifs are new or unread
    if (data === null)
        return 0
    let num = 0;
    Object.keys(data).map((key) => {
        num += data[key].new
    })

    return num
}

function NotificationButton({ uid, status }: any) {

    const db = getDatabase(app)
    const [isExpanded, setIsExpanded] = useState<number>(0);//0-not expanded,1-preview,2-full preview
    const [notifications, changeNotifications] = useState<any>({})


    const removeNew = async (id: string) => {
        //when hovered to delete the new status to false
        await set(ref(db, `users/${uid}/notifs/${id}/new`), false)
    }

    const deleteNotif = async (id: string) => {
        //to remove the notifs
        await remove(ref(db, `users/${uid}/notifs/${id}`))
    }

    useEffect(() => {
        //listener to listen for new updates on that branch
        const unsub = onValue(ref(db, `users/${uid}/notifs`), (snapshot) => {
            changeNotifications(snapshot.val())
        })

        return () => {
            //unsub on unload
            unsub()
        }
    }, [])

    //here the first 2 are for display purposes not really functionlity
    //the last it iterates over the loaded notifs and choses based on a common field which type it is and how it should be displayed
    return (
        <div className="notification-button-container" >
            <button onClick={() => { setIsExpanded((prev)=>{return prev === 1||prev === 2?0:1}) }} className={`notifbtn ${isExpanded === 0?"notifbtnclose":"notifbtnopen"}`}>
                <IoMdNotifications/>
            </button>
            <div className={`summary ${isExpanded === 0?"goback":"expand"}`} onClick={()=>{ setIsExpanded((prev)=>{return prev === 2?1:2}) }}>
                    <strong>Summary:</strong><pre> </pre> {getNrNewNotifs(notifications)} new notifications
                </div>
            <div className={`fullnotifs ${isExpanded !== 2?"closefullnotifs":"openfullnotifs"}`}>
                    <div className="notification-details">
                        {notifications === null ? <></> : Object.keys(notifications).map((key: string) => {
                            return <div onMouseEnter={() => { removeNew(key) }}>
                                {notifications[key].type == "friendRequest" ? <FriendRequestNotif
                                    data={notifications[key]}
                                    deleteNotif={deleteNotif}
                                    index={key}
                                    uid={uid}
                                /> : <></>}
                                {notifications[key].type == "setInterval" ? <TimeIntervalRequestNotif
                                    data={notifications[key]}
                                    deleteNotif={deleteNotif}
                                    index={key}
                                    uid={uid}
                                    status={status}
                                /> : <></>}
                                {notifications[key].type == "AvarageMsg" ? <AvarageTextMsg
                                    data={notifications[key]}
                                    deleteNotif={deleteNotif}
                                    index={key}
                                /> : <></>}
                                {notifications[key].type == "DeleteDocMsg" ? <DeleteDocMessage
                                    data={notifications[key]}
                                    deleteNotif={deleteNotif}
                                    index={key}
                                /> : <></>}
                                {notifications[key].type == "EditDocMsg" ? <EditDocMessage
                                    data={notifications[key]}
                                    deleteNotif={deleteNotif}
                                    index={key}
                                /> : <></>}
                                {notifications[key].type == "NewDocMsg" ? <NewDocMessage
                                    data={notifications[key]}
                                    deleteNotif={deleteNotif}
                                    index={key}
                                /> : <></>}
                            </div>
                        })}
                    </div>{notifications === null ? <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100%'}}>Empty in here...</div> : <></>}
                
                </div>
        </div>
    );
}

export default NotificationButton;
