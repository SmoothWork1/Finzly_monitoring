import PropTypes from 'prop-types';
import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import BootstrapTable from "react-bootstrap-table-next"
import paginationFactory, {
  PaginationProvider,
  PaginationListStandalone,
} from "react-bootstrap-table2-paginator"
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';

import { Link } from "react-router-dom"

import { Card, CardBody, UncontrolledTooltip, CardTitle, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Row, Col, Button } from "reactstrap"
import { eventTitles } from "config/globals"
import { getEventSubscriptionsReq, unsubscribeEventReq } from "config/httpRoutes";
import { alertError } from "config/toast";
import { connect } from 'react-redux';
import SubscriptionDetailsModal from './SubscriptionDetailsModal';
import { changePreloader } from 'store/actions';
import { shortenString } from 'config/helpers';

const getFullColumns = (page) => /* page.props.usertype === 'Support' ? */ [
  {
    dataField: "subscription_id",
    text: "Subscription ID",
    sort: true,
    formatter: (cellContent, row) => (
      <>
      <Link to="#" id={`UncontrolledTooltip${row.subscription_id}SubscriptionId`} className="text-body fw-bold" onClick={() => {page.toggleViewModal(row)}}>
        {row.subscription_id}
      </Link>
      <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.subscription_id}SubscriptionId`}>
        {row.subscription_id}
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
        <span id={`UncontrolledTooltip${row.subscription_id}EventType`}>{shortenString(type, 25)}</span>
        <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.subscription_id}EventType`}>
          {type}
        </UncontrolledTooltip>
        </>
      );
    },
  },
  {
    dataField: "tenant_name",
    text: "Tenant Name",
    sort: false,
    formatter: (cellContent, row) => (
      <>
      <span id={`UncontrolledTooltip${row.subscription_id}Tenant`}>{shortenString(row.tenant_name, 25)}</span>
      <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.subscription_id}Tenant`}>
        {row.tenant_name}
      </UncontrolledTooltip>
      </>
    ),
  },
  {
    dataField: "delivery_method",
    text: "Delivery Method",
    sort: false,
    formatter: (cellContent, row) => (
      <>
      <span id={`UncontrolledTooltip${row.subscription_id}`}>{shortenString(row.delivery_method, 25)}</span>
      <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.subscription_id}`}>
        {row.delivery_method}
      </UncontrolledTooltip>
      </>
    ),
  },
  {
    dataField: "deliver_to",
    text: "Deliver To",
    sort: false,
    formatter: (cellContent, row) => (
      <>
      <span id={`UncontrolledTooltip${row.subscription_id}`}>{shortenString(row.deliver_to, 25)}</span>
      <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.subscription_id}`}>
        {row.deliver_to}
      </UncontrolledTooltip>
      </>
    ),
  },
  {
    dataField: "view",
    isDummyField: true,
    text: "Actions",
    sort: false,
    formatter: (cellContent, row, i) => {
      return (
      <Dropdown
          isOpen={row.menu}
          toggle={() => {page.toggleAction(i)}}
          className="dropdown d-inline-block"
          tag="li"
        >
          <DropdownToggle
            className="btn header-item noti-icon position-relative"
            tag="button"
            id={`grid-table-${row.subscription_id}`}
          >
            {/* <i className="bx bx-dots-vertical" /> */}
            <i className="bx bx-dots-horizontal-rounded color-primary" />
          </DropdownToggle>

          <DropdownMenu className="dropdown-menu-end">
            <DropdownItem
              className={`notify-item align-middle`}
              onClick={() => {page.toggleViewModal(row)}}
            >
              <span className="text-success">Update</span>
            </DropdownItem>
            <DropdownItem
              className={`notify-item align-middle`}
              onClick={() => {page.unsubscribeEvent(row.subscription_id)}}
            >
              <span className="text-danger">Delete</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
    );},
  }
]
// ] : page.props.usertype === 'Non-Support' ? [
//   {
//     dataField: "subscription_id",
//     text: "Subscription ID",
//     sort: true,
//     formatter: (cellContent, row) => (
//       <>
//       <Link to="#" id={`UncontrolledTooltip${row.subscription_id}SubscriptionId`} className="text-body fw-bold" onClick={() => {page.toggleViewModal(row)}}>
//         {row.subscription_id}
//       </Link>
//       <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.subscription_id}SubscriptionId`}>
//         {row.subscription_id}
//       </UncontrolledTooltip>
//       </>
//     ),
//   },
//   {
//     dataField: "event_type",
//     text: "Event Type",
//     sort: false,
//     formatter: (cellContent, row) => {
//       const type = eventTitles[row.event_type];
//       return (
//         <>
//         <span id={`UncontrolledTooltip${row.subscription_id}EventType`}>{shortenString(type, 25)}</span>
//         <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.subscription_id}EventType`}>
//           {type}
//         </UncontrolledTooltip>
//         </>
//       );
//     },
//   },
//   {
//     dataField: "delivery_method",
//     text: "Delivery Method",
//     sort: false,
//     formatter: (cellContent, row) => (
//       <>
//       <span id={`UncontrolledTooltip${row.subscription_id}`}>{shortenString(row.delivery_method, 25)}</span>
//       <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.subscription_id}`}>
//         {row.delivery_method}
//       </UncontrolledTooltip>
//       </>
//     ),
//   },
//   {
//     dataField: "deliver_to",
//     text: "Deliver To",
//     sort: false,
//     formatter: (cellContent, row) => (
//       <>
//       <span id={`UncontrolledTooltip${row.subscription_id}`}>{shortenString(row.deliver_to, 25)}</span>
//       <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.subscription_id}`}>
//         {row.deliver_to}
//       </UncontrolledTooltip>
//       </>
//     ),
//   }
// ] : [];

class Subscriptions extends Component {
	constructor(props) {
		super(props)
		this.state = {
			subscriptions: [],
			gridColumns: getFullColumns(this),
			viewmodal: false,
			subscription: {},
		}
		this.toLowerCase1 = this.toLowerCase1.bind(this);
	}

	toLowerCase1(str) {
		return str.toLowerCase();
	}

	componentDidMount() {
		this.getSubscriptions();
	}

  getSubscriptions = () => {
    this.props.changePreloader(true);
		getEventSubscriptionsReq()
		.then( (res) => {
			const subscriptions = res.subscriptions.map( (r) => ({
				...r,
				menu: false
			}));
			this.setState({subscriptions});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch event subscriptions");
		}).finally( () => {
			this.props.changePreloader(false);
		});
  }

  unsubscribeEvent = (subscriptionId) => {
		unsubscribeEventReq(subscriptionId)
		.then( (res) => {
			this.getSubscriptions();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not unsubscribe from events");
		}).finally( () => {
			this.setState({fetchLoading: false});
		});
  }

  toggleAction = (i) => {
    const subscriptions = this.state.subscriptions.map( (r, idx) => ({
      ...r,
      menu: idx === i ? !r.menu : r.menu
    }));
    this.setState({subscriptions});
  }
  toggleViewModal = (subscription) => {
    this.setState(prevState => ({
      viewmodal: !prevState.viewmodal, subscription
    }))
  }

  render() {
    const { subscriptions, subscription } = this.state;
    document.title = "Event Subscriptions";
    return (
      <React.Fragment>
        <SubscriptionDetailsModal
          isOpen={this.state.viewmodal}
          toggle={() => {this.toggleViewModal({})}}
          subscription={subscription}
          refresh={this.getSubscriptions}
        />
        <Row className="mb-2" style={{marginTop: '5rem', marginRight: '0.4rem'}}>
          {/* {this.props.usertype === 'Support' && */}
            <Col sm="12">
              <div className="text-sm-end">
                <Button
                  color="primary"
                  className="font-16 btn-block btn btn-primary mr-1"
                  onClick={() => {this.toggleViewModal({})}}
                >
                  Add Subscription
                </Button>
              </div>
            </Col>
          {/* } */}
        </Row>
        <Card>
          <CardBody>
            <div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
								<CardTitle className="card-title mb-4 h4">
                  My Event Subscriptions
								</CardTitle>
								<i className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={this.getSubscriptions} />
							</div>
            <PaginationProvider
              pagination={paginationFactory({ // pagination customization
                sizePerPage: 10,
                totalSize: subscriptions.length, // replace later with size(Order),
                custom: true,
              })}
              keyField='subscription_id'
              columns={this.state.gridColumns}
              data={subscriptions}
            >
              {({ paginationProps, paginationTableProps }) => (
                <ToolkitProvider
                  keyField="id"
                  data={subscriptions}
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
                          // defaultSorted={[{ dataField: 'created_at', order: 'desc' }]}
                          bordered={false}
                          striped={false}
                          // selectRow={{ mode: 'checkbox' }}
                          classes={
                            "table align-middle table-nowrap table-check"
                          }
                          headerWrapperClasses={"table-light"}
                        />
                      </div>
                      <div className="pagination pagination-rounded justify-content-end">
                        <PaginationListStandalone
                          {...paginationProps}
                        />
                      </div>
                    </React.Fragment>
                  )}
                </ToolkitProvider>
              )}
            </PaginationProvider>
          </CardBody>
        </Card>
      </React.Fragment>
    )
  }
}

Subscriptions.propTypes = {
  userid: PropTypes.string,
  usertype: PropTypes.string,
  changePreloader: PropTypes.func
};

const mapStateToProps = (state) => ({
  userid: state.session.userid,
  usertype: state.session.type,
});

export default withRouter(connect(mapStateToProps, { changePreloader })(Subscriptions));