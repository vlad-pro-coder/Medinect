import PreviewMedicalRecords from "./dependencies/PreviewMedicalRecords";
import PreviewDoctor from "./PreviewDoctor";
import { useEffect, useRef, useState } from "react";

import { MdEditDocument } from "react-icons/md";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import { FaRegTrashCan } from "react-icons/fa6";
import NewRecordPopup from "./dependencies/AddNewRecordsPopup";
import './CopiedStyles.css'

interface SelectUID {
    value: string | null;
}

const AbsoluteSideBar = ({ selectedPacient, changeopenaddPopup, setEditStatus, setDeleteStatus, EditStatus, DeleteStatus, SelectedDoc }: any) => {

    const [showhide, setshowhide] = useState<boolean>(false)//if hidden or not
    const [heightOfButtons, setheightOfButtons] = useState<number>(0)//the overall height of buttons
    const [pullbtnHeight, setpullbtnHeight] = useState<number>(0)//the height of the pull button

    const [btnHeight, setbtnHeight] = useState<number>(0)//a single button height
    const [hrHeight, sethrHeight] = useState<number>(0)//the line hr height

    //refs to get the above variables
    const buttonsRef = useRef<any>(null)
    const pullbtnRef = useRef<any>(null)
    const btnRef = useRef<any>(null)
    const hrRef = useRef<any>(null)

    useEffect(() => {
        //getting the respective values in the variables
        if (buttonsRef.current && pullbtnRef.current) {
            setheightOfButtons(buttonsRef.current.getBoundingClientRect().height)
            setpullbtnHeight(pullbtnRef.current.getBoundingClientRect().height)
        }
        if(btnRef.current)
            setbtnHeight(btnRef.current.getBoundingClientRect().height)
        if(hrRef.current)
            sethrHeight(hrRef.current.getBoundingClientRect().height)
    }, [buttonsRef, pullbtnRef,btnRef,hrRef])

    //to make a smooth animation i get the height of the buttons and can set the offset from top however i lake based on their current height
    //this will help me hide some buttons in case i need them  
    return <div
        className="cascade-sidebar"
        style={{ top: `${showhide ? `${0 - (SelectedDoc ? btnHeight + hrHeight: 0)}px` : `-${heightOfButtons + (selectedPacient ? 0 : pullbtnHeight)}px`}` }}
        id="cascadeSidebar">
        <div ref={buttonsRef} className="btn-container">
            <button ref={btnRef} onClick={() => { changeopenaddPopup(true) }}><HiOutlineDocumentAdd /> Add Documents</button>
            <hr ref={hrRef} className="separator" />
            <button onClick={() => {
                if (!EditStatus)
                    setDeleteStatus(false)
                setEditStatus((prev: boolean) => {
                    return !prev
                })
            }}><MdEditDocument /> Edit Documents</button>
            <hr className="separator" />
            <button onClick={() => {
                if (!DeleteStatus)
                    setEditStatus(false)

                setDeleteStatus((prev: boolean) => {
                    return !prev
                })

            }}><FaRegTrashCan /> Delete Documents</button>
        </div>
        <div ref={pullbtnRef} className="toggle-btn" onClick={(e) => { 
            setshowhide(!showhide) 
            e.stopPropagation()
            }}>▼</div>
    </div>
}

const Connector = ({ uid, status }:any) => {

    const [selectedPacient, changeselectedPacient] = useState<SelectUID | null>(status === "doctor" ? null : { value: uid })
    const [SelectedDoc, changeSelectedDoc] = useState<string>("")

    const [openaddPopup, changeopenaddPopup] = useState<boolean>(false)

    const [EditStatus, setEditStatus] = useState<boolean>(false)
    const [DeleteStatus, setDeleteStatus] = useState<boolean>(false)

    const PopupClose = () => {
        changeopenaddPopup(false)
    }

    console.log(selectedPacient)
    

    return <div style={{overflow:'auto',height:'100%',width:'100%',position:'relative'}}>
        {openaddPopup ? <NewRecordPopup onClose={PopupClose} ToUserId={selectedPacient?.value} Whoaccesed={uid} /> : <></>}
        <AbsoluteSideBar selectedPacient={selectedPacient} changeopenaddPopup={changeopenaddPopup} setEditStatus={setEditStatus} setDeleteStatus={setDeleteStatus} EditStatus={EditStatus} DeleteStatus={DeleteStatus} SelectedDoc={SelectedDoc} />
        {status == "pacient" ?
            <div className="documents-container"><PreviewMedicalRecords whoisee={uid} EditStatus={EditStatus} DeleteStatus={DeleteStatus} SelectedDoc={SelectedDoc} changeSelectedDoc={changeSelectedDoc} whoami={uid}/></div> :
            <PreviewDoctor uid={uid} selectedPacient={selectedPacient} changeselectedPacient={changeselectedPacient} EditStatus={EditStatus} DeleteStatus={DeleteStatus} SelectedDoc={SelectedDoc} changeSelectedDoc={changeSelectedDoc} whoami={uid}/>}
    </div>
}

export default Connector