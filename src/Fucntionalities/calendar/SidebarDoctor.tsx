import { Draggable } from "@fullcalendar/interaction/index.js"
import { get, getDatabase, onValue, ref } from "firebase/database"
import { useEffect, useRef, useState } from "react"
import { app } from "../../App"
import { v4 as uuidv4 } from 'uuid'
import { getDownloadURL, getStorage, ref as refstg } from "firebase/storage"

const filterUsedNotifs = (totalList: any[], usedList: string[]) => {

  return totalList.filter((elem: any) => { return !usedList.includes(elem.notifID) })
}

const SidebarDoctor = ({ uid, usedNotifID }: any) => {
  const [users, changeUsers] = useState<any>([])

  const [doctorfirstname, changedoctorfirstname] = useState<string>("")
  const [doctorlastname, changedoctorlastname] = useState<string>("")
  const [photos, setphotos] = useState<string[]>([])
  const [filterednotifs,setfilterednotifs] = useState<any[]>([])

  const UsersRef = useRef(null)
  const draggableRef = useRef<Draggable | null>(null)

  useEffect(()=>{
    setfilterednotifs(filterUsedNotifs(users, usedNotifID))
  },[users,usedNotifID])
  

  /* load once per component is mounted */
  useEffect(() => {
    const db = getDatabase(app)
    const storage = getStorage(app)
    const fetchname = async () => {
      /*get the current doctors name for notification purposes */
      changedoctorfirstname((await get(ref(db, `users/${uid}/profile/FirstName`))).val())
      changedoctorlastname((await get(ref(db, `users/${uid}/profile/LastName`))).val())
    }
    fetchname()

    /*create listener for automatic rerender on values changed */
    const unsub = onValue(ref(db, `users/${uid}/notifs`), async (snapshot: any) => {

      if (!snapshot.val()) {
        changeUsers([])
        return;
      }

      const photospacients: any = {}
      /* get any user from the notification that has a request for an appointment */
      /* if the notification has the specific code "setInterval" than they are selected */
      const filterednotifs = Object.keys(snapshot.val()).filter((key: any) => {
        return snapshot.val()[key].type === "setInterval"
      })


      /*get the data about the user because we only have userUID */
      const promises = filterednotifs.map(async (notifID: any) => {
        
        const notif = (await get(ref(db, `users/${uid}/notifs/${notifID}`))).val()
        const firstname = (await get(ref(db, `users/${notif.from}/profile/FirstName`))).val()
        const lastname = (await get(ref(db, `users/${notif.from}/profile/LastName`))).val()
        const request = notif.preferences
        photospacients[notif.from] = await getDownloadURL(refstg(storage, `profilePictures/${notif.from}`))

        return { id: notif.from, request: request, firstname: firstname, lastname: lastname, notifID: notifID }
      }, [])

      /*set the changes */
      changeUsers((await Promise.all(promises)))
      setphotos(photospacients)
    })
    return () => {
      /* unsub on unmount */
      unsub()
    }
  }, [])


/* load once per component is mounted */
  useEffect(() => {
    /* fullCalendar api uses a draggable instance to manage drag and drop events from any source */
    const DragableElements = UsersRef.current

    if (draggableRef.current) {
      draggableRef.current.destroy()// if it exists then destroy to prevent duplicates, it may create more then 1 event per request else.
    }

    if (DragableElements) {
      /*through the css selectors i can get for a certain div some properties set lower in this file */
      /* i can get the pacient's and doctor's full name + notif id that was used to mark it as used */
      /* data will be taken by the fullcalendar api */
      draggableRef.current = new Draggable(DragableElements,
        {
          itemSelector: '.user-item',
          eventData(eventEl) {
            const id = uuidv4()
            const firstlastnamePacient = eventEl.dataset.firstname + " " + eventEl.dataset.lastname
            const firstlastnameDoctor = doctorfirstname + " " + doctorlastname
            const notifID = eventEl.getAttribute("data-notifid")
            const ToID = eventEl.dataset.id
            return {
              id,
              title: firstlastnamePacient + " appointment to " + firstlastnameDoctor,
              extendedProps: { ToID: ToID, notifID: notifID }
            };
          },
        });
    }
  }, [doctorfirstname, doctorlastname])



  const PacientPrev = ({ user }: any) => {
    /* here are the css selectors */
    return <div className="pacient-user">
      <div
        key={uuidv4()}
        data-id={user.id}
        data-notifid={user.notifID}
        data-firstname={user.firstname}
        data-lastname={user.lastname}
        className="user-item"
      >
        <img src={photos[user.id]} className="photoimg" alt="ceva" />
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <span>{user.firstname} {user.lastname}</span>
        </div>

      </div>
        <div className="pacient-request">
          {user.request}
      </div>
    </div>
  }
  /* print every pacient from the filtered notifs list */
  return (
    <div className="sidebar" id="sidebar-doctor">
      <div id="users-list" ref={UsersRef}>
        <h4 style={{textAlign:'center'}}>Pacients Requests</h4>
        {filterednotifs.map((user: any) => {
          return <PacientPrev user={user} />
        })}
        <div style={{height:'40px'}}></div>
      </div>
    </div>)
}

export default SidebarDoctor