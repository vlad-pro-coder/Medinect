import './designRelated/style.css'
import { useState } from 'react';
import LoginCheck from './LoginCheck';
import { useNavigate } from 'react-router-dom';
import RandomQuoteGen from './RandomQuoteGen';
import { get, getDatabase, ref } from 'firebase/database';
import { app } from '../../App';
import { toast } from 'react-toastify';
import ResetPassword from './ResetPassword';


const FormHeader = () => (
    <h2 id="headerTitle">Login</h2>
);

const FormButton = (props: any) => {

    /* button for logging in and checking if the values are correct */
    return <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <button className="styled-btn" onClick={() => { LoginCheck(props.loginrelated.email, props.loginrelated.password, props.loginrelated.changedata) }}>{props.title}</button>
    </div>
}

const Form = () => {

    const navigate = useNavigate();
    const [email, changeemail] = useState<string>("vladnimani123@gmail.com")
    const [password, changepassword] = useState<string>("123456")
    const [data, changedata] = useState({ email: "", id: "" })

    const loginwithcreds = async () => {
        const db = getDatabase(app)
        const isDisabled: boolean = (await get(ref(db, `users/${data.id}/SuspendedAccount`))).val()//path to the value of SuspendedAccount, null in case of anyone else than a doctor who is boolean

        
        if (isDisabled !== true)//if everything correct enter with the uid and email
            navigate('/home', { state: data })
        else//if disabled specific for doctor account kick out
            toast("Account disabled contact your employer for help!")
    }

    /* on valid credentials run the function */
    if (data.email != "" && data.id != "")
        loginwithcreds()

    /* inputs for the user to type */
    return <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
        <input className='Input' value={email} onChange={(e: any) => { changeemail(e.target.value) }} />
        <input className='Input' value={password} onChange={(e: any) => { changepassword(e.target.value) }} />
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <a onClick={()=>{ResetPassword(email)}} style={{ fontSize: 10 }} className="button-link reset-button">Forgot password?</a>
            <a href="/register" style={{ fontSize: 10 }} className="button-link navigation-button">Don't have an account?</a>
        </div>
        <FormButton title="Login" loginrelated={{ email: email, password: password, changedata: changedata }} />
    </div>
}

const LoginPage = () => {

    /* the login form */

    return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className='registertext Logintext'>
            <div className="registerform">
                <FormHeader />
                <Form />
            </div>
            <div className='test'>
                <RandomQuoteGen />
            </div>
        </div>
    </div>
}

export default LoginPage