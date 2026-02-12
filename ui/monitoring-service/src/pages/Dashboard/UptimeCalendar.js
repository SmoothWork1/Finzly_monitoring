import PropTypes from 'prop-types';
import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom"; // Import Link from react-router-dom
import { FaArrowLeft } from "react-icons/fa";
import { alertError } from "config/toast";
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import moment from "moment";

import { getStartingDateOfMonth, getLastDateOfMonth } from "config/helpers";
import { getUptimeAllAppsReq, getUptimeTotalReq, getUptimePlatformTodayReq } from "config/httpRoutes";

import Dropdown from "../../components/Uptime/Dropdown";
import DateRange from "../../components/Uptime/DateRange";
import CalendarView from "../../components/Uptime/CalendarView";

class UptimeCalendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            dataToday: [],
            apps: [],
            selectedOption: "",
            currentMonth: moment().format(),
            startMonth: moment().subtract(70, "days").format()
        };
    }

    componentDidMount() {
        this.getUptimeAllApps();
        this.interval = setInterval(() => {
            this.getUptimeAllApps();
            this.getUptimeTotal();
        }, 500000);

        this.getUptimePlatformToday();
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            prevState.selectedOption !== this.state.selectedOption ||
            prevState.currentMonth !== this.state.currentMonth
        ) {
            this.getUptimeTotal();
        }
    }

    getUptimeAllApps = async () => {
        this.props.changePreloader(true);
        getUptimeAllAppsReq()
        .then((res) => {
            const apps = res.uptime_allapps
            this.setState({ apps, selectedOption: apps[0]?.resource || "" });
        })
        .catch((err) => {
            alertError(err.response?.data?.message || "Could not fetch apps");
        })
        .finally(() => {
            this.props.changePreloader(false);
        });
    };

    getUptimeTotal = async () => {
        const { selectedOption, startMonth, currentMonth } = this.state;
        const startingDate = getStartingDateOfMonth(startMonth);
        const lastDate = getLastDateOfMonth(currentMonth);

        // console.log(startingDate);
        // console.log(lastDate);

        this.props.changePreloader(true);
        getUptimeTotalReq(selectedOption, startingDate, lastDate)
        .then((res) => {
            const data = res.rdsList
            this.setState({ data });
        })
        .catch((err) => {
            alertError(err.response?.data?.message || "Could not fetch data");
        })
        .finally(() => {
            this.props.changePreloader(false);
        });    
    };

    getUptimePlatformToday = async () => {
        this.props.changePreloader(true);
        let platform_id = 'bankos';
        getUptimePlatformTodayReq(platform_id)
            .then((res) => {
                const dataToday = res.output;
                this.setState({ dataToday });
                // console.log('----today-----', dataToday)
            })
            .catch((err) => {
                alertError(err.response?.data?.message || "Could not fetch today's information.");
            })
            .finally(() => {
                this.props.changePreloader(false);
            });
    };
    
    handleSelect = (selectedOption) => {
        this.setState({ selectedOption });
    };

    setCurrentMonth = (currentMonth) => {
        this.setState({ currentMonth });
    };

    setStartMonth = (startMonth) => {
        this.setState({ startMonth });
    };

    render() {
        const { data, dataToday, apps, selectedOption, currentMonth, startMonth } = this.state;

        const filterObj = data;
        const totalItems = filterObj?.length;
        const itemsPerPart = Math.ceil(totalItems / 3); // Calculate the number of items per part

        const parts = [];

        for (let i = 0; i < totalItems; i += itemsPerPart) {
            const part = filterObj.slice(i, i + itemsPerPart); // Slice the array to get a part
            parts.push(part);
        }

        const result = {};

        data.forEach((date) => {
            const month = new Date(date.heartbeat).toLocaleString("default", {
                month: "long",
            });
            if (!result[month]) {
                result[month] = [];
            }
            result[month].push(date);
        });

        const valuesArr = Object.keys(result);

        return (
            <div className="uptime-container">
                <h2 className="uptime-system-status-title">System Status</h2>
                <div className="uptime-dropdown-container">
                    <Dropdown
                        options={apps}
                        onSelect={this.handleSelect}
                        selectedOption={selectedOption}
                        setSelectedOption={this.handleSelect}
                    />
                    <DateRange
                        currentMonth={currentMonth}
                        setCurrentMonth={this.setCurrentMonth}
                        startMonth={startMonth}
                        setStartMonth={this.setStartMonth}
                    />
                </div>
                <div className="uptime-calendar-container">
                    <CalendarView data={result[valuesArr[0]]} selectedOption={selectedOption} />
                    <CalendarView data={result[valuesArr[1]]} selectedOption={selectedOption} />
                    <CalendarView data={result[valuesArr[2]]} selectedOption={selectedOption} />
                </div>

                <div className="uptime-footer">
                    <div className="uptime-link-container">
                        <Link to="/uptime" className="uptime-back-link">
                            <FaArrowLeft className="uptime-arrow-icon" /> Current Status
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

UptimeCalendar.propTypes = {
    changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { changePreloader })(UptimeCalendar));
