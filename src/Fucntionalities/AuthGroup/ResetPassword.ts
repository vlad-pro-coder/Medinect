import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";

const ResetPassword = async (email:string) =>{
  /* get firebase functionalities */
    const auth = getAuth();
  try {
    /* send reset password email */
    await sendPasswordResetEmail(auth, email);
    toast("If the email provided is valid, there should be a new message in your inbox")//message to confirm
    console.log("Password reset email sent.");
  } catch (error) {
    /* dont send it */
    console.error("Error sending password reset email:", error);
    toast(`${error}`)
  }
}

export default ResetPassword