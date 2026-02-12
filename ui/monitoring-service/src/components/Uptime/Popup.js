import React, { Component } from "react";
import moment from "moment";

class Popup extends Component {
    render() {
        const { date, description } = this.props;

        return (
            <div className="uptime-relative">
                <div className="uptime-popup-content">
                    <span className="font-semibold text-xs">
                        {moment(date).format("MMMM DD YYYY")}
                    </span>
                    <span>{description}</span>
                </div>
                <div className="uptime-popup-arrow"></div>
            </div>
        );
    }
}

export default Popup;