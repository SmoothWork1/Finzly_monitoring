import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { GoQuestion } from "react-icons/go";
import Popup from "./Popup";
import QuestionPopu from "./QuestionPopu";

class Stripebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hover: null,
            que: null,
        };
    }

    componentDidMount() {
        this.checkDownTime();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data || prevProps.dataToday !== this.props.dataToday) {
            this.checkDownTime();
        }
    }

    checkDownTime = () => {
        const { data, dataToday, setEventChanged } = this.props;
        let currentTime = moment().format();
        let fiveMinBefore = moment(currentTime).subtract(5, "minute").format();

        const filterData = data.filter(
            item =>
                moment(item.heartbeat).format() <= currentTime &&
                moment(item.heartbeat).format() >= fiveMinBefore
        );
        const downTimeFilter = filterData.filter(item => item.status === -1);

        if (downTimeFilter.length > 0) {
            setEventChanged(true);
        } else {
            setEventChanged(false);
        }
    };

    handleMouseEnter = index => {
        this.setState({ hover: index });
    };

    handleMouseLeave = () => {
        this.setState({ hover: null });
    };

    handleQueEnter = name => {
        this.setState({ que: name });
    };

    handleQueLeave = () => {
        this.setState({ que: null });
    };

    render() {
        const { data, dataToday, name } = this.props;
        const { hover, que } = this.state;
        const upTime = data?.filter(item => item.status === 1)?.length;
        const upTimePerc = (upTime / data.length) * 100;
        let finalObj;

        if( data && dataToday ){
            const newArray = data.map((grp) => {
                const restItemsOfGrp = data[grp].slice(0, -1);
                const todayGrpValue = dataToday[grp][0]; 

                const newArrayWithLastItem = [...restItemsOfGrp, todayGrpValue];
                return [grp, newArrayWithLastItem];
            })

            finalObj = Object.fromEntries(newArray);
        }

        return (
            <div className="stripebar-container">
                <span className="stripebar-header">
                    <h2 className="stripebar-title">
                        {name}
                        {que === name && <QuestionPopu name={name} description="" />}
                        <GoQuestion
                            onMouseEnter={() => this.handleQueEnter(name)}
                            onMouseLeave={this.handleQueLeave}
                            className="ml-1"
                        />
                    </h2>
                    <h4 className="stripebar-operational">Operational</h4>
                </span>
                <span className="stripebar-bar-container">
                    {finalObj?.map((item, i) => {
                        return (
                            <span
                                key={i}
                                className={`stripebar-bar ${
                                    item?.status === 1
                                        ? "bg-green-600"
                                        : item?.status === -1
                                            ? "bg-red-600"
                                            : "bg-gray-500"
                                }`}
                                onMouseEnter={() => this.handleMouseEnter(i)}
                                onMouseLeave={this.handleMouseLeave}
                            >
                                {i === hover && (
                                    <Popup date={item.heartbeat} description={item.description} />
                                )}
                            </span>
                        );
                    })}
                </span>
                <div className="stripebar-footer">
                    <span>90 days</span>
                    <div className="separator-line"></div>
                    <span>{Math.round(upTimePerc)}% uptime</span>
                    <div className="separator-line"></div>
                    <span>Today</span>
                </div>
            </div>
        );
    }
}

Stripebar.propTypes = {
    data: PropTypes.any.isRequired,
    dataToday: PropTypes.any.isRequired,
    name: PropTypes.string.isRequired,
    setEventChanged: PropTypes.func.isRequired,
};

export default Stripebar;