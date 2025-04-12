import { gsap } from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import {  useLayoutEffect, useRef } from "react";


gsap.registerPlugin(ScrollTrigger);
//the component that displays a text and to the side multiple photos(up to 4)

const Print4photos = ({ photosList }: any) => {

    //4 photo display
    return <div className="container-img4">
        {
            photosList.map((image: any) => {
                return <div className="img-display fade-in">
                    <img src={image} />
                </div>
            })
        }
    </div>
}

const Print3photos = ({ photosList }: any) => {
//3 photo display
    return <div className="container-img3">
        {
            photosList.map((image: any) => {
                return <div className="img-display fade-in">
                    <img src={image} />
                </div>
            })
        }
    </div>
}

const Print2photos = ({ photosList }: any) => {

//2 photo display
    return <div className="container-img2">
        {
            photosList.map((image: any,) => {
                return <div className="img-display fade-in">
                    <img src={image} />
                </div>
            })
        }
    </div>
}

const Print1photos = ({ photosList }: any) => {

//1 photo display
    return <div className="container-img1">
        <div className="img-display fade-in">
            <img src={photosList[0]} />
        </div>
    </div>
}

const WindowWithPhotoAndText = ({ reverted = false, PhotoList = [], children }: any) => {

    const fadeInContainerRef = useRef<HTMLDivElement | null>(null);

    //when document is fully loaded
    useLayoutEffect(() => {

        if (fadeInContainerRef.current) {
            //it takes every instance of ".fade-in"
            //it applies a delay on their animation to be displayed at different consecutive times
            const fadeInElements = fadeInContainerRef.current.querySelectorAll('.fade-in');

            fadeInElements.forEach((element: any, index: number) => {
                gsap.fromTo(
                    element,
                    { opacity: 0, y: -100 }, // Initial state
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        delay: index * 0.1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: element, // Element that triggers the animation
                            start: "top 80%",  // Trigger when the top of the element is 80% of the viewport height
                            toggleActions: "play none none none", // Trigger animation once on enter
                        },
                        paused:false,
                    }
                );
            })
        

        setTimeout(() => {
            ScrollTrigger.refresh();
            console.log("rerender")
        }, 50);

    }

    }, [fadeInContainerRef.current])

    //decides which to be displayed based on the params given
    return <div className={`photos-and-text-container ${reverted ? "reverted-row" : ""}`} ref={fadeInContainerRef}>
        <div className="photos-whole-container">
            {PhotoList.length === 4 ? <Print4photos photosList={PhotoList} /> : <></>}
            {PhotoList.length === 3 ? <Print3photos photosList={PhotoList} /> : <></>}
            {PhotoList.length === 2 ? <Print2photos photosList={PhotoList} /> : <></>}
            {PhotoList.length === 1 ? <Print1photos photosList={PhotoList} /> : <></>}
        </div>
        <div className="text-besides fade-in">
            {children}
        </div>
    </div>
}

export default WindowWithPhotoAndText