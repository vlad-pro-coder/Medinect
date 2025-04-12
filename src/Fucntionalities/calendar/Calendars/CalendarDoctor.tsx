import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin, { EventDragStartArg, EventDragStopArg, EventReceiveArg, EventResizeDoneArg } from '@fullcalendar/interaction'
import { useCallback, useEffect, useState } from "react";
import { EventContentArg, EventDropArg } from "@fullcalendar/core/index.js"
import { getDatabase, onValue, ref, remove, set } from "firebase/database"
import { app } from "../../../App"
import MiniProfileView from "../../Profile/MiniProfileView"
import { toast } from "react-toastify"

/*the interfaces for the events */
interface TrueCalendarEvent {
    extendedProps: ExtendedProps;
    id: string;
    title: string;
    start: string;
    end: string;
    color: string;
}

interface ExtendedProps {
    ToID: string;
    notifID: string;
}

const unifyTheEvents = (savedEvents: TrueCalendarEvent[], changedEvents: TrueCalendarEvent[]) => {

    /*this function unifies the two lists making the changed events take priority over the saved ones*/
    const filteredSaved = savedEvents.filter((ev: TrueCalendarEvent) => {
        if (changedEvents.find(evchanged => evchanged.id === ev.id) !== undefined)
            return false
        return true
    })

    //console.log([...filteredSaved, ...changedEvents],"unified")

    return [...filteredSaved, ...changedEvents]
}

const CalendarDoctor = ({ ToSaveEvents, uid, ToSaveEventsList, changeisHolding, changeusedNotifID }: any) => {

    const [events, setEvents] = useState<TrueCalendarEvent[]>([])//current events loaded from database
    const [titleIDchange, changetitleIDchange] = useState<string>("")//for renaming events
    const [titleinput, changetitleinput] = useState<string>("")//for renaming events

    /*to not erase and put back in the database events i ve decided to get two lists*/
    /* one list with the saved events and the other with the saved events now in the state of change or new events */
    /* this creates duplicates so the changed events overwritten the saved events but only visually */
    const [unifiedEvents,setunifiedEvents] = useState<TrueCalendarEvent[]>([])


    const renderEventContent = (eventInfo: EventContentArg) => {
        /* the way the event is displayed in fullCalendar */
        const saveInDB = async (id: string) => {
          const db = getDatabase();//save the custom event name unique for every user to change however they like
          await set(ref(db, `users/${uid}/CalendarEvents/${id}/title`), titleinput);
        };
      
        /*dont forget the mini profile to see who created the event or to who you have the event */
        if (eventInfo.view.type === "timeGridDay") {
          return (
            <div className="fc-event-main">
              <MiniProfileView uid={eventInfo.event.extendedProps.ToID} offsetTop={-15} />
              <div className="fc-event-main-frame">
                <div className="fc-event-time">{eventInfo.timeText}</div>
                {titleIDchange === eventInfo.event.id ? (
                  <input
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        changetitleIDchange("");
                        await saveInDB(eventInfo.event.id);
                      }
                    }}
                    value={titleinput}
                    onChange={(e) => changetitleinput(e.target.value)}
                    onBlur={async () => {
                      changetitleIDchange("");
                      await saveInDB(eventInfo.event.id);
                    }}
                  />
                ) : (
                  <div
                    onClick={() => {
                      changetitleIDchange(eventInfo.event.id);
                      changetitleinput(eventInfo.event.title);
                    }}
                    className="fc-event-title fc-sticky"
                  >
                    {eventInfo.event.title}
                  </div>
                )}
              </div>
            </div>
          );
        }
        /*did an if so the title can only be changed in the "timeGridDay" panel of the calendar */
        return (
          <div className="fc-event-main">
            <div className="fc-event-main-frame" style={{ marginLeft: "0px" }}>
              <div className="fc-event-time">{eventInfo.timeText}</div>
              <div className="fc-event-title fc-sticky">{eventInfo.event.title}</div>
            </div>
          </div>
        );
      };
      

    useEffect(() => {
        const db = getDatabase(app)
        /*listen for new events and update the lists */
        const unsub = onValue(ref(db, `users/${uid}/CalendarEvents`), (snapshot) => {

            if (snapshot.val()) {
                const eventslist = Object.keys(snapshot.val()).map((key) => {
                    const { extendedProps, ...rest } = snapshot.val()[key]
                    return {
                        ...rest,
                        id: key,
                        extendedProps: extendedProps
                    }
                })
                setEvents(eventslist)
                
            }
            else {
                setEvents([])
            }
        })

        return () => {
            unsub()
        }
    }, [uid,app])

    useEffect(()=>{
        /* on events, ToSaveEventList change rerender the whole component for visual update */
        setunifiedEvents(unifyTheEvents(events,ToSaveEventsList))
    },[events,ToSaveEventsList])



    const InCalendarUpdate = useCallback((info: EventResizeDoneArg | EventDropArg) => {
        /* event used for calendar interval update like date change, hour change */
        const { event } = info
        const foundevent = ToSaveEventsList.find((ev: TrueCalendarEvent) => ev.id === event.id)
        
        if (foundevent === undefined) {
            /* if changed event is not already in the ToSaveEventList than add it so it can be displayed over the saved version*/
            const foundsavedevent = events.find(ev => ev.id === event.id)
            ToSaveEvents((prevEvents: any) => {
                return [...prevEvents, foundsavedevent]
            })
        }
        /* the api gives us the updated version in this format */
        const updatedEvent = {
            title: info.event.title,
            start: info.event.start ? info.event.start.toISOString() : null,
            end: info.event.end ? info.event.end.toISOString() : null,
            color: "#D7C627"
        }
        /* change the event in the ToSaveEventsList with the new data provided */
        /* above we have already first put the not changed event in the changed events if true */
        /* it should always find an element and only one based on its id which is universally unique */
        ToSaveEvents((prevEvents: any) => {
            return prevEvents.map((ev: TrueCalendarEvent) => {
                const { extendedProps, ...lastev } = ev
                return ev.id == event.id ? { ...lastev, ...updatedEvent, extendedProps: { ...extendedProps } } : ev
            })
        })
    }, [ToSaveEvents, events, ToSaveEventsList])

    const handleEventReceive = useCallback((info: EventReceiveArg) => {

        /* event recieved from an external source like a draggable that we did in sidebardoctor.tsx */
        const defaultEndTime = new Date(info.event.start!.getTime() + 60 * 60 * 1000).toISOString()

        /* new event info */
        const newEvent = {
            id: info.event.id,
            title: info.event.title,
            start: info.event.start ? info.event.start.toISOString() : null,
            end: info.event.end ? info.event.end.toISOString() : defaultEndTime,
            color: "#D7C627",
            extendedProps: { ...info.event.extendedProps }
        };

        // Append the event to the database and get the generated key
        /* add it to the ToSaveEventsList cause the user might change their mind */
        ToSaveEvents((prevState: any) => {
            return [...prevState, newEvent]
        })
        /* change the notif used as now there is one less notif to drag event from */
        /* only visually it's not there so that when cancelled is pressed everything can be reverted back to normal */ 
        changeusedNotifID((prevNotifIDs: string[]) => {
            return [...prevNotifIDs, info.event.extendedProps.notifID]
        })


    }, [ToSaveEvents,changeusedNotifID])

    const handleDragStart = useCallback((info: EventDragStartArg) => {
        /* mostly used to show the trashbag functionality*/
        changeisHolding(true)

        const { event } = info
        /* to make sure evething works as intended i do the same here just like in the "InCalendarUpdate" function*/
        /* just a safety mesurement */
        const foundevent = ToSaveEventsList.find((ev: TrueCalendarEvent) => ev.id === event.id)
        if (foundevent == undefined) {
            const foundsavedevent = events.find(ev => ev.id === event.id)
            ToSaveEvents((prevEvents: any) => {
                return [...prevEvents, foundsavedevent]
            })
        }

        /*if(!wasEventDeleted)
            info.event.remove();
        setwasEventDeleted(true);*/
    }, [changeisHolding, ToSaveEvents, events, ToSaveEventsList])



    const handleDragEnd = useCallback((info: EventDragStopArg) => {
        /* get the bounding clients for the sidebar of the doctor and the trashbin */
        const trashbin = document.getElementById("trash-bin");
        const sidebardoctor = document.getElementById("sidebar-doctor");
        const recttrash = trashbin?.getBoundingClientRect();
        const rectsidebar = sidebardoctor?.getBoundingClientRect();

        if (recttrash &&
            info.jsEvent.clientX >= recttrash.left &&
            info.jsEvent.clientX <= recttrash.right &&
            info.jsEvent.clientY >= recttrash.top &&
            info.jsEvent.clientY <= recttrash.bottom) {

            const id = info.event.id;

            console.log(info.event.extendedProps)

            // Safely update state

            //changes used notif to reset back so it can be shown back in the sidebar instead of needing a manual reload
            /* if cursor hovered over and let go on the trashbin there will be the following */
            /* 1. if the event is not in the database the notifID is deleted permanently */
            /* 2. if its present in the database just delete the event from the doctor and the pacient */
            changeusedNotifID((prev:string[])=>{
                return prev.filter((notifID)=>{

                    console.log(notifID)
                    return info.event.extendedProps.notifID !== notifID
                })
            })

            ToSaveEvents((prevEvents: TrueCalendarEvent[]) => {
                return prevEvents.filter(ev => ev.id !== id);
            });
            

            const ToID = info.event.extendedProps.ToID

            const db = getDatabase(app)

            remove(ref(db, `users/${uid}/CalendarEvents/${id}`))
            remove(ref(db, `users/${ToID}/CalendarEvents/${id}`))

            toast("removed time interval")
        }
        else if (rectsidebar &&
            info.jsEvent.clientX >= rectsidebar.left &&
            info.jsEvent.clientX <= rectsidebar.right &&
            info.jsEvent.clientY >= rectsidebar.top &&
            info.jsEvent.clientY <= rectsidebar.bottom &&
            ToSaveEventsList.find((changedEvent: TrueCalendarEvent) => changedEvent.id === info.event.id)) {
            /* if in the doctorsidebar bounding rect */
            /* 1.if its not saved and not in the database just return the notifID as unsused and delete the event from the fullcalendar*/
            /* 2.if it is in the database ignore the task as that change is permanent */ 
            changeusedNotifID((prevNotifs: string[]) => {
                return prevNotifs.filter((notifID) => { notifID !== info.event.extendedProps.notifID })
            })
            ToSaveEvents((prevChangedEvents: TrueCalendarEvent[]) => {
                return prevChangedEvents.filter((changedEvent: TrueCalendarEvent) => {
                    return changedEvent.id !== info.event.id
                })
            })
        }

        /* this will make the trashbin dissapear */
        changeisHolding(false);

    }, [changeisHolding, ToSaveEvents, changeusedNotifID, ToSaveEventsList]);

    /* this prints the fullcalendar */
    /* the settings should be clear just search up the FullCalendar documentation */
    return (
        <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="timeGridDay"
            events={unifiedEvents}
            editable={true}
            droppable={true}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth' }}
            eventContent={renderEventContent}
            eventReceive={handleEventReceive}
            eventResize={InCalendarUpdate}
            eventDrop={InCalendarUpdate}
            eventDragStart={handleDragStart}
            eventDragStop={handleDragEnd}
        />
    );
};

export default CalendarDoctor