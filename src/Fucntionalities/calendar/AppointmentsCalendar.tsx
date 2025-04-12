import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./design.css"
import SaveCancelButtons from "./SaveCancelButtons"
import CalendarDoctor from './Calendars/CalendarDoctor';
import SidebarPacient from './SidebarPacient';
import SidebarDoctor from './SidebarDoctor';
import { useState } from 'react';
import CalendarPacient from './Calendars/CalendarPacient';
import Trashbin from './TrashBin';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
}

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
}

const AppointmentsCalendar = ({uid,status}:any) => {

  const [AddedUserIntervals, changeAddedUserIntervals] = useState<TrueCalendarEvent[]>([])//events that have changed are put here
  const [isHolding,changeisHolding] = useState<boolean>()//checks if the user is holding an event
  const [usedNotifID,changeusedNotifID] = useState<string[]>([])//notifs that were used but not saved

  /* this decied which calendar to print as they are fundamentally different in functionality */
  /* also if it is holding it will make the trashpin appear */
  return (<div className="calendarContainer">
    {AddedUserIntervals.length !== 0 ? <SaveCancelButtons toSaveEvents={changeAddedUserIntervals} uid={uid} toSaveEventsList={AddedUserIntervals}  changeusedNotifID = {changeusedNotifID} usedNotifIDList = {usedNotifID}/> : <></>}
    {status === "doctor" ? <SidebarDoctor uid={uid} usedNotifID={usedNotifID} /> : <SidebarPacient uid={uid} />}
    {status === "doctor"?
    <CalendarDoctor ToSaveEvents={changeAddedUserIntervals} uid={uid} ToSaveEventsList={AddedUserIntervals} changeisHolding = {changeisHolding} changeusedNotifID={changeusedNotifID}/>:
    <CalendarPacient uid={uid} changeisHolding = {changeisHolding} />}
    {isHolding?<Trashbin/>:<></>}
  </div>)
}

export default AppointmentsCalendar