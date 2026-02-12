import PropTypes from 'prop-types';
import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import BootstrapTable from "react-bootstrap-table-next"
import paginationFactory, {
  PaginationProvider,
  // PaginationListStandalone,
  // PaginationTotalStandalone,
} from "react-bootstrap-table2-paginator"
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';

import { Link } from "react-router-dom"

import { Button, Card, CardBody, Col, Row, UncontrolledTooltip, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, CardTitle, Modal, Alert, Label, ModalHeader, ModalBody } from "reactstrap"
import { eventTitles, pageTitles, pageTypes } from "config/globals"
import { flagEventReq, getEventFunctionNamesReq, getMonitoringEventsReq, getUsersReq, updMonitoringEventReq } from "config/httpRoutes";
import { /* compareDateWithoutTime, */ convertDateToFieldString, convertJSONtoQParams, generalize, getCleanedDateTime, getPagesArray, safelyParseJSONObj, shortenString } from "config/helpers";
import { alertError, alertSuccess } from "config/toast";
import GridDetailsModal from "./GridDetailsModal";
import GridFilterModal from "./GridFilterModal";
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { sendMessage } from 'config/websocket';
import { saveList } from 'actions/lists';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from "yup";
import { htmlRE } from 'config/regex';
import { getFunctionSchedulesReq, getFunctionsByFilterReq } from 'config/httpRoutes';
import GridScheduleModal from './GridScheduleModal';

const getFullColumns = (page) => 
page.props.usertype === 'Support' || page.props.usertype === 'Super Admin'? [
  {
    dataField: "event_id",
    text: "Event ID",
    sort: true,
    formatter: (cellContent, row) => (
      <>
        <Link to="#" id={`UncontrolledTooltip${generalize(row.event_id)}EventId`} className="text-body fw-bold" onClick={() => { page.toggleViewModal(row) }}>
          {/* {row.event_id} */}
          {shortenString(row.event_id, 25)}
        </Link>
        <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.event_id)}EventId`}>
          {row.event_id}
        </UncontrolledTooltip>
      </>
    ),
  },
  {
    dataField: "event_type",
    text: "Event Type",
    sort: false,
    formatter: (cellContent, row) => {
      const type = eventTitles[row.event_type];
      return (
        <>
          <span id={`UncontrolledTooltip${generalize(row.event_id)}EventType`}>{shortenString(type, 25)}</span>
          <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.event_id)}EventType`}>
            {type}
          </UncontrolledTooltip>
        </>
      );
    },
  },
  {
    dataField: "source_system",
    text: "Source System",
    sort: false,
    formatter: (cellContent, row) => (
      <>
        <span dangerouslySetInnerHTML={{ __html: row.source_system }} />
        {/* <span id={`UncontrolledTooltip${generalize(row.event_id)}SourceSystem`}>{shortenString(row.source_system, 25)}</span>
      <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.event_id)}SourceSystem`}>
        {row.source_system}
      </UncontrolledTooltip> */}
      </>
    ),
  },
  {
    dataField: "description",
    text: "Description",
    sort: false,
    formatter: (cellContent, row) => (
      <>
        <span id={`UncontrolledTooltip${generalize(row.event_id)}Description`}>{shortenString(row.description, 25)}</span>
        <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.event_id)}Description`}>
          {row.description}
        </UncontrolledTooltip>
      </>
    ),
  },
  {
    dataField: "details",
    text: "Details",
    sort: false,
  },
  {
    dataField: "status",
    text: "Status",
    sort: true,
    formatter: (cellContent, row) => (
      <span className={"badge badge-pill font-size-11 badge-soft-" + row.badgeclass}>
        {row.status}
      </span>
    ),
  },
  {
    dataField: "severity",
    text: "Severity",
    sort: true,
    formatter: (cellContent, row) => (
      <span className={`badge badge-pill font-size-11 text-primary severity-text-${row.severity}`}>
        {row.severity}
      </span>
    ),
  },
  // {
  //   dataField: "created_by",
  //   text: "Created By",
  //   sort: false,
  // },
  // {
  //   dataField: "updated_by",
  //   text: "Updated By",
  //   sort: false,
  // },
  {
    dataField: "created_atStr",
    text: "Created At",
    sort: false,
    formatter: (cellContent, row) => (
      <>
        <span id={`UncontrolledTooltip${generalize(row.event_id)}CreatedAt`}>{shortenString(row.created_atStr, 25)}</span>
        <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.event_id)}CreatedAt`}>
          {row.created_atStr}
        </UncontrolledTooltip>
      </>
    ),
  },
  // {
  //   dataField: "updated_atStr",
  //   text: "Updated At",
  //   sort: false,
  // },
  {
    dataField: "view",
    isDummyField: true,
    text: "Actions",
    sort: false,
    // formatter: (cellContent, row) => (
    //   <div className="d-flex">
    //   {row.status !== 'Active' ?
    //     <Button
    //       type="button"
    //       color="danger"
    //       className="btn-sm btn-rounded mr-1"
    //       onClick={() => {page.updateEvent(row.event_id, 'Active')}}
    //     >
    //       Activate
    //     </Button>
    //   :
    //     <></>
    //   }
    //   {row.status !== 'Ignored' ?
    //     <Button
    //       type="button"
    //       color="warning"
    //       className="btn-sm btn-rounded mr-1"
    //       onClick={() => {page.updateEvent(row.event_id, 'Ignored')}}
    //     >
    //       Ignore
    //     </Button>
    //   :
    //     <></>
    //   }
    //   {row.status !== 'Resolved' ?
    //     <Button
    //       type="button"
    //       color="success"
    //       className="btn-sm btn-rounded"
    //       onClick={() => {page.updateEvent(row.event_id, 'Resolved')}}
    //     >
    //       Resolve
    //     </Button>
    //   :
    //     <></>
    //   }
    //   </div>
    // ),
    formatter: (cellContent, row, i) => {
      return (
        <Dropdown
          isOpen={row.menu}
          toggle={() => { page.toggleAction(i) }}
          className="dropdown d-inline-block"
          tag="li"
        >
          <DropdownToggle
            className="btn header-item noti-icon position-relative"
            tag="button"
            id={`grid-table-${generalize(row.event_id)}`}
          >
            {/* <i className="bx bx-dots-vertical" /> */}
            <i className="bx bx-dots-horizontal-rounded color-primary" />
          </DropdownToggle>

          <DropdownMenu className="dropdown-menu-end">
            {row.status !== 'Active' ?
              <DropdownItem
                className={`notify-item align-middle`}
                onClick={() => {/* page.updateEvent(row.event_id, 'Active') */page.toggleCommentModal(row.event_id, 'Active', 'activate') }}
              >
                <span className="text-danger">Activate</span>
              </DropdownItem>
              :
              <></>
            }
            {row.status !== 'Ignored' ?
              <DropdownItem
                className={`notify-item align-middle`}
                onClick={() => {/* page.updateEvent(row.event_id, 'Ignored') */page.toggleCommentModal(row.event_id, 'Ignored', 'ignore') }}
              >
                <span className="text-warning">Ignore</span>
              </DropdownItem>
              :
              <></>
            }
            {row.status !== 'Resolved' ?
              <DropdownItem
                className={`notify-item align-middle`}
                onClick={() => {/* page.updateEvent(row.event_id, 'Resolved') */page.toggleCommentModal(row.event_id, 'Resolved', 'resolve') }}
              >
                <span className="text-success">Resolve</span>
              </DropdownItem>
              :
              <></>
            }
            <DropdownItem
              className={`notify-item align-middle`}
              onClick={() => { page.openEventInJIRA(row.event_type, row.source_system, row.description) }}
            >
              <span className="text-info">Create a JIRA</span>
            </DropdownItem>

            <DropdownItem
              className={`notify-item align-middle`}
              onClick={() => { page.flagEvent(row.description) }}
            >
              <span className="text-danger">Flag Event</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      );
    },
  }
] : (page.props.usertype === 'Non-Support' || page.props.usertype === 'Other User') ? [
  {
    dataField: "event_id",
    text: "Event ID",
    sort: true,
    formatter: (cellContent, row) => (
      <>
        <Link to="#" id={`UncontrolledTooltip${generalize(row.event_id)}EventId`} className="text-body fw-bold" onClick={() => { page.toggleViewModal(row) }}>
          {shortenString(row.event_id, 25)}
        </Link>
        <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.event_id)}EventId`}>
          {row.event_id}
        </UncontrolledTooltip>
      </>
    ),
  },
  {
    dataField: "event_type",
    text: "Event Type",
    sort: false,
    formatter: (cellContent, row) => {
      const type = eventTitles[row.event_type];
      return (
        <>
          <span id={`UncontrolledTooltip${generalize(row.event_id)}EventType`}>{shortenString(type, 25)}</span>
          <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.event_id)}EventType`}>
            {type}
          </UncontrolledTooltip>
        </>
      );
    },
  },
  {
    dataField: "source_system",
    text: "Source System",
    sort: false,
    formatter: (cellContent, row) => (
      <>
        <span id={`UncontrolledTooltip${generalize(row.event_id)}SourceSystem`}>{shortenString(row.source_system, 25)}</span>
        <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.event_id)}SourceSystem`}>
          {row.source_system}
        </UncontrolledTooltip>
      </>
    ),
  },
  {
    dataField: "description",
    text: "Description",
    sort: false,
    formatter: (cellContent, row) => (
      <>
        <span id={`UncontrolledTooltip${generalize(row.event_id)}Description`}>{shortenString(row.description, 25)}</span>
        <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.event_id)}Description`}>
          {row.description}
        </UncontrolledTooltip>
      </>
    ),
  },
  {
    dataField: "details",
    text: "Details",
    sort: false,
  },
  {
    dataField: "status",
    text: "Status",
    sort: true,
    formatter: (cellContent, row) => (
      <span className={"badge badge-pill font-size-11 badge-soft-" + row.badgeclass}>
        {row.status}
      </span>
    ),
  },
  {
    dataField: "severity",
    text: "Severity",
    sort: true,
    formatter: (cellContent, row) => (
      <span className={`badge badge-pill font-size-11 text-primary severity-text-${row.severity}`}>
        {row.severity}
      </span>
    ),
  },
  {
    dataField: "created_atStr",
    text: "Created At",
    sort: false,
    formatter: (cellContent, row) => (
      <>
        <span id={`UncontrolledTooltip${generalize(row.event_id)}CreatedAt`}>{shortenString(row.created_atStr, 25)}</span>
        <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.event_id)}CreatedAt`}>
          {row.created_atStr}
        </UncontrolledTooltip>
      </>
    ),
  },
] : [];

class Grid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      selectMulti: false,
      events: [],
      // allEvents: [],
      // customPages: [],
      gridColumns: getFullColumns(this),
      viewmodal: false,
      event: {},
      total: 0,
      currentPage: 1,
      currentFilter: 'all',

      filtermodal: false,
      status: /* 'Active' */'Any',
      startDate: '',
      endDate: '',
      source_system: '',
      event_id: '',
      description: '',
      severity: '',
      filterTitle: 'All Events',

      users: null,

      updateId: '',
      updateStatus: '',
      updateAction: '',
      commentmodal: false,

      schedulemodal: false,
      schedule: []
    }
    this.toLowerCase1 = this.toLowerCase1.bind(this)
  }

  toLowerCase1(str) {
    return str.toLowerCase();
  }

  componentDidUpdate(prevProps) {
    console.log('-----------------Component Did Updated---------------------');
    if (prevProps.match.params.key !== this.props.match.params.key) {
      // this.getEvents(1, 'all');
      // this.filterTodayActive();
      this.filterAllActive();
    }
    if (((prevProps.events !== this.props.events) || (prevProps.total !== this.props.total)) && this.props.events) {
      const gridColumns = getFullColumns(this);
      console.log('------------Grid Column Generated--------------------')
      // const detailKeys = Object.keys(safelyParseJSONObj(this.props?.events[0]?.details || "{}"));
      const detailKeys = Object.keys(this.props.events[0]?.details || "{}");
      if (detailKeys.length) {
        console.log('Detailed Key');
        gridColumns.splice(4, 1, ...detailKeys.map((key) => ({
          dataField: `details.${key}`,
          text: key.charAt(0).toUpperCase() + key.slice(1),
          sort: false,
          formatter: (cellContent, row) => (
            <>
              {htmlRE.test(row.details[key]) ?
                <span className="text-primary" dangerouslySetInnerHTML={{ __html: row.details[key] }} />
                :
                <>
                  <span id={`UncontrolledTooltip${generalize(row.event_id)}Details${generalize(key)}`}>
                    {shortenString(row.details[key], 25)}
                  </span>
                  <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.event_id)}Details${generalize(key)}`}>
                    {row.details[key]}
                  </UncontrolledTooltip>
                </>
              }
            </>
          ),
        })));
      } else {
        console.log('No Detailed Key')
        gridColumns.splice(4, 1);
      }
      console.log(gridColumns);
      console.log(prevProps.events);
      console.log(this.props.events);
      this.setState({ events: this.props.events, gridColumns, total: this.props.total });
    }
  }

  openEventInJIRA = (event_type, source_system, description) => {
    const jiraObj = {
      summary: `${eventTitles[event_type]} in ${source_system}`,
      description: description,
      pid: process.env.REACT_APP_JIRA_PROJECT_ID,
      issuetype: process.env.REACT_APP_JIRA_ISSUE_TYPE,
    };
    const htmlUrl = `${process.env.REACT_APP_JIRA_BASE_URL}secure/CreateIssueDetails!init.jspa?${convertJSONtoQParams(jiraObj)}`;
    window.open(htmlUrl, '_blank', 'noreferrer');
  }

  flagEvent = (description) => {
    const description_substring = (description.split("<br"))[0];
    const user_id = this.props.userid;
    flagEventReq({ user_id, description_substring })
      .then((res) => {
        alertSuccess("Event Flagged");
      }).catch((err) => {
        this.setState({ error: err.response?.data?.message || 'Could not flag event' });
      });
  }

  componentDidMount() {
    // this.getEvents(1, 'all');
    // this.filterTodayActive();
    this.filterAllActive();
    console.log('-----------------Component Did Mounted---------------------');
    this.getUsers();
  }

  getUsers = () => {
    getUsersReq()
      .then((res) => {
        this.setState({ users: res.users });
      }).catch((err) => {
        alertError(err.response?.data?.message || "Could not fetch required data");
      });
  }

  getEvents = (page, filter = 'all',/* 'today', */ params) => {
    if (!page) {
      page = this.state.currentPage;
    }
    this.props.changePreloader(true);
    const { status, startDate, endDate, source_system, event_id, description, severity } = this.state;
    // this.getEventsAsync(page, filter, params);
    const error = sendMessage('events', {
      actionPack: 'grid',
      gridType: pageTypes[this.props.match.params.key],
      gridPage: page,
      filter,
      query: params || { status, startDate, endDate, source_system, event_id, description, severity },
      user_id: this.props.userid
    });
    this.getEventsAsync(page, filter, params);
    // if (error) {
    //   this.getEventsAsync(page, filter, params);
    // }

    this.setState({ currentPage: page });
  }

  getEventsAsync = (page, filter = 'today', params) => {
    console.log('&&&&&&&&&&&&&&&&&&&&');
    this.props.changePreloader(true);
    const { status, startDate, endDate, source_system, event_id, description, severity } = this.state;
    const promise =
      filter === 'custom' ?
        getMonitoringEventsReq(pageTypes[this.props.match.params.key], page, filter, params || {
          status, startDate, endDate, source_system, event_id, description, severity
        })
        :
        getMonitoringEventsReq(pageTypes[this.props.match.params.key], page, filter)
    promise
      .then((res) => {
        const events = res.events.map((r) => ({
          ...r,
          created_atStr: getCleanedDateTime(r.created_at),
          updated_atStr: getCleanedDateTime(r.updated_at),
          created_at: new Date(r.created_at),
          updated_at: new Date(r.updated_at),
          details: safelyParseJSONObj(r.details),
          badgeclass: r.status === "Active" ? 'danger' : (r.status === "Resolved" ? 'success' : 'warning'),
          checked: false,
          menu: false
        }));
        console.log('^^^^^^^^^^^^', events)
        this.props.saveList({ events, total: res.total });
      }).catch((err) => {
        alertError(err.response?.data?.message || "Could not fetch events");
      }).finally(() => {
        this.props.changePreloader(false);
      });
  }

  // getEvents = (page, filter='today', params) => {
  //   if(!page) {
  //     page = this.state.currentPage;
  //   }
  //   // this.setState({currentPage: page});
  //   this.props.changePreloader(true);
  //   const { status, startDate, endDate, source_system, event_id, description, severity } = this.state;
  // 	const promise =
  //     filter === 'custom' ?
  //       getMonitoringEventsReq(pageTypes[this.props.match.params.key], page, filter, params || {
  //         status, startDate, endDate, source_system, event_id, description, severity
  //       })
  //     :
  //       getMonitoringEventsReq(pageTypes[this.props.match.params.key], page, filter)
  //   promise
  // 	.then( (res) => {
  //     // console.log(res.events, res.total);
  // 		const events = res.events.map( (r) => ({
  // 			...r,
  // 			created_atStr: getCleanedDateTime(r.created_at),
  // 			updated_atStr: getCleanedDateTime(r.updated_at),
  // 			created_at: new Date(r.created_at),
  // 			updated_at: new Date(r.updated_at),
  // 			details: safelyParseJSONObj(r.details),
  //       badgeclass: r.status === "Active" ? 'danger' : (r.status === "Resolved" ? 'success' : 'warning'),
  //       menu: false
  // 		}));
  //     const gridColumns = getFullColumns(this);
  // 		const detailKeys = Object.keys(safelyParseJSONObj(res?.events[0]?.details || "{}"));
  //     if(detailKeys.length) {
  //       gridColumns.splice(4, 1, ...detailKeys.map( (key) => ({
  //         dataField: `details.${key}`,
  //         text: key.charAt(0).toUpperCase() + key.slice(1),
  //         sort: false,
  //         formatter: (cellContent, row) => (
  //           <>
  //           <span id={`UncontrolledTooltip${generalize(row.event_id)}Details${generalize(key)}`}>{shortenString(row.details[key], 25)}</span>
  //           <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.event_id)}Details${generalize(key)}`}>
  //             {row.details[key]}
  //           </UncontrolledTooltip>
  //           </>
  //         ),
  //       })));
  //     } else {
  //       gridColumns.splice(4, 1);
  //     }
  //     // const customPages = (new Array(Math.ceil(res.total/10)).fill({})).map( (v, i) => ({
  //     //   page: i+1,
  //     //   title: `${i+1}`,
  //     //   active: this.state.currentPage === i+1,
  //     //   disabled: false
  //     // }));
  // 		this.setState({events/* : events.filter((e) => e.status === 'Active') */, /* filterTitle: 'All Events', */ /* allEvents: events, */ gridColumns, total: res.total, currentPage: page/* , customPages */});
  // 	}).catch( (err) => {
  // 		alertError(err.response?.data?.message || "Could not fetch events");
  // 	}).finally( () => {
  //     this.props.changePreloader(false);
  // 	});
  // }

  updateEventComment = (comment) => {
    if (!comment) { return; }
    this.updateEvent(this.state.updateStatus, comment);
  }

  updateEvent = (status, comment) => {
    const { selectMulti } = this.state;

    let selectedRows = [];
    if(!selectMulti) {
      selectedRows.push(this.state.updateId);
    }
    else {
      selectedRows = this.state.selectedRows;
    }
    
    updMonitoringEventReq({ selectedRows, status, comment })
      .then((res) => {
        this.getEvents(this.state.currentPage, this.state.currentFilter);
        sendMessage('events', { actionPack: 'event_counts', user_id: this.props.userid });
        this.setState({ updateId: '', updateStatus: '', updateAction: '', comment: '', commentmodal: false, selectMulti: false, selectedRows: [] });
      }).catch((err) => {
        alertError(err.response?.data?.message || "Could not update event status");
      });
  }

  toggleAction = (i) => {
    // const { events } = this.state;
    // events[i].menu = !events[i].menu;
    const events = this.state.events.map((r, idx) => ({
      ...r,
      menu: idx === i ? !r.menu : r.menu
    }));
    this.setState({ events });
  }
  toggleViewModal = (event) => {
    this.setState(prevState => ({
      viewmodal: !prevState.viewmodal, event
    }));
  }
  toggleCommentModal = (updateId = '', updateStatus = '', updateAction = '') => {
    this.setState(prevState => ({
      commentmodal: !prevState.commentmodal, updateId, updateStatus, updateAction
    }));
  }
  toggleCommentAllModal = (updateStatus = '', updateAction = '') => {
    const { selectedRows } = this.state;
    if(selectedRows.length == 0) {
      alertError("Please select rows. Then try again");
      return;
    }
    this.setState(prevState => ({
      commentmodal: !prevState.commentmodal, updateStatus, updateAction, selectMulti: true
    }));
  }
  toggleScheduleModal = (schedule = []) => {
    // if(!schedule) {
    //   this.setState(prevState => ({
    //     schedulemodal: !prevState.schedulemodal
    //   }));
    //   return;
    // }
    this.setState(prevState => ({
      schedulemodal: !prevState.schedulemodal, schedule
    }));
  }
  toggleFilterModal = (values) => {
    if (!values) {
      this.setState(prevState => ({
        filtermodal: !prevState.filtermodal
      }));
      return;
    }
    const { status, startDate, endDate, source_system, event_id, description, severity } = values;
    this.getEvents(this.state.currentPage, 'custom', { status, startDate, endDate, source_system, event_id, description, severity });
    this.setState({ currentPage: 1, currentFilter: 'custom', status, startDate, endDate, source_system, event_id, description, severity, filterTitle: 'Custom Filter', filtermodal: false });
    // let { allEvents:events } = this.state;
    // if(status !== "Any") {
    //   events = events.filter( (f) => f.status === status);
    // }
    // if(startDate) {
    //   const st = new Date(startDate);
    //   events = events.filter( (f) => f.created_at > st);
    // }
    // if(endDate) {
    //   const ed = new Date(endDate);
    //   events = events.filter( (f) => f.created_at < ed);
    // }
    // if(source_system) {
    //   events = events.filter( (f) => f.source_system.toLowerCase().indexOf(source_system.toLowerCase()) > -1);
    // }
    // if(event_id) {
    //   events = events.filter( (f) => f.event_id.toLowerCase().indexOf(event_id.toLowerCase()) > -1);
    // }
    // if(description) {
    //   events = events.filter( (f) => f.description.toLowerCase().indexOf(description.toLowerCase()) > -1);
    // }
    // this.setState({status, startDate, endDate, source_system, event_id, description, filterTitle: 'Custom Filter', filtermodal: false, events: [...events]});
  }
  filterMineActive = () => {
    // let { allEvents:events } = this.state;
    // events = events.filter( (f) => (f.status === 'Active') && (f.user_id === this.props.userid));
    // this.setState({status: 'Active', startDate: '', endDate: '', filterTitle: 'My Events', events: [...events]});
    this.getEvents(1, 'user');
    this.setState({ currentPage: 1, currentFilter: 'user', /* status: 'Active', startDate: '', endDate: '', source_system: '', event_id: '', description: '', severity: 'Any', */ filterTitle: 'My Events' });
  }
  filterTodayActive = () => {
    // let { allEvents:events } = this.state;
    // const td = new Date();
    // events = events.filter( (f) => (f.status === 'Active') && (compareDateWithoutTime(f.created_at, td)));
    // const fieldTd = convertDateToFieldString(td);
    // this.setState({status: 'Active', startDate: fieldTd, endDate: fieldTd, filterTitle: 'Today\'s Events', events: [...events]});
    const td = new Date();
    // const fieldTd = convertDateToFieldString(td);
    this.getEvents(1, 'today');
    this.setState({ currentPage: 1, currentFilter: 'today', /* status: 'Active', startDate: fieldTd, endDate: fieldTd, source_system: '', event_id: '', description: '', severity: 'Any', */ filterTitle: 'Today\'s Events' });
  }
  filterAllActive = () => {
    // let { allEvents:events } = this.state;
    // events = events.filter( (f) => f.status === 'Active');
    // this.setState({status: 'Active', startDate: '', endDate: '', filterTitle: 'All Events', events: [...events]});
    console.log('----------------------Filter Actived-------------------')
    this.getEvents(1, 'all');
    this.setState({ currentPage: 1, currentFilter: 'all', /* status: 'Active', startDate: '', endDate: '', source_system: '', event_id: '', description: '', severity: 'Any', */ filterTitle: 'All Events' });
  }

  // pageButtonRenderer = ({ page, active, disabled, title, onPageChange }) => {
  //   const handleClick = (e) => {
  //     e?.preventDefault && e.preventDefault();
  //     onPageChange(page);
  //     // console.log("Page Handle", page, active, disabled, title, onPageChange);
  //     if(!active) {
  //       this.getEvents(page, this.state.currentFilter);
  //     }
  //   };
  //   // ....
  //   return (
  //     <li className={active ? "page-item active" : "page-item"}>
  //       <a href="#" onClick={ handleClick } className="page-link">{ page }</a>
  //     </li>
  //   );
  // };

  mySelectRow = (paginationProps) => ({
    mode: 'checkbox',
    clickToSelect: true,
    onSelect: (row, isSelect, rowIndex, e) => {
      if (isSelect) {
        this.setState(() => ({
          selectedRows: [...this.state.selectedRows, row.event_id]
        }));
      } else {
        this.setState(() => ({
          selectedRows: this.state.selectedRows.filter(x => x !== row.event_id)
        }));
      }
    },
    onSelectAll: (isSelect, rows) => {
      const { page, sizePerPage } = paginationProps;

      const startIdx = (page - 1) * sizePerPage;
      const endIdx = startIdx + sizePerPage;
      const currentPageRows = rows.slice(startIdx, endIdx).map(r => r.event_id);
      
      if (isSelect) {
        this.setState((prevState) => ({
          selectedRows: [...new Set([...prevState.selectedRows, ...currentPageRows])]
        }));
      } else {
        this.setState((prevState) => ({
          selectedRows: prevState.selectedRows.filter(id => !currentPageRows.includes(id))
        }));
      }
    }
  });

  // deleteSelectedRows = () => {
  //   const { selectedRows, events } = this.state;
  //   const updatedEvents = events.filter(event => !selectedRows.includes(event.event_id));
    
  //   this.setState({
  //     events: updatedEvents,
  //     selectedRows: []
  //   });
  // };

  pageListRenderer = ({ pages, onPageChange }) => {
    // just exclude <, <<, >>, >
    // const pageWithoutIndication = pages.filter(p => typeof p.page !== 'string');
    // const customPages = (new Array(Math.ceil(this.state.total/10)).fill({})).map( (v, i) => ({
    //   page: i+1,
    //   title: `${i+1}`,
    //   active: this.state.currentPage === i+1,
    //   disabled: false
    // }));
    const lastPage = Math.ceil(this.state.total / 10);
    const pagesArr = getPagesArray(this.state.currentPage, lastPage)
    const customPages = pagesArr.map((v, i) => ({
      page: v,
      title: `${v}`,
      active: this.state.currentPage === v,
      disabled: false,
      last: false, first: false
    }));
    if (pagesArr.indexOf(lastPage) === -1) {
      customPages.push({
        page: lastPage,
        title: `${lastPage}`,
        active: false,
        disabled: false,
        last: true, first: false
      });
    }
    if (pagesArr.indexOf(1) === -1) {
      customPages.unshift({
        page: 1,
        title: `1`,
        active: false,
        disabled: false,
        last: false, first: true
      });
    }
    return (
      <div className="pagination pagination-rounded justify-content-end">
        <ul className="pagination react-bootstrap-table-page-btns-ul">
          {customPages.map(p => (
            <React.Fragment key={`BO${p.page}OM`}>
              {/* <button className="btn btn-success" onClick={ () => onPageChange(p.page) }>{ p.page }</button> */}
              {p.last &&
                <li className="page-item">
                  <a href="#" onClick={(e) => { e.preventDefault() }} className="page-link">{"..."}</a>
                </li>
              }
              <li className={p.active ? "page-item active" : "page-item"}>
                <a href="#" onClick={() => { onPageChange(p.page); !p.active && this.getEvents(p.page, this.state.currentFilter) }} className="page-link">{p.page}</a>
              </li>
              {p.first &&
                <li className="page-item">
                  <a href="#" onClick={(e) => { e.preventDefault() }} className="page-link">{"..."}</a>
                </li>
              }
            </React.Fragment>
          ))}
        </ul>
      </div>
    );
  };

  openFunctionSchedule = () => {
    const { key } = this.props.match.params;
    const type = pageTypes[key]; // Use same for queries
    this.props.changePreloader(true);
    getFunctionsByFilterReq()
      .then(async (res) => {
        // console.log("Filter Functions", res);
        // alertSuccess(res.message || "Found functions");
        const functionNames = (await getEventFunctionNamesReq(type)).functions.map((fnc) => fnc.function_name);
        if (!functionNames || !functionNames.length) {
          alertError("Event does not have corresponding functions");
          return;
        }
        const functions = [];
        for (let i = 0; i <= functionNames.length; ++i) {
          if (i === functionNames.length) {
            this.props.changePreloader(false);
            this.toggleScheduleModal(functions);
          } else {
            // console.log("FILTERED FUNC:", res.functions.filter( (func) => func.functionName.indexOf(functionNames[i]) > -1));
            const func = (res.functions.filter((func) => func.functionName.indexOf(functionNames[i]) > -1))[0];
            const schedule = (await getFunctionSchedulesReq(func.functionArn)).scheduler[0];
            functions.push({
              function: func.functionName,
              arn: func.functionArn,
              schedule: schedule.scheduleExpression,
              schedName: schedule.name
            });
          }
        }
      }).catch((err) => {
        this.props.changePreloader(false);
        alertError(err.response?.data?.message || "Could not fetch function schedules");
      });
  }

  render() {
    const { events, event, status, startDate, endDate, source_system, event_id, description, severity, filterTitle, currentFilter, schedule/* , total, currentPage */ } = this.state;
    const { key } = this.props.match.params;
    document.title = pageTitles[key];
    // console.log("EVENTS: ", events);
    // console.log("GRID COLUMNS: ", this.state.gridColumns);
    return (
      <React.Fragment>
        <GridDetailsModal
          isOpen={this.state.viewmodal}
          toggle={() => { this.toggleViewModal({}) }}
          event={event}
          users={this.state.users}
          refresh={this.getEvents}
        />
        <GridFilterModal
          isOpen={this.state.filtermodal}
          toggle={this.toggleFilterModal}
          filter={{ status, startDate, endDate, source_system, event_id, description, severity }}
        />
        <GridScheduleModal
          isOpen={this.state.schedulemodal}
          toggle={this.toggleScheduleModal}
          schedule={schedule}
        />
        <Modal
          isOpen={this.state.commentmodal}
          role="dialog"
          autoFocus={true}
          centered={true}
          className="exampleModal"
          tabIndex="-1"
          toggle={this.toggleCommentModal}
        >
          <ModalHeader toggle={this.toggleCommentModal}>Enter comment to {this.state.updateAction} event</ModalHeader>
          <ModalBody style={{ maxHeight: '75vh', overflow: 'scroll' }} className="p-2">
            <Formik
              enableReinitialize={true}
              initialValues={{
                commment: ""
              }}
              validationSchema={Yup.object().shape({
                comment: Yup.string()
                  .required(
                    "Please Enter Your Comments"
                  ),
              })}
              onSubmit={values => {
                this.updateEventComment(values.comment);
              }}
            >
              {({ errors, formStatus, touched }) => (
                <Form className="form-horizontal">
                  {this.state.error && this.state.error ? (
                    <Alert color="danger">
                      {this.state.error}
                    </Alert>
                  ) : null}

                  <div className="mb-3">
                    <Label for="comment" className="form-label">
                      Comments
                    </Label>
                    <Field
                      component="textarea"
                      name="comment"
                      placeholder="Enter comments"
                      type="text"
                      className={
                        "form-control" +
                        (errors.comment && touched.comment
                          ? " is-invalid"
                          : "")
                      }
                    />
                    <ErrorMessage
                      name="comment"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>

                  <div className="mt-3 d-flex justify-content-end">
                    <button
                      className="btn btn-primary btn-block"
                      type="submit"
                    >
                      {" "}
                      Save{" "}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </ModalBody>
        </Modal>
        <Row className="mb-2" style={{ marginTop: '5rem', marginRight: '0.4rem' }}>
          <Col sm="12">
            <div className="text-sm-end d-none d-sm-block">
              <Button
                color="primary"
                className={`fs-filter btn-block btn btn-filter btn-primary mr-1 ${currentFilter === 'all' ? 'selected-filter-button' : ''}`}
                onClick={() => {/* currentFilter !== 'all' && */ this.filterAllActive() }}
              >
                {/* <i className="mdi mdi-filter mr-1" /> */}
                All Events
              </Button>
              <Button
                color="primary"
                // className="fs-filter btn-block btn btn-primary mr-1"
                className={`fs-filter btn-block btn btn-filter btn-primary mr-1 ${currentFilter === 'today' ? 'selected-filter-button' : ''}`}
                onClick={() => {/* currentFilter !== 'today' && */ this.filterTodayActive() }}
              >
                {/* <i className="mdi mdi-filter mr-1" /> */}
                Today&apos;s Events
              </Button>
              <Button
                color="primary"
                className={`fs-filter btn-block btn btn-filter btn-primary mr-1 ${currentFilter === 'user' ? 'selected-filter-button' : ''}`}
                onClick={() => {/* currentFilter !== 'user' && */ this.filterMineActive() }}
              >
                {/* <i className="mdi mdi-filter mr-1" /> */}
                My Events
              </Button>
              <Button
                color="primary"
                className={`fs-filter btn-block btn btn-filter btn-primary ${currentFilter === 'custom' ? 'selected-filter-button' : ''}`}
                onClick={() => { this.toggleFilterModal() }}
              >
                <i className="mdi mdi-filter" />
                Filter Event
              </Button>
            </div>
            <div className="d-sm-none d-flex flex-column justify-content-between align-items-end">
              <a href="#" onClick={() => {/* currentFilter !== 'today' && */ this.filterTodayActive() }} className={`filter-link ${currentFilter === 'today' ? 'selected' : ''}`}>Today&apos;s Events</a>
              <a href="#" onClick={() => {/* currentFilter !== 'user' && */ this.filterMineActive() }} className={`filter-link ${currentFilter === 'user' ? 'selected' : ''}`}>My Events</a>
              <a href="#" onClick={() => {/* currentFilter !== 'all' && */ this.filterAllActive() }} className={`filter-link ${currentFilter === 'all' ? 'selected' : ''}`}>All Events</a>
              <a href="#" onClick={() => { this.toggleFilterModal() }} className={`filter-link ${currentFilter === 'custom' ? 'selected' : ''}`}>Filter Event</a>
            </div>
          </Col>
        </Row>
        <Card>
          <CardBody>
            <div className="d-sm-flex flex-wrap" style={{ justifyContent: 'space-between' }}>
              <CardTitle className="card-title mb-4 h4">
                {pageTitles[key]} - {filterTitle}
              </CardTitle>
              <div>
                <i id="grid-ignore-btn" className="mdi mdi-close-circle cursor-pointer mr-2" style={{ fontSize: 20 }} onClick={() => { this.toggleCommentAllModal('Ignored', 'ignore') }} />
                <UncontrolledTooltip placement="auto" target="grid-ignore-btn">
                  Ignore Event
                </UncontrolledTooltip>

                <i id="grid-resolve-btn" className="mdi mdi-check-circle cursor-pointer mr-2" style={{ fontSize: 20 }} onClick={() => { this.toggleCommentAllModal('Resolved', 'resolve') }} />
                <UncontrolledTooltip placement="auto" target="grid-resolve-btn">
                  Resolve Event
                </UncontrolledTooltip>
                
                <i id="grid-queries-btn" className="mdi mdi-text-box-multiple cursor-pointer mr-2" style={{ fontSize: 20 }} onClick={() => { this.props.history.push(`/queries/${key}`) }} />
                <UncontrolledTooltip placement="auto" target="grid-queries-btn">
                  Event Queries
                </UncontrolledTooltip>
                <i id="grid-schedule-btn" className="mdi mdi-file-document cursor-pointer mr-2" style={{ fontSize: 20 }} onClick={() => { this.openFunctionSchedule() }} />
                <UncontrolledTooltip placement="auto" target="grid-schedule-btn">
                  Get Event Schedule
                </UncontrolledTooltip>
                <i id="grid-refresh-btn" className="mdi mdi-refresh cursor-pointer" style={{ fontSize: 20 }} onClick={() => { this.getEvents(this.state.currentPage, this.state.currentFilter) }} />
                <UncontrolledTooltip placement="auto" target="grid-refresh-btn">
                  Refresh Events
                </UncontrolledTooltip>
              </div>
            </div>
            {Array.isArray(events) && events.length > 0 && events[0].event_id &&
              <PaginationProvider
                pagination={paginationFactory({ // pagination customization
                  sizePerPage: 10,
                  // totalSize: total, // events.length,
                  // page: currentPage,
                  hideSizePerPage: true,
                  // custom: true,
                  hidePageListOnlyOnePage: false,
                  showTotal: false,
                  // paginationTotalRenderer: () => null,
                  // pageButtonRenderer: this.pageButtonRenderer
                  pageListRenderer: this.pageListRenderer,
                  // onPageChange: (page) => this.getEvents(page, this.state.currentFilter)
                })}
                keyField='event_id'
                columns={this.state.gridColumns}
                data={events}
              >
                {({ paginationProps, paginationTableProps }) => (
                  <ToolkitProvider
                    keyField="event_id"
                    data={events}
                    columns={this.state.gridColumns}
                    bootstrap4
                    search
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
                            selectRow={this.mySelectRow(paginationProps)}
                            classes={
                              "table align-middle table-nowrap table-check"
                            }
                            headerWrapperClasses={"table-light"}
                          />
                        </div>
                        <div className="pagination pagination-rounded justify-content-end">
                          {/* <PaginationListStandalone
                            {...paginationProps}
                          /> */}
                          {/* <PaginationTotalStandalone
                            {...paginationProps}
                          /> */}
                        </div>
                      </React.Fragment>
                    )}
                  </ToolkitProvider>
                )}
              </PaginationProvider>
            }
          </CardBody>
        </Card>
      </React.Fragment>
    )
  }
}

Grid.propTypes = {
  userid: PropTypes.string,
  usertype: PropTypes.string,
  changePreloader: PropTypes.func,
  saveList: PropTypes.func,
};

const mapStateToProps = (state) => ({
  userid: state.session.userid,
  usertype: state.session.type,
  events: state.lists.events,
  total: state.lists.total,
});

export default withRouter(connect(mapStateToProps, { saveList, changePreloader })(Grid));