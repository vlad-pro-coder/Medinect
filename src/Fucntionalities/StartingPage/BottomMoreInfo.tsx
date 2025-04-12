import { FaSquareXTwitter } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";

const BottomMoreInfo = () => {

    //the bottom part with links and data
    //dummy data they do nothing just there for asthethics
    return <div className="bottom-container">
        <div className="info-container">
            <div className="info-mini-container">
                <span className="info-text">Email: </span>
                <span className="info-text">test@gmail.com</span>
            </div>
            <div className="info-mini-container">
                <span className="info-text">Phone number: </span>
                <span className="info-text">+40 000 000 000</span>
            </div>
        </div>
        <div className="social-media-container">
            <div><FaSquareXTwitter /></div>
            <div><FaFacebook /></div>
            <div><FaInstagram /></div>
            <div><FaLinkedin /></div>
        </div>
    </div>
}

export default BottomMoreInfo