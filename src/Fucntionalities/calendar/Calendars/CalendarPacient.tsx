import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin, { EventDragStartArg, EventDragStopArg } from '@fullcalendar/interaction'
import { useCallback, useEffect, useRef, useState } from "react";
import { getDatabase, off, onValue, ref, set } from "firebase/database"
import { app } from "../../../App"
import { EventContentArg } from "@fullcalendar/core/index.js"
import MiniProfileView from "../../Profile/MiniProfileView"

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

const CalendarPacient = ({ uid, changeisHolding }: any) => {

    const [events, setEvents] = useState<TrueCalendarEvent[]>([])//current events loaded from database

    /* the pacient only holds a reference to the event not accually a copy so it will create a listener for every event in case it changes */
    const listenersRef = useRef<any[]>([])
    const [titles, changeTitles] = useState<any>({})//for renaming events
    const [titleIDchange, changetitleIDchange] = useState<string>("")//for renaming events
    const [titleinput, changetitleinput] = useState<string>("")//for renaming events

    /*calendar reference */
    const CalRef = useRef<FullCalendar>(null)

    console.log(events)

    const renderEventContent = (eventInfo: EventContentArg) => {
/* the way the event is displayed in fullCalendar */
        const saveInDB = (id: string) => {
            const db = getDatabase()//save the custom event name unique for every user to change however they like
            set(ref(db, `users/${uid}/CalendarEvents/${id}/titluCustom`), titleinput)
        }
/*dont forget the mini profile to see who created the event or to who you have the event */
        if (eventInfo.view.type === "timeGridDay")
            return (<div className="fc-event-main">
                <MiniProfileView uid={eventInfo.event.extendedProps.ToID} offsetTop={-15} />
                <div className="fc-event-main-frame">
                    <div className="fc-event-time">{eventInfo.timeText}</div>
                    {titleIDchange === eventInfo.event.id ? <input
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                changetitleIDchange("")
                                saveInDB(eventInfo.event.id)
                            }
                        }}
                        value={titleinput}
                        onChange={(e) => { changetitleinput(e.target.value) }}
                        onBlur={() => {
                            changetitleIDchange("")
                            saveInDB(eventInfo.event.id)
                        }}
                    /> : <div onClick={() => {
                        changetitleIDchange(eventInfo.event.id)
                        changetitleinput(titles[eventInfo.event.id])
                    }} className="fc-event-title fc-sticky">
                        {titles[eventInfo.event.id]}
                    </div>}

                </div>
            </div>);
/*did an if so the title can only be changed in the "timeGridDay" panel of the calendar */
        return (<div className="fc-event-main">
            <div className="fc-event-main-frame" style={{marginLeft:'0px'}}>
                <div className="fc-event-time">{eventInfo.timeText}</div>
                <div className="fc-event-title fc-sticky">
                    {titles[eventInfo.event.id]}
                </div>

            </div>
        </div>);
    };

    const handleDragStart = useCallback((info: EventDragStartArg) => {
        changeisHolding(true)
        info.event.remove()
    }, [changeisHolding])

    const handleDragEnd = useCallback((info: EventDragStopArg) => {
        changeisHolding(false)
        info.event.remove()
    }, [changeisHolding])

    useEffect(() => {
        const db = getDatabase(app)
        /* firstly i am getting any event reference that there is stored in the pacients account */
        const unsubmain = onValue(ref(db, `users/${uid}/CalendarEvents`), (snapshot) => {

            console.log(snapshot.val())
            setEvents([])   

            if (snapshot.exists()) {
                const eventsRefs = Object.keys(snapshot.val()).map((key: any) => {
                    return snapshot.val()[key]
                })
                setupListeners(eventsRefs)
            }
            else {
                setupListeners([])
            }

        })
        /* after that for every reference i put a listener on the doctors event branch to listen for changes */
        const setupListeners = (eventsRefs: { path: string, titluCustom: string }[]) => {
            listenersRef.current.forEach((listener) => off(listener.ref, 'value', listener.callback));
            listenersRef.current = [];
            // Set up new listeners 
            eventsRefs.forEach((event: { path: string, titluCustom: string }) => {
                /* for each reference create a listener that would listen on that path*/
                const eventPath: string = event.path
                const titlu = event.titluCustom
                const id = eventPath.substring(eventPath.lastIndexOf('/') + 1)
                const eventRef = ref(db, eventPath);
                const callback = (snapshot: any) => {
                    /* on change this will be called and a snapshot will be sent */
                    if (snapshot.exists()) {
                        /* if it exists make the changes */
                        const eventData = snapshot.val();
                        eventData.id = id;
                        eventData.extendedProps.ToID = eventPath.substring(eventPath.indexOf('/') + 1, eventPath.indexOf('/', eventPath.indexOf('/') + 1))
                        setEvents((prevEvents) => {
                            const existingEvent = prevEvents.find(event => event.id === eventData.id);
                            if (existingEvent) {
                                return prevEvents.map(event => event.id === eventData.id ? eventData : event);
                            }
                            else {
                                return [...prevEvents, eventData];
                            }
                        })
                        changeTitles((prevTitles: any) => {
                            prevTitles[id] = titlu
                            return prevTitles
                        })
                    }
                }
                /* this is the onvalue that listens on every branch for changes */
                /* on every change it will call its given function "callback" */
                onValue(eventRef, callback);
                /* push the listener to remove them later when the user closes the window */
                listenersRef.current.push({ ref: eventRef, callback })
            })
        }

        return () => {
            /* when unmounted it unsubs from the main listener and the doctor branch listener set up above */
            unsubmain()
            /* we used the off() function which takes a ref, what type of listener, and what function it was calling to indentify the corrent listener */
            /* other listener can have the same ref but maybe different type of listener or calls a different function that's why it takes so many parameters */
            listenersRef.current.forEach((listener) => off(listener.ref, 'value', listener.callback))
        }
    }, [uid])

    useEffect(() => {
        /* antother way of setting the calendar properties through its api */
        if (CalRef.current) {
            const Calapi = CalRef.current.getApi()

            Calapi.setOption("eventDragStart", undefined)
            Calapi.setOption("eventDragStop", undefined)

            Calapi.setOption("eventDragStart", handleDragStart)
            Calapi.setOption("eventDragStop", handleDragEnd)
        }
    })

        /* this prints the fullcalendar */
    /* the settings should be clear just search up the FullCalendar documentation */
    return (
        <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="timeGridDay"
            events={events}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth' }}
            eventContent={renderEventContent}
            ref={CalRef}
        />
    );
};

export default CalendarPacient