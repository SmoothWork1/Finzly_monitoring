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
import { getFlaggedEventsReq, unflagEventReq } from "config/httpRoutes";
import { alertError } from "config/toast";
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { shortenString } from 'config/helpers';
import FlaggedDetailsModal from './FlaggedDetailsModal';

const getFullColumns = (page) => page.props.usertype === 'Support' ? [
  {
    dataField: "flagged_id",
    text: "Flagged ID",
    sort: true,
    formatter: (cellContent, row) => (
      <>
      <Link to="#" id={`UncontrolledTooltip${row.subscription_id}FlaggedId`} className="text-body fw-bold" onClick={() => {page.toggleViewModal(row)}}>
        {row.flagged_id}
      </Link>
      <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.subscription_id}FlaggedId`}>
        {row.flagged_id}
      </UncontrolledTooltip>
      </>
    ),
  },
  {
    dataField: "description_substring",
    text: "Description Substring",
    sort: false,
    formatter: (cellContent, row) => {
      return (
        <>
        <span id={`UncontrolledTooltip${row.flagged_id}DescriptionSubstring`}>{shortenString(row.description_substring, 25)}</span>
        <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.flagged_id}DescriptionSubstring`}>
          {row.description_substring}
        </UncontrolledTooltip>
        </>
      );
    },
  },
  {
    dataField: "created_by",
    text: "Created By",
    sort: false,
    formatter: (cellContent, row) => {
      return (
        <>
        <span id={`UncontrolledTooltip${row.flagged_id}CreatedBy`}>{shortenString(row.created_by, 25)}</span>
        <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.flagged_id}CreatedBy`}>
          {row.created_by}
        </UncontrolledTooltip>
        </>
      );
    },
  },
  {
    dataField: "last_updated_by",
    text: "Last Updated By",
    sort: false,
    formatter: (cellContent, row) => {
      return (
        <>
        <span id={`UncontrolledTooltip${row.flagged_id}LastUpdatedBy`}>{shortenString(row.last_updated_by, 25)}</span>
        <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.flagged_id}LastUpdatedBy`}>
          {row.last_updated_by}
        </UncontrolledTooltip>
        </>
      );
    },
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
            id={`grid-table-${row.flagged_id}`}
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
              onClick={() => {page.unflagEvent(row.flagged_id)}}
            >
              <span className="text-danger">Delete</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
    );},
  }
] : page.props.usertype === 'Non-Support' ? [
  {
    dataField: "flagged_id",
    text: "Flagged ID",
    sort: true,
    formatter: (cellContent, row) => (
      <>
      <Link to="#" id={`UncontrolledTooltip${row.subscription_id}FlaggedId`} className="text-body fw-bold" onClick={() => {page.toggleViewModal(row)}}>
        {row.flagged_id}
      </Link>
      <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.subscription_id}FlaggedId`}>
        {row.flagged_id}
      </UncontrolledTooltip>
      </>
    ),
  },
  {
    dataField: "description_substring",
    text: "Description Substring",
    sort: false,
    formatter: (cellContent, row) => {
      return (
        <>
        <span id={`UncontrolledTooltip${row.flagged_id}DescriptionSubstring`}>{shortenString(row.description_substring, 25)}</span>
        <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.flagged_id}DescriptionSubstring`}>
          {row.description_substring}
        </UncontrolledTooltip>
        </>
      );
    },
  },
  {
    dataField: "created_by",
    text: "Created By",
    sort: false,
    formatter: (cellContent, row) => {
      return (
        <>
        <span id={`UncontrolledTooltip${row.flagged_id}CreatedBy`}>{shortenString(row.created_by, 25)}</span>
        <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.flagged_id}CreatedBy`}>
          {row.created_by}
        </UncontrolledTooltip>
        </>
      );
    },
  },
  {
    dataField: "last_updated_by",
    text: "Last Updated By",
    sort: false,
    formatter: (cellContent, row) => {
      return (
        <>
        <span id={`UncontrolledTooltip${row.flagged_id}LastUpdatedBy`}>{shortenString(row.last_updated_by, 25)}</span>
        <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.flagged_id}LastUpdatedBy`}>
          {row.last_updated_by}
        </UncontrolledTooltip>
        </>
      );
    },
  }
] : [];

class EventFlags extends Component {
	constructor(props) {
		super(props)
		this.state = {
			flags: [],
			gridColumns: getFullColumns(this),
			viewmodal: false,
			flagged: {},
		}
		this.toLowerCase1 = this.toLowerCase1.bind(this);
	}

	toLowerCase1(str) {
		return str.toLowerCase();
	}

	componentDidMount() {
		this.getFlaggedEvents();
	}

  getFlaggedEvents = () => {
    this.props.changePreloader(true);
		getFlaggedEventsReq()
		.then( (res) => {
			const flags = res.flags.map( (r) => ({
				...r,
				menu: false
			}));
			this.setState({flags});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch flagged events");
		}).finally( () => {
			this.props.changePreloader(false);
		});
  }

  unflagEvent = (flaggedId) => {
		unflagEventReq(flaggedId)
		.then( (res) => {
			this.getFlaggedEvents();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not unflag event");
		}).finally( () => {
			this.setState({fetchLoading: false});
		});
  }

  toggleAction = (i) => {
    const flags = this.state.flags.map( (r, idx) => ({
      ...r,
      menu: idx === i ? !r.menu : r.menu
    }));
    this.setState({flags});
  }
  toggleViewModal = (flagged) => {
    this.setState(prevState => ({
      viewmodal: !prevState.viewmodal, flagged
    }))
  }

  render() {
    const { flags, flagged } = this.state;
    document.title = "Event Flags";
    return (
      <React.Fragment>
        <FlaggedDetailsModal
          isOpen={this.state.viewmodal}
          toggle={() => {this.toggleViewModal({})}}
          flagged={flagged}
          refresh={this.getFlaggedEvents}
        />
        <Row className="mb-2" style={{marginTop: '5rem', marginRight: '0.4rem'}}>
          {this.props.usertype === 'Support' &&
            <Col sm="12">
              <div className="text-sm-end">
                <Button
                  color="primary"
                  className="font-16 btn-block btn btn-primary mr-1"
                  onClick={() => {this.toggleViewModal({})}}
                >
                  Add Event Flag
                </Button>
              </div>
            </Col>
          }
        </Row>
        <Card>
          <CardBody>
            <div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
								<CardTitle className="card-title mb-4 h4">
                  Event Flags
								</CardTitle>
								<i className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={this.getFlaggedEvents} />
							</div>
            <PaginationProvider
              pagination={paginationFactory({ // pagination customization
                sizePerPage: 10,
                totalSize: flags.length, // replace later with size(Order),
                custom: true,
              })}
              keyField='flagged_id'
              columns={this.state.gridColumns}
              data={flags}
            >
              {({ paginationProps, paginationTableProps }) => (
                <ToolkitProvider
                  keyField="id"
                  data={flags}
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

EventFlags.propTypes = {
  userid: PropTypes.string,
  usertype: PropTypes.string,
  changePreloader: PropTypes.func
};

const mapStateToProps = (state) => ({
  userid: state.session.userid,
  usertype: state.session.type,
});

export default withRouter(connect(mapStateToProps, { changePreloader })(EventFlags));