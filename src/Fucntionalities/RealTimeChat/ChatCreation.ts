import { get, getDatabase, ref, set } from "firebase/database"
import { app } from "../../App"

//to create a instance of 1-1 chat
export const one_to_one_chat_creation = async (uid1:string,uid2:string) =>{
    
    const db = getDatabase(app)

    //get create the id of the chat
    const chatuid = uid1 < uid2 ? uid1 +"_"+ uid2 : uid2 +"_"+ uid1

    //create a new entry in the the firebase database
    await set(ref(db,`chats/${chatuid}`),{
        participants:[uid1,uid2],//the participants
        typeOfConvo:"1-1",//type of convo
        ConvoPhotoPath:"",//the photo attachments
        CreationDate:new Date(),//the creation date
        lastMessage:"",//last message pure string
        NameOfConvo:"",//the name of convo
        ActiveChat:true,//if chat is active(inactive when the users are no longer friends)
    })

    //adds the chat to both doctor and pacient
    const involvedchats1:string[] = ((await get(ref(db, `users/${uid1}/involvedchats`))).val() || [])
    const involvedchats2:string[] = ((await get(ref(db, `users/${uid2}/involvedchats`))).val() || [])

    //if they already are in the chats(they've been friends before just ignore) 
    if(!involvedchats1.includes(chatuid))
        involvedchats1.push(chatuid)
    if(!involvedchats2.includes(chatuid))
        involvedchats2.push(chatuid)
    
    //set the newly created lists back to their place
    await set(ref(db, `users/${uid1}/involvedchats`),involvedchats1)
    await set(ref(db, `users/${uid2}/involvedchats`),involvedchats2)

}

//in progress to create one to multiple chat
export const one_to_more_chat_creation = () =>{

}

