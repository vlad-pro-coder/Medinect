import { useNavigate } from 'react-router-dom';
import './design.css'
import ButtonWithSliderDown from '../CustomComponents/ButtonWithSliderDown';
import ParallaxTitle from './ParallaxTitle';
import WindowWithPhotoAndText from '../CustomComponents/WindowWithPhotoAndText';

import ColumnsOfSmallPhotoandText from '../CustomComponents/ColumnsOfSmallPhotoandText';

import f1 from '../../assets/FeaturesPhotosIcons/ai-recipes-transformar-to-text.png'
import f2 from '../../assets/FeaturesPhotosIcons/chat-with-doctor.png'
import f3 from '../../assets/FeaturesPhotosIcons/files-in-cloud.png'
import f4 from '../../assets/FeaturesPhotosIcons/recipes-lookup.png'
import f5 from '../../assets/FeaturesPhotosIcons/calendar.png'

import nocontact from '../../assets/problemsPhoto/nocontact.svg'
import notime from '../../assets/problemsPhoto/notime.svg'
import unorganized from '../../assets/problemsPhoto/unorganized.svg'

import adaptable from '../../assets/adaptable.png'
import anyprofesion from '../../assets/anyprofesion.png'

import easynav1 from '../../assets/FeaturesPhotosIcons/easynav1.png'
import easynav2 from '../../assets/FeaturesPhotosIcons/easynav2.png'

import doctorsorganization from '../../assets/FeaturesPhotosIcons/doctorsorganization.png'
import doctorspacient from '../../assets/FeaturesPhotosIcons/doctorspacient.png'

import medicalrecords from '../../assets/FeaturesPhotosIcons/medicalrecords.png'
import chatswithdoctor from '../../assets/FeaturesPhotosIcons/chatswithdoctor.png'
import editrpofile from '../../assets/FeaturesPhotosIcons/editrpofile.png'
import makeappointments from '../../assets/FeaturesPhotosIcons/makeappointments.png'
import addediterase from '../../assets/FeaturesPhotosIcons/addediterase.png'
import notification from '../../assets/FeaturesPhotosIcons/notifications.png'

import Category from '../CustomComponents/Category';
import PhotoSmallTextScroller from '../CustomComponents/PhotoSmallTextScroller';
import BottomMoreInfo from './BottomMoreInfo';

const TopBar = () => {

    const navigate = useNavigate()
    //the top bar for login and register that takes you there

    return <div className='navbar-logreg'>
        <ButtonWithSliderDown onClick={() => { navigate('/login') }}>Login</ButtonWithSliderDown>
        <ButtonWithSliderDown onClick={() => { navigate('/register') }}>Register</ButtonWithSliderDown>
    </div>
}

const StartPage = () => {

    //the starter page with everything that describes the app
    return <div className='container-start' >
        <TopBar />
        {/*the paralax displayed*/}
        <div style={{ height: '800px' }}>
            <ParallaxTitle />
        </div>
        <div>
        {/*the components take displays columns of photos and text one after another */}
            <ColumnsOfSmallPhotoandText title={"Common hospital problems:"} Features={[
                { photo: notime, text: "Tired of long hours lost waiting to see a doctor?" },
                { photo: unorganized, text: "Medical documents stranded everywhere, do you think just tossing them somewhere will resolve your menagement problem?" },
                { photo: nocontact, text: "In public institution you can hardly contact back your doctor, maybe you have a question, will you just make another appointment or go through the whole hospital, just for a question?" },
            ]} />
            {/*animated category*/}
            <Category>Our Mission:</Category>
            {/*the photos on the left in a grid like and text on the right*/}
            <WindowWithPhotoAndText PhotoList={[
                adaptable,
                anyprofesion
            ]}>
                To help you an your hospital prepare better, when you want to make an appointment. Our solution adapts to the already present system so it forces no one to follow our view of how the medical system should work. We make the current system easier for everyone no matter thier profesion.
            </WindowWithPhotoAndText>
            <Category>What we offer:</Category>
            <ColumnsOfSmallPhotoandText title={"Feature rich application:"} Features={[
                { photo: f5, text: "Easily make appointments to your doctor and know always when you have it in through our calendar" },
                { photo: f2, text: "Any added doctor to your account can be easily contacted, with real time response" },
                { photo: f3, text: "Put photos of your medical documents directly in our cloud where you can see them organized and easy to find" },
                { photo: f1, text: "Our A.I. model that translates text from photos paired up with our web robot" },
                { photo: f4, text: "Want to order your medicine? Our web robot can help you get what you want from trusted vendors" },
            ]} />
            <WindowWithPhotoAndText PhotoList={[
                easynav1,
                easynav2
            ]}>
                Easily navigate through your account
            </WindowWithPhotoAndText>
            <WindowWithPhotoAndText PhotoList={[
                doctorsorganization,
                doctorspacient
            ]} reverted={true}>
                Manage your doctors as a pacient or manage their accounts as an organization
            </WindowWithPhotoAndText>
            {/*the scroller */}
            <PhotoSmallTextScroller DataDisplay={[
                {photo:medicalrecords,text:"preview your medical records to know which to choose without remembering their name!"},
                {photo:makeappointments,text:"request an appointment to your doctor, so he can easily adjust to your needs!"},
                {photo:chatswithdoctor,text:"contact your doctors and send them refferences to your medical documents!"},
                {photo:editrpofile,text:"edit your profile so everybody can see everything up to date!"},
                {photo:addediterase,text:"you are in control of your documents, add, edit or erase as you please!"},
                {photo:notification,text:"be up to date with any new changes made to your account, by your doctors or you!"}
            ]}/>
            
            {/*bottom text*/}
            <BottomMoreInfo />
        </div>
    </div>
}
export default StartPage;