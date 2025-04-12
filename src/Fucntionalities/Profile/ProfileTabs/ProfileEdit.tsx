import { get, getDatabase, ref, set } from "firebase/database"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { app } from "../../../App"

const ProfileEdit = ({ uid }: any) => {

    const [lastProfileInfo, setlastProfileInfo] = useState<any>({})//if the user doesnt want to change or forgets
    const [ProfileInfo, setProfileInfo] = useState<any>({})//get the profile info
    const [isUnsaved, setisUnsaved] = useState<boolean>(false)//if changes were made and saved
    const humanreadableconvertion: any = {
        address: "Address",
        Creation_Date: "creation date of the organization",
        Office_phone_number: "Office phone number",
        Organization_Name: "Organization name",
        email: "email",
        CNP: "personal numerical code(I.D.)",
        Emergency_contact_name: "Emergency contact name",
        Emergency_contact_number: "Emergency contact number",
        FirstName: "First Name",
        LastName: "Last Name",
        date: "date of birth",
        personal_phone_number: "personal phone number",
        Gender: "Gender",
        AffiliateOrg: "Affiliate Organization",
    }

    useEffect(() => {
        if (JSON.stringify(lastProfileInfo) !== JSON.stringify(ProfileInfo))
            setisUnsaved(true)
        else
            setisUnsaved(false)
    }, [ProfileInfo, lastProfileInfo])

    useEffect(() => {
        const db = getDatabase(app)

        const fetchdata = async () => {//fetch for both to know if there was a change
            setProfileInfo((await get(ref(db, `users/${uid}/profile`))).val())
            setlastProfileInfo((await get(ref(db, `users/${uid}/profile`))).val())
        }
        fetchdata()

    }, [])

    const SaveChanges = () => {
        //if we save the lastProfileInfo will now become the saved version
        setlastProfileInfo(ProfileInfo)
        const db = getDatabase(app)
        set(ref(db, `users/${uid}/profile`), ProfileInfo)//updating it in the database
    }

    //the fields, buttons and the popup that says if it is saved or not
    //many fields for every type of users
    return <div className="container-editing">
        <h1 className="heading">Edit Profile</h1>

        {isUnsaved && (
            <div className="unsaved-indicator">
                <FontAwesomeIcon icon={faExclamationTriangle} /> Unsaved Changes
            </div>
        )}

        {/* Personal numerical code */}
        {ProfileInfo.FirstName ? <div className="form-group">
            <label className="label">{humanreadableconvertion.CNP}</label>
            <input
                type="text"
                name="name"
                value={ProfileInfo.CNP}
                onChange={(e) => { setProfileInfo({ ...ProfileInfo, CNP: e.target.value }) }}
                placeholder="Enter your first name"
                className="input"
            />
        </div> : <></>}

        {/* Name */}
        {ProfileInfo.FirstName ? <div className="form-group">
            <label className="label">{humanreadableconvertion.FirstName}</label>
            <input
                type="text"
                name="name"
                value={ProfileInfo.FirstName}
                onChange={(e) => { setProfileInfo({ ...ProfileInfo, FirstName: e.target.value }) }}
                placeholder="Enter your first name"
                className="input"
            />
        </div> : <></>}

        {/* Name Last */}
        {ProfileInfo.LastName ? <div className="form-group">
            <label className="label">{humanreadableconvertion.LastName}</label>
            <input
                type="text"
                name="name"
                value={ProfileInfo.LastName}
                onChange={(e) => { setProfileInfo({ ...ProfileInfo, LastName: e.target.value }) }}
                placeholder="Enter your first name"
                className="input"
            />
        </div> : <></>}

        {/* Gender */}
        {ProfileInfo.Gender ? <div className="form-group">
            <label className="label">{humanreadableconvertion.Gender}</label>
            <div className="gender-options">
                <label>
                    <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={ProfileInfo.Gender === "Male"}
                        onChange={() => { setProfileInfo({ ...ProfileInfo, Gender: "Male" }) }}
                    />{" "}
                    Male
                </label>
                <label>
                    <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={ProfileInfo.Gender === "Female"}
                        onChange={() => { setProfileInfo({ ...ProfileInfo, Gender: "Female" }) }}
                    />{" "}
                    Female
                </label>
            </div>
        </div> : <></>}

        {/* Date of Birth */}
        {ProfileInfo.date ? <div className="form-group">
            <label className="label">{humanreadableconvertion.date}</label>
            <input
                type="date"
                name="dob"
                value={ProfileInfo.date}
                onChange={(e) => { setProfileInfo({ ...ProfileInfo, date: e.target.value }) }}
                className="input"
            />
        </div> : <></>}

        {/* Email */}
        {/*ProfileInfo.email ? <div className="form-group">
            <label className="label">{humanreadableconvertion.email}</label>
            <input
                type="email"
                name="email"
                value={ProfileInfo.email}
                onChange={(e) => { setProfileInfo({ ...ProfileInfo, email: e.target.value }) }}
                placeholder="Enter your email"
                className="input"
            />
        </div> : <></>*/}

        {/* Phone Number */}
        {ProfileInfo.personal_phone_number ? <div className="form-group">
            <label className="label">{humanreadableconvertion.personal_phone_number}</label>
            <input
                type="tel"
                name="phone"
                value={ProfileInfo.personal_phone_number}
                onChange={(e) => { setProfileInfo({ ...ProfileInfo, personal_phone_number: e.target.value }) }}
                placeholder="Enter your phone number"
                className="input"
            />
        </div> : <></>}

        {/* Creation Date */}
        {ProfileInfo.Creation_Date ? <div className="form-group">
            <label className="label">{humanreadableconvertion.Creation_Date}</label>
            <input
                type="date"
                name="phone"
                value={ProfileInfo.Creation_Date}
                onChange={(e) => { setProfileInfo({ ...ProfileInfo, Creation_Date: e.target.value }) }}
                placeholder="Enter your phone number"
                className="input"
            />
        </div> : <></>}

        {/* Organization Name */}
        {ProfileInfo.Organization_Name ? <div className="form-group">
            <label className="label">{humanreadableconvertion.Organization_Name}</label>
            <input
                type="text"
                name="phone"
                value={ProfileInfo.Organization_Name}
                onChange={(e) => { setProfileInfo({ ...ProfileInfo, Organization_Name: e.target.value }) }}
                placeholder="Enter your phone number"
                className="input"
            />
        </div> : <></>}

        {/* Office phone number */}
        {ProfileInfo.Office_phone_number ? <div className="form-group">
            <label className="label">{humanreadableconvertion.Office_phone_number}</label>
            <input
                type="phone"
                name="phone"
                value={ProfileInfo.Office_phone_number}
                onChange={(e) => { setProfileInfo({ ...ProfileInfo, Office_phone_number: e.target.value }) }}
                placeholder="Enter your phone number"
                className="input"
            />
        </div> : <></>}

        {/* Emergency contact name */}
        {ProfileInfo.Emergency_contact_name ? <div className="form-group">
            <label className="label">{humanreadableconvertion.Emergency_contact_name}</label>
            <input
                type="text"
                name="phone"
                value={ProfileInfo.Emergency_contact_name}
                onChange={(e) => { setProfileInfo({ ...ProfileInfo, Emergency_contact_name: e.target.value }) }}
                placeholder="Enter your phone number"
                className="input"
            />
        </div> : <></>}

        {/* Emergency contact number */}
        {ProfileInfo.Emergency_contact_number ? <div className="form-group">
            <label className="label">{humanreadableconvertion.Emergency_contact_number}</label>
            <input
                type="text"
                name="phone"
                value={ProfileInfo.Emergency_contact_number}
                onChange={(e) => { setProfileInfo({ ...ProfileInfo, Emergency_contact_number: e.target.value }) }}
                placeholder="Enter your phone number"
                className="input"
            />
        </div> : <></>}

        {/* Save Button */}
        <button onClick={SaveChanges} className="button-editing">
            Save Changes
        </button>
    </div>
}

export default ProfileEdit