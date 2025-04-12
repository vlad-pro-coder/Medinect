import { useEffect, useRef, useState } from 'react';
import cv from 'opencv.js'; // Ensure OpenCV.js is correctly imported
import Tesseract from 'tesseract.js';
import './design.css'

const ImageProcessor = ({ PhotoUri, language, processedText, setProcessedText }: any) => {

    const [bluredImg, setbluredImg] = useState<string>('');
    const photoRef = useRef<HTMLImageElement>(null);
    const [isProcessed,setisProcessed] = useState<boolean>(false)

    console.log(language)

    /// Apply Gaussian Blur for OCR preprocessing
    useEffect(() => {
        if (PhotoUri && cv && cv.imread) {
            const imgElem = photoRef.current as HTMLImageElement;

            imgElem.onload = async () => {
                try {
                    // Fetch the image from Firebase Storage URL
                    const response = await fetch(PhotoUri, { mode: 'cors' });
                    const blob = await response.blob();  // Get the image blob

                    // Create an image bitmap from the blob
                    const bitmap = await createImageBitmap(blob);

                    // Now draw the bitmap on the canvas
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = bitmap.width;
                    canvas.height = bitmap.height;
                    ctx?.drawImage(bitmap, 0, 0);

                    // Use OpenCV to apply the GaussianBlur
                    const src = cv.imread(canvas);  // Use canvas as source
                    const dst = new cv.Mat();

                    //resize the photo for better quality
                    const scale = 2;
                    cv.resize(src, dst, new cv.Size(src.cols * scale, src.rows * scale), 0, 0, cv.INTER_CUBIC);

                    //apply black and white filter with a gaussian blur for better accuracy
                    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
                    cv.GaussianBlur(dst, dst, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);


                    //convert from black and white format to rgba format for display
                    const rgbaDst = new cv.Mat();
                    cv.cvtColor(dst, rgbaDst, cv.COLOR_GRAY2RGBA);

                    // Clean up
                    ctx?.putImageData(new ImageData(new Uint8ClampedArray(rgbaDst.data), rgbaDst.cols, rgbaDst.rows), 0, 0);

                    // Set unchanged image as the data URL for display
                    setbluredImg(canvas.toDataURL());

                    // Clean up
                    src.delete();
                    dst.delete();
                    //rgbaDst.delete();
                } catch (error) {
                    console.error('Error processing image:', error);
                }
            };
        }
    }, [PhotoUri]);

    /// Extract text using Tesseract
    useEffect(() => {

        const fetchText = async () => {
            if (bluredImg) {
                // Initialize Tesseract worker
                //a fully programed with multiple langauge support that can scan photos for text
                //can be pretty inacurate if the writting is too ugly
                const worker: any = await Tesseract.createWorker();

                await worker.loadLanguage(language)
                await worker.setParameters({ pageSegMode: 6 }) // Correct PSM parameter
                await worker.recognize(bluredImg) // Perform OCR
                    .then(({ data: { text } }: any) => {
                        setProcessedText(text); // Set OCR text result
                        setisProcessed(true)
                    })
                    .catch((err: any) => {
                        console.error("Error during OCR:", err);
                    })
                    .finally(() => worker.terminate()); // Terminate worker after processing
            }
        }
        fetchText()
    }, [bluredImg]);

    //displays the image being scanned, the text in a textarea without the button
    return (
        <div style={{display:'flex', flexDirection:'column',width:'100%',height:'80%',justifyContent:'center',alignItems:'center',gap:'20px' }}>
            <img ref={photoRef} src={PhotoUri} className='scrape-img'/>
            {isProcessed?<textarea className='textarea-scrape'
                value={processedText}
                onChange={(e) => setProcessedText(e.target.value)}
                placeholder="Processed text will appear here"
            />:<div className="loader"></div>}
        </div>
    );
};

export default ImageProcessor;
