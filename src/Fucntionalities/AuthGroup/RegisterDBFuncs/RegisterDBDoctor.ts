
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
inputs[8] = Password
inputs[9] = ID organization in which doctor is or was created 
*/

import { createUserWithEmailAndPassword, getAuth, sendEmailVerification } from "firebase/auth";
import { app } from "../../../App"
import { getDatabase, push, ref, set } from "firebase/database";
import { doc, getFirestore, setDoc } from 'firebase/firestore'
import { getStorage, uploadBytes, ref as storageref } from "firebase/storage";

import photo from '../../../assets/DefaultProfilePhoto.jpg'
import { toast } from "react-toastify";

const RegisterDBDoctor = async (Inputs: any[], okstate: any) => {
  /* get firebase functionalities */
  const auth = getAuth(app);
  const db = getDatabase(app);
  const storage = getStorage(app);
  const firedb = getFirestore(app)

  /* on sign in create doctor in auth */
  await createUserWithEmailAndPassword(auth, Inputs[3], Inputs[8]).then((userCredential) => {
    // Signed up 
    const user: any = userCredential.user.email;
    const uid = userCredential.user.uid
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
        AffiliateOrg: Inputs[9]
      });
      set(ref(db,`users/${uid}/status`),"doctor")//set status
      set(ref(db,`users/${uid}/SuspendedAccount`),false)//active account(for now)
      push(ref(db,`users/${Inputs[9]}/CreatedDoctors`),uid)//add the doctor UID to the organization's database entry 
                                                           // for account listing in the friends functionality
      sendEmailVerification(userCredential.user);//send email to verify cause it won't verify itself

      toast("An email was sent to the doctor's inbox for confirmation.\nThe email doesn't have a time limit.")
      toast("Doctor account created")// send successful messages
    } catch (err:any) {
      //internal error in the database for debugging
      console.error(err, "database initialization")
      toast(`${err.message}`)
      okstate(false)
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
      okstate(false)
      return
    }

    try {
      //set up doc for fast look-up for UID:email relation
      setDoc(doc(firedb, 'users', user), { uid })
      okstate(true)
    } catch (error: any) {
      ///could not set up the relation due to error
      console.log(error, "firestore initialization")
      toast(`${error.message}`)
      okstate(false)
      return
    }

  })
    .catch((error) => {
      //account not created cause of error
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage)
      toast(`${error.message}`)
      okstate(false)
    })
}

export default RegisterDBDoctor