import { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import './css/popupStyle.css'
import './css/design.css'
import SlidingButton from "../CustomComponents/SlidingButton";
import { FaUserDoctor } from "react-icons/fa6";
import NotificationButton from "../CustomNotifications/Notifications";
import { FaCalendarAlt } from "react-icons/fa";
import { get, getDatabase, onValue, ref } from "firebase/database";
import { app } from "../../App";
import { FaFileMedical } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { FaUserEdit } from "react-icons/fa";
import { VscTriangleRight } from "react-icons/vsc";
import { VscTriangleLeft } from "react-icons/vsc";
import FriendListManager from "../FriendsList/FriendListManager";
import DoctorAccountCreation from "../AuthGroup/DoctorAccountCreation";
import Connector from "../MedicalDocuments/Connector";
import ConnectorChat from "../RealTimeChat/Connector";
import AppointmentsCalendar from "../calendar/AppointmentsCalendar";
import { FaUserFriends } from "react-icons/fa";
import OrganizationDoctorAccountManager from "../FriendsList/OrganizationDoctorAccountManager";
import { MdManageAccounts } from "react-icons/md";
import { toast } from "react-toastify";
import InvestigationMain from "../InvestigationPanel/InvestigationMain";
import Logo from "../CustomComponents/FromPhotoToIcon";
import investigationPhoto from "../../assets/investigation_button.svg"

const SwicthTabContext = createContext({})//make a context to give variables to the child components in the react tree
                                        //used by live chat mostly to know with which conversation to start displaying instead of none
const CurrentTabContext = createContext({})//to navigate to the calendar through 

const Home = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const [status, changeStatus] = useState<string>('')//the users status pacient,doctor,organization
    const [expandsidebar, setexpandsidebar] = useState<boolean>(false)//sidebar that uses extending buttons
    const [selectedTab, setselectedTab] = useState<string>("")//what tab is selected
    const [DefaultSelectedChat, setDefaultSelectedChat] = useState<string>("")//if using the friends tab what user to be by default chosen when entering

    const [DisableStatus, setDisableStatus] = useState<boolean | null>(false)//if the account is dissabled

    const { email, id } = location.state//get the email and id given by the auth service from the firebase when logged in successfully

    useEffect(() => {
        //fetch the user status
        const db = getDatabase(app)

        const fetchname = async () => {
            changeStatus((await get(ref(db, `users/${id}/status`))).val())
        }
        fetchname()
    }, [])

    useEffect(() => {
        //the default tab to be loaded when you first load the page
        setselectedTab(status === "organization" ? "doctoraccountmanager" : "friends")
    }, [status])

    useEffect(() => {
        ///gets the disabled status with a listener to kick out any doctor at any time if the accounts are disabled
        const db = getDatabase(app)
        const unsub = onValue(ref(db, `users/${id}/SuspendedAccount`), snapshot => {
            setDisableStatus(snapshot.val())
        })

        return () => unsub()
    }, [])

    //navigate out
    if (DisableStatus === true) {
        navigate('/login')
        toast("Account disabled contact your employer for help!")
    }


    //display them in a if like manner but only one can be displayed at a time
    //maybe i'll add multitasking someday
    return <div className="home">
        <div className="top-bar">
            <CurrentTabContext.Provider value={{setselectedTab:setselectedTab,selectedTab:selectedTab}}>
                <NotificationButton uid={id} status={status} />
            </CurrentTabContext.Provider>
        </div>
        <div className="rest-area">
            <div className="side-bar">
                <div className="expander" onClick={() => { setexpandsidebar(!expandsidebar) }}>{expandsidebar === true ? <VscTriangleLeft /> : <VscTriangleRight />}</div>
                {status === "organization" && <div className="wholebtns">
                    <SlidingButton willopen={expandsidebar} icon={FaUserDoctor} onClick={() => { setselectedTab("doctoraccountcreation") }}>Create Doctor Account</SlidingButton>
                    <hr className="separator"></hr>
                </div>}
                {status === "organization" && <div className="wholebtns">
                    <SlidingButton willopen={expandsidebar} icon={MdManageAccounts} onClick={() => { setselectedTab("doctoraccountmanager") }}>Doctor Account Manager</SlidingButton>
                    <hr className="separator"></hr>
                </div>}
                {(status === "pacient" || status === "doctor") && <div className="wholebtns">
                    <SlidingButton willopen={expandsidebar} icon={FaCalendarAlt} onClick={() => { setselectedTab("calendar") }}>See your Calendar</SlidingButton>
                    <hr className="separator"></hr>
                </div>}
                {(status === "pacient" || status === "doctor") && <div className="wholebtns">
                    <SlidingButton willopen={expandsidebar} icon={FaFileMedical} onClick={() => { setselectedTab("meddocs") }}>my medical documents</SlidingButton>
                    <hr className="separator"></hr>
                </div >}
                {(status === "pacient" || status === "doctor") && <div className="wholebtns">
                    <SlidingButton willopen={expandsidebar} icon={CgProfile} onClick={() => { navigate('/home/profile', { state: { uid: id, status: status } }) }}>profile</SlidingButton>
                    <hr className="separator"></hr>
                </div>}
                {(status === "pacient" || status === "doctor") && <div className="wholebtns">
                    <SlidingButton willopen={expandsidebar} icon={FaUserFriends} onClick={() => { setselectedTab("friends") }}>{status === "pacient" ? "doctors" : "pacients"}</SlidingButton>
                    <hr className="separator"></hr>
                </div>}
                {(status === "pacient" || status === "doctor") && <div className="wholebtns">
                    <SlidingButton willopen={expandsidebar} icon={FaUserEdit} onClick={() => { setselectedTab("chat") }}>Chat</SlidingButton>
                    <hr className="separator"></hr>
                </div>}
                {(status === "pacient" || status === "doctor") && <div className="wholebtns">
                    <SlidingButton willopen={expandsidebar} icon={() => <Logo img_path={investigationPhoto} />} onClick={() => { setselectedTab("investigations") }}>Investigations</SlidingButton>
                    <hr className="separator"></hr>
                </div>}
            </div>
            <div className="main-content">
                <SwicthTabContext.Provider value={{
                    setselectedTab,
                    setDefaultSelectedChat
                }}>
                    {selectedTab === "friends" ? <FriendListManager uid={id} status={status} /> : <></>}
                    {selectedTab === "doctoraccountcreation" ? <DoctorAccountCreation id={id} /> : <></>}
                    {selectedTab === "calendar" ? <AppointmentsCalendar uid={id} status={status} /> : <></>}
                    {selectedTab === "meddocs" ? <Connector uid={id} status={status} /> : <></>}
                    {selectedTab === "chat" ? <ConnectorChat uid={id} DefaultSelectedChat={DefaultSelectedChat} /> : <></>}
                    {selectedTab === "doctoraccountmanager" ? <OrganizationDoctorAccountManager uid={id} /> : <></>}
                    {selectedTab === "investigations" ? <InvestigationMain uid={id} status={status} /> : <></>}
                </SwicthTabContext.Provider>
            </div>
        </div>


    </div >
}

export default Home
export { SwicthTabContext,CurrentTabContext }