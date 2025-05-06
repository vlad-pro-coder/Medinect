import { IndexToIllness } from "./IllnessDetectionMain";


const SecondHalfDiagnostic = ({Illnesses, PhotoFile}:any) =>{

    const DetectedIllnessSearch = ({illness}:any) =>{
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`symptoms for ${illness}`)}`;

    return (
        <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="internet-search-illness">
            symptoms for {illness}
        </a>
    );
    }

    console.log(Illnesses)

    if(!Illnesses)
        return <div className={`results-container ${PhotoFile?"expand-for-results":""}`}>
            <h2 style={{fontSize:'24px',marginBottom:'10px',textAlign:'center'}}>Diagnostic</h2>
            <div>In just a moment...</div>
            </div>
    return <div className={`results-container expand-for-results`}>
        <h2 style={{fontSize:'24px',marginBottom:'10px',textAlign:'center'}}>Diagnostic</h2>
        {
            Illnesses[10] === false?Illnesses.map((truthValue:number, index:number)=>{
                if(!truthValue)return <div></div>
                return <DetectedIllnessSearch illness={IndexToIllness[index]}/>
            }):<div>No Findings, you are completly healthy.</div>
        }
    </div>  
}
export default SecondHalfDiagnostic