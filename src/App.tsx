import { Route, Routes, useLocation } from 'react-router-dom'
import StartPage from './Fucntionalities/StartingPage/startPage'
import LoginPage from './Fucntionalities/AuthGroup/LoginPage'
import RegisterPage from './Fucntionalities/AuthGroup/OverAllRegister'
import ParticleComponent from './Fucntionalities/AuthGroup/designRelated/BackGroundParticles'
import { useEffect, useState } from 'react'

import { initializeApp } from "firebase/app";
import Home from './Fucntionalities/homePage/Home'
import ProfileManagerView from './Fucntionalities/Profile/ProfileManagerView'
import NormalProfileView from './Fucntionalities/Profile/NormalProfileView'
import {ToastContainer} from 'react-toastify'
import EmailRelatedVerification from './Fucntionalities/AuthGroup/EmailRelatedVerification'

//firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCXSBla8HPxYdH9PjIdQTX0Nyiu8ei9Lao",
  authDomain: "medical-project-39a59.firebaseapp.com",
  databaseURL: "https://medical-project-39a59-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "medical-project-39a59",
  storageBucket: "medical-project-39a59.firebasestorage.app",
  messagingSenderId: "525371411701",
  appId: "1:525371411701:web:19441479d93a5260b309bc",
  measurementId: "G-MMKVF8KZV3"
};

const app = initializeApp(firebaseConfig);//initialize firebase

const BackgroundHangler = ({ children }: any) => {
  const location = useLocation(); 
  const [showParticles, setShowParticles] = useState(true); 
  //the particles background is only shown to some paths not all that have a different path in the app
  useEffect(() => { 
    const pathsWithParticles = ['/', '/login', '/register'];
    setShowParticles(pathsWithParticles.includes(location.pathname));
  },[location])

    return <>
      {showParticles && <ParticleComponent />}
      {children}
    </>
}

  function App() {

    //all the possible routes it can get you to.
    //this app is more state dependent and not new page dependent, meaning it likes to load new components rather than loading them in a separate link path
    return (
      <div style={{ position: 'relative', width: '100vw', height: '100vh'}}>
        <ToastContainer/>{/*the toast container for notifications */}
        <BackgroundHangler>{/*the particles background */}
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/home/profile" element={<ProfileManagerView />}/>
          <Route path="/home/ProfilePreview" element={<NormalProfileView />}/>
          <Route path="/emailrelatedverifications" element={<EmailRelatedVerification />}/>
        </Routes>
        </BackgroundHangler>
      </div>
    )
  }

  export default App
  export {app}
