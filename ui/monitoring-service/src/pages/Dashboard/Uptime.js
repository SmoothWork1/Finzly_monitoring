import PropTypes from 'prop-types';
import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom"; // Import Link from react-router-dom
import { getUptimeAppsReq, getUptimePlatformReq, getUptimePlatformTodayReq } from "config/httpRoutes";
import { alertError } from "config/toast";
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';

import CRMbar from '../../components/Uptime/CRMbar';
import Stripebar from '../../components/Uptime/Stripebar';


class Uptime extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            dataToday: [],
            apps: [],
            eventChanged: false
        };
    }

    componentDidMount() {
        this.getUptimeApps();
        this.getUptimePlatform();
        this.getUptimePlatformToday();
    }

    getUptimeApps = async () => {
        this.props.changePreloader(true);
        getUptimeAppsReq()
            .then((res) => {
				const apps = res.uptime_apps
                this.setState({ apps });
            })
            .catch((err) => {
                alertError(err.response?.data?.message || "Could not fetch apps");
            })
            .finally(() => {
                this.props.changePreloader(false);
            });
    };

    getUptimePlatform = async () => {
        this.props.changePreloader(true);
        let platform_id = 'bankos';
        getUptimePlatformReq(platform_id)
            .then((res) => {
                const data = res.output;
                this.setState({ data });
            })
            .catch((err) => {
                alertError(err.response?.data?.message || "Could not fetch events details");
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

    setEventChanged = (eventChanged) => {
        this.setState({ eventChanged });
    };

    render() {
        const { data, dataToday, apps, eventChanged } = this.state;
        document.title = "Uptime Report";
        return (
            <React.Fragment>
                <div className="uptime-container">
                    <div className={`uptime-status ${eventChanged ? 'bg-red-600' : 'bg-green-600'}`}>
                        <h2>
                            {!eventChanged ? "All Systems Operational" : "Some systems are down"}
                        </h2>
                    </div>
                    <div className="uptime-about-section">
                        <h2>About This Site</h2>
                        <p>
                            {`This is the Finzly BankOS status page, where you can get updates on
                            how our systems are doing. If there are interruptions to service, we
                            will post a note here.`}
                        </p>
                        <p>
                            {`If you would like to receive updates of any status changes, please
                            click the “Subscribe to Updates” button in the top-right of this page.
                            We recommend subscribing with a shared email address or group alias,
                            such as `}
                            <a className="uptime-link" href="/">
                                product@yourcompany.com.
                            </a>
                            {` This not only ensures that your team remains informed of announcements
                            or downtime that may impact your BankOS account or integrations, but
                            also helps keep these important messages out of your Spam and
                            Promotions folders.`}
                        </p>
                        <p>
                            {`As always, if you are experiencing any issues, don't hesitate to get
                            in touch with us at `}
                            <a className="uptime-link" href="/">
                                support@finzly.com
                            </a>
                        </p>
                    </div>
                    <div className="uptime-footer">
                        <p>
                            {`Uptime over the past 90 days.   `}
                            <Link to="/uptime/calendar" className="uptime-link">
                                View historical uptime
                            </Link>
                        </p>
                        <div className="uptime-border-box">
                            {data && dataToday && apps.map((app) => {
                                const objKeys = data[app.grp] ? Object.keys(data[app.grp]) : "";
                                return objKeys.length === 1 ? (
                                    data[app.grp] && dataToday[app.grp] (
                                        <Stripebar
                                            data={data[app.grp][app.grp]}
                                            dataToday={dataToday[app.grp][app.grp]}
                                            name={app.grp}
                                            key={app.grp}
                                            setEventChanged={this.setEventChanged}
                                        />
                                    )
                                ) : (
                                    <CRMbar
                                        data={data[app.grp]}
                                        dataToday={dataToday[app.grp]}
                                        name={app.grp}
                                        key={app.grp}
                                        setEventChanged={this.setEventChanged}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

Uptime.propTypes = {
    changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { changePreloader })(Uptime));
