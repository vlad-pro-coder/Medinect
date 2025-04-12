
//structure
/*
inputs[0] = First Name
inputs[1] = Last Name
inputs[2] = personal phone number
inputs[3] = date
inputs[4] = email
*/

import { createUserWithEmailAndPassword, getAuth, sendEmailVerification } from "firebase/auth";
import { app } from "../../../App"
import { getDatabase, ref, set } from "firebase/database";
import { toast } from "react-toastify";

const RegisterDBOrganization = async (Inputs: any[],changeUserCreated:any) => {
    /* get firebase functionalities */
    const auth = getAuth(app);
    const db = getDatabase(app);

    /* on sign in create doctor in auth */
    await createUserWithEmailAndPassword(auth, Inputs[4], Inputs[5]).then((userCredential) => {
        // Signed up 
        const user = userCredential.user.email;
        const uid = userCredential.user.uid

        changeUserCreated({email:user,id:uid})
        /*set up the profile of the user in the database */
        try{
            set(ref(db, 'users/' + uid + '/profile'), {
            Organization_Name: Inputs[0],
            Office_phone_number: Inputs[1],
            address:Inputs[2],
            Creation_Date:Inputs[3],
            email:Inputs[4],
          });
          set(ref(db,`users/${uid}/status`),"organization")//set status
          sendEmailVerification(userCredential.user);//send email to verify cause it won't verify itself
          
          toast("An email was sent to your inbox for confirmation.\nThe email doesn't have a time limit.")
          toast("Organization account created")// send successful messages
        }catch(err:any){
            //internal error in the database for debugging
            console.log(err,"database initialization")
            toast(`${err.message}`)
        }
        

    }).catch((error) => {
        //account not created cause of error
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode,errorMessage)

            changeUserCreated(false)
            toast(`${error.message}`)
        })
}

export default RegisterDBOrganization