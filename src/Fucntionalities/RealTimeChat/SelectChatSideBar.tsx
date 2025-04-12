import { get, getDatabase, onValue, ref } from "firebase/database";
import { memo, useEffect, useState } from "react"
import { app } from "../../App";
import { getDownloadURL, getStorage, ref as storageref } from "firebase/storage";

//interface for a metadata of a chat
interface Metadata {
    participants: string[];
    typeOfConvo: string;///1-1 or 1-multiple
    ConvoPhotoPath: string///in storage if typeOfConvo is 1-muliple
    CreationDate: string;///basically when they became friends or group created for more people
    lastMessage: string;//the last message
    NameOfConvo: string;/// if 1-multiple, 1-1 the opposite name, automatically set for 1-1
    ActiveChat:boolean; ///for 1-1 if they are friend or not 
}

const Chat = memo(({ chatuid,useruid }: any) => {

    const [metadata, setmetadata] = useState<Metadata | null>(null)//the metadata of the chat
    const [minichatPhoto, setminichatPhoto] = useState<string>("")//the chatphoto which is the photo of the one who you are talking to
    const [ConvoName, setConvoName] = useState<string | undefined>("")//the name of the conversation

    useEffect(() => {
        const db = getDatabase(app)
        //set up a listener to get the lastest metadata(mostly used to get the last message)
        const unsub = onValue(ref(db, `chats/${chatuid}`), snapshot => {
            setmetadata(snapshot.val())
        })

        return () => unsub();
    }, [chatuid])

    useEffect(() => {
        //fetch the photo of the chat based on the person you are looking at
        const storage = getStorage(app)
        const fetchdata = async () => {
            setminichatPhoto(await getDownloadURL(storageref(storage, ImgForChat())))
        }
        fetchdata()
    }, [metadata?.ConvoPhotoPath])

    useEffect(() => {
        if (metadata?.typeOfConvo === "1-1") {
            const db = getDatabase(app) 
            //the opposite person from the one that you are
            const opposite_person = metadata.participants.filter((userid) => { return useruid !== userid })[0]

            const fetchname = async () => {//fetches the name and lastname of the person you are looking at
                const firstname = (await get(ref(db, `users/${opposite_person}/profile/FirstName`))).val()
                const lastname = (await get(ref(db, `users/${opposite_person}/profile/LastName`))).val()

                console.log(firstname, lastname)
                setConvoName(`${firstname} ${lastname}`)//the convo name
            }
            fetchname()
        }
        else
            setConvoName(metadata?.NameOfConvo)// if its one to multiple it would have a convo_name
    }, [metadata?.NameOfConvo,useruid])

    const ImgForChat = () => {
        if (metadata?.typeOfConvo === "1-1") {
            //the opposite person from the one that you are
            const opposite_person = metadata.participants.filter((userid) => { return useruid !== userid })[0]
            return `profilePictures/${opposite_person}`//return the opposite person profile photo path
        }
        else
            return metadata?.ConvoPhotoPath;//or if one-multiple just use the convophotopath
    }

    //from the data display the strip of element that is the chat
    return <div className="minichatContainer" style={{ overflow: 'hidden' }}>
        <div style={{ height: '70px', width: '70px', display: 'flex', justifyContent: 'center', alignItems: 'center',flexShrink:'0',flexDirection:'column' }}>
            <img src={minichatPhoto} className="round-profile" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column',flex:1 }}>
            <div className="strong-type" style={{maxWidth:'80%'}}>{ConvoName}</div>
            <div className="slim-type" style={{maxWidth:'80%'}}>{metadata?.lastMessage}</div>
        </div>
    </div>
})

const SelectChatSideBar = ({ InvolvedChats, selectedChat, setselectedChat, useruid }: any) => {

    //get the involved chats and show them one by one in a left side of the screen from a new compo 
    return <div className="chats-preview">
        {InvolvedChats.map((chatuid: string) => {
            return <div style={{backgroundColor:`${selectedChat === chatuid?"#d3d3d3":"white"}`,display:'flex',flexDirection:'column',width:'100%'}} onClick={() => { setselectedChat(chatuid) }}>
                <Chat chatuid={chatuid} useruid={useruid}/>
                <hr className="separator"/>
            </div>
        })}

    </div>

}

export default SelectChatSideBar