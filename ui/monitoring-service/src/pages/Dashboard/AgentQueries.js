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
import { pageTitles, pageTypes } from "config/globals"
import { getAgentQueriesReq, rmAgentQueryReq } from "config/httpRoutes";
import { alertError } from "config/toast";
import { connect } from 'react-redux';
import AgentQueryModal from './AgentQueryModal';
import { changePreloader } from 'store/actions';
import { generalize, shortenString } from 'config/helpers';

const getFullColumns = (page) => [
  {
    dataField: "query_name",
    text: "Query Name",
    sort: true,
    formatter: (cellContent, row) => (
      <>
      <Link to="#" id={`UncontrolledTooltip${row.key}QueryName`} className="text-body fw-bold" onClick={() => {page.toggleViewModal(row)}}>
        {row.query_name}
      </Link>
      <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.key}QueryName`}>
        {row.query_name}
      </UncontrolledTooltip>
      </>
    ),
  },
  // {
  //   dataField: "lambda_name",
  //   text: "Lambda Name",
  //   sort: false,
  //   formatter: (cellContent, row) => (
  //     <>
  //     <span id={`UncontrolledTooltip${row.key}Lambda`}>{shortenString(row.lambda_name, 25)}</span>
  //     <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.key}Lambda`}>
  //       {row.lambda_name}
  //     </UncontrolledTooltip>
  //     </>
  //   ),
  // },
  {
    dataField: "query",
    text: "Query",
    sort: false,
    formatter: (cellContent, row) => (
      <>
      <span id={`UncontrolledTooltip${row.key}Query`}>{shortenString(row.query, 25)}</span>
      <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.key}Query`}>
        {row.query}
      </UncontrolledTooltip>
      </>
    ),
  },
  {
    dataField: "query_result",
    text: "Query Result",
    sort: false,
    formatter: (cellContent, row) => (
      <>
      <span id={`UncontrolledTooltip${row.key}QueryResult`}>{shortenString(row.query_result, 25)}</span>
      <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.key}QueryResult`}>
        {row.query_result}
      </UncontrolledTooltip>
      </>
    ),
  },
  {
    dataField: "query_order",
    text: "Query Order",
    sort: false,
    formatter: (cellContent, row) => (
      <>
      <span id={`UncontrolledTooltip${row.key}QueryOrder`}>{shortenString(row.query_order, 25)}</span>
      <UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${row.key}QueryOrder`}>
        {row.query_order}
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
            id={`grid-table-${row.key}`}
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
              onClick={() => {page.removeAgentQuery(row.query_name)}}
            >
              <span className="text-danger">Delete</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
    );},
  }
];

class AgentQueries extends Component {
	constructor(props) {
		super(props)
		this.state = {
			queries: [],
			gridColumns: getFullColumns(this),
			viewmodal: false,
			query: {},
		}
		this.toLowerCase1 = this.toLowerCase1.bind(this);
	}

	toLowerCase1(str) {
		return str.toLowerCase();
	}

	componentDidMount() {
		this.getAgentQueries();
	}

  getAgentQueries = () => {
    this.props.changePreloader(true);
		getAgentQueriesReq(pageTypes[this.props.match.params.key])
		.then( (res) => {
			const queries = res.queries.map( (r) => ({
				...r,
				menu: false,
        key: `${r.lambda_name}_${r.query_name}`.replace(/\s/g, '')
			}));
			this.setState({queries, viewmodal: false, query: {}});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch event agent queries");
		}).finally( () => {
			this.props.changePreloader(false);
		});
  }

  removeAgentQuery = (query_name) => {
		rmAgentQueryReq(pageTypes[this.props.match.params.key], query_name)
		.then( (res) => {
			this.getAgentQueries();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove agent query");
		}).finally( () => {
			this.setState({fetchLoading: false});
		});
  }

  toggleAction = (i) => {
    const queries = this.state.queries.map( (r, idx) => ({
      ...r,
      menu: idx === i ? !r.menu : r.menu
    }));
    this.setState({queries});
  }
  toggleViewModal = (query) => {
    this.setState(prevState => ({
      viewmodal: !prevState.viewmodal, query
    }))
  }

  render() {
    const { queries, query } = this.state;
    const { key } = this.props.match.params;
    document.title = pageTitles[key];
    return (
      <React.Fragment>
        <AgentQueryModal
          isOpen={this.state.viewmodal}
          toggle={() => {this.toggleViewModal({})}}
          query={query}
          refresh={this.getAgentQueries}
          match={this.props.match}
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
                  Add Agent Query
                </Button>
              </div>
            </Col>
          {/* } */}
        </Row>
        <Card>
          <CardBody>
            <div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
								<CardTitle className="card-title mb-4 h4">
                  {pageTitles[key]}
								</CardTitle>
                <div>
                  <i id="grid-events-btn" className="mdi mdi-text-box-multiple cursor-pointer mr-2" style={{fontSize: 20}} onClick={() => {this.props.history.push(`/grid/${key}`)}} />
                  <UncontrolledTooltip placement="auto" target="grid-events-btn">
                    Events
                  </UncontrolledTooltip>
                  <i id="queries-refresh-btn" className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={this.getAgentQueries} />
                  <UncontrolledTooltip placement="auto" target="queries-refresh-btn">
                    Refresh Queries
                  </UncontrolledTooltip>
                </div>
							</div>
            <PaginationProvider
              pagination={paginationFactory({ // pagination customization
                sizePerPage: 10,
                totalSize: queries.length, // replace later with size(Order),
                custom: true,
              })}
              keyField='key'
              columns={this.state.gridColumns}
              data={queries}
            >
              {({ paginationProps, paginationTableProps }) => (
                <ToolkitProvider
                  keyField="key"
                  data={queries}
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

AgentQueries.propTypes = {
  changePreloader: PropTypes.func
};

export default withRouter(connect(null, { changePreloader })(AgentQueries));