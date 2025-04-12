import { get, getDatabase, onValue, push, ref } from "firebase/database"
import { useEffect, useRef, useState } from "react"
import { app } from "../../App"
import { getDownloadURL, getStorage, ref as refstg } from "firebase/storage";
import {toast} from 'react-toastify'

interface doctor {
  firstname: string;
  lastname: string;
  id: string
}

const Form = ({ doctoruid, useruid }: any) => {

  const [preferences, changepref] = useState<string>("")

  /* creates a notification for the doctor */
  const createNotif = async () => {
    const db = getDatabase(app)
    try {
      if(!preferences)
        throw "cant send an empty message"
      await push(ref(db, `users/${doctoruid}/notifs`), { type: "setInterval", preferences: preferences, from: useruid,date:new Date().toString(),new:true })
      toast("request sent")
    } catch (error) {
      toast(`${error}`)
    }
  }

  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
    <textarea className="textarea-style" rows={3} placeholder="Type here..." onChange={(e: any) => { changepref(e.target.value) }} value={preferences} />
    <button onClick={createNotif}>send Appointment Request</button>
  </div>
}


const SidebarPacient = ({ uid }: any) => {

  const [doctors, changeDoctors] = useState<doctor[]>([])
  const [selectedDoctor, changeSelectedDoctor] = useState<string>('')
  const [photos, setphotos] = useState<any>({})
  const divRef = useRef<any>(null)

  useEffect(() => {
    const db = getDatabase(app)
    const storage = getStorage(app)
    /*maintains a listener on the path of friends to that if a doctors accepts while the calendar is loaded it will show up imidiatly without a manual rerender*/
    const unsub = onValue(ref(db, `users/${uid}/friends`), async (snapshot) => {
      const iddoctors: any[] = snapshot.val()
      const photosdoctors: any = {}

      /* parses the doctors uid in accuall doctor data to show on the screen*/
      const promises = iddoctors.map(async (uid: string) => {
        const firstname = (await get(ref(db, `users/${uid}/profile/FirstName`))).val()
        const lastname = (await get(ref(db, `users/${uid}/profile/LastName`))).val()
        photosdoctors[uid] = await getDownloadURL(refstg(storage, `profilePictures/${uid}`))
        return { firstname: firstname, lastname: lastname, id: uid }
      })
      const doctorschange: doctor[] = await Promise.all(promises)
      /*save data found about doctors*/
      changeDoctors(doctorschange)
      setphotos(photosdoctors)

    })

    return () => {
      /* on component getting unrendered remove the listener */
      unsub()
    }
  }, [])

  const handleClickOutside = (event:any) => { 
    if (divRef.current && !divRef.current.contains(event.target)) 
      changeSelectedDoctor(''); 
    };

  useEffect(()=>{
    /*handle for better user experience if the user clicks outside close the extended doctor view with a textarea */
    document.addEventListener('click',handleClickOutside);
    return () => { 
      document.removeEventListener('click', handleClickOutside);
    }
  },[])

  const DoctorProf = ({ user }: any) => {
    return <div ref={divRef} className="user" onClick={(e) => {
    e.stopPropagation()
    changeSelectedDoctor(user.id) }} >
      <div style={{display:'flex',flexDirection:'row'}}>
      <img src={photos[user.id]} className="photoimg" />
        <div style={{ display:'flex',flex:1, alignItems:'center',justifyContent:'center' }}>
          <span>{user.firstname} {user.lastname}</span>
        </div>
      </div>

      {user.id == selectedDoctor ? <Form useruid={uid} doctoruid={user.id} /> : <></>}
    </div>
  }
  /*print doctors with the help of another component */
  return (
    <div className="sidebar">
      <h2>Users</h2>
      {doctors.map((user) => {
        return <DoctorProf user={user} />
      })}
      <div style={{height:'40px'}}></div>
    </div>)
}

export default SidebarPacient