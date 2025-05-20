import { getDownloadURL, getStorage, ref as storageref } from "firebase/storage"
import { memo, useEffect, useRef, useState } from "react"
import { app } from "../../App"
import { get, getDatabase, onValue, ref } from "firebase/database"

//this is the mini profile the one on which you can click and it expands
const MiniProfileView = memo(({ uid, offsetTop, offsetLeft }: any) => {

    const [profilepic, setprofilepic] = useState<string>("")//the profile picture of the one in this container
    const [showadditional, setshowadditional] = useState<boolean>(false)//small or big state
    const [additionalinfo, setadditionalinfo] = useState<any>(null)//the info about the user
    const [status, setStatus] = useState<string>("")//what status he is
    const divRef = useRef<any>(null)//reference to big container

    useEffect(() => {

        const storage = getStorage(app)
        const db = getDatabase(app)

        //a simple listener to change if changes occur to display the latest info
        const unsub = onValue(ref(db, `users/${uid}/profile`), async (snapshot) => {
            const result = snapshot.val()
            setadditionalinfo({
                FirstName: result.FirstName,
                LastName: result.LastName,
                AffiliateOrg: (await get(ref(db, `users/${result.AffiliateOrg}/profile/Organization_Name`))).val(),
                PersonalNumber: result.personal_phone_number,
            })
        })

        const fetchfoto = async () => {//to fetch the profile picture
            setprofilepic(await getDownloadURL(storageref(storage, `profilePictures/${uid}`)))
            setStatus((await get(ref(db, `users/${uid}/status`))).val())
        }

        fetchfoto()

        return () => unsub()//remove listener on unmount

    }, [])

    const handleClickOutside = (event: any) => {
        //if clicked outside we will automatically make the mini profile smaller
        if (divRef.current && !divRef.current.contains(event.target))
            setshowadditional(false);
    };

    useEffect(() => {
        //a click event to know when we click
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        }
    }, [])

    const showmoreinfo = (event: any) => {
        //to not update the children
        event.stopPropagation()
        setshowadditional(!showadditional)
    }

    //the info about the doctor/pacient, it grows and it schrinks based on your actions
    return <div ref={divRef} className={`image-container${showadditional ? ' grow' : ''}`} style={{ top: `${offsetTop}px`, left: `${offsetLeft}px` }} onClick={showmoreinfo} onBlur={() => { setshowadditional(false) }}>
        <img src={profilepic} className={`mini-photo ${showadditional ? 'img-grow' : ''}`} />
        {showadditional === true ?
            <div className="additionalinfo fade-in">
                <div className="text-row slide-in">{additionalinfo.FirstName} {additionalinfo.LastName}</div>
                <div className="text-row slide-in">Contact Info: {additionalinfo.PersonalNumber}</div>
                {status === "doctor" ? <div className="text-row slide-in">Affiliate organization: {additionalinfo.AffiliateOrg}</div> : <></>}
            </div> :
            <></>}
    </div>
})

export default MiniProfileView