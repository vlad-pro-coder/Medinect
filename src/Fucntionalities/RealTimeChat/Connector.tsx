import { getDatabase, onValue, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { app } from "../../App"
import SelectChatSideBar from "./SelectChatSideBar"
import ChatSideBar from "./ChatSideBar"
import './design.css'

const Connector = ({ uid ,DefaultSelectedChat}:any) =>{

    //chats in which the user is involved
    const [InvolvedChats,setInvolvedChats]=useState([])
    const [selectedChat,setselectedChat] = useState(DefaultSelectedChat)//the selected chat

    useEffect(()=>{

        const db = getDatabase(app)

        //a listener to check in what chats he is in and update if any modifications appear
        const unsub = onValue(ref(db,`users/${uid}/involvedchats`), snapshot =>{
            if(snapshot.val())
                setInvolvedChats(snapshot.val())
            else
            setInvolvedChats([])
        })

        return ()=>unsub();//remove listener
    },[uid])

    //print the 2 instances the sidebar to show your chats and another sidebar to show the messages 
    return <div className="big-container">
        <div className="schrinked-View">
        <SelectChatSideBar InvolvedChats={InvolvedChats} selectedChat = {selectedChat} setselectedChat={setselectedChat} useruid={uid}/>
        {selectedChat === ""?<div style={{width:'100%',height:'100%',backgroundColor:'#f5f5f5'}}></div>:<ChatSideBar chatuid = {selectedChat} PerspectiveUID={uid} key={selectedChat}/>}
        </div>
    </div>

}

export default Connector