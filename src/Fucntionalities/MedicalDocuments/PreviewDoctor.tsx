import { get, getDatabase, onValue, ref } from "firebase/database"
import { useEffect, useState } from "react"
import { app } from "../../App"
import PreviewMedicalRecords from "./dependencies/PreviewMedicalRecords"
import { getDownloadURL, getStorage, ref as storageref } from "firebase/storage"
import Select, { OptionProps, SingleValueProps, StylesConfig } from 'react-select'
import { v4 as uuidv4 } from 'uuid'

interface SelectUID {
    value: string | null;
}

interface UserOptionProps extends OptionProps<any, any> {
    data: SelectUID;
}

interface UserSingleProps extends SingleValueProps<any, any> {
    data: SelectUID;
}

const PrintPhotoName = (props: UserOptionProps | UserSingleProps) => {

    const { innerProps, data } = props

    const [firstname, setfirstname] = useState<string>("")
    const [lastname, setlastname] = useState<string>("")
    const [PhotoURI, setPhotoURI] = useState<string>("")

    useEffect(() => {
        const db = getDatabase(app)
        const storage = getStorage(app)

        const fetchdata = async () => {
            setfirstname((await get(ref(db, `users/${data.value}/profile/FirstName`))).val())
            setlastname((await get(ref(db, `users/${data.value}/profile/LastName`))).val())
            setPhotoURI(await getDownloadURL(storageref(storage, `profilePictures/${data.value}`)))
        }

        fetchdata()

    }, [])

    return <div {...innerProps} style={{ display: "flex", flexDirection: "row", alignItems:'center', justifyContent:'space-around' }}>
        <img src={PhotoURI} style={{ height: '35px', width: '35px',borderRadius:'50%' }} />
        <div>
        <span style={{marginRight:'10px'}}>{firstname}</span>
        <span>{lastname}</span>
        </div>
    </div>
}

const PreviewDoctor = ({ uid,selectedPacient,changeselectedPacient,EditStatus,DeleteStatus,SelectedDoc, changeSelectedDoc,whoami }: any) => {

    const [pacients, changePacient] = useState<SelectUID[] | undefined>(undefined)
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {

        const db = getDatabase(app)
        const unsub = onValue(ref(db, `users/${uid}/friends`), (snapshot) => {
            if (snapshot.val())
                changePacient(snapshot.val().map((uid: string) => {
                    return { value: uid }
                }))
            else
                changePacient(undefined)
        })

        return () => unsub()
    }, [])

    const customStyles: StylesConfig<SelectUID, false> = {
        control: (provided) => (
            {
                ...provided,
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                borderColor: '#ccc',
                padding: '5px'
            }),
        option: (provided, state) => (
            {
                ...provided,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: state.isSelected ? '#dfe6e9' : '#ffffff',
                color: '#2d3436',
                padding: '10px 20px',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#b2bec3', },
            }),
        menu: (provided) => (
            {
                ...provided,
                borderRadius: '8px',
                marginTop: '5px',
                maxHeight: '150px',
                overflowY: 'auto',
            }),
        singleValue: (provided) => (
            {
                ...provided,
                display: 'flex',
                alignItems: 'center',
            }),
        input: (provided) => (
            {
                ...provided,
                height: 0,
                padding: 0,
                margin: 0,
                visibility: 'hidden',
                pointerEvents: 'none'
            })
    }

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
    
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }, []);

    return <div>
        <div className="dropdown-container" style={{left:`${screenWidth < 760?'70%':'50%'}`}}>
            <Select
                value={selectedPacient}
                onChange={(selected: SelectUID | null) => { changeselectedPacient(selected) }}
                options={pacients}
                components={{ Option: PrintPhotoName, SingleValue: PrintPhotoName }}
                styles={customStyles}
                key={uuidv4()}
            />
        </div>
        <div className="documents-container">
            {selectedPacient === null ? <div>select your pacient from the drop-down option menu</div> :
                <PreviewMedicalRecords 
                    doctorUID={uid}
                    whoisee={selectedPacient.value} 
                    EditStatus={EditStatus} 
                    DeleteStatus={DeleteStatus}
                    SelectedDoc={SelectedDoc} 
                    changeSelectedDoc={changeSelectedDoc}
                    key={uuidv4()}
                    whoami={whoami}
                    />
            }
        </div>
    </div>
}

export default PreviewDoctor