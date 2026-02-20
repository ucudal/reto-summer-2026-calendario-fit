import React from "react"
import logoUcu from '../assets/Logo-Universidad-Catolica.svg'


function Header() {
    return(
        <>
        <div className="header">
            <div className="headerContent">
                <h1>Sistema de gestión de calendarios académicos - FIT</h1>
                <div className="filters">
                    <span className="filter">filtro 1</span> <span className="filter">filtro 2</span> <span className="filter">filtro 3</span>
                </div>
            </div>
            <img className="logoUcu" src={logoUcu} alt="Logo UCU"/>
        </div>
        </>
    )
}

export default Header;