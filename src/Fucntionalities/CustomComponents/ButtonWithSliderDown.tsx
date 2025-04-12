

const ButtonWithSliderDown = ({onClick,children}:any) =>{
    //simple button that has a slider down for animation used for the login and register button in the '/' screen
    return <button className="nav-button" onClick={onClick}>{children}</button>
}

export default ButtonWithSliderDown