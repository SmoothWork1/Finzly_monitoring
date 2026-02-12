import React, { Component } from "react";
import { getStartingDayOfMonth, getMonthNameFromDate } from "config/helpers";
import Popup from "./Popup";
import moment from "moment";
import { getUptimePlatformSpecificReq, getStatusByDate } from "config/httpRoutes";
import { alertError } from "config/toast";

class CalendarView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hover: null,
            clicked: null,
            showModal: false,
            newHours: '',
            newMinutes: '',
            isLoading: false,
            textareaContent: '',
            status4hrsago: 1,
            title: 'Application is healthy',
            resource: '',
            grp: '',
            modalData: null,
            newFinalObj: {},
        };
        this.finalObj = {};
    }

    setHover = (index) => {
        this.setState({ hover: index });
    };

    clearHover = () => {
        this.setState({ hover: null });
    };

    setClicked = (index) => {
        this.setState({ clicked: index });
    };

    openModal = (data, resource) => {
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
            grp: data?.grp ? data.grp : '',
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
        const { data, selectedOption } = this.props;
        const { isLoading } = this.state;

        let startingDay;
        let monthName;
        let upTimePerc;

        if (Array.isArray(data)) {
            startingDay = getStartingDayOfMonth(new Date(data[0].heartbeat));
            monthName = getMonthNameFromDate(new Date(data[0].heartbeat));
            const upTime = data?.filter((item) => item.status === 1)?.length;
            upTimePerc = (upTime / data.length) * 100;
        }

        const emptyCells = Array.from({ length: startingDay }, (_, index) => (
            <div key={`empty-${index}`} className="empty-cell"></div>
        ));

        return (
            <div className="uptime-calendar-view">
                <div className="uptime-calendar-header">
                    <h2 className="uptime-header-title">{monthName}</h2>
                    <h2 className="uptime-header-percentage">{Math.round(upTimePerc)}%</h2>
                </div>

                <div className="uptime-calendar-grid">
                    {emptyCells}
                    {data?.map((item, i) => (
                        <span
                            key={i}
                            className={`uptime-calendar-cell ${
                                item?.status === 1
                                    ? "bg-up"
                                    : item?.status === -1
                                        ? "bg-down"
                                        : item?.status === 0
                                            ? "bg-yellow-neutral"
                                            : "bg-neutral"
                            } ${this.state.clicked === i && "uptime-calendar-selected-cell"}`}
                            onMouseEnter={() => this.setHover(i)}
                            onMouseLeave={this.clearHover}
                            onClick={() => this.openModal(item, selectedOption)}
                        >
                            {i === this.state.hover && (
                                <Popup date={item.heartbeat} description={item.description} />
                            )}
                        </span>
                    ))}
                </div>

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

                            {/* Textarea after minutes */}
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

export default CalendarView;
