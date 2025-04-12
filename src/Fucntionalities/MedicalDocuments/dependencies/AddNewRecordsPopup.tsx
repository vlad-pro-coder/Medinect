import { useState } from "react";
import FileUpload from "./FileUpload";
import '../design.css'
import '../CopiedStyles.css'
import uploadFiles from "../uploadFiles";
import { countryList, LanguageAfferentNotation } from "../countryList";

function NewRecordPopup({ onClose, ToUserId, Whoaccesed }: any) {

    const [FormularFiles, setFormularFiles] = useState<any[]>([]);
    const [ReteteFiles, setReteteFiles] = useState<any[]>([])
    const [nameDoc, changenameDoc] = useState<string>("")
    const [language, setLanguage] = useState<string>("Other")
    const [isDisabled,setIsDisabled] = useState<boolean>(false)

    const handleClick = () => {
        if( isDisabled )
            return
        console.log("Button clicked!");
        setIsDisabled(true);
    
        uploadFiles(FormularFiles, ReteteFiles, ToUserId, nameDoc, Whoaccesed, LanguageAfferentNotation[language])
        // Re-enable the button after 2 seconds
        setTimeout(() => {
          setIsDisabled(false);
        }, 2000);
      };

    //simple add doc for the currently selected pacient
    return (
        <div className="popup">
            <div className="popup-inner" style={{ justifyContent: 'space-around' }}>
                <button className="close-btn" onClick={onClose}>X</button>
                <h2 style={{ textAlign: 'center', fontFamily: 'poppins' }}>Select or drag and drop your desired files in their coresponding category</h2>
                <input value={nameDoc} onChange={(e) => { changenameDoc(e.target.value) }} style={{maxWidth:'650px',alignSelf:'center',width:'100%',textAlign:'center'}}/>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                    <FileUpload selectedFiles={FormularFiles} setSelectedFiles={setFormularFiles} >
                        Choose or drag photos related to the medical document
                    </FileUpload>
                    <FileUpload selectedFiles={ReteteFiles} setSelectedFiles={setReteteFiles} >
                    Choose or drag photos related to the recipes of the document
                        </FileUpload>
                </div>
                <div className="language-select-wrapper">
                    <label htmlFor="language-select">Select Language:</label>
                    <select value={language} onChange={(e) => { setLanguage(e.target.value) }} className="language-select" size={1}>
                        {
                            countryList.map((language: string) => {
                                return <option value={language}>
                                    {language}
                                </option>
                            })
                        }

                    </select>
                </div>
                <button onClick={handleClick}
                    className="submit-button">Submit</button>
            </div>
        </div>
    );
}

export default NewRecordPopup