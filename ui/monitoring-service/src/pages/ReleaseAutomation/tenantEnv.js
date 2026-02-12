import React from 'react';
import PropTypes from "prop-types";
import { alertError } from 'config/toast';
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { withRouter } from "react-router-dom";
import { getTenantEnvironmentsReq, rmTenantEnvironmentReq, getTenantsReq, getEnvironmentsReq } from 'config/httpRARoutes';
import { getTenantEnvironmentColumns } from './setupColumns';
import TenantEnvModal from './tenantEnvModal';
import { Card, CardBody, CardTitle } from "reactstrap";
import BootstrapTable from "react-bootstrap-table-next"
import paginationFactory, {
  PaginationProvider,
} from "react-bootstrap-table2-paginator"
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import { unpaginatedTableSize } from 'config/globals';

class RATenantEnv extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			tenant_envs: [],
			tenant_env: {},
			tenant_envmodal: false,
			tenant_envColumns: getTenantEnvironmentColumns(this),
			tenants: [],
			environments: []
		};
	}

	componentDidMount() { 
		this.getTenantEnvironments();
		this.getPreReqs();
	}

	getPreReqs = async () => {
		try {
			const environments = (await getEnvironmentsReq()).environments;
			const tenants = (await getTenantsReq()).tenants;
			this.setState({environments, tenants});
		} catch(err) {
			alertError("Could not fetch required data");
		}
	}

	getTenantEnvironments = () => {
		this.props.changePreloader(true);
		getTenantEnvironmentsReq()
		.then( (res) => {
			this.setState({tenant_envs: [...res.tenant_envs]});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch tenant environments");
		}).finally( () => {
			this.props.changePreloader(false);
		});
	}

	toggleTenantEnvironmentModal = (tenant_env) => {
		if(tenant_env?.refresh) {this.getTenantEnvironments();}
		this.setState(prevState => ({
			tenant_envmodal: !prevState.tenant_envmodal, tenant_env
		}));
	}

	removeTenantEnvironment = (tenantenvid) => {
		rmTenantEnvironmentReq(tenantenvid)
		.then( (res) => {
			this.getTenantEnvironments();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove tenant environment");
		});
	}

	pageListRenderer = () => {
		return (<></>);
	}

	render() {
		document.title = "Release Automation Tenant Environment Mapping";
		const {
			tenant_envs, tenant_env, tenant_envmodal, tenant_envColumns,
			environments, tenants
		} = this.state;
		return (
			<React.Fragment>
				<TenantEnvModal
					close={this.toggleTenantEnvironmentModal}
					isOpen={tenant_envmodal}
					tenant_env={tenant_env}
					tenants={tenants}
					environments={environments}
				/>
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
									// sizePerPage: tenant_envs.length,
									sizePerPage: unpaginatedTableSize,
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
			</React.Fragment>
		);
	}
}

RATenantEnv.propTypes = {
	changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { changePreloader })(RATenantEnv));