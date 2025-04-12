import './design.css'

//a button that if "willopen" is true it extends the button with a text, else it scrinks the button making the text dissapear
const SlidingButton = ({ icon: Icon, onClick, children,willopen }: any) => {
    return <div className={`icon-button ${willopen?"open":""}`} onClick={onClick}>
        {Icon && <Icon className="icon" />}
        <div className="icon-text">{children}</div>
    </div>
}

export default SlidingButton