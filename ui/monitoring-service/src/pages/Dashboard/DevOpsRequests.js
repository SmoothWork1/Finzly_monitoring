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
import { approveDevOpsRequestReq, completeDevOpsRequestReq, getDevOpsRequestsReq, rejectDevOpsRequestReq, rmDevOpsRequestReq } from "config/httpRoutes";
import { alertError } from "config/toast";
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { generalize, getCleanedDateTime, shortenString } from 'config/helpers';
import DevOpsRequestModal from './DevOpsRequestModal';

const getFullColumns = (page) => [
  {
    dataField: "id",
    text: "ID",
    sort: true,
    formatter: (cellContent, row) => (
      <>
      <Link to="#" id={`UncontrolledTooltip${row.id}RequestID`} className="text-body fw-bold" onClick={() => {page.toggleViewModal(row)}}>
        {row.id}
      </Link>
      <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.id}RequestID`}>
        {row.id}
      </UncontrolledTooltip>
      </>
    ),
  },
  {
    dataField: "requester.first_name",
    text: "Requester",
    sort: false,
    formatter: (cellContent, row) => (
      <>
      <span id={`UncontrolledTooltip${row.id}Requester`}>{shortenString(`${row.requester.first_name} ${row.requester.last_name}`, 25)}</span>
      <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.id}Requester`}>
        {`${row.requester.first_name} ${row.requester.last_name}`}
      </UncontrolledTooltip>
      </>
    ),
  },
  {
		dataField: "command",
		text: "Command",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}RequestCommand`}>{shortenString(row.command, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}RequestCommand`}>
				{row.command}
			</UncontrolledTooltip>
			</>
		),
	},
  {
		dataField: "execution_dateStr",
		text: "Execution Date",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}RequestExecDate`}>{shortenString(row.execution_dateStr, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}RequestExecDate`}>
				{row.execution_dateStr}
			</UncontrolledTooltip>
			</>
		),
	},
  {
		dataField: "creation_dateStr",
		text: "Creation Date",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}RequestCreationDate`}>{shortenString(row.creation_dateStr, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}RequestCreationDate`}>
				{row.creation_dateStr}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "status",
		text: "Status",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}RequestStatus`}>{shortenString(row.status, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}RequestStatus`}>
				{row.status}
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
        row.status === 'Rejected' || row.status === 'Processed' ?
          <></>
        :
          <Dropdown
            isOpen={row.menu}
            toggle={() => {page.toggleAction(i)}}
            className="dropdown d-inline-block"
            tag="li"
          >
            <DropdownToggle
              className="btn header-item noti-icon position-relative"
              tag="button"
              id={`rqst-table-${row.id}`}
            >
              {/* <i className="bx bx-dots-vertical" /> */}
              <i className="bx bx-dots-horizontal-rounded color-primary" />
            </DropdownToggle>

            <DropdownMenu className="dropdown-menu-end">
              {row.status === 'In Review' ?
                <DropdownItem
                  className={`notify-item align-middle`}
                  onClick={() => {page.toggleViewModal(row)}}
                >
                  <span className="text-success">Update</span>
                </DropdownItem>
              :
                <></>
              }
              {(page.props.devops_type === 'Approver' || page.props.devops_type === 'Admin') ?
                row.status === 'In Review' ?
                  <>
                    <DropdownItem
                      className={`notify-item align-middle`}
                      onClick={() => {page.approveDevOpsRequest(row.id)}}
                    >
                      <span className="text-info">Approve</span>
                    </DropdownItem>
                    <DropdownItem
                      className={`notify-item align-middle`}
                      onClick={() => {page.rejectDevOpsRequest(row.id)}}
                    >
                      <span className="text-danger">Reject</span>
                    </DropdownItem>
                  </>
                : row.status === 'Approved' ?
                  <>
                  <DropdownItem
                    className={`notify-item align-middle`}
                    onClick={() => {page.completeDevOpsRequest(row.id)}}
                  >
                    <span className="text-success">Complete</span>
                  </DropdownItem>
                  </>
                :
                  <></>
              :
                <></>
              }
              {row.status === 'In Review' ?
                <DropdownItem
                  className={`notify-item align-middle`}
                  onClick={() => {page.removeDevOpsRequest(row.id)}}
                >
                  <span className="text-danger">Delete</span>
                </DropdownItem>
              :
                <></>
              }
            </DropdownMenu>
          </Dropdown>
    );},
  }
];

class DevOpsRequests extends Component {
	constructor(props) {
		super(props)
		this.state = {
			requests: [],
			gridColumns: getFullColumns(this),
			viewmodal: false,
			request: {},
		}
		this.toLowerCase1 = this.toLowerCase1.bind(this);
	}

	toLowerCase1(str) {
		return str.toLowerCase();
	}

	componentDidMount() {
		this.getDevOpsRequests();
	}

  getDevOpsRequests = () => {
    this.props.changePreloader(true);
		getDevOpsRequestsReq()
		.then( (res) => {
			const requests = res.requests.map( (r) => ({
				...r,
				menu: false,
        creation_dateStr: getCleanedDateTime(r.creation_date),
        creation_date: new Date(r.creation_date),
        execution_dateStr: getCleanedDateTime(r.execution_date),
        execution_date: new Date(r.execution_date),
			}));
			this.setState({requests, viewmodal: false, request: {}});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch devops requests");
		}).finally( () => {
			this.props.changePreloader(false);
		});
  }

  removeDevOpsRequest = (requestId) => {
		rmDevOpsRequestReq(requestId)
		.then( (res) => {
			this.getDevOpsRequests();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove devops request");
		}).finally( () => {
			this.setState({fetchLoading: false});
		});
  }

  rejectDevOpsRequest = (requestId) => {
		rejectDevOpsRequestReq(requestId)
		.then( (res) => {
			this.getDevOpsRequests();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not reject devops request");
		}).finally( () => {
			this.setState({fetchLoading: false});
		});
  }
  approveDevOpsRequest = (requestId) => {
		approveDevOpsRequestReq(requestId)
		.then( (res) => {
			this.getDevOpsRequests();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not approve devops request");
		}).finally( () => {
			this.setState({fetchLoading: false});
		});
  }
  completeDevOpsRequest = (requestId) => {
		completeDevOpsRequestReq(requestId)
		.then( (res) => {
			this.getDevOpsRequests();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not complete devops request");
		}).finally( () => {
			this.setState({fetchLoading: false});
		});
  }

  toggleAction = (i) => {
    const requests = this.state.requests.map( (r, idx) => ({
      ...r,
      menu: idx === i ? !r.menu : r.menu
    }));
    this.setState({requests});
  }
  toggleViewModal = (request) => {
    this.setState(prevState => ({
      viewmodal: !prevState.viewmodal, request
    }));
  }

  render() {
    const { requests, request } = this.state;
    document.title = 'Request Manager';
    return (
      <React.Fragment>
        <DevOpsRequestModal
          isOpen={this.state.viewmodal}
          toggle={() => {this.toggleViewModal({})}}
          request={request}
          refresh={this.getDevOpsRequests}
        />
        <Row className="mb-2" style={{marginTop: '5rem', marginRight: '0.4rem'}}>
          {this.props.devops_type === 'User' &&
            <Col sm="12">
              <div className="text-sm-end">
                <Button
                  color="primary"
                  className="font-16 btn-block btn btn-primary mr-1"
                  onClick={() => {this.toggleViewModal({})}}
                >
                  Add DevOps Request
                </Button>
              </div>
            </Col>
          }
        </Row>
        <Card>
          <CardBody>
            <div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
								<CardTitle className="card-title mb-4 h4">
                  Request Manager
								</CardTitle>
                <div>
                  <i id="requests-refresh-btn" className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={this.getDevOpsRequests} />
                  <UncontrolledTooltip placement="auto" target="requests-refresh-btn">
                    Refresh Requests
                  </UncontrolledTooltip>
                </div>
							</div>
            <PaginationProvider
              pagination={paginationFactory({ // pagination customization
                sizePerPage: 10,
                totalSize: requests.length, // replace later with size(Order),
                custom: true,
              })}
              keyField='id'
              columns={this.state.gridColumns}
              data={requests}
            >
              {({ paginationProps, paginationTableProps }) => (
                <ToolkitProvider
                  keyField="id"
                  data={requests}
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

DevOpsRequests.propTypes = {
  changePreloader: PropTypes.func,
  devops_type: PropTypes.string,
};

const mapStateToProps = (state) => ({
  devops_type: state.session.devops_type,
});

export default withRouter(connect(mapStateToProps, { changePreloader })(DevOpsRequests));