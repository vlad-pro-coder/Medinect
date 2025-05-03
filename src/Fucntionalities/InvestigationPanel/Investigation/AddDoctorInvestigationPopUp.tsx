import { doc, getDoc, getFirestore } from "@firebase/firestore";
import { get, getDatabase, push, ref } from "firebase/database";
import { useState } from "react";
import { toast } from "react-toastify";
import { app } from "../../../App";


const AddDoctorInvestigationPopUp = ({onClose,WhoSent,IDinvestigation}: any) => {

    const firedb = getFirestore(app)
    const db = getDatabase(app)
    const [email, setEmail] = useState<string>('');
  
    const handleSubmit = async (e:any) => {
      e.preventDefault();
      try{
        //from the email get the uid from the firebase cause we dont work with emails
        const docRef = doc(firedb,'users',email)
        const docSnap = await getDoc(docRef)
        console.log(docSnap.data())
        if(!docSnap.exists())
          toast("no such user")//if no doc is found display error
        else
        {
          //if found then get the status to make sure you befriend a doctor and not a pacient
            const status = await get(ref(db,`users/${docSnap.data().uid}/status`))
            if(status.val() != "doctor")
                toast("user is not a doctor")//if a pacient send error
            else{
              //if successful send the notification
              const participatingDoctors:string[] = (await get(ref(db,`Investigations/${IDinvestigation}/DoctorParticipants`))).val()
              if(participatingDoctors.includes(docSnap.data().uid))
                throw "doctor already in the investigation"
                await push(ref(db,`users/${docSnap.data().uid}/notifs`),{type:"InvestigationRequest",from:WhoSent,new:true,date:new Date().toString(),IDofInvestigation:IDinvestigation})
                toast("Investigation join request was sent")
                onClose()
            }
        }
        
      } catch(error:any){
        console.log(error)
        toast("error while sending investigation request " + error.message)
      }
    };
  
    //the display of the popup
    return (
      <div className="popup">
        <div className="popup-inner space">
          <button className="close-btn" onClick={onClose}>X</button>
          <h2 className="titledocadd">Enter the email of the doctor you want to add</h2>
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
              className="inputdocadd"
            />
            <button type="submit" className="buttondocadd">Submit</button>
          </form>
        </div>
      </div>
    );
}

export default AddDoctorInvestigationPopUp