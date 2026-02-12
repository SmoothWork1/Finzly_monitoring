import React from 'react';
import PropTypes from "prop-types";
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { withRouter } from "react-router-dom";
import { getDBSchemaUpdatesReq, rmDBSchemaUpdateReq } from 'config/httpRARoutes';
import { Card, CardBody, CardTitle, Col, Row, UncontrolledTooltip } from "reactstrap";
import DBSchemaModal from './dbSchemaModal.js';
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
  PaginationProvider,
} from "react-bootstrap-table2-paginator";
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import { generalize, getCleanedDateTime, shortenString } from 'config/helpers.js';
import { alertError } from 'config/toast.js';
import { unpaginatedTableSize } from 'config/globals.js';

const getDBSchemaColumns = (page) => [
	{
		dataField: "id",
		text: "ID",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}ID`}>{shortenString(row.id, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ID`}>
				{row.id}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "app_code",
		text: "App Code",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}AppCode`}>{shortenString(row.app_code, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}AppCode`}>
				{row.app_code}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "entity_type",
		text: "Entity Type",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}EntityType`}>{shortenString(row.entity_type, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}EntityType`}>
				{row.entity_type}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "schema_sql",
		text: "Schema SQL",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}SchemaSQL`}>{shortenString(row.schema_sql, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}SchemaSQL`}>
				{row.schema_sql}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "schema_order",
		text: "Schema Order",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}SchemaOrder`}>{shortenString(row.schema_order, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}SchemaOrder`}>
				{row.schema_order}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "schema_release",
		text: "Schema Release",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}SchemaRelease`}>{shortenString(row.schema_release, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}SchemaRelease`}>
				{row.schema_release}
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
			<span id={`UncontrolledTooltip${generalize(row.id)}Status`}>{shortenString(row.status, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}Status`}>
				{row.status}
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
		dataField: "updatedOnStr",
		text: "Updated On",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}UpdatedOnStr`}>{shortenString(row.updatedOnStr, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}UpdatedOnStr`}>
				{row.updatedOnStr}
			</UncontrolledTooltip>
			</>
		),
	},
	{
		dataField: "comments",
		text: "Comments",
		sort: true,
		formatter: (cellContent, row) => (
			<>
			<span id={`UncontrolledTooltip${generalize(row.id)}Comments`}>{shortenString(row.comments, 25)}</span>
			<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}Comments`}>
				{row.comments}
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
						<i className="mdi my-fs-1 cursor-pointer mdi-pencil mr-2" onClick={() => {page.toggleDBSchemaModal(row)}} />
						<i className="mdi my-fs-1 cursor-pointer mdi-delete" onClick={() => {page.removeDBSchema(row.id)}} />
					</Col>
				</Row>
			);
		},
	}
]

class RADBSchemaUpdates extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			db_schemas: [],
			db_schema: {},
			db_schema_modal: false,
			dbSchemaColumns: getDBSchemaColumns(this),
		}
	}

	componentDidMount() { 
		this.getDBSchemas();
	}

	getDBSchemas = () => {
		this.props.changePreloader(true);
		getDBSchemaUpdatesReq()
		.then( (res) => {
			this.setState({db_schemas: [...res.db_schemas.map( (dbsch) => ({
				...dbsch,
				createdOnStr: getCleanedDateTime(dbsch.created_on),
				created_on: new Date(dbsch.created_on),
				updatedOnStr: getCleanedDateTime(dbsch.updated_on),
				updated_on: new Date(dbsch.updated_on),
				badgeclass: dbsch.status === "Active" ? 'success' : (dbsch.status === "disabled" ? 'danger' : 'warning')
			}))]});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch db schemas");
		}).finally( () => {
			this.props.changePreloader(false);
		});
	}

	toggleDBSchemaModal = (db_schema) => {
		if(db_schema?.refresh) {this.getDBSchemas();}
		this.setState(prevState => ({
			db_schema_modal: !prevState.db_schema_modal, db_schema
		}));
	}

	removeDBSchema = (schemaid) => {
		rmDBSchemaUpdateReq(schemaid)
		.then( (res) => {
			this.getDBSchemas();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not remove db schemas");
		});
	}

	pageListRenderer = () => {
		return (<></>);
	}

	render() {
		document.title = "Release Automation DB Schema & Updates";
		const {
			db_schemas, db_schema, db_schema_modal, dbSchemaColumns
		} = this.state;
		return (
			<React.Fragment>
				<DBSchemaModal
					close={this.toggleDBSchemaModal}
					isOpen={db_schema_modal}
					db_schema={db_schema}
				/>
				<Card style={{marginTop: '5rem', marginRight: '0.4rem'}}>
					<CardBody>
						<div className="d-sm-flex flex-wrap" style={{justifyContent: 'space-between'}}>
							<CardTitle className="card-title mb-4 h4">
								DB Schemas & Updates
							</CardTitle>
							<div>
								<span className="cursor-pointer mr-2" style={{fontSize: 22}} onClick={() => {this.toggleDBSchemaModal({})}}>+</span>
								<i className="mdi mdi-refresh cursor-pointer" style={{fontSize: 20}} onClick={() => {this.getDBSchemas()}} />
							</div>
						</div>
						{Array.isArray(db_schemas) && db_schemas.length > 0 && db_schemas[0].id &&
							<PaginationProvider
								pagination={paginationFactory({
									// sizePerPage: db_schemas.length,
									sizePerPage: unpaginatedTableSize,
									hideSizePerPage: true,
									hidePageListOnlyOnePage: true,
									showTotal: false,
									pageListRenderer: this.pageListRenderer,
								})}
								keyField='id'
								columns={dbSchemaColumns}
								data={db_schemas}
							>
								{({ paginationProps, paginationTableProps }) => (
								<ToolkitProvider
									keyField="id"
									data={db_schemas}
									columns={dbSchemaColumns}
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

RADBSchemaUpdates.propTypes = {
	changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { changePreloader })(RADBSchemaUpdates));