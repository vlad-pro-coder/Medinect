import { get, getDatabase, remove, set,ref as refdb } from "firebase/database"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import { app } from "../../../App"
import { v4 as uuidv4 } from 'uuid'
import ServerShutdownIcon from "../../CustomComponents/HostShutDownIcon";
import ServerStartIcon from "../../CustomComponents/ServerStartIcon";
import TextCopyIcon from "../../CustomComponents/TextCopyIcon";
import { toast } from "react-toastify";
import { VscTriangleLeft } from "react-icons/vsc";

    // constants
    const smallHostWidth:number = 50
    const bigHostWidth:number = 100
    const biggerPadding:number = 20 
//

//this is the host popup(animated slider or something) that activates, deactivates and copies the code
const HostContainer = memo(({path}:any) => {
    const [isHostActive, setisHostActive] = useState<boolean>(false)
    const [HostID, setHostID] = useState<string | null>(null)
    const [loadingHostData, setloadingHostData] = useState<boolean>(false)

    const HostIDConatiner = useRef<any>(null)

    const [showHost, setshowHost] = useState<number>(1)

    const [timeout,settimeout] = useState<boolean>(false)

    const [docsContainerWidth,setdocsContainerWidth] = useState<number>(550)

    const ActivateHost = useCallback(async () => {
        if(timeout)
            return

        //activating the host
        settimeout(true)

        const db = getDatabase(app)
        try {
            //make a new uid for every host instance so previos links cant work
            //set up both the reference and the accuall data
            const newID = uuidv4()
            setHostID(newID)
            await set(refdb(db, `HostedReferences/HostData/${newID}`), {
                path: path,
            })
            await set(refdb(db, `HostedReferences/HostRef/${path}`), newID)

        } catch (err) {
            //error
            console.error(err)
        }
        //everything good now host is active
        setisHostActive(true)
        toast("Doument host activated")

        //set out a timer to not spam the button
        setTimeout(() => {
            settimeout(false)
          }, 1000);

    }, [setHostID,setTimeout,timeout,setisHostActive])

    //to recalculate the host button on parent is resized
    useEffect(() => {
        // Use querySelector to find the element
        const element = document.querySelector('.all-img-container');
    
        if (!element) return;
    
        const resizeObserver = new ResizeObserver((entries) => {
          for (let entry of entries) {
            setdocsContainerWidth((element as HTMLElement).offsetWidth); // Update the state with the new width
          }
        });
    
        resizeObserver.observe(element); // Start observing
    
        // Cleanup when the component unmounts
        return () => resizeObserver.unobserve(element);
      }, []);

    const DeactivateHost = useCallback(async () => {
        if(timeout)
            return

        settimeout(true)

        const db = getDatabase(app)
        try {
            //delete everything
            const HostID = (await get(refdb(db, `HostedReferences/HostRef/${path}`))).val()
            await remove(refdb(db, `HostedReferences/HostRef/${path}`))
            await remove(refdb(db, `HostedReferences/HostData/${HostID}`))

        } catch (err) {
            console.error(err)
        }
        //everything good
        setisHostActive(false)
        toast("Document host deactivated")

        //set out a timer to not spam the button
        setTimeout(() => {
            settimeout(false)
          }, 1000);
    }, [timeout,setTimeout,setisHostActive])

    useEffect(() => {
        //if you think about it if tho instances of a pacient account being open at the same time and fidgeting this the host button
        //it would definetly destroy something in the background cause they dont have listeners to update for the other the information'
        //but idk why would someone benefit from doing this might change it later but until then it's not logical for something to just start breaking the app because he is bored
        //in real life people wouldnt even think about this i bet
        const fetchHostID = async () => {
            const db = getDatabase(app)
            try {
                //get the host id if it exists
                const HostID = (await get(refdb(db, `HostedReferences/HostRef/${path}`))).val()
                setHostID(HostID)
                setloadingHostData(true)
                setisHostActive(HostID ? true : false)
            } catch (err) {
                //error
                console.error(err)
            }
        }
        fetchHostID()
    }, [])
    
    //this is the standard display if you press to activate the host it will activate and the buttons will change
    //it goes bothways for the shutdown button nothing special really
    return <div>{loadingHostData ? <div className="hostid-container" style={{right:`${docsContainerWidth - showHost * (isHostActive?bigHostWidth:smallHostWidth) - biggerPadding}px`}}>
        {isHostActive ? <div className="container-active-host" ref={HostIDConatiner}>
            <div className="host-expander" onClick={()=>{setshowHost(showHost === 0?1:0)}}><VscTriangleLeft /></div>
            {showHost == 1?<div style={{width:`${biggerPadding}px`}}></div>:<></>}
            <button className="action-host-btn" onClick={() => {
                ///copy to clipboard @MedDoc {UID}
                toast("code copied to clipboard")
                navigator.clipboard.writeText(`@MedDoc ${HostID} `)
            }}><TextCopyIcon /></button>
            <button onClick={DeactivateHost} className="action-host-btn close-host-btn"><ServerShutdownIcon /></button>

        </div> : <></>}
        {!isHostActive ? <div style={{ display: 'flex', flexDirection: 'row' }} ref={HostIDConatiner}>
            <div className="host-expander" onClick={()=>{setshowHost(showHost === 0?1:0)}}><VscTriangleLeft /></div>
            {showHost == 1?<div style={{width:`${biggerPadding}px`}}></div>:<></>}
            <button className="action-host-btn" onClick={ActivateHost}><ServerStartIcon /></button>
        </div> : <></>}
    </div> : <></>
    }

    </div>
})

export default HostContainer