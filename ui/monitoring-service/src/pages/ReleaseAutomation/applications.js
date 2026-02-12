import React from 'react';
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { withRouter } from "react-router-dom";
import { getApplicationsReq, rmApplicationReq } from 'config/httpRARoutes';
import { generalize, getCleanedDateTime, shortenString } from 'config/helpers';
import { Card, CardBody, CardTitle, Col, Row, UncontrolledTooltip } from "reactstrap";
import ApplicationModal from './applicationModal.js';
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationProvider,
} from "react-bootstrap-table2-paginator";
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import { unpaginatedTableSize } from 'config/globals.js';

const getApplicationColumns = (page) => [
	{
		dataField: "id",
		text: "Application ID",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}ApplicationID`}>{shortenString(row.id, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ApplicationID`}>
				{row.id}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "app_name",
		text: "Application Name",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}ApplicationName`}>{shortenString(row.app_name, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ApplicationName`}>
				{row.app_name}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "app_code",
		text: "Application Code",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}ApplicationCode`}>{shortenString(row.app_code, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ApplicationCode`}>
				{row.app_code}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "app_context",
		text: "Application Context",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}ApplicationContext`}>{shortenString(row.app_context, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ApplicationContext`}>
				{row.app_context}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "schema_name",
		text: "Schema Name",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}SchemaName`}>{shortenString(row.schema_name, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}SchemaName`}>
				{row.schema_name}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "is_default_app",
		text: "Default App",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}DefaultApp`}>{
				row.is_default_app ?
					<i className="mdi my-fs-1 mdi-check" />
				:
					<i className="mdi my-fs-1 mdi-close" />
			}</span>
			</>
		),
	},
	{
		dataField: "group_name",
		text: "Group Name",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}GroupName`}>{shortenString(row.group_name, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}GroupName`}>
				{row.group_name}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "enable_api",
		text: "API Enabled",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}APIEnabled`}>{
				row.enable_api ?
					<i className="mdi my-fs-1 mdi-check" />
				:
					<i className="mdi my-fs-1 mdi-close" />
			}</span>
			</>
		),
	},
	{
		dataField: "api_code",
		text: "API Code",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}APICode`}>{shortenString(row.api_code, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}APICode`}>
				{row.api_code}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "createdOnStr",
		text: "Created On",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}CreatedOnStr`}>{shortenString(row.createdOnStr, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}CreatedOnStr`}>
				{row.createdOnStr}
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
			<span id={`UncontrolledTooltip${generalize(row.id)}ApplicationStatus`}>{shortenString(row.status, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ApplicationStatus`}>
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
				<Row className="mb-2" style={{marginTop: '0rem', marginRight: '0rem'}}>
					<Col sm="12">
						<i className="mdi my-fs-1 cursor-pointer mdi-pencil mr-2" onClick={() => {page.toggleApplicationModal(row)}} />
						<i className="mdi my-fs-1 cursor-pointer mdi-delete" onClick={() => {page.removeApplication(row.id)}} />
					</Col>
				</Row>
			);
		},
	}
]

class RAApplications extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			applications: [],
			application: {},
			applicationmodal: false,
			applicationColumns: getApplicationColumns(this),
		}
	}

	componentDidMount() { 
		this.getApplications();
	}

	getApplications = () => {
		this.props.changePreloader(true);
		getApplicationsReq()
		.then( (res) => {
			// this.setState({applications: [...res.applications]});
			this.setState({applications: [...res.applications.map( (app) => ({
					...app,
					is_default_app: Boolean(app.is_default_app),
					enable_api: Boolean(app.enable_api),
					createdOnStr: getCleanedDateTime(app.created_on),
					created_on: new Date(app.created_on),
			}))]});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch applications");
		}).finally( () => {
			this.props.changePreloader(false);
		});
	}

	toggleApplicationModal = (application) => {
		if(application?.refresh) {this.getApplications();}
		this.setState(prevState => ({
			applicationmodal: !prevState.applicationmodal, application
		}));
	}

	removeApplication = (appid) => {
		rmApplicationReq(appid)
		.then( (res) => {
			this.getApplications();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove application");
		});
	}

	pageListRenderer = () => {
		return (<></>);
	}

	render() {
		document.title = "Release Automation Applications";
		const {
			applications, application, applicationmodal, applicationColumns
		} = this.state;
		return (
			<React.Fragment>
				<ApplicationModal
					close={this.toggleApplicationModal}
					isOpen={applicationmodal}
					application={application}
				/>
				<Card style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<CardBody>
						<div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
							<CardTitle className="card-title mb-4 h4">
								Applications
							</CardTitle>
							<div>
								<span className="cursor-pointer mr-2" style={{fontSize: 22}} onClick={() => {this.toggleApplicationModal({})}}>+</span>
								<i className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={() => {this.getApplications()}} />
							</div>
						</div>
						{Array.isArray(applications) && applications.length > 0 && applications[0].id &&
							<PaginationProvider
								pagination={paginationFactory({
									// sizePerPage: applications.length,
									sizePerPage: unpaginatedTableSize,
									hideSizePerPage: true,
									hidePageListOnlyOnePage: true,
									showTotal: false,
									pageListRenderer: this.pageListRenderer,
								})}
								keyField='id'
								columns={applicationColumns}
								data={applications}
							>
								{({ paginationProps, paginationTableProps }) => (
								<ToolkitProvider
									keyField="id"
									data={applications}
									columns={applicationColumns}
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
											defaultSorted={[{ dataField: 'datetime', order: 'desc' }]}
											bordered={false}
											striped={false}
											classes={
												"table align-middle table-nowrap table-check"
											}
											headerWrapperClasses={"table-light"}
										/>
										</div>
										<div className="pagination pagination-rounded justify-content-end"></div>
									</React.Fragment>
									)}
								</ToolkitProvider>
								)}
							</PaginationProvider>
						}
					</CardBody>
				</Card>
			</React.Fragment>
		);
	}
}

RAApplications.propTypes = {
	changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { changePreloader })(RAApplications));