import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Mlightcap from '../../assets/TitleLetters/M-light-cap.png'
import Elightcap from '../../assets/TitleLetters/E-light-cap.png'
import Dlightcap from '../../assets/TitleLetters/D-light-cap.png'
import Ilightcap from '../../assets/TitleLetters/I-light-cap.png'
import clightlow from '../../assets/TitleLetters/c-light-low.png'
import alightlow from '../../assets/TitleLetters/a-light-low.png'
import llightlow from '../../assets/TitleLetters/l-light-low.png'
import cdarklow from '../../assets/TitleLetters/c-dark-low.png'
import odarklow from '../../assets/TitleLetters/o-dark-low.png'
import Ndarkcap from '../../assets/TitleLetters/N-dark-cap.png'
import Edarkcap from '../../assets/TitleLetters/E-dark-cap.png'
import Cdarkcap from '../../assets/TitleLetters/C-dark-cap.png'
import Tdarkcap from '../../assets/TitleLetters/T-dark-cap.png'

const OffsetTop = 200;
const OffsetLeft = 50;

gsap.registerPlugin(ScrollTrigger);

//the parallax component that does the animation of the follow like effect
const ParallaxTitle = () => {

    const containerRef = useRef<any>(null)

    useLayoutEffect(() => {
        const layers = containerRef.current.querySelectorAll(".layer");

        layers.forEach((layer: any) => {
            const depth = layer.dataset.depth; // Get the depth value
            const movement = depth * 100; // Control the amount of movement

            // Apply GSAP animation
            gsap.to(layer, {
                y: movement + "px", // Move the layer vertically
                ease: "none", // Linear movement
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom 75px",
                    scrub: 1, // Smooth animation tied to scroll
                    markers: false, // Set to true for debugging
                },
            });
        });

        return () => {
            // Cleanup on unmount
            ScrollTrigger.getAll().forEach((st) => st.kill());
        };
    }, [containerRef.current]);

    //if the value is bigger they move further down and faster
    //the styles for the position of the elements is more for asthethic purposes so that they are not one above another
    //this is why the animation doesnt work except for desktop sadly
    return <div className='parallax-container' ref={containerRef} style={{display:'flex',flexDirection:'row',justifyContent:'center'}}>
        <div style={{width:'1400px',position:'relative'}}>
        <img data-depth="1" style={{ top: `${OffsetTop + 0}px`, left: `${OffsetLeft + 0}px` }} src={Mlightcap} className='layer' />
        <img data-depth="1.3" style={{ top: `${OffsetTop + -27}px`, left: `${OffsetLeft + 150}px` }} src={Elightcap} className='layer' />
        <img data-depth="0.5" style={{ top: `${OffsetTop + -54}px`, left: `${OffsetLeft + 300}px` }} src={Dlightcap} className='layer' />
        <img data-depth="0.8" style={{ top: `${OffsetTop + -75}px`, left: `${OffsetLeft + 420}px` }} src={Ilightcap} className='layer' />
        <img data-depth="0.7" style={{ top: `${OffsetTop + -25}px`, left: `${OffsetLeft + 640}px`, height: '130px', width: 'auto' }} src={clightlow} className='layer' />
        <img data-depth="0.8" style={{ top: `${OffsetTop + -35}px`, left: `${OffsetLeft + 700}px`, height: '130px', width: 'auto' }} src={alightlow} className='layer' />
        <img data-depth="0.9" style={{ top: `${OffsetTop + -65}px`, left: `${OffsetLeft + 730}px`, height: '150px', width: 'auto' }} src={llightlow} className='layer' />

        <img data-depth="1.5" style={{ top: `${OffsetTop + 300}px`, left: `${OffsetLeft + 540}px`, height: '130px', width: 'auto' }} src={cdarklow} className='layer' />
        <img data-depth="1.3" style={{ top: `${OffsetTop + 290}px`, left: `${OffsetLeft + 590}px`, height: '130px', width: 'auto' }} src={odarklow} className='layer' />
        <img data-depth="1" style={{ top: `${OffsetTop + 70}px`, left: `${OffsetLeft + 540}px` }} src={Ndarkcap} className='layer' />
        <img data-depth="0.5" style={{ top: `${OffsetTop + 45}px`, left: `${OffsetLeft + 680}px` }} src={Edarkcap} className='layer' />
        <img data-depth="1.3" style={{ top: `${OffsetTop + 20}px`, left: `${OffsetLeft + 800}px` }} src={Cdarkcap} className='layer' />
        <img data-depth="0.6" style={{ top: `${OffsetTop + -5}px`, left: `${OffsetLeft + 920}px` }} src={Tdarkcap} className='layer' />
        </div>
    </div>
}

export default ParallaxTitle