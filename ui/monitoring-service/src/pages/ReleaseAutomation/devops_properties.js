import React from 'react';
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { withRouter } from "react-router-dom";
import { getDevOpsPropsReq, getEnvironmentsReq, rmDevOpsPropReq } from 'config/httpRARoutes';
import { generalize, getCleanedDateTime, shortenString } from 'config/helpers';
import { Card, CardBody, CardTitle, Col, Row, UncontrolledTooltip } from "reactstrap";
import DevOpsPropsModal from './devopsPropsModal.js';
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationProvider,
} from "react-bootstrap-table2-paginator";
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import { unpaginatedTableSize } from 'config/globals.js';
import DevOpsPropsFilterModal from './devOpsPropsFilterModal.js';
import { alertError } from 'config/toast.js';

const getDevOpsPropertiesColumns = (page) => [
	{
		dataField: "prop_key",
		text: "Property Key",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.prop_key)}PropertyKey`}>{shortenString(row.prop_key, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.prop_key)}PropertyKey`}>
				{row.prop_key}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "value",
		text: "Value",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.prop_key)}Value`}>{shortenString(row.value, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.prop_key)}Value`}>
				{row.value}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "env",
		text: "Environment",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.prop_key)}Environment`}>{shortenString(row.env, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.prop_key)}Environment`}>
				{row.env}
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
			<span id={`UncontrolledTooltip${generalize(row.prop_key)}CreatedOnStr`}>{shortenString(row.createdOnStr, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.prop_key)}CreatedOnStr`}>
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
			<span id={`UncontrolledTooltip${generalize(row.prop_key)}DevOpsPropsStatus`}>{shortenString(row.status, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.prop_key)}DevOpsPropsStatus`}>
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
						<i className="mdi my-fs-1 cursor-pointer mdi-pencil mr-2" onClick={() => {page.toggleDevOpsPropModal(row)}} />
						<i className="mdi my-fs-1 cursor-pointer mdi-delete" onClick={() => {page.removeDevOpsProperty(row.prop_key)}} />
					</Col>
				</Row>
			);
		},
	}
]

class RADevOpsProperties extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			devops_properties: [],
			devops_property: {},
			devops_prop_modal: false,
			devopsPropertiesColumns: getDevOpsPropertiesColumns(this),

			prop_key: '',
			value: '',
			env: '',
			status: '',
			filtermodal: false,

			environments: null
		}
	}

	componentDidMount() { 
		this.getDevOpsProperties();
		this.getPreReqs();
	}

	getPreReqs = async () => {
		try {
			const environments = (await getEnvironmentsReq()).environments;
			this.setState({environments}, () => {
				this.props.changePreloader(false);
			});
		} catch(err) {
			alertError("Could not fetch required data");
		}
	}

	getDevOpsProperties = (filter) => {
		this.props.changePreloader(true);
		const { prop_key, value, env, status } = this.state;
		getDevOpsPropsReq(
			filter || {
				prop_key, value, env, status
			}
		)
		.then( (res) => {
			this.setState({devops_properties: [...res.devops_properties.map( (prop) => ({
					...prop,
					createdOnStr: getCleanedDateTime(prop.created_on),
					created_on: new Date(prop.created_on),
				}))]
			});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch devops properties");
		}).finally( () => {
			this.props.changePreloader(false);
		});
	}

	toggleDevOpsPropModal = (devops_property) => {
		if(devops_property?.refresh) {this.getDevOpsProperties();}
		this.setState(prevState => ({
			devops_prop_modal: !prevState.devops_prop_modal, devops_property
		}));
	}

	removeDevOpsProperty = (prop_key) => {
		rmDevOpsPropReq(prop_key)
		.then( (res) => {
			this.getDevOpsProperties();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove devops property");
		});
	}

	pageListRenderer = () => {
		return (<></>);
	}

	toggleFilterModal = (values) => {
		if(!values) {
		  this.setState(prevState => ({
			filtermodal: !prevState.filtermodal
		  }));
		  return;
		}
		const { prop_key, value, env, status } = values;
		this.getDevOpsProperties({ prop_key, value, env, status });
		this.setState({prop_key, value, env, status, filtermodal: false});
	}

	render() {
		document.title = "Release Automation DevOps Properties";
		const {
			devops_properties, devops_property, devops_prop_modal, devopsPropertiesColumns, environments,
			prop_key, value, env, status, filtermodal
		} = this.state;
		return (
			<React.Fragment>
				<DevOpsPropsModal
					close={this.toggleDevOpsPropModal}
					isOpen={devops_prop_modal}
					devops_property={devops_property}
					environments={environments}
				/>
				<DevOpsPropsFilterModal
					isOpen={filtermodal}
					toggle={this.toggleFilterModal}
					filter={{prop_key, value, env, status}}
					environments={environments}
				/>
				<Card style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<CardBody>
						<div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
							<CardTitle className="card-title mb-4 h4">
								DevOps Properties
							</CardTitle>
							<div>
								<i className="mdi mdi-filter cursor-pointer mr-2" style={{fontSize: 20}} onClick={() => {this.toggleFilterModal()}} />
								<span className="cursor-pointer mr-2" style={{fontSize: 22}} onClick={() => {this.toggleDevOpsPropModal({})}}>+</span>
								<i className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={() => {this.getDevOpsProperties()}} />
							</div>
						</div>
						{Array.isArray(devops_properties) && devops_properties.length > 0 && devops_properties[0].prop_key &&
							<PaginationProvider
								pagination={paginationFactory({
									// sizePerPage: devops_properties.length,
									sizePerPage: unpaginatedTableSize,
									hideSizePerPage: true,
									hidePageListOnlyOnePage: true,
									showTotal: false,
									pageListRenderer: this.pageListRenderer,
								})}
								keyField='id'
								columns={devopsPropertiesColumns}
								data={devops_properties}
							>
								{({ paginationProps, paginationTableProps }) => (
								<ToolkitProvider
									keyField="id"
									data={devops_properties}
									columns={devopsPropertiesColumns}
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

RADevOpsProperties.propTypes = {
	changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { changePreloader })(RADevOpsProperties));