import React from "react"
import Header from "./Header";
import AccionesMenu from "./AccionesMenu";
import CalendarView from "./CalendarView";
import CalendarFilter from "./CalendarFilter";
import AlertsView from "./AlertsView";

function AppContent() {
    return (
        <>
        <Header/>
        <div className="content">
            <div className="sideBar">
                <AccionesMenu/>
                <CalendarFilter/>
                <AlertsView/>
            </div>
            <div className="mainView">
                <CalendarView/>
            </div>
        </div>
        </>
    )
}

export default AppContent;