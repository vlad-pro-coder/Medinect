import { useState } from "react";

interface PhotoText {
    photo: any;
    text: string;
}
//scroller
const PhotoSmallTextScroller = ({ DataDisplay }: { DataDisplay: PhotoText[] }) => {

    const [currentIndex, setCurrentIndex] = useState(0);
    //handles two instances t=at once on the screen
    //it pushes the images to the side when it is scroller
    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex + 2 >= DataDisplay.length ? 0 : prevIndex + 2
        );
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex - 2 < 0 ? DataDisplay.length - 2 : prevIndex - 2
        );
    };

    //every photo is displayed but a div is over not making them visible
    //when a photo is to be displayed it uses translateX to translate the x-axis position
    return (<div className="scroller-further-container">
        <div className="scroller-funcs-container">
            <button onClick={handlePrev} className="prev">&lt;</button>
            <div className="scroller-container">
                <div
                    className="scroller"
                    style={{
                        transform: `translateX(-${currentIndex * 50}%)`,
                        transition: "transform 0.5s ease",
                    }}
                >
                    {DataDisplay.map((photo, index) => (
                        <div className="photo-text" key={index}>
                            <img src={photo.photo} alt={`Photo ${index + 1}`} />
                            <div className="overlay">
                                <p>{photo.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="controls">
                    <div className="dots">
                        {Array(Math.ceil(DataDisplay.length / 2))
                            .fill(0)
                            .map((_, i) => (
                                <span
                                    onClick={() => { setCurrentIndex(i * 2) }}
                                    key={i}
                                    className={`dot ${currentIndex / 2 === i ? "active" : ""}`}
                                ></span>
                            ))}
                    </div>
                </div>
            </div>
            <button onClick={handleNext} className="next">&gt;</button>
        </div>
    </div>
    );
}

export default PhotoSmallTextScroller