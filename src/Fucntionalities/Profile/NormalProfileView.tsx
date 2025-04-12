import { get, getDatabase, onValue, ref } from "firebase/database"
import { app } from "../../App"
import { useEffect, useState } from "react"
import { getDownloadURL, getStorage, ref as storageref } from "firebase/storage"
import { useLocation } from "react-router-dom"
import './design.css'

//a profile viewer viewable in a new path on the site
const NormalProfileView = () => {

    const location = useLocation()
    const { uid } = location.state//get the id of the one displayed

    const [profileData, changeprofileData] = useState<any>({})//get the profile data
    const [photoURI, changephotoURI] = useState<string>("")//the profile picture
    const [status, setStatus] = useState<string>("")//their status
    const [orgname, setOrgname] = useState<string>("")//orgname if doctor
    const [orgnumber, setOrgnumber] = useState<string>("")//orgnumber if doctor

    console.log(profileData)

    useEffect(() => {

        const db = getDatabase(app)
        const storage = getStorage(app)

        //set up a listener to get the newest of data
        const unsub = onValue(ref(db, `users/${uid}/profile`), async (snapshot) => {
            changeprofileData(snapshot.val())//get the profile data
            setOrgname((await get(ref(db, `users/${snapshot.val().AffiliateOrg}/profile/Organization_Name`))).val())//get the orgname
            setOrgnumber((await get(ref(db, `users/${snapshot.val().AffiliateOrg}/profile/Office_phone_number`))).val())//get the orgnumber
        })

        const fetchphoto = async () => {
            //get the profile picture of the user
            changephotoURI(await getDownloadURL(storageref(storage, `profilePictures/${uid}`)))
            setStatus((await get(ref(db, `users/${uid}/status`))).val())
        }

        fetchphoto()

        return () => unsub()//stop listener on unmount

    }, [])

    //print the data may be different based on your status that's why we get it
    return <div className="profile-container">
        <div className="profile-header">
            <div className="curved-line"></div>
            <img className="profile-photo" src={photoURI} alt="Profile Photo" />
            <h1 className="user-name">{profileData.FirstName} {profileData.LastName}</h1>
        </div>
        <div className="profile-info">
            <div className="column">
                <h2>...Personal Info...</h2>
                <ul>
                    <li><strong>ID:</strong> {profileData.CNP}</li>
                    <li><strong>Gender:</strong> {profileData.Gender}</li>
                    <li><strong>Date of Birth:</strong> {profileData.date}</li>
                    <li><strong>Address:</strong> {profileData.date}</li>
                    <li><strong>Email:</strong> {profileData.email}</li>
                </ul>
            </div>
            <div className="column">
                <h2>...Contact Info...</h2>
                <ul>
                    <li><strong>phone number:</strong> {profileData.personal_phone_number}</li>
                    {status === "pacient" ? <li><strong>Emergency name:</strong> {profileData.Emergency_contact_name}</li> : <></>}
                    {status === "pacient" ? <li><strong>Emergency number:</strong> {profileData.Emergency_contact_number}</li> : <></>}
                    {status === "doctor" ? <li><strong>Affiliate Organization:</strong> {orgname}</li> : <></>}
                    {status === "doctor" ? <li><strong>Affiliate Organization Number:</strong> {orgnumber}</li> : <></>}
                </ul>
            </div>
        </div>
    </div>

}

export default NormalProfileView