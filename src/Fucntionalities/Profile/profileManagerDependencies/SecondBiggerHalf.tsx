import PrivacySettings from "../ProfileTabs/PrivacySettings"
import ProfileEdit from "../ProfileTabs/ProfileEdit"


const SecondBiggerHalf = ({status,SelectedSetting,uid}:any) =>{

    //either prints the edit component or the privacy one which is not active
    return <div>
        {SelectedSetting === "editprofile"?<ProfileEdit uid={uid}/>:<></>}
        {SelectedSetting === "privsettings"?<PrivacySettings uid={uid} status={status}/>:<></>}
    </div>
}

export default SecondBiggerHalf