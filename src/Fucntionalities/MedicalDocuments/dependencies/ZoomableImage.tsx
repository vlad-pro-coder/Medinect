import { useEffect, useState } from "react"
import Modal from 'react-modal';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';


const ZoomablePhoto = ({ photo, alt = 'Couldn`t load', StyleClasses }: any) => {

    const [isOpen, setIsOpen] = useState(false); // State to track modal visibility
    const [aspectRatio, setAspectRatio] = useState<number>(1); // State to hold the aspect ratio
    const [containerStyle, setContainerStyle] = useState({ width: "0px", height: "0px" });

    //this is to display the zoom in popup photo using a react-zoom-pan-pitch library

    useEffect(() => {
        const handleResize = () => {
            const vw = window.innerWidth * 0.7;
            const vh = window.innerHeight * 0.7;

            if (vw / vh > aspectRatio) {
                // Constrain by height
                setContainerStyle({
                    width: `${vh * aspectRatio}px`,
                    height: `${vh}px`,
                });
            } else {
                // Constrain by width
                setContainerStyle({
                    width: `${vw}px`,
                    height: `${vw / aspectRatio}px`,
                });
            }
        };

        handleResize(); // Call once initially
        window.addEventListener("resize", handleResize); // Adjust on window resize

        return () => window.removeEventListener("resize", handleResize); // Cleanup listener
    }, [aspectRatio]);


    useEffect(() => {
        const getAspectRatio = () => {
            const img = new Image();
            img.src = photo;

            img.onload = () => {
                // Once the image is loaded, get the width and height
                const aspRatio = img.width / img.height;
                setAspectRatio(aspRatio)
            };

            img.onerror = (err) => {
                console.error('Failed to load image:', err);
            };
        };

        getAspectRatio()
    }, [photo]);

    // Function to open the modal
    const openModal = () => setIsOpen(true);

    // Function to close the modal
    const closeModal = () => setIsOpen(false);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Clickable Image */}
            <img
                src={photo}
                alt={alt}
                onClick={openModal}
                className={StyleClasses}
            />

            {/* Modal Popup */}
            <Modal
                isOpen={isOpen}
                onRequestClose={closeModal}
                contentLabel="Zoomable Image"
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        zIndex: 2000,
                    },
                    content: {
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        ...containerStyle,
                        padding: '0px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        // Ensure no scrollbars
                    },
                }}
            >
                {/* Zoomable Image in Modal */}
                <TransformWrapper
                    initialScale={1}
                    minScale={1}
                    maxScale={5} // Max zoom level
                    wheel={{ step: 0.1, smoothStep: 0.001 }} // Zoom speed for mouse wheel
                    pinch={{ step: 0.1 }} // Pinch zoom for mobile
                    doubleClick={{ disabled: true }} // Optional: Disable double-click zoom
                    centerOnInit={false} // Disable automatic centering when zooming
                    limitToBounds={true}
                    smooth={true}
                >
                    {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                        <div style={{ position: 'relative', cursor: 'grab', height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <TransformComponent>
                                <img
                                    src={photo}
                                    alt={alt}
                                    style={{
                                        ...containerStyle,
                                        objectFit: 'contain',
                                    }}
                                />
                            </TransformComponent>
                        </div>
                    )}
                </TransformWrapper>
            </Modal>
        </div>
    );
};

export default ZoomablePhoto