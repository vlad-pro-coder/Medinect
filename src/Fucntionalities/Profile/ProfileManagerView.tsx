import { useState } from "react"
import { useLocation } from "react-router-dom"
import FirstSmallHalf from "./profileManagerDependencies/FirstSmallHalf"
import "./design.css"
import SecondBiggerHalf from "./profileManagerDependencies/SecondBiggerHalf"


const ProfileManagerView = () => {

    const location = useLocation()
    const { uid, status } = location.state//gets the uid and status of the user who accesed this

    const [SelectedSetting, setSelectedSetting] = useState<string>('editprofile')//if we editting or doing something else

    //the two halfs, we put them in a separate container to be organized
    return <div className="whole-container">
        <div className="first-half">
            <FirstSmallHalf SelectedSetting={SelectedSetting} setSelectedSetting={setSelectedSetting} uid={uid} status={status} />
        </div>
        <div className="second-half">
            <SecondBiggerHalf SelectedSetting={SelectedSetting} status={status} uid={uid} />
        </div>
    </div>

}

export default ProfileManagerView