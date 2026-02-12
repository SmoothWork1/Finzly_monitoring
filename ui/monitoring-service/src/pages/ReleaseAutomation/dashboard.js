import React from 'react';
import PropTypes from "prop-types";
import { alertError, alertSuccess } from 'config/toast';
import { getApplicationsReq, getExecInfoReq, getReleaseEnvironmentsReq, getTenantEnvironmentsReq, getTenantsReq, launchExecInfoReq, rmExecInfoReq } from 'config/httpRARoutes';
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { withRouter } from "react-router-dom";
import { generalize, getCleanedDateTime, shortenString } from 'config/helpers';
import { Card, CardBody, Col, Row, UncontrolledTooltip, CardTitle } from "reactstrap";
import ExecInfoModal from './executionInfoModal';
import BootstrapTable from "react-bootstrap-table-next"
import paginationFactory, {
  PaginationProvider,
} from "react-bootstrap-table2-paginator"
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import { unpaginatedTableSize } from 'config/globals';

const getExecColumns = (page) => [
	{
		dataField: "id",
		text: "Execution ID",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			{/* <Link to="#" id={`UncontrolledTooltip${generalize(row.id)}Id`} className="text-body fw-bold" onClick={() => {page.toggleViewModal(row)}}>
				{shortenString(row.id, 25)}
			</Link>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}Id`}>
				{row.id}
			</UncontrolledTooltip> */}
			<span id={`UncontrolledTooltip${generalize(row.id)}ID`}>{shortenString(row.id, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ID`}>
				{row.id}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "source_tenant",
		text: "Source Tenant",
		sort: false,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}SourceTenant`}>{shortenString(row.source_tenant, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}SourceTenant`}>
				{row.source_tenant}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "source_tenant_env",
		text: "Source Tenant Environment",
		sort: false,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}SourceTenantEnvironment`}>{shortenString(row.source_tenant_env, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}SourceTenantEnvironment`}>
				{row.source_tenant_env}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "tenant_id",
		text: "Tenant ID",
		sort: false,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}TenantID`}>{shortenString(row.tenant_id, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}TenantID`}>
				{row.tenant_id}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "tenant_name_id",
		text: "Tenant Name ID",
		sort: false,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}TenantNameID`}>{shortenString(row.tenant_name_id, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}TenantNameID`}>
				{row.tenant_name_id}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "env_id",
		text: "Environment ID",
		sort: false,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}EnvironmentID`}>{shortenString(row.env_id, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}EnvironmentID`}>
				{row.env_id}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "release_id",
		text: "Release ID",
		sort: false,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}ReleaseID`}>{shortenString(row.release_id, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ReleaseID`}>
				{row.release_id}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "copy_from_source",
		text: "Copied from Source",
		sort: false,
		formatter: (cellContent, row) => (
			<>
				<span id={`UncontrolledTooltip${generalize(row.id)}CopyFromSource`}>{
					row.copy_from_source ?
						<i className="mdi my-fs-1 mdi-check" />
					:
						<i className="mdi my-fs-1 mdi-close" />
				}</span>
			</>
		),
	},
	{
		dataField: "datetimeStr",
		text: "Executed At",
		sort: false,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}ExecutedAt`}>{shortenString(row.datetimeStr, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ExecutedAt`}>
				{row.datetimeStr}
			</UncontrolledTooltip>
			</>
		),
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
		dataField: "view",
		isDummyField: true,
		text: "Actions",
		sort: false,
		formatter: (cellContent, row, i) => {
			return (
				<Row className="mb-2" style={{marginTop: '0rem', marginRight: '0rem'}}>
					<Col sm="12">
						<i className="mdi my-fs-1 cursor-pointer mdi-rocket-launch-outline mr-2" onClick={() => {page.launchExecution(row.id)}} />
						<i className="mdi my-fs-1 cursor-pointer mdi-pencil mr-2" onClick={() => {page.toggleViewModal(row)}} />
						<i className="mdi my-fs-1 cursor-pointer mdi-delete" onClick={() => {page.removeExecInfo(row.id)}} />
					</Col>
				</Row>
			);
		},
	}
];

class RADashboard extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			exec_info: [],
			exec: {},
			viewmodal: false,

			gridColumns: getExecColumns(this),

			tenants: null,
			tenant_envs: null,
			release_envs: null,
			applications: null,
			applicationsByCode: null
		};
	}

	componentDidMount() { 
		this.getPreReqs();
		this.getExecInfo(true);
	}

	getExecInfo = (init) => {
		this.props.changePreloader(true);
		getExecInfoReq()
		.then( (res) => {
			this.setState({exec_info: [...res.exec_info.map( (ei) => ({
				...ei,
				datetimeStr: getCleanedDateTime(ei.datetime),
				datetime: new Date(ei.datetime),
				products: ei.products.split(","),
				copy_from_source: Boolean(ei.copy_from_source),
				badgeclass: ei.status === "Active" ? 'danger' : (ei.status === "Complete" ? 'success' : 'warning')
			}))]});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch execution information");
		}).finally( () => {
			!init && this.props.changePreloader(false);
		});
	}

	getPreReqs = async () => {
		try {
			const tenants = (await getTenantsReq()).tenants;
			const tenant_envs = (await getTenantEnvironmentsReq()).tenant_envs;
			const release_envs = (await getReleaseEnvironmentsReq()).release_envs;
			const applications = (await getApplicationsReq()).applications;
			const filteredApplications = applications.filter( (app) => Boolean(app.app_code) && !Boolean(app.is_default_app) && app.app_code !== 'finzly.common');
			this.setState({tenants, tenant_envs, release_envs, applications: filteredApplications, applicationsByCode: this.sortApplicationsByCode(applications)}, () => {
				this.props.changePreloader(false);
			});
		} catch(err) {
			alertError("Could not fetch required data");
		}
	}

	sortApplicationsByCode = (applications) => {
		const appObj = {};
		for(let i = 0; i <= applications.length; ++i) {
			if(i === applications.length) {
				return appObj;
			} else {
				appObj[applications[i].app_code] = applications[i];
			}
		}
	}

	sortApplicationsById = (applications) => {
		const appObj = {};
		for(let i = 0; i <= applications.length; ++i) {
			if(i === applications.length) {
				return appObj;
			} else {
				appObj[applications[i].id] = applications[i];
			}
		}
	}

	toggleViewModal = (exec) => {
		if(exec?.refresh) {this.getExecInfo();}
		if(this.state.applicationsByCode && Array.isArray(exec?.products) && Array.isArray(exec?.applications)) {
			// console.log(exec, exec.applications, this.state.applicationsByCode);
			this.setState(prevState => ({
				viewmodal: !prevState.viewmodal, exec: {
					...exec,
					products: exec.products.map( (prod) => ({label: prod, value: prod})),
					applications: exec.applications.map( (app_code) => {
						const app = this.state.applicationsByCode[app_code];
						return {label: app.app_name, value: app.app_code};
					}),
				}
			}));
		} else {
			this.setState(prevState => ({
				viewmodal: !prevState.viewmodal, exec
			}));
		}
	}

	removeExecInfo = (execinfoid) => {
		rmExecInfoReq(execinfoid)
		.then( (res) => {
			this.getExecInfo();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove execution info");
		});
	}

	launchExecution = (execinfoid) => {
		launchExecInfoReq(execinfoid)
		.then( (res) => {
			// this.getExecInfo();
			alertSuccess(res.message);
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not launch execution info");
		});
	}

	pageListRenderer = () => {
		return (<></>);
	}

	render() {
		document.title = "Release Automation Dashboard";
		const { exec_info, exec, viewmodal, gridColumns, tenants, tenant_envs, release_envs, applications, applicationsByCode } = this.state;
		return (
			<React.Fragment>
				<ExecInfoModal
					close={this.toggleViewModal}
					isOpen={viewmodal}
					exec={exec}
					tenants={tenants}
					tenant_envs={tenant_envs}
					release_envs={release_envs}
					applications={applications}
					applicationsByCode={applicationsByCode}
				/>
				{/* <Row className="mb-2" style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<Col sm="12">
						<div className="text-sm-end d-none d-sm-block">
						<Button
							color="primary"
							className={`fs-filter btn-block btn btn-filter btn-primary mr-1`}
							onClick={() => {this.toggleViewModal({})}}
						>
							Launch
						</Button>
						</div>
					</Col>
				</Row> */}
				<Card style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<CardBody>
						<div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
							<CardTitle className="card-title mb-4 h4">
								Execution Info
							</CardTitle>
							<div>
								<span className="cursor-pointer mr-2" style={{fontSize: 22}} onClick={() => {this.toggleViewModal({})}}>+</span>
								<i className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={() => {this.getExecInfo()}} />
							</div>
						</div>
						{Array.isArray(exec_info) && exec_info.length > 0 && exec_info[0].id &&
							<PaginationProvider
								pagination={paginationFactory({
									// sizePerPage: exec_info.length,
									sizePerPage: unpaginatedTableSize,
									hideSizePerPage: true,
									hidePageListOnlyOnePage: true,
									showTotal: false,
									pageListRenderer: this.pageListRenderer,
								})}
								keyField='id'
								columns={gridColumns}
								data={exec_info}
							>
								{({ paginationProps, paginationTableProps }) => (
								<ToolkitProvider
									keyField="id"
									data={exec_info}
									columns={gridColumns}
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

RADashboard.propTypes = {
	changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { changePreloader })(RADashboard));