import React from 'react';
import PropTypes from "prop-types";
import { alertError } from 'config/toast';
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { withRouter } from "react-router-dom";
import { getEnvironmentsReq, getReleaseEnvironmentsReq, getReleasesReq, getTenantEnvironmentsReq, getTenantsReq, rmEnvironmentReq, rmReleaseEnvironmentReq, rmReleaseReq, rmTenantEnvironmentReq, rmTenantReq } from 'config/httpRARoutes';
import { getEnvironmentColumns, getReleaseColumns, getReleaseEnvironmentColumns, getTenantColumns, getTenantEnvironmentColumns } from './setupColumns';
import TenantModal from './tenantModal';
import ReleaseModal from './releaseModal';
import EnvironmentModal from './environmentModal';
import TenantEnvModal from './tenantEnvModal';
import ReleaseEnvModal from './releaseEnvModal';
import { Button, Card, CardBody, Col, Row, CardTitle } from "reactstrap";
import BootstrapTable from "react-bootstrap-table-next"
import paginationFactory, {
  PaginationProvider,
} from "react-bootstrap-table2-paginator"
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';

class RASetup extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			environments: [],
			environment: {},
			environmentmodal: false,
			environmentColumns: getEnvironmentColumns(this),

			tenants: [],
			tenant: {},
			tenantmodal: false,
			tenantColumns: getTenantColumns(this),

			releases: [],
			release: {},
			releasemodal: false,
			releaseColumns: getReleaseColumns(this),

			tenant_envs: [],
			tenant_env: {},
			tenant_envmodal: false,
			tenant_envColumns: getTenantEnvironmentColumns(this),

			release_envs: [],
			release_env: {},
			release_envmodal: false,
			release_envColumns: getReleaseEnvironmentColumns(this),
		};
	}

	componentDidMount() { 
		this.props.changePreloader(true);
		Promise.all([
			this.getEnvironments(),
			this.getTenants(),
			this.getReleases(),
			this.getTenantEnvironments(),
			this.getReleaseEnvironments()
		]).then( () => {
			this.props.changePreloader(false);
		});
	}

	getEnvironments = () => {
		return new Promise( (resolve) => {
			getEnvironmentsReq()
			.then( (res) => {
				this.setState({environments: [...res.environments]});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not fetch environments");
			}).finally( () => {
				resolve();
			});
		});
	}

	toggleEnvironmentModal = async (environment) => {
		if(environment?.refresh) {await this.getEnvironments();}
		this.setState(prevState => ({
			environmentmodal: !prevState.environmentmodal, environment
		}));
	}

	removeEnvironment = (environmentid) => {
		rmEnvironmentReq(environmentid)
		.then( async (res) => {
			await this.getEnvironments();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove environment");
		});
	}

	getTenants = () => {
		return new Promise( (resolve) => {
			getTenantsReq()
			.then( (res) => {
				this.setState({tenants: [...res.tenants]});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not fetch tenants");
			}).finally( () => {
				resolve();
			});
		});
	}

	toggleTenantModal = async (tenant) => {
		if(tenant?.refresh) {await this.getTenants();}
		this.setState(prevState => ({
			tenantmodal: !prevState.tenantmodal, tenant
		}));
	}

	removeTenant = (tenantid) => {
		rmTenantReq(tenantid)
		.then( async (res) => {
			await this.getTenants();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove tenant");
		});
	}

	getReleases = () => {
		return new Promise( (resolve) => {
			getReleasesReq()
			.then( (res) => {
				this.setState({releases: [...res.releases]});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not fetch releases");
			}).finally( () => {
				resolve();
			});
		});
	}

	toggleReleaseModal = async (release) => {
		if(release?.refresh) {await this.getReleases();}
		this.setState(prevState => ({
			releasemodal: !prevState.releasemodal, release
		}));
	}

	removeRelease = (releaseid) => {
		rmReleaseReq(releaseid)
		.then( async (res) => {
			await this.getReleases();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove release");
		});
	}

	getTenantEnvironments = () => {
		return new Promise( (resolve) => {
			getTenantEnvironmentsReq()
			.then( (res) => {
				this.setState({tenant_envs: [...res.tenant_envs]});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not fetch tenant environments");
			}).finally( () => {
				resolve();
			});
		});
	}

	toggleTenantEnvironmentModal = async (tenant_env) => {
		if(tenant_env?.refresh) {await this.getTenantEnvironments();}
		this.setState(prevState => ({
			tenant_envmodal: !prevState.tenant_envmodal, tenant_env
		}));
	}

	removeTenantEnvironment = (tenantenvid) => {
		rmTenantEnvironmentReq(tenantenvid)
		.then( async (res) => {
			await this.getTenantEnvironments();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove tenant environment");
		});
	}

	getReleaseEnvironments = () => {
		return new Promise( (resolve) => {
			getReleaseEnvironmentsReq()
			.then( (res) => {
				this.setState({release_envs: [...res.release_envs]});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not fetch release environments");
			}).finally( () => {
				resolve();
			});
		});
	}

	toggleReleaseEnvironmentModal = async (release_env) => {
		if(release_env?.refresh) {await this.getReleaseEnvironments();}
		this.setState(prevState => ({
			release_envmodal: !prevState.release_envmodal, release_env
		}));
	}

	removeReleaseEnvironment = (releaseenvid) => {
		rmReleaseEnvironmentReq(releaseenvid)
		.then( async (res) => {
			await this.getReleaseEnvironments();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove release environment");
		});
	}

	pageListRenderer = () => {
		return (<></>);
	}

	render() {
		document.title = "Release Automation Setup";
		const {
			environments, environment, environmentmodal, environmentColumns,
			tenants, tenant, tenantmodal, tenantColumns,
			releases, release, releasemodal, releaseColumns,
			tenant_envs, tenant_env, tenant_envmodal, tenant_envColumns,
			release_envs, release_env, release_envmodal, release_envColumns,
		} = this.state;
		return (
			<React.Fragment>
				<EnvironmentModal
					close={this.toggleEnvironmentModal}
					isOpen={environmentmodal}
					environment={environment}
				/>
				{/* <Row className="mb-2" style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<Col sm="12">
						<div className="text-sm-end d-none d-sm-block">
						<Button
							color="primary"
							className={`fs-filter btn-block btn btn-filter btn-primary mr-1`}
							onClick={() => {this.toggleEnvironmentModal({})}}
						>
							Add Environment
						</Button>
						</div>
					</Col>
				</Row> */}
				<Card style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<CardBody>
						<div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
							<CardTitle className="card-title mb-4 h4">
								Environments
							</CardTitle>
							<div>
								<span className="cursor-pointer mr-2" style={{fontSize: 22}} onClick={() => {this.toggleEnvironmentModal({})}}>+</span>
								<i className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={() => {this.getEnvironments()}} />
							</div>
						</div>
						{Array.isArray(environments) && environments.length > 0 && environments[0].id &&
							<PaginationProvider
								pagination={paginationFactory({
									sizePerPage: environments.length,
									hideSizePerPage: true,
									hidePageListOnlyOnePage: true,
									showTotal: false,
									pageListRenderer: this.pageListRenderer,
								})}
								keyField='id'
								columns={environmentColumns}
								data={environments}
							>
								{({ paginationProps, paginationTableProps }) => (
								<ToolkitProvider
									keyField="id"
									data={environments}
									columns={environmentColumns}
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
				<TenantModal
					close={this.toggleTenantModal}
					isOpen={tenantmodal}
					tenant={tenant}
				/>
				{/* <Row className="mb-2" style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<Col sm="12">
						<div className="text-sm-end d-none d-sm-block">
						<Button
							color="primary"
							className={`fs-filter btn-block btn btn-filter btn-primary mr-1`}
							onClick={() => {this.toggleTenantModal({})}}
						>
							Add Tenant
						</Button>
						</div>
					</Col>
				</Row> */}
				<Card style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<CardBody>
						<div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
							<CardTitle className="card-title mb-4 h4">
								Tenants
							</CardTitle>
							<div>
								<span className="cursor-pointer mr-2" style={{fontSize: 22}} onClick={() => {this.toggleTenantModal({})}}>+</span>
								<i className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={() => {this.getTenants()}} />
							</div>
						</div>
						{Array.isArray(tenants) && tenants.length > 0 && tenants[0].id &&
							<PaginationProvider
								pagination={paginationFactory({
									sizePerPage: tenants.length,
									hideSizePerPage: true,
									hidePageListOnlyOnePage: true,
									showTotal: false,
									pageListRenderer: this.pageListRenderer,
								})}
								keyField='id'
								columns={tenantColumns}
								data={tenants}
							>
								{({ paginationProps, paginationTableProps }) => (
								<ToolkitProvider
									keyField="id"
									data={tenants}
									columns={tenantColumns}
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
				<ReleaseModal
					close={this.toggleReleaseModal}
					isOpen={releasemodal}
					release={release}
				/>
				{/* <Row className="mb-2" style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<Col sm="12">
						<div className="text-sm-end d-none d-sm-block">
						<Button
							color="primary"
							className={`fs-filter btn-block btn btn-filter btn-primary mr-1`}
							onClick={() => {this.toggleReleaseModal({})}}
						>
							Add Release
						</Button>
						</div>
					</Col>
				</Row> */}
				<Card style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<CardBody>
						<div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
							<CardTitle className="card-title mb-4 h4">
								Releases
							</CardTitle>
							<div>
								<span className="cursor-pointer mr-2" style={{fontSize: 22}} onClick={() => {this.toggleReleaseModal({})}}>+</span>
								<i className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={() => {this.getReleases()}} />
							</div>
						</div>
						{Array.isArray(releases) && releases.length > 0 && releases[0].id &&
							<PaginationProvider
								pagination={paginationFactory({
									sizePerPage: releases.length,
									hideSizePerPage: true,
									hidePageListOnlyOnePage: true,
									showTotal: false,
									pageListRenderer: this.pageListRenderer,
								})}
								keyField='id'
								columns={releaseColumns}
								data={releases}
							>
								{({ paginationProps, paginationTableProps }) => (
								<ToolkitProvider
									keyField="id"
									data={releases}
									columns={releaseColumns}
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
				<TenantEnvModal
					close={this.toggleTenantEnvironmentModal}
					isOpen={tenant_envmodal}
					tenant_env={tenant_env}
					tenants={tenants}
					environments={environments}
				/>
				{/* <Row className="mb-2" style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<Col sm="12">
						<div className="text-sm-end d-none d-sm-block">
						<Button
							color="primary"
							className={`fs-filter btn-block btn btn-filter btn-primary mr-1`}
							onClick={() => {this.toggleTenantEnvironmentModal({})}}
						>
							Add Tenant Environment
						</Button>
						</div>
					</Col>
				</Row> */}
				<Card style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<CardBody>
						<div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
							<CardTitle className="card-title mb-4 h4">
								Tenant Environments
							</CardTitle>
							<div>
								<span className="cursor-pointer mr-2" style={{fontSize: 22}} onClick={() => {this.toggleTenantEnvironmentModal({})}}>+</span>
								<i className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={() => {this.getTenantEnvironments()}} />
							</div>
						</div>
						{Array.isArray(tenant_envs) && tenant_envs.length > 0 && tenant_envs[0].id &&
							<PaginationProvider
								pagination={paginationFactory({
									sizePerPage: tenant_envs.length,
									hideSizePerPage: true,
									hidePageListOnlyOnePage: true,
									showTotal: false,
									pageListRenderer: this.pageListRenderer,
								})}
								keyField='id'
								columns={tenant_envColumns}
								data={tenant_envs}
							>
								{({ paginationProps, paginationTableProps }) => (
								<ToolkitProvider
									keyField="id"
									data={tenant_envs}
									columns={tenant_envColumns}
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
				<ReleaseEnvModal
					close={this.toggleReleaseEnvironmentModal}
					isOpen={release_envmodal}
					release_env={release_env}
					releases={releases}
					environments={environments}
				/>
				{/* <Row className="mb-2" style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<Col sm="12">
						<div className="text-sm-end d-none d-sm-block">
						<Button
							color="primary"
							className={`fs-filter btn-block btn btn-filter btn-primary mr-1`}
							onClick={() => {this.toggleReleaseEnvironmentModal({})}}
						>
							Add Release Environment
						</Button>
						</div>
					</Col>
				</Row> */}
				<Card style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<CardBody>
						<div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
							<CardTitle className="card-title mb-4 h4">
								Release Environments
							</CardTitle>
							<div>
								<span className="cursor-pointer mr-2" style={{fontSize: 22}} onClick={() => {this.toggleReleaseEnvironmentModal({})}}>+</span>
								<i className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={() => {this.getReleaseEnvironments()}} />
							</div>
						</div>
						{Array.isArray(release_envs) && release_envs.length > 0 && release_envs[0].id &&
							<PaginationProvider
								pagination={paginationFactory({
									sizePerPage: release_envs.length,
									hideSizePerPage: true,
									hidePageListOnlyOnePage: true,
									showTotal: false,
									pageListRenderer: this.pageListRenderer,
								})}
								keyField='id'
								columns={release_envColumns}
								data={release_envs}
							>
								{({ paginationProps, paginationTableProps }) => (
								<ToolkitProvider
									keyField="id"
									data={release_envs}
									columns={release_envColumns}
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

RASetup.propTypes = {
	changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { changePreloader })(RASetup));