import PropTypes from 'prop-types';
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Dropdown, DropdownToggle, DropdownMenu, Row, Col } from "reactstrap";
import SimpleBar from "simplebar-react";

//i18n
import { withTranslation } from "react-i18next";
import { getNotificationsReq, notificationViewedReq, getUsersReq, clearNotificationsReq } from 'config/httpRoutes';
import { alertError } from 'config/toast';
import { getCleanedDateTime, getTimeDifferenceFromNow, safelyParseJSONObj } from 'config/helpers';
import { eventTitles } from 'config/globals';
import { connect } from 'react-redux';
import GridDetailsModal from 'pages/Dashboard/GridDetailsModal';
import { sendMessage } from 'config/websocket';
import { saveList } from 'actions/lists';

class NotificationDropdown extends Component {
  constructor(props) {
    super(props)
    this.state = {
      menu: false,
      // notifications: null,
      viewmodal: false,
      event: {},
      users: null,
      // more: false
    }
    this.toggle = this.toggle.bind(this)
  }

  toggle() {
    this.setState(prevState => ({
      menu: !prevState.menu,
    }))
  }

  componentDidMount() {
    this.getNotifications();
    this.getUsers();
  }

  getUsers = () => {
		getUsersReq()
		.then( (res) => {
			this.setState({users: res.users});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch required data");
		});
	}

  getNotifications = () => {
		const error = sendMessage('events', {actionPack: 'notifications', user_id: this.props.userid});
    if(error) {
      this.getNotificationsAsync();
    }
  }
  getNotificationsAsync = () => {
		getNotificationsReq()
		.then( (res) => {
			const notifications = res.notifications.map( (r) => ({
				...r,
				created_atStr: getCleanedDateTime(r.created_at),
				updated_atStr: getCleanedDateTime(r.updated_at),
				created_at: new Date(r.created_at),
				updated_at: new Date(r.updated_at),
				details: safelyParseJSONObj(r.details),
				badgeclass: r.status === "Active" ? 'danger' : (r.status === "Resolved" ? 'success' : 'warning')
			}));
			// this.setState({notifications, more: res.more});
      this.props.saveList({notifications, more: res.more});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch notifications");
		});
  }

  clearNotifications = (e) => {
    e.preventDefault();
		clearNotificationsReq()
		.then( (res) => {
			this.getNotifications();
		}).catch( (err) => {
      console.log(err);
			alertError(err.response?.data?.message || "Could not clear notifications");
		});
  }

  toggleViewModal = (event, index) => {
		this.setState(prevState => ({
		  viewmodal: !prevState.viewmodal, event
		}));
    if(event.event_id) {
      notificationViewedReq({event_id: event.event_id, user_id: this.props.userid})
      .then( (res) => {
        // const { notifications } = this.state;
        // notifications.splice(index, 1);
        // this.setState({notifications:  [...notifications]});
        this.getNotifications();
      }).catch( (err) => {});
    }
	}

  render() {
    const { notifications, more } = this.props;
    return (
      <React.Fragment>
        <GridDetailsModal
          isOpen={this.state.viewmodal}
          toggle={() => {this.toggleViewModal({})}}
          event={this.state.event}
          users={this.state.users}
        />
        <Dropdown
          isOpen={this.state.menu}
          toggle={this.toggle}
          className="dropdown d-inline-block"
          tag="li"
        >
          <DropdownToggle
            className="btn header-item noti-icon position-relative"
            tag="button"
            id="page-header-notifications-dropdown"
          >
            <i className="bx bx-bell bx-tada" />
            {notifications && notifications.length > 0 && (<span className="badge bg-danger rounded-pill">{more ? "10+" : notifications.length}</span>)}
          </DropdownToggle>

          <DropdownMenu className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0">
            <div className="p-3">
              <Row className="align-items-center">
                <Col>
                  <h6 className="m-0"> {this.props.t("Notifications")} </h6>
                </Col>
                <div className="col-auto">
                  <a href="/#" className="small" onClick={this.clearNotifications}>
                    {" "}
                    Clear All
                  </a>
                  {/* <a href="/dashboard" className="small">
                    {" "}
                    View All
                  </a> */}
                </div>
              </Row>
            </div>

            <SimpleBar style={{ height: "230px" }}>
              {Array.isArray(notifications) && notifications.length > 0 && notifications.map( (n, i) =>
                <div key={`notif${i}`} onClick={() => {this.toggleViewModal(n, i)}} className="text-reset notification-item cursor-pointer">
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <h6 className="mt-0 mb-1">
                        {this.props.t(`${eventTitles[n.event_type]} #${n.event_id}`)}
                      </h6>
                      <div className="font-size-12 text-muted">
                        <p className="mb-1">
                          {this.props.t(
                            n.description
                          )}
                        </p>
                        <div className="d-flex p-0 justify-content-between">
														<p className="mb-0">
															<i className="mdi mdi-clock-outline" />{" "}
															{this.props.t(getTimeDifferenceFromNow(n.created_at))}{" "}
														</p>
														<span className={`badge badge-pill font-size-11 text-primary severity-text-${n.severity}`}>
															{n.severity}
														</span>
													</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </SimpleBar>
            <div className="p-2 border-top d-grid">
              <Link className="btn btn-sm btn-link font-size-14 text-center" to="/dashboard">
                <i className="mdi mdi-arrow-right-circle me-1"></i> <span key="t-view-more">{this.props.t("View More..")}</span>
              </Link>
            </div>
          </DropdownMenu>
        </Dropdown>
      </React.Fragment>
    )
  }
}

NotificationDropdown.propTypes = {
  t: PropTypes.any,
  userid: PropTypes.string
}

const mapStateToProps = (state) => ({
  userid: state.session.userid,
  notifications: state.lists.notifications,
  more: state.lists.more,
});

const mapDispatchToProps = (dispatch) => ({
  saveList: (list) => {dispatch(saveList(list))},
});

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(NotificationDropdown));
