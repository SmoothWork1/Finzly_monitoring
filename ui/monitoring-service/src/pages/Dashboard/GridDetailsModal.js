import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  // Button,
  // Dropdown,
  // DropdownItem,
  // DropdownMenu,
  // DropdownToggle,
  // Form,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Alert,
  Button,
} from "reactstrap";
import { eventTitles } from "config/globals";
import { assignEventReq, flagEventReq, getMonitoringEventReq, updMonitoringEventReq, addEventCommentReq } from "config/httpRoutes";
import { Field, Formik, /* ErrorMessage, */ Form } from "formik";
import { alertError, alertSuccess } from "config/toast";
import { convertJSONtoQParams, generalize, getCleanedDateTime, safelyParseJSONObj } from "config/helpers";
import { connect } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next"
import paginationFactory, {
  PaginationProvider,
  // PaginationListStandalone,
  // PaginationTotalStandalone,
} from "react-bootstrap-table2-paginator"
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import classnames from "classnames";
import * as Yup from "yup";
import { htmlRE } from "config/regex";
import { changePreloader } from 'store/actions';

class GridDetailsModal extends Component {
  constructor(props) {
    super(props);
    this.savedUserid = this.props?.event?.user_id || '';
    this.state = {
      drop: false,
      status: this.props?.event?.status || '',
      event: {},
      comments: [],
      activeTab: 'details',
      commentColumns: [
        {
          dataField: "comment",
          text: "Comment",
          sort: false,
          formatter: (cellContent, row, rowIndex) => (
            <>
            <span id={`UncontrolledTooltip${generalize(row.event_id)}${generalize(row.user_id)}${rowIndex}Comment`}>{row.comment}</span>
            </>
          ),
        },
        // {
        //   dataField: "user_id",
        //   text: "User ID",
        //   sort: false,
        //   formatter: (cellContent, row, rowIndex) => (
        //     <>
        //     <span id={`UncontrolledTooltip${generalize(row.event_id)}${generalize(row.user_id)}${rowIndex}UserId`}>{row.user_id}</span>
        //     </>
        //   ),
        // },
        {
          dataField: "email",
          text: "User Email",
          sort: false,
          formatter: (cellContent, row, rowIndex) => (
            <>
            <span id={`UncontrolledTooltip${generalize(row.event_id)}${generalize(row.user_id)}${rowIndex}UserId`}>{row.email}</span>
            </>
          ),
        },
        {
          dataField: "created_atStr",
          text: "Created At",
          sort: false,
          formatter: (cellContent, row, rowIndex) => (
            <>
            <span id={`UncontrolledTooltip${generalize(row.event_id)}${generalize(row.user_id)}${rowIndex}Created At`}>{row.created_atStr}</span>
            </>
          ),
        },
      ]
    };
  }

  componentDidUpdate(prevProps) {
    // if(this.props.event.status !== prevProps.status) {
    //   this.setState({status: this.props.event.status});
    // }
    if(this.props.event && this.props.event.event_id && this.props.event.event_id !== prevProps.event.event_id) {
      this.getEvent();
    }
  }
  
  // componentDidMount() {
  //   console.log("Fetching Event Details");
  //   if(this.props.event && this.props.event.event_id) {
  //     this.getEvent();
  //   }
  // }

  getEvent = (activeTab='details') => {
    // this.props.changePreloader(true);
    getMonitoringEventReq(this.props.event.event_id)
    .then( (res) => {
      this.setState({
        event: {
          ...res.event,
          badgeclass: res.event.status === "Active" ? 'danger' : (res.event.status === "Resolved" ? 'success' : 'warning'),
          created_atStr: getCleanedDateTime(res.event.created_at),
          updated_atStr: getCleanedDateTime(res.event.updated_at),
          created_at: new Date(res.event.created_at),
          updated_at: new Date(res.event.updated_at),
          details: safelyParseJSONObj(res.event.details),
        },
        // comments: res.comments.map( (c) => c.comment),
        comments: res.comments.map( (r) => ({
          ...r,
          created_atStr: getCleanedDateTime(r.created_at),
          pk: `${r.user_id}_${r.created_at}`
        })),
        activeTab,
        status: res?.event?.status || '',
      });
      this.savedUserid = res?.event?.user_id || '';
    }).catch( (err) => {
      alertError(err.response?.data?.message || "Could not fetch event details");
      this.props.toggle && this.props.toggle();
    })/* .finally( () => {
      this.props.changePreloader(false);
    }) */;
  }

  handleUserChange = (user_id) => {
    if(!user_id || user_id === this.props.event.user_id || user_id === this.savedUserid) {return;}
    if(user_id === 'null') {user_id = null;}
    assignEventReq({event_id: this.props.event.event_id, user_id})
    .then( (res) => {
      this.savedUserid = user_id;
      this.props.refresh && this.props.refresh();
      alertSuccess("Event assigned to user");
    }).catch( (err) => {
      alertError(err.response?.data?.message || "Could not assign event to user");
    });
  }

  updateEvent = (status) => {
		updMonitoringEventReq({event_id: this.props.event.event_id, status})
		.then( (res) => {
			this.props.refresh && this.props.refresh();
      this.setState({status});
      alertSuccess("Event status updated");
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not update event status");
		});
	}
  toggleAction = () => {
    this.setState((prevState) => ({
      drop: !prevState.drop
    }));
  }

  openEventInJIRA = () => {
    const jiraObj = {
      summary: `${eventTitles[this.props.event.event_type]} in ${this.props.event.source_system}`,
      description: this.props.event.description,
      pid: process.env.REACT_APP_JIRA_PROJECT_ID,
      issuetype: process.env.REACT_APP_JIRA_ISSUE_TYPE,
    };
    const htmlUrl = `${process.env.REACT_APP_JIRA_BASE_URL}secure/CreateIssueDetails!init.jspa?${convertJSONtoQParams(jiraObj)}`;
    window.open(htmlUrl, '_blank', 'noreferrer');
  }

  flagEvent = () => {
    const description_substring = (this.props.event.description.split("<br"))[0];
    const user_id = this.props.userid;
    flagEventReq({user_id, description_substring})
    .then( (res) => {
      alertSuccess("Event Flagged");
    }).catch( (err) => {
      this.setState({error: err.response?.data?.message || 'Could not flag event'});
    });
  }

  addEventComment = (comment) => {
    addEventCommentReq({event_id: this.props.event.event_id, comment})
    .then( (res) => {
      this.getEvent('comments');
    }).catch( (err) => {
      alertError(err.response?.data?.message || "Could not add comment");
    });
  }

  toggleTab = (tab) => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      });
    }
  }

  render() {
    const status = this.state.status || this.props.event.status;
    const { comments } = this.state;
    return (
      <React.Fragment>
        <Modal
          isOpen={this.props.isOpen}
          role="dialog"
          autoFocus={true}
          centered={true}
          className="exampleModal"
          tabIndex="-1"
          toggle={this.props.toggle}
        >
          <div className="modal-content">
            <ModalHeader toggle={this.props.toggle}>
              {/* Event Details */}
              <Nav className="d-flex" pills>
                <NavItem>
                  {/* <NavLink */}
                  <Button
                    className={classnames({
                      // active: this.state.activeTab === "details",
                      "selected-filter-button": this.state.activeTab === "details",
                      "btn-filter": true,
                      "fs-filter": true,
                      "btn-primary": true,
                    })}
                    // style={this.state.activeTab === "details" ? {} : {}}
                    onClick={() => {
                      this.toggleTab("details")
                    }}
                  >
                    <p className="fw-bold mb-0">Details</p>
                  {/* </NavLink> */}
                  </Button>
                </NavItem>
                <NavItem>
                  {/* <NavLink */}
                  <Button
                    className={classnames({
                      // active: this.state.activeTab === "comments",
                      "selected-filter-button": this.state.activeTab === "comments",
                      "btn-filter": true,
                      "fs-filter": true,
                      "btn-primary": true,
                      "ml-1": true
                    })}
                    // style={this.state.activeTab === "comments" ? {} : {}}
                    onClick={() => {
                      this.toggleTab("comments")
                    }}
                  >
                    <p className="fw-bold mb-0">Comments</p>
                  {/* </NavLink> */}
                  </Button>
                </NavItem>
              </Nav>
            </ModalHeader>
            <ModalBody style={{maxHeight: '75vh', overflow: 'scroll'}}>
              <TabContent activeTab={this.state.activeTab}>
                <TabPane tabId="details">
                  {this.state.event.event_id ?
                    <>
                    <p className="mb-2">
                      {/* Event id: <span className="text-primary">{this.props.event.event_id}</span> */}
                      Event id: <span className="text-primary">{this.state.event.event_id}</span>
                    </p>
                    <p className="mb-2">
                      Event Type:{" "}
                      {/* <span className="text-primary">{eventTitles[this.props.event.event_type]}</span> */}
                      <span className="text-primary">{eventTitles[this.state.event.event_type]}</span>
                    </p>
                    <p className="mb-2">
                      Source System:{" "}
                      {/* <span className="text-primary">{this.props.event.source_system}</span> */}
                      {/* <span className="text-primary" dangerouslySetInnerHTML={{__html: this.props.event.source_system}} /> */}
                      <span className="text-primary" dangerouslySetInnerHTML={{__html: this.state.event.source_system}} />
                    </p>
                    <p className="mb-2">
                      Description:{" "}
                      {/* <span className="text-primary">{this.props.event.description}</span> */}
                      {/* <span className="text-primary" dangerouslySetInnerHTML={{__html: this.props.event.description}} /> */}
                      <span className="text-primary" dangerouslySetInnerHTML={{__html: this.state.event.description}} />
                    </p>
                    {/* {this.props.event && this.props.event.details && Object.keys(this.props.event.details).map( (key, i) => */}
                    {this.state.event && this.state.event.details && Object.keys(this.state.event.details).map( (key, i) =>
                      <p key={`brr${i}`} className="mb-2 text-capitalize">
                        {key}:{" "}
                        {htmlRE.test(this.state.event.details[key]) ?
                          <span className="text-primary" dangerouslySetInnerHTML={{__html: this.state.event.details[key]}} />
                        :
                          <span className="text-primary">{this.state.event.details[key]}</span>
                        }
                      </p>
                    )}
                    <p className="mb-2">
                      Status:{" "}
                      {/* <span className={`text-${this.props.event.badgeclass}`}>{status}</span> */}
                      <span className={`text-${this.state.event.badgeclass}`}>{status}</span>
                    </p>
                    <p className="mb-2">
                      Severity:{" "}
                      {/* <span className={`text-primary severity-text-${this.props.event.severity}`}>{this.props.event.severity}</span> */}
                      <span className={`text-primary severity-text-${this.state.event.severity}`}>{this.state.event.severity}</span>
                    </p>
                    {/* <p className="mb-2">
                      Comments:{" "}
                    </p>
                    <p className="mb-2">
                      {Array.isArray(this.state.comments) && this.state.comments.map( (comment, i) =>
                        <React.Fragment key={i}>
                          <span className="text-primary ml-2">- {comment}</span>
                          <br/>
                        </React.Fragment>
                      )}
                    </p> */}
                    <p className="mb-2">
                      Created By:{" "}
                      {/* <span className="text-primary">{this.props.event.created_by}</span> */}
                      <span className="text-primary">{this.state.event.created_by}</span>
                    </p>
                    <p className="mb-2">
                      Updated By:{" "}
                      {/* <span className="text-primary">{this.props.event.updated_by}</span> */}
                      <span className="text-primary">{this.state.event.updated_by}</span>
                    </p>
                    <p className="mb-2">
                      Created At:{" "}
                      {/* <span className="text-primary">{this.props.event.created_atStr}</span> */}
                      <span className="text-primary">{this.state.event.created_atStr}</span>
                    </p>
                    <p className="mb-2">
                      Updated At:{" "}
                      {/* <span className="text-primary">{this.props.event.updated_atStr}</span> */}
                      <span className="text-primary">{this.state.event.updated_atStr}</span>
                    </p>
                    {this.props.usertype === 'Support' && <div className="mb-2">
                      <Formik
                        enableReinitialize={true}
                        initialValues={{
                          // user: this.props.event.user_id || "",
                          user: this.state.event.user_id || "",
                        }}
                        onSubmit={values => {
                          this.handleUserChange(values.user);
                        }}
                      >
                        {({ errors, status, touched, values }) => (
                        <Form className="mt-3 d-flex w-100 justify-content-end form-horizontal align-items-end">
                          <div className="w-100">
                            <Label className="form-label">
                              Assigned User
                            </Label>
                            <Field
                              name="user"
                              as="select"
                              className="form-control"
                            >
                              <option value="null">None</option>
                              {Array.isArray(this.props.users) && this.props.users.map( (u, i) =>
                                <option key={`user${i}option`} value={u.id}>{u.first_name} {u.last_name}</option>
                              )}
                            </Field>
                          </div>
                          {/* {this.handleUserChange(values.user)} */}
                          <button
                            className="btn btn-primary btn-block"
                            type="submit"
                            style={{width: '4rem', marginLeft: '0.5rem', height: '2.4rem'}}
                          >
                            {" "}
                            Save{" "}
                          </button>
                        </Form>
                        )}
                      </Formik>
                      </div>
                    }
                    </>
                  :
                    <div id="preloader" style={{display: 'block'}}>
                      <div id="status" style={{display: 'block'}}>
                        <div className="spinner-chase">
                          <div className="chase-dot"></div>
                          <div className="chase-dot"></div>
                          <div className="chase-dot"></div>
                          <div className="chase-dot"></div>
                          <div className="chase-dot"></div>
                          <div className="chase-dot"></div>
                        </div>
                      </div>
                    </div>
                  }
                </TabPane>
                <TabPane tabId="comments">
                  {Array.isArray(comments) && comments.length > 0 && comments[0].event_id &&
                    <PaginationProvider
                      pagination={paginationFactory({ // pagination customization
                        // sizePerPage: comments.length,
                        // totalSize: comments.length,
                        hideSizePerPage: true,
                        hidePageListOnlyOnePage: false,
                        showTotal: false,
                      })}
                      keyField='pk'
                      columns={this.state.gridColumns}
                      data={comments}
                    >
                      {({ paginationProps, paginationTableProps }) => (
                        <ToolkitProvider
                          keyField="pk"
                          data={comments}
                          columns={this.state.commentColumns}
                          bootstrap4
                          search
                          ignoreSinglePage
                        >
                          {toolkitProps => (
                            <React.Fragment>
                              <div className="table-responsive">
                                <BootstrapTable
                                  {...toolkitProps.baseProps}
                                  {...paginationTableProps}
                                  responsive
                                  defaultSorted={[{ dataField: 'created_at', order: 'desc' }]}
                                  bordered={false}
                                  striped={false}
                                  // selectRow={{ mode: 'checkbox' }}
                                  ignoreSinglePage
                                  classes={
                                    "table align-middle table-nowrap table-check"
                                  }
                                  headerWrapperClasses={"table-light"}
                                />
                              </div>
                            </React.Fragment>
                          )}
                        </ToolkitProvider>
                      )}
                    </PaginationProvider>
                  }
                </TabPane>
              </TabContent>
            </ModalBody>
            <ModalFooter style={{display: 'flex', justifyContent: 'space-between'}}>
              <Formik
                enableReinitialize={true}
                initialValues={{
                  commment: this.state.comment || ""
                }}
                validationSchema={Yup.object().shape({
                  comment: Yup.string()
                  .required(
                    "Please Enter Your Comments"
                  ),
                })}
                onSubmit={values => {
                  this.addEventComment(values.comment);
                }}
              >
                {({ errors, formStatus, touched }) => (
                  <Form className="form-horizontal w-100">
                    {this.state.error && this.state.error ? (
                      <Alert color="danger">
                        {this.state.error}
                      </Alert>
                    ) : null}

                    <div className="mt-3 d-flex w-100 justify-content-end">
                      {/* <Label for="comment" className="form-label">
                        Comments
                      </Label> */}
                      <Field
                        component="textarea"
                        name="comment"
                        placeholder="Add new comment"
                        type="text"
                        className={
                          "form-control" +
                          (errors.comment && touched.comment
                            ? " is-invalid"
                            : "")
                        }
                      />
                      {/* <ErrorMessage
                        name="comment"
                        component="div"
                        className="invalid-feedback"
                      /> */}

                      <button
                        className="btn btn-primary btn-block"
                        type="submit"
                        style={{width: '4rem', marginLeft: '0.5rem'}}
                      >
                        {" "}
                        Save{" "}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </ModalFooter>
            {/* <ModalFooter style={{display: 'flex', justifyContent: 'space-between'}}>
              <Dropdown
                isOpen={this.state.drop}
                toggle={() => {this.toggleAction()}}
                className="dropdown d-inline-block"
                tag="li"
              >
                <DropdownToggle
                  className={`btn header-item noti-icon position-relative text-${this.props.event.badgeclass}`}
                  tag="span"
                  id={`grid-details-drop`}
                  style={{display: 'flex', alignItems: 'center'}}
                >
                  {status}
                  <i className="mdi mdi-chevron-down ml-1" />
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  {this.props.usertype === 'Support' &&
                    <>
                    {status !== 'Active' ?
                      <DropdownItem
                        className={`notify-item align-middle`}
                        onClick={() => {this.updateEvent('Active')}}
                      >
                        <span className="text-danger">Activate</span>
                      </DropdownItem>
                    :
                      <></>
                    }
                    {status !== 'Ignored' ?
                      <DropdownItem
                        className={`notify-item align-middle`}
                        onClick={() => {this.updateEvent('Ignored')}}
                      >
                        <span className="text-warning">Ignore</span>
                      </DropdownItem>
                    :
                      <></>
                    }
                    {status !== 'Resolved' ?
                      <DropdownItem
                        className={`notify-item align-middle`}
                        onClick={() => {this.updateEvent('Resolved')}}
                      >
                        <span className="text-success">Resolve</span>
                      </DropdownItem>
                    :
                      <></>
                    }
                    <div className="dropdown-divider" />
                    </>
                  }
                    <DropdownItem
                      className={`notify-item align-middle`}
                      onClick={() => {this.openEventInJIRA()}}
                    >
                      <span className="text-info">Create a JIRA</span>
                    </DropdownItem>

                    {this.props.usertype === 'Support' &&
                      <DropdownItem
                        className={`notify-item align-middle`}
                        onClick={() => {this.flagEvent()}}
                      >
                        <span className="text-danger">Flag Event</span>
                      </DropdownItem>
                    }
                </DropdownMenu>
              </Dropdown>
              <Button
                type="button"
                color="secondary"
                onClick={this.props.toggle}
              >
                Close
              </Button>
            </ModalFooter> */}
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

GridDetailsModal.propTypes = {
  toggle: PropTypes.func,
  changePreloader: PropTypes.func,
  isOpen: PropTypes.bool,
  event: PropTypes.any,
  userid: PropTypes.string,
  usertype: PropTypes.string,
};

const mapStateToProps = (state) => ({
  userid: state.session.userid,
  usertype: state.session.type,
});

export default connect(mapStateToProps, { changePreloader })(GridDetailsModal);
