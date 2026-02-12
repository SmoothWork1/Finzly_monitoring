import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { FiMinusSquare, FiPlusSquare } from "react-icons/fi";
import { GoQuestion } from "react-icons/go";
import Popup from "./Popup";
import QuestionPopup from "./QuestionPopu";

import { getUptimePlatformSpecificReq, getStatusByDate } from "config/httpRoutes";
import { alertError } from "config/toast";

class CRMbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hover: null,
            que: null,
            showMore: false,
            showModal: false,
            modalData: null,
            newHours: '',
            newMinutes: '',
            isLoading: false,
            newFinalObj: {},
            textareaContent: '',
            status4hrsago: 1,
            title: 'Application is healthy',
            resource: '',
            grp: '',
        };
        this.finalObj = {};
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
        const { data, setEventChanged } = this.props;
        let values = [];
        for (var property in data) {
            values.push(property);
        }

        if (values.length > 0) {
            let currentTime = moment().format();
            let fiveMinBefore = moment(currentTime).subtract(5, "minute").format();

            const filterData = data[values[0]]?.filter(
                (item) =>
                    moment(item.heartbeat).format() <= currentTime &&
                    moment(item.heartbeat).format() >= fiveMinBefore
            );

            const downTimeFilter = filterData.filter((item) => item.status === -1);

            if (downTimeFilter.length > 0) {
                setEventChanged(true);
            } else {
                setEventChanged(false);
            }
        }
    };

    handleMouseEnter = (index) => {
        this.setState({ hover: index });
    };

    handleMouseLeave = () => {
        this.setState({ hover: null });
    };

    handleQueEnter = (name) => {
        this.setState({ que: name });
    };

    handleQueLeave = () => {
        this.setState({ que: null });
    };

    toggleShowMore = () => {
        this.setState((prevState) => ({ showMore: !prevState.showMore }));
    };

    openModal = (data, resource, grp) => {
        // this.setState({ showModal: true, modalData: data });
        let new_title = '';
        let new_status_4hrs_ago = '';

        if (data?.status === 1) {
            new_title = "Application is healthy";
        } else if (data?.status === -1) {
            new_title = "Application is Unhealthy";
        } else if (data?.status === 0) {
            new_title = "Application is Partially Healthy";
        } else {
            new_title = "No data available";
        }

        const date = moment(data.heartbeat);      
        this.setState({
            showModal: true,
            modalData: data,
            resource,
            grp,
            newHours: data?.description ? date.utc().hour() : 0,
            newMinutes: data?.description ? date.utc().minute() : 0,
            textareaContent: data.description || '',
            status4hrsago: new_status_4hrs_ago,
            title: new_title,
        });
    };
    
    closeModal = () => {
        this.setState({ showModal: false, modalData: null });
    };

    handleTimeChange = async (type, value) => {
        this.setState({ [type]: value }, async () => {
            if (this.state.modalData.status) {
                await this.updateTimeLogic();    
            }
        });
    };

    updateTimeLogic = async () => {
        const { newHours, newMinutes, modalData } = this.state;
        const hours = parseInt(newHours, 10);
        const minutes = parseInt(newMinutes, 10);

        if (isNaN(hours) || isNaN(minutes)) {
            alert('Please enter valid hours and minutes.');
            return;
        }

        // Create new Date object or formatted string
        const updatedTime = moment(modalData.heartbeat)
            .hours(hours)
            .minutes(minutes)
            .format('YYYY-MM-DD HH:mm:ss');

        // Update your data source here, e.g.,
        let platform_id = 'bankos';
        let grp = modalData.grp;
        let resource = modalData.resource;
        let new_title = '';
        let new_status_4hrs_ago = '';

        try {
            const res = await getStatusByDate(platform_id, grp, resource, updatedTime);
            const data = res?.results?.[0];
            new_status_4hrs_ago = data.status;

            if (modalData?.status === 1) {
                new_title = "Application is healthy";
            } else if (new_status_4hrs_ago === -1) {
                new_title = "Application is Unhealthy";
            } else if (new_status_4hrs_ago === 0 || new_status_4hrs_ago === 1) {
                new_title = "Application is Partially Healthy";
            }
        } catch (err) {
            alertError(err.response?.data?.message || "Could not fetch the correct status.");
        } finally {
            // Set loading to false
            this.setState({ 
                isLoading: false, 
                showModal: true, 
                newFinalObj: this.finalObj,
                status4hrsago: new_status_4hrs_ago,
                title: new_title,
            },
            () => {
                // console.log('------newFinalObj-------', this.state.newFinalObj);
            });
        }
    };

    handleSubmit = async () => {
        const { newHours, newMinutes, modalData, textareaContent } = this.state;
        // Simple validation
        const hours = parseInt(newHours, 10);
        const minutes = parseInt(newMinutes, 10);

        if (isNaN(hours) || isNaN(minutes)) {
            alert('Please enter valid hours and minutes.');
            return;
        }

        // Set loading to true
        this.setState({ isLoading: true });

        // Create new Date object or formatted string
        const updatedTime = moment(modalData.heartbeat)
            .hours(hours)
            .minutes(minutes)
            .format('YYYY-MM-DD HH:mm:ss');

        // Update your data source here, e.g.,
        let platform_id = 'bankos';
        let grp = modalData.status ? modalData.grp : this.state.grp;
        let resource = modalData.status ? modalData.resource : this.state.resource;

        try {
            const res = await getUptimePlatformSpecificReq(platform_id, grp, resource, updatedTime, textareaContent);
            const dataSpecific = res;
            
            if (this.finalObj && this.finalObj[resource]) {
                // Check if platform and resource match with the items in the array
                const items = this.finalObj[resource];

                if (modalData.heartbeat) {
                    const selectedDateStr = moment(modalData.heartbeat).format('YYYY-MM-DD');

                    // Find an item with the same heartbeat date
                    const matchIndex = items.findIndex(item =>
                        moment(item.heartbeat).format('YYYY-MM-DD') === selectedDateStr
                    );

                    if (matchIndex !== -1) {
                        // Replace the matched item
                        const dataItem = dataSpecific?.results?.[0];
                        if (dataItem) {
                            items[matchIndex] = dataItem;
                        }
                    } else {
                        // No match: optionally push new data
                    }
                }
            }
        } catch (err) {
            alertError(err.response?.data?.message || "Could not fetch the correct information.");
        } finally {
            // Set loading to false
            this.setState({ 
                isLoading: false, 
                showModal: false, 
                newFinalObj: this.finalObj 
            },
            () => {
                // console.log('------newFinalObj-------', this.state.newFinalObj);
            });
        }
    };

    render() {
        const { data, dataToday, name } = this.props;
        const { hover, que, showMore, isLoading } = this.state;
        let values = [];

        for (var property in data) {
            values.push(property);
        }

        if( data && dataToday ){
            const grpsArray = Object.keys(data); // ['a', 'b', 'c']
            const newArray = grpsArray.map((grp, grp_index) => {
                const lastItemOfGrp = data[grp][data[grp].length - 1];
                const restItemsOfGrp = data[grp].slice(0, -1);
                const todayGrpValue = dataToday[grp]?.[0]; 

                const newArrayWithLastItem = [...restItemsOfGrp, todayGrpValue];
                return [grp, newArrayWithLastItem];
            })

            if (Object.keys(this.state.newFinalObj).length > 0) {
                // It's not empty
                this.finalObj = this.state.newFinalObj;
            } else {
                // It's empty, generate new object
                this.finalObj = Object.fromEntries(newArray);
                this.setState({ 
                    newFinalObj: this.finalObj 
                }, () => {
                    // console.log('------newFinalObj-------', this.state.newFinalObj);
                });
            }
        }

        let upTimePerc = 0;
        let filterData = [];

        if (values.length > 0 && this.state.newFinalObj) {
            const upTime = this.state.newFinalObj[values[0]]?.filter(
                (item) => item.status === 1
            )?.length;
            upTimePerc = (upTime / this.state.newFinalObj[values[0]]?.length) * 100;

            let currentTime = moment().format();
            let fiveMinBefore = moment(currentTime).subtract(5, "minute").format();

            filterData = this.state.newFinalObj[values[0]]?.filter(
                (item) =>
                    moment(item.heartbeat).format() <= currentTime &&
                    moment(item.heartbeat).format() >= fiveMinBefore
            );
        }

        const downTimeFilter = filterData?.filter((item) => item.status === -1);

        return (
            <div className="crmbar-container">
                <span className="crmbar-header">
                    <h2 className="crmbar-title">
                        {(
                            !showMore ? (
                                <FiPlusSquare
                                    className="text-sm cursor-pointer"
                                    onClick={this.toggleShowMore}
                                />
                            ) : (
                                <FiMinusSquare
                                    className="text-sm cursor-pointer"
                                    onClick={this.toggleShowMore}
                                />
                            )
                        )}
                        <span className="ml-1">{name}</span>
                        {que === name && <QuestionPopup name={name} description="" />}
                        <GoQuestion
                            onMouseEnter={() => this.handleQueEnter(name)}
                            onMouseLeave={this.handleQueLeave}
                            className="ml-1"
                        />
                    </h2>
                    <h4 className="crmbar-operational">Operational</h4>
                </span>
                {!showMore && this.state.newFinalObj && (
                    <>
                        <span className="crmbar-bar-container">
                            {values.length > 0 &&
                                this.state.newFinalObj[values[0]]?.map((item, i) => (
                                    <span
                                        key={i}
                                        className={`crmbar-bar ${
                                            item?.status === 1
                                                ? "bg-green-600"
                                                : item?.status === -1
                                                    ? "bg-red-600"
                                                    : item?.status === 0
                                                        ? "bg-yellow-500"
                                                        : "bg-gray-500"
                                        }`}
                                        onMouseEnter={() => this.handleMouseEnter(i)}
                                        onMouseLeave={this.handleMouseLeave}
                                    >
                                        {i === hover && (
                                            <Popup
                                                date={item.heartbeat}
                                                description={item.description}
                                            />
                                        )}
                                    </span>
                                ))}
                        </span>
                        <div className="crmbar-footer">
                            <span>90 days</span>
                            <div className="separator-line"></div>
                            <span>{Math.round(upTimePerc)}% uptime</span>
                            <div className="separator-line"></div>
                            <span>Today</span>
                        </div>
                    </>
                )}
                {showMore &&
                    values.map((value) => (
                        <div className="crmbar-show-more" key={value}>
                            <div className="flex flex-col gap-1">
                                <h2 className="text-sm">{value}</h2>
                                <span className="crmbar-bar-container">
                                    {this.state.newFinalObj[value].map((item, i) => {
                                        const newTime = this.state.newFinalObj[value].filter(
                                            (item) => item?.status === 1
                                        ).length;
                                        upTimePerc = (newTime / this.state.newFinalObj[value].length) * 100;
                                        return (
                                            <span
                                                key={i}
                                                className={`crmbar-bar ${
                                                    item?.status === 1
                                                        ? "bg-green-600"
                                                        : item?.status === -1
                                                            ? "bg-red-600"
                                                            : item?.status === 0
                                                                ? "bg-yellow-500"
                                                                : "bg-gray-500"
                                                }`}
                                                onMouseEnter={() => this.handleMouseEnter(item?.id)}
                                                onMouseLeave={this.handleMouseLeave}
                                                onClick={() => this.openModal(item, value, name)}
                                            >
                                                {item?.id === hover && value === item?.resource && (
                                                    <Popup
                                                        date={item.heartbeat}
                                                        description={item.description}
                                                    />
                                                )}
                                            </span>
                                        );
                                    })}
                                </span>
                                <div className="crmbar-footer">
                                    <span>90 days</span>
                                    <div className="separator-line"></div>
                                    <span>{Math.round(upTimePerc)}% uptime</span>
                                    <div className="separator-line"></div>
                                    <span>Today</span>
                                </div>
                            </div>
                        </div>
                    ))}
                
                {this.state.showModal && (
                    <div className="modal-backdrop">
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2><strong> {moment(this.state.modalData?.heartbeat).format('YYYY-MM-DD')} </strong></h2>
                            <h4>{this.state.modalData?.status ? this.state.modalData?.resource : this.state.resource}</h4>
                            <h4>{this.state.title}</h4>
                            
                            <div style={{ marginTop: '1rem' }}>
                                <label>
                                    Hours:
                                    <input
                                        type="number"
                                        min={0}
                                        max={23}
                                        value={this.state.newHours}
                                        onChange={(e) => this.handleTimeChange('newHours', e.target.value)}
                                        style={{ marginLeft: '0.5rem', width: '60px' }}
                                    />
                                </label>
                                <label style={{ marginLeft: '1rem' }}>
                                    Minutes:
                                    <input
                                        type="number"
                                        min={0}
                                        max={59}
                                        value={this.state.newMinutes}
                                        onChange={(e) => this.handleTimeChange('newMinutes', e.target.value)}
                                        style={{ marginLeft: '0.5rem', width: '60px' }}
                                    />
                                </label>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <label>
                                    Description: <br />
                                </label>
                                <textarea
                                    rows={3}
                                    style={{ width: '100%', marginTop: '0.5rem' }}
                                    value={this.state.textareaContent}
                                    onChange={(e) => this.setState({ textareaContent: e.target.value })}
                                />
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {isLoading ? (
                                    <div className="spinner">Loading...</div>
                                ) : (
                                    <button onClick={this.handleSubmit}>Submit</button>
                                )}
                                <button onClick={this.closeModal}>Cancel</button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        );
    }
}

CRMbar.propTypes = {
    data: PropTypes.any.isRequired,
    dataToday: PropTypes.any.isRequired,
    name: PropTypes.string.isRequired,
    setEventChanged: PropTypes.func.isRequired,
};

export default CRMbar;
