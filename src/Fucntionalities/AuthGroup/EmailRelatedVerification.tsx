import { applyActionCode, confirmPasswordReset, getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { app } from '../../App';
import { toast } from 'react-toastify';

function ResetPassword({ oobCode }: any) {
    const [password, setPassword] = useState<string>("");
    const [PasswordRetype, setPasswordRetype] = useState<string>("");

    const navigate = useNavigate()

    const handleReset = async () => {
        console.log(password, PasswordRetype)
        if (password !== PasswordRetype) {
            /*do nothing if the passwords are different */
            toast("Passwords don't match")
            return
        }
        /* change it and nagivate back to login */
        const auth = getAuth();
        await confirmPasswordReset(auth, oobCode, password)
            .then(() => {
                console.log("changed password")
                toast("Password has been reset!");
                navigate('/login')
            })
            .catch((error) => {
                /* error password wont change */
                console.error("Error resetting password:", error);
                toast(error.message);
            });
    };

    /* take 2 passwords to check if they match to set the final one */
    return (
        <div className="password-reset-container">
            <div className="password-reset-box">
                <h2>Reset Your Password</h2>
                <input type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required />
                <input type="password"
                    placeholder="Retype password"
                    value={PasswordRetype}
                    onChange={(e) => setPasswordRetype(e.target.value)}
                    required />
                <button onClick={handleReset}>Reset Password</button>
            </div>
        </div>
    );
}

const VerifyEmail = ({ oobCode }: any) => {

    const navigate = useNavigate()
    const [displayMessage, setdisplayMessage] = useState<string>("Verifying email...")

    useEffect(() => {
        const auth = getAuth(app)
        /*on email verified just go back to the login screen */
        applyActionCode(auth, oobCode)//to verify email with the special code
            .then(() => {
                //send message
                toast("Email verified successfully!");
                setdisplayMessage("Your email is now verified. Go back to the login screen.")
                navigate('/login')
            })
            .catch((error) => {
                //error email not verified
                console.error("Error verifying email:", error);
                setdisplayMessage("Email error.")
                toast("Error verifying email: " + error);
            });
    }, [oobCode]);

    return <div className="email-verification-container">
        <div className="email-verification-message">
            <p>{displayMessage}</p>
        </div>
    </div>;
}

const EmailRelatedVerification = () => {

    /*component for email related verification: email verification, password change*/
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');//we are given by default params by firebase to identify the session and user 
    const oobCode = searchParams.get('oobCode');

    if (!mode || !oobCode) {
        return <p>Invalid or expired action link.</p>;
    }

    return (
        <div>
            {mode === 'verifyEmail' && <VerifyEmail oobCode={oobCode} />}
            {mode === 'resetPassword' && <ResetPassword oobCode={oobCode} />}
            {/* Handle other modes if needed */}
        </div>
    );

}

export default EmailRelatedVerification