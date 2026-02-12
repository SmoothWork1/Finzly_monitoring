import React from 'react';
import PropTypes from "prop-types";
import { alertError } from 'config/toast';
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { withRouter } from "react-router-dom";
import { getTenantsReq, rmTenantReq } from 'config/httpRARoutes';
import { getTenantColumns } from './setupColumns';
import TenantModal from './tenantModal';
import { Card, CardBody, CardTitle } from "reactstrap";
import BootstrapTable from "react-bootstrap-table-next"
import paginationFactory, {
  PaginationProvider,
} from "react-bootstrap-table2-paginator"
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import { unpaginatedTableSize } from 'config/globals';

class RATenants extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			tenants: [],
			tenant: {},
			tenantmodal: false,
			tenantColumns: getTenantColumns(this),
		};
	}

	componentDidMount() { 
		this.getTenants();
	}

	getTenants = () => {
		this.props.changePreloader(true);
		getTenantsReq()
		.then( (res) => {
			this.setState({tenants: [...res.tenants]});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch tenants");
		}).finally( () => {
			this.props.changePreloader(false);
		});
	}

	toggleTenantModal = (tenant) => {
		if(tenant?.refresh) {this.getTenants();}
		this.setState(prevState => ({
			tenantmodal: !prevState.tenantmodal, tenant
		}));
	}

	removeTenant = (tenantid) => {
		rmTenantReq(tenantid)
		.then( (res) => {
			this.getTenants();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove tenant");
		});
	}

	pageListRenderer = () => {
		return (<></>);
	}

	render() {
		document.title = "Release Automation Tenants";
		const {
			tenants, tenant, tenantmodal, tenantColumns
		} = this.state;
		return (
			<React.Fragment>
				<TenantModal
					close={this.toggleTenantModal}
					isOpen={tenantmodal}
					tenant={tenant}
				/>
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
									// sizePerPage: tenants.length,
									sizePerPage: unpaginatedTableSize,
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
			</React.Fragment>
		);
	}
}

RATenants.propTypes = {
	changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { changePreloader })(RATenants));