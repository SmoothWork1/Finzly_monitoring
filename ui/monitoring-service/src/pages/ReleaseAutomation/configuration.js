import React from 'react';
import PropTypes from "prop-types";
import { alertError } from 'config/toast';
import { getConfigsReq, getEnvironmentsReq, getReleasesReq, rmConfigReq } from 'config/httpRARoutes';
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { withRouter } from "react-router-dom";
import { generalize, getCleanedDateTime, shortenString } from 'config/helpers';
import { Button, Card, CardBody, Col, Row, UncontrolledTooltip, CardTitle } from "reactstrap";
import ConfigModal from './configurationModal';
import BootstrapTable from "react-bootstrap-table-next"
import paginationFactory, {
  PaginationProvider,
} from "react-bootstrap-table2-paginator"
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import ConfigurationFilterModal from './configurationFilterModal';
import { unpaginatedTableSize } from 'config/globals';

const getConfigColumns = (page) => [
	{
		dataField: "field_group",
		text: "Field Group",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(`${row.property_key}`)}FieldGroup`}>{shortenString(row.field_group, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(`${row.property_key}`)}FieldGroup`}>
				{row.field_group}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "application",
		text: "Application",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(`${row.property_key}`)}Application`}>{shortenString(row.application, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(`${row.property_key}`)}Application`}>
				{row.application}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "property_key",
		text: "Property Key",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(`${row.property_key}`)}PropertyKey`}>{shortenString(row.property_key, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(`${row.property_key}`)}PropertyKey`}>
				{row.property_key}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "property_value",
		text: "Property Value",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(`${row.property_key}`)}PropertyValue`}>{shortenString(row.property_value, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(`${row.property_key}`)}PropertyValue`}>
				{row.property_value}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "target",
		text: "Target",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(`${row.property_key}`)}Target`}>{shortenString(row.target, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(`${row.property_key}`)}Target`}>
				{row.target}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "product",
		text: "Product",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(`${row.property_key}`)}Product`}>{shortenString(row.product, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(`${row.property_key}`)}Product`}>
				{row.product}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "app_code",
		text: "Host App",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(`${row.property_key}`)}AppCode`}>{shortenString(row.app_code, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(`${row.property_key}`)}AppCode`}>
				{row.app_code}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "type",
		text: "Type",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(`${row.property_key}`)}Type`}>{shortenString(row.type, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(`${row.property_key}`)}Type`}>
				{row.type}
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
			<span id={`UncontrolledTooltip${generalize(`${row.property_key}`)}CreatedOn`}>{shortenString(row.createdOnStr, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(`${row.property_key}`)}CreatedOn`}>
				{row.createdOnStr}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "updatedOnStr",
		text: "Updated On",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(`${row.property_key}`)}UpdatedOn`}>{shortenString(row.updatedOnStr, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(`${row.property_key}`)}UpdatedOn`}>
				{row.updatedOnStr}
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
	// {
	// 	dataField: "property_action",
	// 	text: "Property Action",
	// 	sort: true,
	// 	formatter: (cellContent, row) => (
	// 		<>
	// 		<span id={`UncontrolledTooltip${generalize(`${row.property_key}`)}PropertyAction`}>{shortenString(row.property_action, 25)}</span>
	// 		<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(`${row.property_key}`)}PropertyAction`}>
	// 			{row.property_action}
	// 		</UncontrolledTooltip>
	// 		</>
	// 	),
	// },
	// {
	// 	dataField: "release_id",
	// 	text: "Release ID",
	// 	sort: true,
	// 	formatter: (cellContent, row) => (
	// 		<>
	// 		<span id={`UncontrolledTooltip${generalize(`${row.property_key}`)}ReleaseID`}>{shortenString(row.release_id, 25)}</span>
	// 		<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(`${row.property_key}`)}ReleaseID`}>
	// 			{row.release_id}
	// 		</UncontrolledTooltip>
	// 		</>
	// 	),
	// },
	// {
	// 	dataField: "env_id",
	// 	text: "Environment ID",
	// 	sort: true,
	// 	formatter: (cellContent, row) => (
	// 		<>
	// 		<span id={`UncontrolledTooltip${generalize(`${row.property_key}`)}EnvironmentID`}>{shortenString(row.env_id, 25)}</span>
	// 		<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(`${row.property_key}`)}EnvironmentID`}>
	// 			{row.env_id}
	// 		</UncontrolledTooltip>
	// 		</>
	// 	),
	// },
	{
		dataField: "view",
		isDummyField: true,
		text: "Actions",
		sort: false,
		formatter: (cellContent, row, i) => {
			return (
				<Row className="mb-2" style={{marginTop: '0rem', marginRight: '0rem'}}>
					<Col sm="12">
						<i className="mdi my-fs-1 cursor-pointer mdi-pencil mr-2" onClick={() => {page.toggleViewModal(row)}} />
						<i className="mdi my-fs-1 cursor-pointer mdi-delete" onClick={() => {page.removeConfiguration(row.property_key/* , row.release_id, row.env_id */)}} />
					</Col>
				</Row>
			);
		},
	}
];

class RAConfiguration extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			configurations: [],
			config: {},
			viewmodal: false,

			filtermodal: false,
			field_group: '',
			application: '',
			property_key: '',
			property_value: '',
			product: '',
			app_code: '',
			target: '',
			type: '',
			status: '',
			// release_id: '',

			gridColumns: getConfigColumns(this),

			// environments: null,
			// releases: null,
		};
	}

	componentDidMount() { 
		// this.getPreReqs();
		this.getConfigs();
	}

	getConfigs = (filter) => {
		this.props.changePreloader(true);
		const { field_group, application, property_key, property_value, /* release_id, */ product, app_code, target, type, status } = this.state;
		getConfigsReq(
			filter || {
				field_group, application, property_key, property_value, /* release_id, */ product, app_code, target, type, status
			}
		)
		.then( (res) => {
			this.setState({configurations: [...res.configurations.map( (c) => ({
				...c,
				key: `${c.property_key}`, // `${c.property_key}${c.release_id}${c.env_id}`
				createdOnStr: getCleanedDateTime(c.created_on),
				created_on: new Date(c.created_on),
				updatedOnStr: getCleanedDateTime(c.updated_on),
				updated_on: new Date(c.updated_on),
				badgeclass: c.status === "Active" ? 'success' : (c.status === "disabled" ? 'danger' : 'warning')
			}))]});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch configurations");
		}).finally( () => {
			this.props.changePreloader(false);
		});
	}

	// getPreReqs = async () => {
	// 	try {
	// 		const environments = (await getEnvironmentsReq()).environments;
	// 		const releases = (await getReleasesReq()).releases;
	// 		this.setState({environments, releases});
	// 	} catch(err) {
	// 		alertError("Could not fetch required data");
	// 	}
	// }

	toggleViewModal = (config) => {
		if(config?.refresh) {this.getConfigs();}
		this.setState(prevState => ({
			viewmodal: !prevState.viewmodal, config
		}));
	}

	removeConfiguration = (propkey/* , releaseid, envid */) => {
		rmConfigReq(propkey/* , releaseid, envid */)
		.then( (res) => {
			this.getConfigs();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove configuration");
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
		const { field_group, application, property_key, property_value/* , release_id */ } = values;
		this.getConfigs({ field_group, application, property_key, property_value/* , release_id */ });
		this.setState({field_group, application, property_key, property_value, /* release_id, */ filtermodal: false});
	}

	render() {
		document.title = "Release Automation Configuration";
		const { configurations, config, viewmodal, gridColumns, /* environments, releases, */ filtermodal, field_group, application, property_key, property_value, /* release_id, */ product, app_code, target, type, status } = this.state;
		return (
			<React.Fragment>
				<ConfigModal
					close={this.toggleViewModal}
					isOpen={viewmodal}
					config={config}
					// environments={environments}
					// releases={releases}
				/>
				<ConfigurationFilterModal
					isOpen={filtermodal}
					toggle={this.toggleFilterModal}
					filter={{field_group, application, property_key, property_value, /* release_id, */ product, app_code, target, type, status}}
				/>
				{/* <Row className="mb-2" style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<Col sm="12">
						<div className="text-sm-end d-none d-sm-block">
						<Button
							color="primary"
							className={`fs-filter btn-block btn btn-filter btn-primary mr-1`}
							onClick={() => {this.toggleViewModal({})}}
						>
							Add Configuration
						</Button>
						</div>
					</Col>
				</Row> */}
				<Card style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<CardBody>
						<div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
							<CardTitle className="card-title mb-4 h4">
								Configurations
							</CardTitle>
							<div>
								<i className="mdi mdi-filter cursor-pointer mr-2" style={{fontSize: 20}} onClick={() => {this.toggleFilterModal()}} />
								<span className="cursor-pointer mr-2" style={{fontSize: 22}} onClick={() => {this.toggleViewModal({})}}>+</span>
								<i className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={() => {this.getConfigs()}} />
							</div>
						</div>
						{Array.isArray(configurations) && configurations.length > 0 && configurations[0].property_key &&
							<PaginationProvider
								pagination={paginationFactory({
									// sizePerPage: configurations.length,
									sizePerPage: unpaginatedTableSize,
									hideSizePerPage: true,
									hidePageListOnlyOnePage: true,
									showTotal: false,
									pageListRenderer: this.pageListRenderer,
								})}
								keyField='key'
								columns={gridColumns}
								data={configurations}
							>
								{({ paginationProps, paginationTableProps }) => (
								<ToolkitProvider
									keyField="key"
									data={configurations}
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

RAConfiguration.propTypes = {
	changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { changePreloader })(RAConfiguration));