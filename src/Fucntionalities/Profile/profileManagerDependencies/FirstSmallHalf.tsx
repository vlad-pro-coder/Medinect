import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage"
import { app } from "../../../App"
import { useEffect, useState } from "react"
import { MdEditNote } from "react-icons/md";
import { CiEdit } from "react-icons/ci";

const FirstSmallHalf = ({ SelectedSetting, setSelectedSetting, uid }: any) => {

    //the first half of the screen where you can choose which settings to see and edit your profile picture
    const [ProfilePhotoURI, setProfilePhotoURI] = useState<string>('')
    console.log(ProfilePhotoURI)

    useEffect(() => {

        const storage = getStorage(app)

        const fetch = async () => {//getting the profile picture
            try {
                const link = await getDownloadURL(ref(storage, `profilePictures/${uid}`))
                setProfilePhotoURI(link)
            } catch (err) {
                console.error(err)
            }
        }

        fetch()
    }, [])

    const handleIMGupdate = async (event:any) => {
        //when a new photo is added as profile picture the old one gets replaced both on the screen and in the storage 
        const file = event.target.files[0];
        if (file) {
            const storage = getStorage(app)
            //uloading new photo
            await uploadBytes(ref(storage,`profilePictures/${uid}`),file)
            const reader = new FileReader();
            //load the image
            reader.onload = (e:any) => {
                setProfilePhotoURI(e.target?.result);
            };
            reader.readAsDataURL(file);
        }
        
    }

    const handleBTNclick = () =>{
        document.getElementById('fileInput')?.click();//to change your photo
    }

    //this is the left side where i should add more account settings in the future
    return <div className="options-container">
        <div className="image-container-edit-profile">
            <div style={{ position: 'relative' }}>
                <button className="profile-img-button-edit"
                    onClick={handleBTNclick}
                ><CiEdit /></button>
                <input type="file" 
                id="fileInput" 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleIMGupdate}
                />
                <img src={ProfilePhotoURI} className="circle-image" />
            </div>
        </div>
        <div className="btns-container">
            <button className={`option-btn ${SelectedSetting === "editprofile" ? "selected" : ""}`}
                onClick={() => { setSelectedSetting("editprofile") }}>
                <MdEditNote /> Edit Profile {SelectedSetting === "editprofile" ? ">" : ""}
            </button>
            {/*<button className={`option-btn ${SelectedSetting === "privsettings" ? ">" : ""}`}
                onClick={() => { setSelectedSetting("privsettings") }}>
                <MdOutlineSecurity /> Privacy Settings {SelectedSetting === "privsettings" ? ">" : ""}
            </button>*/}
        </div>

    </div>

}

export default FirstSmallHalf