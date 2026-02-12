import React from 'react';
import PropTypes from "prop-types";
import { alertError } from 'config/toast';
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { withRouter } from "react-router-dom";
import { getEnvironmentsReq, rmEnvironmentReq } from 'config/httpRARoutes';
import { getEnvironmentColumns } from './setupColumns';
import EnvironmentModal from './environmentModal';
import { Card, CardBody, CardTitle } from "reactstrap";
import BootstrapTable from "react-bootstrap-table-next"
import paginationFactory, {
  PaginationProvider,
} from "react-bootstrap-table2-paginator"
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import { unpaginatedTableSize } from 'config/globals';

class RAEnvironments extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			environments: [],
			environment: {},
			environmentmodal: false,
			environmentColumns: getEnvironmentColumns(this),
		};
	}

	componentDidMount() { 
		this.getEnvironments();
	}

	getEnvironments = () => {
		this.props.changePreloader(true);
		getEnvironmentsReq()
		.then( (res) => {
			this.setState({environments: [...res.environments]});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch environments");
		}).finally( () => {
			this.props.changePreloader(false);
		});
	}

	toggleEnvironmentModal = (environment) => {
		if(environment?.refresh) {this.getEnvironments();}
		this.setState(prevState => ({
			environmentmodal: !prevState.environmentmodal, environment
		}));
	}

	removeEnvironment = (environmentid) => {
		rmEnvironmentReq(environmentid)
		.then( (res) => {
			this.getEnvironments();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove environment");
		});
	}

	pageListRenderer = () => {
		return (<></>);
	}

	render() {
		document.title = "Release Automation Environments";
		const {
			environments, environment, environmentmodal, environmentColumns
		} = this.state;
		return (
			<React.Fragment>
				<EnvironmentModal
					close={this.toggleEnvironmentModal}
					isOpen={environmentmodal}
					environment={environment}
				/>
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
									// sizePerPage: environments.length,
									sizePerPage: unpaginatedTableSize,
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
			</React.Fragment>
		);
	}
}

RAEnvironments.propTypes = {
	changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { changePreloader })(RAEnvironments));