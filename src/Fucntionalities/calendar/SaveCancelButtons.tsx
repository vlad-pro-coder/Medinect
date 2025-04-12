import { get, getDatabase, push, ref, set,update } from "firebase/database";
import { app } from "../../App";
import { FaRegSave } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { toast } from "react-toastify";

interface TrueCalendarEvent {
  extendedProps: ExtendedProps;
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
}

interface ExtendedProps {
  lastevent: CalendarEvent;
  ToID: string;
  newlycreated: boolean;
}
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
}

const SaveCancelButtons = ({ toSaveEvents, toSaveEventsList, uid, changeusedNotifID, usedNotifIDList }: any) => {

  console.log(usedNotifIDList, 'used notifs in the save cancel button')

  const db = getDatabase(app)
  const saveUpdated = () => {
    toSaveEventsList.map(async (ev: TrueCalendarEvent) => {
      /* if saved pressed overwritten everything in the database with the new values updating it for you and the pacient*/
      /* also send a message to the user with the new changes*/
      const { id, extendedProps, ...rest } = ev;
      await set(ref(db, `users/${uid}/CalendarEvents/${id}`), { ...rest, extendedProps: { ToID: extendedProps.ToID } })
      await set(ref(db, `users/${extendedProps.ToID}/CalendarEvents/${id}/path`), `users/${uid}/CalendarEvents/${id}`)
      /* this "if" is for asthetic purposes so that a doctor and pacient can name its event however they like*/
      if (!(await get(ref(db, `users/${extendedProps.ToID}/CalendarEvents/${id}/titluCustom`))).exists())
        await set(ref(db, `users/${extendedProps.ToID}/CalendarEvents/${id}/titluCustom`), rest.title)
      //push a new notif firebase database will handle automatically the new UID */
      await push(ref(db, `users/${extendedProps.ToID}/notifs`), {
        type: "AvarageMsg",
        new: true,
        text: `New Date for your appointment: 
                ${rest.start.substring(rest.start.indexOf('T') + 1, rest.start.indexOf('Z') - 7)} until 
                ${rest.end.substring(rest.start.indexOf('T') + 1, rest.start.indexOf('Z') - 7)} \n 
                Date: ${rest.end.substring(0, rest.start.indexOf('T'))}`,
        from: uid,
        date: new Date().toString()
      })
    })
    /*remove the used notifs they dont belong in here anymore, they have been used and can't be redeemed */
    /*update the branches with a null so that it auto deletes for smooth interaction */
    let updates: any = {}
    for (const notifID of usedNotifIDList) {
      const key: string = `users/${uid}/notifs/${notifID}`
      updates[key] = null
    }

    update(ref(db),updates)

    /* back to the old state but with changes saved */
    console.log(usedNotifIDList, "deleted notifs")
    toast("changes saved")
    toSaveEvents([])
    changeusedNotifID([])
  }
  const CancelUpdate = () => {
    /* when canceled just move everything back to normal and continue from there */
    toast("changes cancelled")
    changeusedNotifID([])
    toSaveEvents([])
  }

  /* the two buttons appear when there is at least one unsaved change(it does not include deletion) */
  return <div className="button-container">
    <button className="shake-button" onClick={saveUpdated}><FaRegSave /> Save</button>
    <button className="shake-button" style={{ backgroundColor: '#FF7043' }} onClick={CancelUpdate}><MdOutlineCancel /> Cancel</button>
  </div>
}

export default SaveCancelButtons