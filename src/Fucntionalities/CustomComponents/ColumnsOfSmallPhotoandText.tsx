import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface PhotoText {
    photo: any;
    text: string;
}

const ColumnsOfSmallPhotoandText = ({ Features,title }: { Features: PhotoText[],title:string }) => {

    const Containerinfo = useRef<any>(null)

    //load animation when the document is fully loaded
    useLayoutEffect(() => {
        if (Containerinfo.current) {
            const fadeInElements = Containerinfo.current.querySelectorAll('.fade-in');

            fadeInElements.forEach((element: any, index: number) => {
                gsap.fromTo(
                    element,
                    { opacity: 0, x: -100 }, // Initial state
                    {
                        opacity: 1,
                        x: 0,
                        duration: 1,
                        delay: index * 0.1,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: element, // Element that triggers the animation
                            start: "top 80%",  // Trigger when the top of the element is 80% of the viewport height
                            toggleActions: "play none none none", // Trigger animation once on enter
                        },
                        paused: false,
                    }
                );
            })

            setTimeout(() => {
                ScrollTrigger.refresh();
                console.log("rerender")
            }, 50);
        }
    }, [Containerinfo.current])

    //load animation when the document is fully loaded
    useLayoutEffect(() => {

        const titleRef = document.querySelector('.features-title')

        gsap.fromTo(
            titleRef,
            { opacity: 0, y: -100 }, // Initial state
            {
                opacity: 1,
                y: 0,
                duration: 1,
                delay: 0.3,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: titleRef, // Element that triggers the animation
                    start: "top 90%",  // Trigger when the top of the element is 80% of the viewport height
                    toggleActions: "play none none none", // Trigger animation once on enter
                },
                paused: false,
            }
        );

        setTimeout(() => {
            ScrollTrigger.refresh();
            console.log("rerender")
        }, 50);

    }, [])

    //design for a component that uses a fade in animation and shows a photo and text dont, multiple instances are displayed in a row next to one another
    return <div style={{ paddingTop: '50px' }}>
        <h1 className="features-title">{title}</h1>
        <div ref={Containerinfo} className="features-container">
            {
                Features.map((feature: PhotoText) => {
                    return <div className="feature-info fade-in">
                        <img src={feature.photo} className="feature-photo" />
                        <div className="feature-text">{feature.text}</div>
                    </div>
                })
            }
        </div>
    </div>
}

export default ColumnsOfSmallPhotoandText