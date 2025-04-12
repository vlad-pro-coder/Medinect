import { useEffect, useState } from "react";
import { IconType } from "react-icons/lib";
import {CloudStorage,ChatWithDoctor,EditDeleteRecords,FastAppointments,ManageDoctorsPacients} from './designRelated/QuotesIcons'

interface suggestion{
    text:string;
    Icon: null | IconType;
}

/* constant list of random texts for the right panel of the login for style */
const suggestions:suggestion[] = [
    {text:"Secure your health files in the cloud for instant access whenever you need them. No more searching—organize your records effortlessly and focus on what matters most: your well-being.",Icon:CloudStorage},
    {text:"Stay connected with your doctor anytime through seamless chat. Access expert advice, share concerns, and take charge of your health with quick, reliable communication at your fingertips.",Icon:ChatWithDoctor},
    {text:"Easily edit and delete outdated health records to keep everything up to date. Simplify your file management, so you can stay organized and fully in control of your medical information.",Icon:EditDeleteRecords},
    {text:"Book appointments quickly and efficiently with our streamlined system. Skip the waiting and prioritize your health over outdated processes, making better care accessible when you need it most.",Icon:FastAppointments},
    {text:"Effortlessly manage your doctor-patient relationships with intuitive tools. Stay organized, streamline communication, and ensure every interaction focuses on what truly matters—delivering and receiving the best possible care.",Icon:ManageDoctorsPacients},
];

const RandomQuoteGen = () => {

    const [RandomSuggestion, setSuggestion] = useState<suggestion>({text:"",Icon:null});

    useEffect(() => {
        // Generate a random suggestion on mount
        setSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
      }, []);

    return <div className="random-suggestion-container">
        <div className="icon-quote">
            {RandomSuggestion.Icon? <RandomSuggestion.Icon/>:<></>}
        </div>
        <div className="suggestion">{RandomSuggestion.text}</div>
    </div>
}

export default RandomQuoteGen