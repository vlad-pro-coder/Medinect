import './designRelated/style.css'
import {  useState } from 'react';
import RegisterDBDoctor from './RegisterDBFuncs/RegisterDBDoctor';


const FormHeader = () => (
    <h2 id="headerTitle">Doctor Account Creation</h2>
);

const FormButton = (props: any) => {

    return<button className="styled-btn" onClick={() => { RegisterDBDoctor(props.inputs, props.okstate) }}>{props.title}</button>
    
}

const Form = ({ OrgUID, okstate }: any) => {

    /* take info to send to the backend and register the user not much to say*/
    const [firstname, changefirstname] = useState<string>("");
    const [lastname, changelastname] = useState<string>("");
    const [personal_number, changepersonal_number] = useState<string>("");
    const [email, changeemail] = useState<string>("");
    const [date, changedate] = useState<string>("");
    const [gender, changeGender] = useState<boolean>(true);
    const [address, changeaddress] = useState<string>("");
    const [CNP, changeCNP] = useState<string>("");
    const [password, changepassword] = useState<string>("");

    return (<div className='inputsContainer'>
        <div style={{ display: 'flex',width:'100%',gap:'10px' }}>
            <input className="Input" placeholder='First Name' value={firstname} onChange={(e: any) => { changefirstname(e.target.value) }} />
            <input className="Input" placeholder='Last Name' value={lastname} onChange={(e: any) => { changelastname(e.target.value) }} />
        </div>
        <input className="Input" placeholder='doctors phone number' value={personal_number} onChange={(e: any) => { changepersonal_number(e.target.value) }} />
        <input className="Input" type="email" placeholder='Email' value={email} onChange={(e: any) => { changeemail(e.target.value) }} />
        <input className="Input" type="date" placeholder='date of birth' value={date} onChange={(e: any) => { changedate(e.target.value) }} />
        <div style={{ display: 'flex', width: '100%' }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', flexDirection: 'row',gap:'20px' }}>
                <label style={{ textAlign: 'center', color: 'white' }}>Male</label>
                <input className="Input" style={{ height: '20px', width: '20px' }} type="checkbox" placeholder='Male' checked={gender} onChange={() => { changeGender(true) }} />
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', flexDirection: 'row',gap:'20px' }}>
                <label style={{ textAlign: 'center', color: 'white' }}>Female</label>
                <input className="Input" style={{ height: '20px', width: '20px' }} type="checkbox" placeholder='Female' checked={!gender} onChange={() => { changeGender(false) }} />
            </div>
        </div>
        <input className="Input" placeholder='Address' value={address} onChange={(e: any) => { changeaddress(e.target.value) }} />
        <input className="Input" placeholder='ID' value={CNP} onChange={(e: any) => { changeCNP(e.target.value) }} />
        <input className="Input" placeholder='Password' value={password} onChange={(e: any) => { changepassword(e.target.value) }} />
        <FormButton title="Register" inputs={[firstname, lastname, personal_number, email, date, gender, address, CNP, password, OrgUID]} okstate={okstate} />
    </div>)
}

const DoctorAccountCreation = ({ id }: any) => {

    const [everythingok, changeState] = useState(null);// this is almost unused still here cause i'm to afraid to touch it
    
    /* the registration form */
    return <div style={{ width: '100%', height: '100%', display: 'flex',alignItems:'center', justifyContent: 'center' }}>
        <div className='registertext' style={{ width: '50%',height:'80%' }}>
            <div className="registerform" style={{ width: '100%' }}>
                <FormHeader />
                <Form OrgUID={id} okstate={changeState} />
                {everythingok == false ? <text>there was an error. Try Again.</text> : <></>}
            </div>
        </div>
    </div>
}

export default DoctorAccountCreation