import { getDatabase, onValue, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { app } from "../../App"
import "./design.css"
import DoctorAccountPreview from "./DoctorAccountPreview"

const OrganizationDoctorAccountManager = ({ uid }: any) => {

    const [friends, setfriends] = useState<any>({})

    useEffect(() => {
        const db = getDatabase(app)
        //listen for new doctors being added, tho creating an account and checking the accounts can't be done at the same time but maybe multiple people access that account
        const unsub = onValue(ref(db, `users/${uid}/CreatedDoctors`), snapshot => {
            if(snapshot.val())
            setfriends(snapshot.val())
            else
            setfriends([])
        })

        return () => unsub()
    }, [])

    //display the friends
    return <div className="friendswhole">
        <h1 style={{textAlign:'center'}}>Doctors List</h1>

        <div className="container-friends">
            {
                Object.keys(friends).map((key) => {
                    return <DoctorAccountPreview uid={friends[key]} myid={uid} />
                })
            }
        </div>
    </div>
}

export default OrganizationDoctorAccountManager