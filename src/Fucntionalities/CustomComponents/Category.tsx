import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Category = ({children}:any) =>{

    //load animation when the document is fully loaded
    useLayoutEffect(() => {

        const titleRef = document.querySelector('.category-separator')

        gsap.fromTo(
            titleRef,
            { opacity: 0, scaleX: 0 }, // Initial state
            {
                opacity: 1,
                scaleX: 1,
                duration: 2,
                delay: 0.1,
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

    useLayoutEffect(() => {

        const titleRef = document.querySelector('.category-text')

        gsap.fromTo(
            titleRef,
            { opacity: 0 }, // Initial state
            {
                opacity: 1,
                duration: 2,
                delay: 0.1,
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
    
    //a simple text and slider down animated to appear from 0 opacity and simple slider that grows from the middle when it pops on the screen
    return <div style={{width:'95%',marginLeft:'30px',marginTop:'30px',display:'flex',flexDirection:'column'}}>
        <div className="category-text">{children}</div>
        <hr className="category-separator"/>
    </div>
}

export default Category