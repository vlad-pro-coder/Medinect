import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import mime from 'react-native-mime-types';
import { FaDownload } from "react-icons/fa";

//prints a photo if that is a photo
export const PrintPhoto = ({ url, additionalStyleClass }: any) => {
    return <img className = {additionalStyleClass} src={url} style={{ maxWidth: '100%', height: 'auto' }} />
}

const fileIcons = {
    image: 'mdi:file-image',    // Image file icon
    pdf: 'mdi:file-pdf',        // PDF file icon
    audio: 'mdi:file-music',    // Audio file icon
    video: 'mdi:file-video',    // Video file icon
    document: 'mdi:file-document', // Document file icon
    default: 'mdi:file',        // Default file icon
};

//should display a custom icon based on the type or just a default type if there are none available
//with this you can send more file types and download them
export const Unsupported = ({ url, additionalStyleClass}: any) => {

    const getFileType = () => {
        const mimeType = mime.lookup(url); // Get MIME type from file URL
        console.log(mimeType)

        if (mimeType) {
            if (mimeType.includes('image')) return 'image';
            if (mimeType.includes('pdf')) return 'pdf';
            if (mimeType.includes('audio')) return 'audio';
            if (mimeType.includes('video')) return 'video';
            if (mimeType.includes('word') || mimeType.includes('excel')) return 'document';
        }

        return 'default'; // Fallback to default if no match
    };

    function downloadFile() {
        const fileUrl = url; // Replace with your storage link
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = ''; // This ensures the file gets downloaded instead of opened
        link.click();
    }

    const [icon, setIcon] = useState<string>("");

    useEffect(() => {
        const type = getFileType(); // Get the file type based on MIME
        setIcon(fileIcons[type]); // Set the corresponding icon from Iconify
    }, [url]);

    //the icon and a download button
    return (
        <div className={`container-files ${additionalStyleClass}`}>
            <Icon icon={icon} width={40} height={40} style={{color:'black'}} />
            <button className="download-btn" onClick={downloadFile}><FaDownload/></button>
        </div>
    );
}