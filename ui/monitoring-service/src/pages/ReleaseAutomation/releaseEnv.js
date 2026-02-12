import React from 'react';
import PropTypes from "prop-types";
import { alertError } from 'config/toast';
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { withRouter } from "react-router-dom";
import { getEnvironmentsReq, getReleaseEnvironmentsReq, getReleasesReq, rmReleaseEnvironmentReq } from 'config/httpRARoutes';
import { getReleaseEnvironmentColumns } from './setupColumns';
import ReleaseEnvModal from './releaseEnvModal';
import { Card, CardBody, CardTitle } from "reactstrap";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationProvider,
} from "react-bootstrap-table2-paginator";
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import { unpaginatedTableSize } from 'config/globals';

class RAReleaseEnv extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			release_envs: [],
			release_env: {},
			release_envmodal: false,
			release_envColumns: getReleaseEnvironmentColumns(this),

			releases: [],
			environments: []
		};
	}

	componentDidMount() { 
		this.getReleaseEnvironments();
		this.getPreReqs();
	}

	getPreReqs = async () => {
		try {
			const environments = (await getEnvironmentsReq()).environments;
			const releases = (await getReleasesReq()).releases;
			this.setState({environments, releases});
		} catch(err) {
			alertError("Could not fetch required data");
		}
	}

	getReleaseEnvironments = () => {
		this.props.changePreloader(true);
		getReleaseEnvironmentsReq()
		.then( (res) => {
			this.setState({release_envs: [...res.release_envs]});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch release environments");
		}).finally( () => {
			this.props.changePreloader(false);
		});
	}

	toggleReleaseEnvironmentModal = (release_env) => {
		if(release_env?.refresh) {this.getReleaseEnvironments();}
		this.setState(prevState => ({
			release_envmodal: !prevState.release_envmodal, release_env
		}));
	}

	removeReleaseEnvironment = (releaseenvid) => {
		rmReleaseEnvironmentReq(releaseenvid)
		.then( (res) => {
			this.getReleaseEnvironments();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove release environment");
		});
	}

	pageListRenderer = () => {
		return (<></>);
	}

	render() {
		document.title = "Release Automation Release Environment Setup";
		const {
			release_envs, release_env, release_envmodal, release_envColumns,
			releases, environments
		} = this.state;
		return (
			<React.Fragment>
				<ReleaseEnvModal
					close={this.toggleReleaseEnvironmentModal}
					isOpen={release_envmodal}
					release_env={release_env}
					releases={releases}
					environments={environments}
				/>
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
									// sizePerPage: release_envs.length,
									sizePerPage: unpaginatedTableSize,
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

RAReleaseEnv.propTypes = {
	changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { changePreloader })(RAReleaseEnv));