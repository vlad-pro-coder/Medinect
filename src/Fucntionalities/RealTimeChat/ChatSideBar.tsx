import { addDoc, collection, getDocs, getFirestore, limit, orderBy, Timestamp, query, onSnapshot, startAfter } from "@firebase/firestore";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { app } from "../../App";
import { get, getDatabase, onValue, ref, ref as refdb, set } from "firebase/database";
import { getDownloadURL, getMetadata, getStorage, ref as refstg, uploadBytes, UploadResult } from "firebase/storage";
import { PrintPhoto, Unsupported } from "./SupportedFiles";
import { IoSend } from "react-icons/io5";
import { MdAddLink } from "react-icons/md";
import PreviewSelectedRecord from "../MedicalDocuments/dependencies/PreviewSelectedRecordPopup";
import Modal from 'react-modal';

interface chatFormat {
    messageID: string;
    From: string;
    Message: string;
    Attachment: string;///paths to storage
    TimeStamp: Timestamp;
}

interface contentMessage {
    text: string;
    Attachments: File[];
}

const HardLimit = 20;

interface ApartText {
    text: string;
    command: string;
}

const Message = memo(({ chatinfo, photos, PerspectiveUID }: any) => {
    //also uses memo to not load all the messages after the parent updates but only the neccesery one

    const [ArrayOfText, setArrayOfText] = useState<ApartText[]>([])//the tokened text
    const [showDoc, setshowDoc] = useState<boolean>(false)//rather to show or to not show
    const [showDocPath, setshowDocPath] = useState<boolean>(false)//the host reference for a doc preview
    const TimeStampDate = chatinfo.TimeStamp.toDate()//when was sent

    const PrintFormatedArray = () => {
        const db = getDatabase(app)
        const RedirectToMedDoc = useCallback(async (HostID: string) => {
            console.log(`HostedReferences/HostData/${HostID}/path`)
            const path = (await get(refdb(db, `HostedReferences/HostData/${HostID}/path`))).val()
            setshowDocPath(path)
            setshowDoc(true)
        }, [setshowDocPath, setshowDoc])

        return <div>
            {
                ArrayOfText.map((FormatText: ApartText) => {
                    if (FormatText.command === "normalText") {
                        return <span className="text">{FormatText.text}</span>
                    }
                    else if (FormatText.command === "MedDoc") {
                        return <span className="link-text" onClick={() => { RedirectToMedDoc(FormatText.text) }}>Medical Document Link</span>
                    }
                    return <div>problem parsing</div>
                })
            }
        </div>
    }

    const year = TimeStampDate.getFullYear();
    const month = TimeStampDate.getMonth() + 1; // Months are zero-based, so we add 1
    const day = TimeStampDate.getDate();
    const hours = TimeStampDate.getHours();
    const minutes = TimeStampDate.getMinutes();

    // Format the date and time as a string
    const formattedDate = `${month}/${day}/${year} ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;

    const [url, seturl] = useState<string>("")

    useEffect(() => {
        const CutDownTextForTextCommands = () => {
            const regex = new RegExp("@", "g"); // Global search for the character
            const matches = chatinfo.Message.matchAll(regex);//finds all special encoding from the text

            let LastCopied = 0;//last token
            let arrayOfText: ApartText[] = []//the newly formated text

            for (const match of matches) {
                const index = match.index//takes up every global instance of @
                if (index !== undefined) {//to not create problems
                    arrayOfText.push({ text: chatinfo.Message.substring(LastCopied, index), command: "normalText" })//from the last copied to the index there is only good already formated text 
                    const space1index = chatinfo.Message.indexOf(" ", index)//first space in the notation "@meddoc {code} "
                    const space2index = chatinfo.Message.indexOf(" ", space1index + 1) === -1 ? chatinfo.Message.length : chatinfo.Message.indexOf(" ", space1index + 1)//second space where the special command ends "@meddoc {code} "

                    const command = chatinfo.Message.substring(index + 1, space1index)//the command part
                    const params = chatinfo.Message.substring(space1index + 1, space2index)//the params of the command part

                    arrayOfText.push({ text: params, command: command })//push the params and the type of command

                    LastCopied = space2index//continue from here with the formatting
                }
            }
            arrayOfText.push({ text: chatinfo.Message.substring(LastCopied), command: "normalText" })//pushes the last part of the sgtring it is not taken into account earlier
            setArrayOfText(arrayOfText)//set the formated text
        }

        CutDownTextForTextCommands()
    }, [chatinfo])//loaded only once


    useEffect(() => {
        const fetchdata = async () => {
            if (chatinfo.Attachment !== "") {//the chat info attachemnt like a photo or a unsupported file
                const storage = getStorage(app)
                seturl(await getDownloadURL(refstg(storage, chatinfo.Attachment)))
            }
        }
        fetchdata()
    }, [chatinfo])

    const PrintSupported = () => {//for file display
        if (chatinfo.Message.startsWith("image/"))
            return <PrintPhoto url={url} />
        else
            return <Unsupported url={url} />
    }

    //here we print our modal(popup) with the clicked meddoc or any command 
    //we also print the message by checking if its a file or a message
    //if its a file "PrintSupported" will handle it
    //otherwise just the above formated string of tokened array for print links to the command i neccesery
    return <div className={`message ${PerspectiveUID !== chatinfo.From ? "message-received" : "message-sent"}`}>
        <Modal
            isOpen={showDoc}
            onRequestClose={() => { setshowDoc(false) }}
            contentLabel="Example Modal"
            className="modal-content"
            overlayClassName="modal-overlay"
        >
            <div style={{height:'100vh'}}>
                <div style={{height:'100px'}}></div>
            {showDocPath ? <PreviewSelectedRecord path={showDocPath} onBackClick={() => { setshowDoc(false) }} EditStatus={false} DeleteStatus={false} doctorUID={"cineva"} whoisee={""} /> :
                <div>Medical document host is down or doesnt exist</div>}
                </div>
        </Modal>
        <img src={photos[chatinfo.From]} className="round-profile" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: `${PerspectiveUID !== chatinfo.From ? "flex-start" : "flex-end"}` }}>
            <div style={{ marginRight: `${PerspectiveUID !== chatinfo.From ? "10px" : "0"}`, marginLeft: `${PerspectiveUID !== chatinfo.From ? "0px" : "10px"}` }}>{formattedDate}</div>
            <div style={{ display: 'flex', flexDirection: `${PerspectiveUID !== chatinfo.From ? "row-reverse" : "row"}` }}>
                <div className="wraper-msg">
                    {chatinfo.Attachment === "" ? <PrintFormatedArray /> : <PrintSupported />}
                </div>
                <div className="tail"></div>
            </div>
        </div>
    </div>
})
const MessagesContainer = memo(({ chats, photos, PerspectiveUID }: any) => {

    //we use memo to update only when the props update
    //back in the day while i was typing in the textarea with the text it would reload multiple times the messages which is not ideal at all
    return <div>
        {
            chats.map((chat: chatFormat) => {
                return <Message key={chat.messageID} chatinfo={chat} photos={photos} PerspectiveUID={PerspectiveUID} />
            })
        }
    </div>
})

const ChatSideBar = ({ chatuid, PerspectiveUID }: any) => {

    const loaderRef = useRef<any>(null)//the loader that shows when new data is loading
    const timeoutRef = useRef<any>(null)//a timeout for checking if the trigger is in sight
    const [hasMore, setHasMore] = useState<boolean>(true)//if it has more
    const [loading, setLoading] = useState<boolean>(false)//if it's loading more
    const [loadingMore, setloadingMore] = useState<boolean>(false)

    const [isChatActive, setisChatActive] = useState<boolean>(false)//if the chat is active

    console.log(hasMore)

    const sendMessage = async (content: contentMessage) => {
        const firedb = getFirestore(app)//everything is set in the firestore

        const processFile = async (file: File) => {
            try {
                // Initialize Firebase Storage
                const storage = getStorage();

                // Create a reference in Firebase Storage
                const storageRef = refstg(storage, `chatAttachments/${chatuid}/${file.name}`);

                // Upload the file
                const result: UploadResult = await uploadBytes(storageRef, file);

                //return the path and content type
                return { path: result.metadata.fullPath, type: (await getMetadata(storageRef)).contentType }

            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }

        try {
            const messagesRef = collection(firedb, "Chats", chatuid, "messages");//the path firebase path
            if (content.text != "")//for messages that are not null
                await addDoc(messagesRef, {
                    From: PerspectiveUID,
                    Message: content.text,
                    Attachment: "",
                    TimeStamp: Timestamp.now(),
                });

                //for every file that has been attached to the list will we saved independently
            for (const file of content.Attachments) {
                const { path, type }: any = await processFile(file)
                await addDoc(messagesRef, {
                    From: PerspectiveUID,
                    Message: type,
                    Attachment: path,
                    TimeStamp: Timestamp.now(),
                });
            }


//everything successful
            console.log("Message sent!");
        } catch (error) {
            //error
            console.error("Error sending message: ", error);
        }
    };
    //sent photos
    const [photos, setPhotos] = useState<any>({})

    useEffect(() => {
        const db = getDatabase(app)
        const unsub = onValue(refdb(db, `chats/${chatuid}/ActiveChat`), snapshot => {
            setisChatActive(snapshot.val())//if the chat is active listener
        })
        return () => unsub()
    }, [chatuid])

    useEffect(() => {
        const storage = getStorage(app)
        const db = getDatabase(app)

        //listener for updates in the metadata of the currently selected chat
        const unsub = onValue(refdb(db, `chats/${chatuid}`), async snapshot => {
            const participants = snapshot.val()?.participants
            const userphotos: any = {}
            const promises = participants.map(async (uid: string) => {
                userphotos[uid] = await getDownloadURL(refstg(storage, `profilePictures/${uid}`))
            })

            await Promise.all(promises)

            setPhotos(userphotos)
        })

        return () => unsub()

    }, [chatuid])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && hasMore) {
///the observer that triggers when the trigger is in sight
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);

                    //little timeout to not spam commands
                    timeoutRef.current = setTimeout(() => {
                        fetchOlderMessages()
                    }, 300);

                }
            },
            { threshold: 1.0 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);//load observer
        }

        return () => {
            ///stop observer on unmount
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current); // Clean up timeout on unmount
            }
        };
    }, [loaderRef.current, loading, hasMore,chatuid]);

    const [initialMessages, setInitialMessages] = useState<chatFormat[]>([]); // First batchsize messages
    const [newMessages, setNewMessages] = useState<chatFormat[]>([]); // New messages
    const [olderMessages, setOlderMessages] = useState<chatFormat[]>([]); // Older messages
    const [lastFetchedDoc, setLastFetchedDoc] = useState<any>(null); // For pagination

    useEffect(() => {
        // Fetch initial 20 messages and set up the snapshot listener
        const firedb = getFirestore(app)
        const messagesRef = collection(firedb, "Chats", chatuid, "messages");
        let startdoc: any = null;

        const fetchInitialMessages = async () => {
            setloadingMore(true)
            setLoading(true)///to not start other loadings without this being done

            const messagesQuery = query(messagesRef, orderBy("TimeStamp", "desc"), limit(HardLimit));//organize them by timestamp

            const snapshot = await getDocs(messagesQuery);//the snapshot with values
            const messages: chatFormat[] = snapshot.docs.map(doc => ({//the messages it got just add them to the lists
                messageID: doc.id,
                From: doc.data().From,
                Message: doc.data().Message,
                Attachment: doc.data().Attachment,
                TimeStamp: doc.data().TimeStamp,
            }));

            // Save initial messages and last fetched document
            setInitialMessages(messages);//these are the initial messages
            if (snapshot.docs.length > 0) {
                //setting the last doc fetched to continue from there
                setLastFetchedDoc(snapshot.docs[snapshot.docs.length - 1]);
                startdoc = snapshot.docs[0]
            }
            setloadingMore(false)
            setLoading(false)// can load more now

            // Set up snapshot listener for new messages
            const unsub = onSnapshot(
                query(messagesRef, orderBy("TimeStamp", "asc"), startAfter(startdoc)), // Listen for new messages in ascending order
                snapshot => {
                    const newMessagesArr: chatFormat[] = [];
                    snapshot.docChanges().forEach(change => {
                        if (change.type === "added") {//this is for new messages that were added
                            newMessagesArr.push({
                                messageID: change.doc.id,
                                From: change.doc.data().From,
                                Message: change.doc.data().Message,
                                Attachment: change.doc.data().Attachment,
                                TimeStamp: change.doc.data().TimeStamp,
                            });
                        }
                    });

                    // Append new messages to the newMessages state
                    setNewMessages(prev => [...prev, ...newMessagesArr]);//set the new messages
                }
            );



            return () => unsub(); // Clean up listener on unmount
        }

        fetchInitialMessages();

    }, [chatuid]);

    // Fetch older messages on demand (e.g., on scroll)
    const fetchOlderMessages = async () => {
        if (!lastFetchedDoc && loading) return;//dont run when other loading is happening
        setLoading(true)//to not lete other loading happen
        setloadingMore(true)

        const firedb = getFirestore(app)
        const messagesRef = collection(firedb, "Chats", chatuid, "messages");
        const messagesQuery = query(//this is the query
            messagesRef,
            orderBy("TimeStamp", "desc"),
            startAfter(lastFetchedDoc), // Fetch messages after the last one we already have
            limit(HardLimit)
        );

        const snapshot = await getDocs(messagesQuery);
        const olderMessagesArr = snapshot.docs.map(doc => ({//now we get the snapshot and the older messages 
            messageID: doc.id,
            From: doc.data().From,
            Message: doc.data().Message,
            Attachment: doc.data().Attachment,
            TimeStamp: doc.data().TimeStamp,
        }));

        // Update older messages and the last fetched doc
        setOlderMessages(prev => [...prev, ...olderMessagesArr]);//add to the already exisiting
        if (snapshot.docs.length > 0) {
            setLastFetchedDoc(snapshot.docs[snapshot.docs.length - 1]);//set the last fetched doc to start over from here
        }

        console.log(snapshot.docs.length)
        if (snapshot.docs.length >= 0 && snapshot.docs.length < HardLimit)
            {setHasMore(false)//no more messages to check so it blocks the observer to not render or try to render anything else
                console.log("no more",chatuid)
                console.log(snapshot.docs.length,"how many")
            }
        setLoading(false)//eveything back to normal new messages can get loaded
        setloadingMore(false)
    };

    useEffect(() => {
        //this sets the lastmessage to the newly sent message by someone of the two comunicationg
        const displayMsgMetadata = async () => {
            const db = getDatabase(app)
            const lastname = (await get(ref(db, `users/${newMessages[newMessages.length - 1].From}/profile/LastName`))).val()
            set(ref(db, `chats/${chatuid}/lastMessage`), lastname + ": " + newMessages[newMessages.length - 1].Message)
        }
        if (newMessages.length > 0)//if there are new messages
            displayMsgMetadata()
    }, [newMessages, app,chatuid])

    // Combine messages for rendering

    const scrollToBottom = () => {
        //by default it scrolls to the end of the conversation to not load continuosly messages and for asthetic
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();//scrolls to the bottom
    }, [initialMessages,chatuid]);

    //this updates the total chats only when these 3 lists change
    //if they dont change then javascript keeps the same reference because javascript compares based on memory reference and not accuall values, at least lists check them this way 
    const chats = useMemo(() => [...olderMessages.slice().reverse(), ...initialMessages.slice().reverse(), ...newMessages],
        [olderMessages, initialMessages, newMessages,chatuid])
        console.log(chats.length)

    const [text, setText] = useState<string>("")//the text written
    const [files, setFiles] = useState<File[]>([])//the files seleced

    const messagesEndRef = useRef<HTMLDivElement | null>(null);//where it scrolls when new messages flow in
    const FileRef = useRef<any>(null)//just the file ref
    const textareaRef = useRef<any>(null);//text are ref

    useEffect(() => {
        const textarea = textareaRef.current;
        //this rearanges the text area to get bigger as you type more
        if(textarea)
        {
            textarea.style.height = 'auto';  // Reset the height to auto
            textarea.style.height = `${textarea.scrollHeight}px`;  // Set the height to match the content's scrollHeight
        }

    }, [text]);

    const handleRemoveFile = (index: number) => {//the remove files from the container when you want to send some
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index)); // Filter out the file by index
    };

    //here we display the messages along with the container for selected files from your pc, along with the ussuall text field and add attachment button and send button
    return <div className="chatcontainer">
        {//the messages
        loadingMore ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="loader"></div></div> : <></>}
        <div className="messages">
            <div ref={loaderRef} style={{ height: '20px' }}></div>
            <MessagesContainer chats={chats} photos={photos} PerspectiveUID={PerspectiveUID} />
            <div ref={messagesEndRef} />
        </div>

        <div style={{display:'flex',justifyContent:'flex-end',flexDirection:'column'}}>
        {//the container with files
        files.length ? <div
            style={{
                minHeight: '100px',
                maxHeight: '200px', // Set max height for the container
                overflowY: 'auto', // Enable vertical scrolling
                marginTop: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                padding: '5px',
                backgroundColor: '#fafafa',
            }}
        >

            <ul style={{ listStyleType: 'none', padding: 0, marginTop: '10px' }}>
                {files.map((file, index) => (
                    <li
                        key={index}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#f5f5f5',
                            marginBottom: '5px',
                            padding: '10px',
                            borderRadius: '5px',
                            border: '1px solid #ddd'
                        }}
                    >
                        <span>{file.name}</span>
                        <button
                            onClick={() => handleRemoveFile(index)}
                            style={{
                                backgroundColor: '#ff5c5c',
                                border: 'none',
                                color: 'white',
                                padding: '5px 10px',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
        </div> : <></>}

        {//the text area along with the 2 buttons for file attachment and sending the string message
        isChatActive ? <div className="messageInput">

            <button onClick={() => {
                FileRef.current.click()
            }} className="circle-btn"><MdAddLink /></button>
            <textarea ref={textareaRef} value={text} onChange={(e) => { setText(e.target.value) }} className="chat-input" />
            <input ref={FileRef} style={{ display: 'none' }} type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files == null ? [] : e.target.files))} />
            {text === "" && !files ? <></> : <button className="circle-btn" onClick={() => {
                sendMessage({ text: text, Attachments: files })
                setFiles([])
                setText("")
            }}><IoSend /></button>}
        </div>:<div className="messageInput" style={{height:'40px'}}>
            Chat is disabled, add him again as your Doctor/Pacient
            </div>}
            </div>
    </div>

}

export default ChatSideBar