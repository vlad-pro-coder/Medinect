import { useEffect, useRef, useState } from "react"
import ZoomablePhoto from "../MedicalDocuments/dependencies/ZoomableImage";
import { toast } from "react-toastify";


const ServerDomain = "http://127.0.0.1:5000"

const FirstHalfPhoto = ({ PhotoFile, setPhotoFile, setPhotoIsLoading, PhotoIsLoading,setResults }: any) => {

    const InputRef = useRef<any>(null)

    const handleDrop = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
        const files = event.dataTransfer.files[0];
        setPhotoFile(files);
      };
    
      //stops things from rerendering when hovering over
      const handleDragOver = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
      };

    useEffect(() => {

        const GiveBackendPhoto = async (file:File) => {
            if (!file) return;
        
            setPhotoIsLoading(true);
            try {
              const formData = new FormData();
              formData.append("photo", PhotoFile);
        
              const response = await fetch(ServerDomain + "/startDiagnosis", {
                method: "POST",
                body: formData,
              });
        
              if (!response.ok) {
                throw new Error("Failed to process image");
              }
        
              const data = await response.json();
              setResults(data.predicted_class);
            } catch (error) {
              console.error("Error:", error);
              toast("An error occurred while processing the image. Try again later...");
            } finally {
                setPhotoIsLoading(false);
            }
          };

        if (PhotoFile) {
            GiveBackendPhoto(PhotoFile)
        }
    }, [PhotoFile])

    const [photoUrl, setPhotoUrl] = useState<string>("");

    useEffect(() => {
        if (PhotoFile) {
            const objectUrl = URL.createObjectURL(PhotoFile);
            setPhotoUrl(objectUrl);

            // Cleanup the object URL on component unmount
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [PhotoFile]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; // Get the first file if available
        if (file) {
            setPhotoFile(file); // Call the setImage function with the file
        }
    };

    if (!PhotoFile)
        return <div className="photo-half">
            <input
        type="file"
        multiple
        ref={InputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div
        onClick={() => InputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: '4px dashed grey',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          height: '400px',
          width:'400px',
          display:'flex',
          justifyContent:'center',
          alignItems:'center'
        }}
      >Click or drag and drop a photo of your chest XRay</div>
        </div>

        console.log(photoUrl)

    return <div className="photo-half schrinked-for-results">
        {PhotoIsLoading ? <div style={{zIndex:'3',position:'absolute',display:'flex',justifyContent:'center',alignItems:'center',height:'100%',width:'100%'}}><div className="loader"></div> </div>: <></>}
        <ZoomablePhoto photo={photoUrl} StyleClasses="photo-for-detection"/>
    </div>

}

export default FirstHalfPhoto