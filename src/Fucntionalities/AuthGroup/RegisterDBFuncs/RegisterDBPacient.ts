
//structure
/*
inputs[0] = First Name
inputs[1] = Last Name
inputs[2] = personal phone number
inputs[3] = email
inputs[4] = date
inputs[5] = gender
inputs[6] = Address
inputs[7] = ID
inputs[8] = Emergency contact name
inputs[9] = Emergency contact number
*/

import { createUserWithEmailAndPassword, getAuth, sendEmailVerification } from "firebase/auth";
import { app } from "../../../App"
import { getDatabase, ref, set } from "firebase/database";
import { doc, getFirestore, setDoc } from 'firebase/firestore'
import { getStorage, uploadBytes, ref as storageref } from "firebase/storage";

import photo from '../../../assets/DefaultProfilePhoto.jpg'
import { toast } from "react-toastify";

const RegisterDBPacient = async (Inputs: any[], changeUserCreated: any) => {
  /* get firebase functionalities */
  const auth = getAuth(app);
  const db = getDatabase(app);
  const storage = getStorage(app);
  const firedb = getFirestore(app)

  /* on sign in create doctor in auth */
  await createUserWithEmailAndPassword(auth, Inputs[3], Inputs[10]).then((userCredential) => {
    // Signed up 
    const user: any = userCredential.user.email;
    const uid = userCredential.user.uid

    changeUserCreated({ email: user, id: uid })
    /*set up the profile of the user in the database */
    try {
      set(ref(db, 'users/' + uid + '/profile'), {
        FirstName: Inputs[0],
        LastName: Inputs[1],
        personal_phone_number: Inputs[2],
        email: Inputs[3],
        date: Inputs[4],
        Gender: Inputs[5] ? "Male" : "Female",
        address: Inputs[6],
        CNP: Inputs[7],
        Emergency_contact_name: Inputs[8],
        Emergency_contact_number: Inputs[9],
      });
      set(ref(db,`users/${uid}/status`),"pacient")//set status
      sendEmailVerification(userCredential.user);//send email to verify cause it won't verify itself
      
      toast("An email was sent to your inbox for confirmation.\nThe email doesn't have a time limit.")
      toast("Pacient account created")// send successful messages
    } catch (err:any) {
      //internal error in the database for debugging
      console.error(err, "database initialization")
      toast(`${err.message}`)
      return 
    }

    try {
      const putstorage = async () => {
        ///put the default profile picture in the users account as its profile photo(can be changed later)
        const response = await fetch(photo);
        const blob = await response.blob();
        const storageRef = storageref(storage, `profilePictures/${uid}`);
        await uploadBytes(storageRef, blob)
      }

      putstorage()
    } catch (err:any) {
      ///could not upload the image to the storage
      console.error(err, "storage initialization")
      toast(`${err.message}`)
    }

    try {
      //set up doc for fast look-up for UID:email relation
      setDoc(doc(firedb, 'users', user), { uid })
    } catch (error: any) {
      ///could not set up the relation due to error
      console.log(error, "firestore initialization")
      toast(`${error.message}`)
    }

  })
    .catch((error) => {
      //account not created cause of error
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage)

      changeUserCreated(false)
      toast(`${error.message}`)
    })
}

export default RegisterDBPacient