import { useState } from 'react';
import './designRelated/style.css'
import RegisterDBPacient from './RegisterDBFuncs/RegisterDBPacient';
import RegisterDBOrganization from './RegisterDBFuncs/RegisterDBOrganization';
import RandomQuoteGen from './RandomQuoteGen';
import { useNavigate } from 'react-router-dom';

const FormHeader = () => (
    <h2 id="headerTitle">Register</h2>
);

const handleRegister = (Inputs: (string | boolean)[], which: boolean, changeUserState: any) => {
    console.log(Inputs, "something")


    if (which) {
        RegisterDBPacient(Inputs, changeUserState);
    }
    else {
        RegisterDBOrganization(Inputs, changeUserState);
    }
}


const FormPacient = ({ props }: any) => {

    const { changeUserState } = props
    const [firstname, changefirstname] = useState<string>("");
    const [lastname, changelastname] = useState<string>("");
    const [personal_number, changepersonal_number] = useState<string>("");
    const [email, changeemail] = useState<string>("");
    const [date, changedate] = useState<string>("");
    const [gender, changeGender] = useState<boolean>(true);
    const [address, changeaddress] = useState<string>("");
    const [CNP, changeCNP] = useState<string>("");
    const [emergency_contact_name, changeemergency_contact_name] = useState<string>("");
    const [emergency_contact_number, changeemergency_contact_number] = useState<string>("");
    const [password, changepassword] = useState<string>("");
    /* take the values and when the button is pressed try to login and navigate to login */

    const navigate = useNavigate()

    return (<div className='inputsContainer'>
        <div style={{ display: 'flex', gap: '5px' }}>
            <input className="Input" placeholder='First Name' value={firstname} onChange={(e: any) => { changefirstname(e.target.value) }} />
            <input className="Input" placeholder='Last Name' value={lastname} onChange={(e: any) => { changelastname(e.target.value) }} />
        </div>
        <input className="Input" placeholder='personal phone number' value={personal_number} onChange={(e: any) => { changepersonal_number(e.target.value) }} />
        <input className="Input" type="email" placeholder='Email' value={email} onChange={(e: any) => { changeemail(e.target.value) }} />
        <input className="Input" type="date" placeholder='date of birth' value={date} onChange={(e: any) => { changedate(e.target.value) }} />
        <div style={{ display: 'flex', width: '100%' }}>
            <div style={{flex:1,display:'flex',justifyContent:'space-around',flexDirection:'row'}}>
                <label style={{textAlign:'center',color:'white'}}>Male</label>
                <input className="Input" style={{ height: '20px', width: '20px' }} type="checkbox" placeholder='Male' checked={gender} onChange={() => { changeGender(true) }} />
            </div>
            <div style={{flex:1,display:'flex',justifyContent:'space-around',flexDirection:'row'}}>
                <label style={{textAlign:'center',color:'white'}}>Female</label>
                <input className="Input" style={{ height: '20px', width: '20px' }} type="checkbox" placeholder='Female' checked={!gender} onChange={() => { changeGender(false) }} />
            </div>
        </div>
        <input className="Input" placeholder='Address' value={address} onChange={(e: any) => { changeaddress(e.target.value) }} />
        <input className="Input" placeholder='ID' value={CNP} onChange={(e: any) => { changeCNP(e.target.value) }} />
        <div style={{ display: 'flex', gap: '5px' }}>
            <input className="Input" placeholder='Emergency contact name' value={emergency_contact_name} onChange={(e: any) => { changeemergency_contact_name(e.target.value) }} />
            <input className="Input" placeholder='Emergency contact number' value={emergency_contact_number} onChange={(e: any) => { changeemergency_contact_number(e.target.value) }} />
        </div>
        <input className="Input" placeholder='Password' value={password} onChange={(e: any) => { changepassword(e.target.value) }} />
        <button className="styled-btn" onClick={() => { 
            handleRegister([firstname, lastname, personal_number, email, date, gender, address, CNP, emergency_contact_name, emergency_contact_number, password], true, changeUserState) 
            navigate('/login')
            }}>Register</button>
    </div>)
}


const FormOrganization = ({ props }: any) => {

    const { changeUserState } = props;

    const [org_name, changeorg_name] = useState<string>("");
    const [Office_phone, changeOffice_phone] = useState<string>("");
    const [Address, changeAddress] = useState<string>("");
    const [date, changedate] = useState<string>("");
    const [email, changeemail] = useState<string>("");
    const [password, changepassword] = useState<string>("");

    const navigate = useNavigate()
    /* same as the others just take the values and when the button is pressed try to login and navigate to login */

    return (<div className='inputsContainer'>
        <input className="Input" placeholder='Organization Name' value={org_name} onChange={(e: any) => { changeorg_name(e.target.value) }} />
        <input className="Input" placeholder='Office phone number' value={Office_phone} onChange={(e: any) => { changeOffice_phone(e.target.value) }} />
        <input className="Input" placeholder='Address' value={Address} onChange={(e: any) => { changeAddress(e.target.value) }} />
        <input className="Input" type="date" placeholder='Creation Date' value={date} onChange={(e: any) => { changedate(e.target.value) }} />
        <input className="Input" type="email" placeholder='Office Email' value={email} onChange={(e: any) => { changeemail(e.target.value) }} />
        <input className="Input" type="password" placeholder='Password' value={password} onChange={(e: any) => { changepassword(e.target.value) }} />
        <button className="styled-btn" onClick={() => { 
            handleRegister([org_name, Office_phone, Address, date, email, password], false, changeUserState) 
            navigate('/login')
            }} >Register</button>
    </div>)
}

const RegisterPage = () => {

    const [isPacient, changeState] = useState<boolean>(true);
    const [UserState, changeUserState] = useState<object | boolean>({})
    //registration page is dual for pacient and organization

    return <div style={{ width: '100%', height: '100%', display: 'flex', paddingTop: '5%', justifyContent: 'center' }}>
        <div className='wholeregister'>
            <div className='signupasButtons'>
                <button className='signupasButton' onClick={() => { changeState(true) }}>Sign up as Pacient</button>
                <button className='signupasButton' onClick={() => { changeState(false) }}>Sign up as Organization</button>
            </div>
            <div className='registertext'>
                <div className="registerform">
                    <FormHeader />
                    {isPacient ?
                        <FormPacient props={{ changeUserState: changeUserState }} /> :
                        <FormOrganization props={{ changeUserState: changeUserState }} />
                    }
                </div>
                <div className="test" style={{width:'50%'}}>
                    <RandomQuoteGen />
                </div>
            </div>
            {UserState == false ? <text>error while registering. try again!</text> : ''}
        </div>
    </div>
}

export default RegisterPage