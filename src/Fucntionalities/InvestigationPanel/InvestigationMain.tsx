//made in another path

import { useState } from "react"
import InvestigationTree from "./Investigation/InvestigationTree"
import InvestigationsPreview from "./InvestigationsPreview"
import "./design.css"
import "./InvestigationPreviewStyle.css"

const InvestigationMain = ({uid,status}:any) =>{

    const [currentInvestigation,setcurrentInvestigation] = useState<string>("")

    return <div className="investigation-container">
        <InvestigationsPreview uid={uid} status={status} setcurrentInvestigation={setcurrentInvestigation} currentInvestigation={currentInvestigation}/>
        {currentInvestigation?<InvestigationTree InvestigationID={currentInvestigation} WhoAccesed={uid} status={status} />:<></>}
    </div>
}

export default InvestigationMain