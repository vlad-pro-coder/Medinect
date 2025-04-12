import { get, getDatabase, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { MdDelete } from "react-icons/md"
import { app } from "../../../App"
import timeSince from "../TimePastConverter"
import { AiFillMessage } from "react-icons/ai";

//notification for new docs added in your medical documents
const NewDocMessage = ({ data, deleteNotif, index }: any) => {

    console.log(data)

    const [senderName, setsenderName] = useState<string>("")
    const [timepassed,] = useState<string>(timeSince(data.date))

    useEffect(() => {
        //fetch the name of who ever trigger such notification
        const db = getDatabase(app)
        const fetchdb = async () => {
            setsenderName((await get(ref(db, `users/${data.from}/profile/LastName`))).val() + " " + (await get(ref(db, `users/${data.from}/profile/FirstName`))).val())
        }
        fetchdb()
    }, [data])

    return <div className={`notification-item ${data.new ? "notification-new" : ""}`} id={`${index}`}>
        <div className="ico">
            <AiFillMessage />
        </div>
        <button onClick={() => { deleteNotif(index) }} className="deleteBTN"><MdDelete /></button>
        <div className="timesinceupload slim-type">{timepassed}</div>
        <div style={{ marginTop: '35px' }}>
            <div style={{ textAlign: 'center' }}>{data.text}</div>
            <div className="slim-type">Added By: {senderName}</div>
        </div>
    </div>
}

export default NewDocMessage