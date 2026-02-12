import React, { Component } from "react";
import moment from "moment";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

class DateRange extends Component {
    constructor(props) {
        super(props);
        this.latest = moment().format();
    }

    handlePreviousClick = () => {
        const { startMonth, setCurrentMonth, setStartMonth } = this.props;
        setCurrentMonth(startMonth);
        setStartMonth(moment(startMonth).subtract(70, "days").format());
    };

    handleNextClick = () => {
        const { currentMonth, startMonth, setCurrentMonth, setStartMonth } = this.props;
        if (
            moment(currentMonth).format("MMMM YYYY") !==
            moment(this.latest).format("MMMM YYYY")
        ) {
            setCurrentMonth(moment(currentMonth).add(70, "days").format());
            setStartMonth(moment(startMonth).add(70, "days").format());
        }
    };

    render() {
        const { startMonth, currentMonth } = this.props;

        return (
            <div className="date-range">
                <span
                    className="button"
                    onClick={this.handlePreviousClick}
                >
                    <FaAngleLeft />
                </span>
                <h2>
                    {moment(startMonth).format("MMMM YYYY")} to{" "}
                    {moment(currentMonth).format("MMMM YYYY")}
                </h2>
                <span
                    className="button"
                    onClick={this.handleNextClick}
                >
                    <FaAngleRight
                        className={
                            moment(currentMonth).format("MMMM YYYY") ===
                            moment(this.latest).format("MMMM YYYY")
                                ? "icon-disabled"
                                : ""
                        }
                    />
                </span>
            </div>
        );
    }
}

export default DateRange;
