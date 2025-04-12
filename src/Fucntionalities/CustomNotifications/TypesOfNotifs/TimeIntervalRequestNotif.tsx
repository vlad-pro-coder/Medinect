import { get, getDatabase, ref } from "firebase/database"
import { useContext, useEffect, useState } from "react"
import { MdDelete } from "react-icons/md"
import { app } from "../../../App"
import { IoMdPeople } from "react-icons/io";
import timeSince from "../TimePastConverter"
import { CurrentTabContext } from "../../homePage/Home"

//sent to doctor to notify to take action about an appointment
const TimeIntervalRequestNotif = ({ data, deleteNotif, index }: any) => {

    const {setselectedTab,selectedTab}:any = useContext(CurrentTabContext)

    const [timepassed,settimepassed] = useState<string>(timeSince(data.date))

    const [senderName, setsenderName] = useState<string>("")
    //its just the standard message but with a button that sends the user to the calendar view

    useEffect(() => {
        //fetch the name of who ever trigger such notification
        const db = getDatabase(app)
        const fetchdb = async () => {
            setsenderName((await get(ref(db, `users/${data.from}/profile/LastName`))).val() + " " + (await get(ref(db, `users/${data.from}/profile/FirstName`))).val())
        }
        fetchdb()
    }, [data])

    //display the notification
    return <div className={`notification-item ${data.new ? "notification-new" : ""}`} id={`${index}`}>
        <div className="ico">
            <IoMdPeople />
        </div>
        <div className="timesinceupload slim-type">{timepassed}</div>
        <button onClick={() => { deleteNotif(index) }} className="deleteBTN"><MdDelete /></button>
        <div style={{ paddingTop: '35px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>{senderName} wants an appointment</div>
            {selectedTab != "calendar" ?
                <button className="friendReq-btn" onClick={() => {setselectedTab("calendar")}}>Navigate To Calendar</button> :
                <></>
            }
        </div>
    </div>
}

export default TimeIntervalRequestNotif