import { get, getDatabase, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { app } from "../../../App"
import { SummarizedDoctor } from "./BlameButton"


const TotalParticipatingDoctors = ({ InvestigationID }: any) => {

    const [showhide, setshowhide] = useState<boolean>(false)//if hidden or not
    const [TotalDoctors,setTotalDoctors] = useState<string[]>([])


    useEffect(() => {
        const db = getDatabase(app)
        
        const fetchDoctors = async () =>{
            setTotalDoctors((await get(ref(db,`Investigations/${InvestigationID}/DoctorParticipants`))).val() || [])
        }
        fetchDoctors()

    }, [InvestigationID])

    //to make a smooth animation i get the height of the buttons and can set the offset from top however i lake based on their current height
    //this will help me hide some buttons in case i need them  
    return <div className="all-doctors-container" style={{top:(showhide?"-10px":"-167px")}}>
        <div className="all-doctors">
            <h4>Total Doctors</h4>
            {
                TotalDoctors.map((uid:string)=>{
                    return <SummarizedDoctor uid={uid}/>
                })
            }
        </div>
        <div className="toggle-btn all-doctors-btn" onClick={() => {
            setshowhide(!showhide) 
            }}>▼</div>
    </div>
}

export default TotalParticipatingDoctors