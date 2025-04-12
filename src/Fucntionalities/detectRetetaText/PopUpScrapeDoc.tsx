import { useEffect, useState } from "react"
import ImageProcessor from './preprocessImg'
import axios from "axios";
import PrintResultsFromScraper from "./PrintResultsFromScraper";
import ProgressBar from 'react-bootstrap/ProgressBar';

interface ScrapedData {
    name: string;
    link: string;
    imagelink: string;
}

const ServerDomain = "http://127.0.0.1:5000"

const PopUpScrapeDoc = ({ url, onClose, language }: any) => {

    const [procentage, setprocentage] = useState<number>(0)///procentage ready
    const [processedText, setProcessedText] = useState<string>('');///where the text will go after it is processed
    const [results, setResults] = useState<ScrapedData[]>([])//products results
    const [AssignedScarpeID, setAssignedScarpeID] = useState<string>("")//id given by the backend
    const [stateDisplay, setstateDisplay] = useState<number>(0)//0-edit processed text display,1-loading bar display,2-results display

    const fetchRecipes = async () => {
        //get the results from the python backend
        try {
            const response = await axios.get(`${ServerDomain}/results_scrape/${AssignedScarpeID}`);
            
            if (response.data.results !== "error")
                setResults(response.data.results)//set them up

        } catch (err) {
            console.error("Error fetching progress:", err);
        }
    }

    useEffect(() => {

        if (!AssignedScarpeID || !url)//if url is valid and we have an id then start querying
            return

        //sets a 5 sec interval and queries the server if it is ready when progress is 100% get sent to display 2, get what is found and clear interval
        const interval = setInterval(async () => {
            try {
                const response = await axios.get(`${ServerDomain}/progress/${AssignedScarpeID}`);
                if (response.data.progress !== undefined) {
                    setprocentage(response.data.progress);

                    // Stop polling if progress reaches 100
                    if (response.data.progress === 100) {
                        clearInterval(interval);
                        fetchRecipes()
                        setstateDisplay(2)
                    }
                }
            } catch (err) {
                console.error("Error fetching progress:", err);
                clearInterval(interval); // Stop polling on error
                setstateDisplay(0)
            }
        }, 5000);

        return () => {
            //on unmount stop querying the server
            clearInterval(interval);
        };

    }, [AssignedScarpeID, url])

    const sendForScraping = async () => {
        //the first stage in which we send a request for a id from the backend
        setstateDisplay(1)
        setprocentage(0)
        setResults([])
        setAssignedScarpeID("")
        try {
            const response = await axios.post(`${ServerDomain}/initiate_scrape`, { text: processedText,language:language });
            const userUID = response.data.user_id;
            //get the backend generated id
            setAssignedScarpeID(userUID)

            // Add logic to scrape using `keywords`
            console.log('uid:', userUID);
        } catch (err) {
            console.error("Error during scraping", err);
        } finally {
        }
    };

    //display the popup and the 3 stages
    return <div className="popup popup-scraping">
        <div className="popup-inner" style={{ height: '80vh', width: '80vw',backgroundColor: "#f9f3e8" }}>
            <button className="close-btn" onClick={onClose}>X</button>
            {stateDisplay === 0 ? <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                <ImageProcessor PhotoUri={url} language={language} processedText={processedText} setProcessedText={setProcessedText} />
                <button onClick={sendForScraping} className="button-editing" style={{ width: '200px', height: '50px', marginTop: '20px' }}>
                    Search on the Web
                </button>
            </div> : <></>}
            {stateDisplay === 1 ? <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ height: '80%', width: '80%', display: 'flex', justifyContent: 'center'}}>
                    <ProgressBar now={procentage} label={`${procentage.toFixed(0)}%`} style={{}}/>
                </div>
            </div> : <></>}
            {stateDisplay === 2 ? <div style={{ height: '95%', width: '95%', overflow: 'auto'}}>
                <PrintResultsFromScraper results={results} />
            </div> : <></>}
        </div>
    </div>
}

export default PopUpScrapeDoc