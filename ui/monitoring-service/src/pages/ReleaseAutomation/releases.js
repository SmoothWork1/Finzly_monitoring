import React from 'react';
import PropTypes from "prop-types";
import { alertError } from 'config/toast';
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { withRouter } from "react-router-dom";
import { getReleasesReq, rmReleaseReq } from 'config/httpRARoutes';
import { getReleaseColumns } from './setupColumns';
import ReleaseModal from './releaseModal';
import { Card, CardBody, CardTitle } from "reactstrap";
import BootstrapTable from "react-bootstrap-table-next"
import paginationFactory, {
  PaginationProvider,
} from "react-bootstrap-table2-paginator"
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import { unpaginatedTableSize } from 'config/globals';

class RAReleases extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			releases: [],
			release: {},
			releasemodal: false,
			releaseColumns: getReleaseColumns(this),
		};
	}

	componentDidMount() { 
		this.getReleases();
	}

	getReleases = () => {
		this.props.changePreloader(true);
		getReleasesReq()
		.then( (res) => {
			this.setState({releases: [...res.releases]});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch releases");
		}).finally( () => {
			this.props.changePreloader(false);
		});
	}

	toggleReleaseModal = (release) => {
		if(release?.refresh) {this.getReleases();}
		this.setState(prevState => ({
			releasemodal: !prevState.releasemodal, release
		}));
	}

	removeRelease = (releaseid) => {
		rmReleaseReq(releaseid)
		.then( (res) => {
			this.getReleases();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove release");
		});
	}

	pageListRenderer = () => {
		return (<></>);
	}

	render() {
		document.title = "Release Automation Releases";
		const {
			releases, release, releasemodal, releaseColumns,
		} = this.state;
		return (
			<React.Fragment>
				<ReleaseModal
					close={this.toggleReleaseModal}
					isOpen={releasemodal}
					release={release}
				/>
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
									// sizePerPage: releases.length,
									sizePerPage: unpaginatedTableSize,
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
			</React.Fragment>
		);
	}
}

RAReleases.propTypes = {
	changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { changePreloader })(RAReleases));