import { getAuth, sendEmailVerification, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { app } from "../../App"
import { toast } from "react-toastify";

const LoginCheck = async (email:string,password:string,changeFunc:any) =>{

    /* the email is taken from the login form so if nothing is typed it would definetly give an error */
    const auth = getAuth(app)
    await signInWithEmailAndPassword(auth,email,password).then((UserCredential)=>{
        //if(!UserCredential.user.emailVerified)
        //{/* if the user is not verified send another email and kick him out */
            //sendEmailVerification(UserCredential.user);
            //signOut(auth)
            //toast("Account's email not verified. A new one was sent")
            //return 
        //}
        //successful login
        console.log(UserCredential.user.uid,UserCredential.user.email)
        changeFunc({id:UserCredential.user.uid,email:UserCredential.user.email})
    }).catch((error) => {
        /* login wont happen cause error*/
        const errorCode = error.code;
        const errorMessage = error.message;
        changeFunc({id:"",email:""})
        console.error(errorCode,errorMessage)
        toast(errorMessage)
      });
}

export default LoginCheck