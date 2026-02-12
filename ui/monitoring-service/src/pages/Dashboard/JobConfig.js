import PropTypes from 'prop-types';
import axios from 'axios';
import qs from 'querystring'
import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import BootstrapTable from "react-bootstrap-table-next"
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import paginationFactory, { PaginationProvider } from "react-bootstrap-table2-paginator";
import { Card, CardBody, UncontrolledTooltip, CardTitle, DropdownToggle, Dropdown, DropdownMenu, DropdownItem, Row, Col, Button } from "reactstrap"
import { getActiveTenantsReq, getJobConfigsReq } from "config/httpRoutes";
import { generalize, shortenString, getPagesArray } from "config/helpers";
import { alertError } from "config/toast";
import { paginatedTableSize } from 'config/globals.js';
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';

class JobConfig extends Component {
	constructor(props) {
		super(props);
		this.state = {
			dropdown: false,
			total: 0,
			currentPage: 1,
			jobconfigs: [],
			tenants: [],
			selected_tenant: {},
			gridColumns: [
				{
					dataField: "id",
					text: "Schedule ID",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
								<span id={`UncontrolledTooltip${generalize(row.id)}JobConfigId`}>{shortenString(row.id, 25)}</span>
								<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}JobConfigId`}>
									{row.id}
								</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "prject_id",
					text: "Project ID",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
								<span id={`UncontrolledTooltip${generalize(row.id)}ProjectId`}>{shortenString(row.project_id, 25)}</span>
								<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ProjectId`}>
									{row.project_id}
								</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "project",
					text: "Project Name",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
								<span id={`UncontrolledTooltip${generalize(row.id)}ProjectName`}>{shortenString(row.project, 25)}</span>
								<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}ProjectName`}>
									{row.project}
								</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "flow_id",
					text: "Flow ID",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
								<span id={`UncontrolledTooltip${generalize(row.id)}FlowId`}>{shortenString(row.flow_id, 25)}</span>
								<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}FlowId`}>
									{row.flow_id}
								</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "cron",
					text: "Cron Expression",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
								<span id={`UncontrolledTooltip${generalize(row.id)}CronExpression`}>{shortenString(row.cron, 25)}</span>
								<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}CronExpression`}>
									{row.cron}
								</UncontrolledTooltip>
							</>
						);
					}
				}
			],
		}
		this.toLowerCase1 = this.toLowerCase1.bind(this)
	}

	toLowerCase1(str) {
		return str.toLowerCase();
	}

	componentDidMount() {
		this.getActiveTenants()
	}

	getActiveTenants = async () => {
		getActiveTenantsReq()
		.then((res) => {
			const tenants = res.total_tenants.map((jc, key) => ({
				...jc,
				key: key
			}));
			this.setState({ tenants, selected_tenant: tenants[0] }, function() {
				this.getJobConfigs();
			});
		}).catch((err) => {
			alertError(err.response?.data?.message || "Could not fetch job configs details");
		}).finally(() => {
			this.props.changePreloader(false);
		});
	}

	getJobConfigs = async () => {
		this.props.changePreloader(true);
		const { selected_tenant } = this.state;
		
		getJobConfigsReq(selected_tenant.stage, selected_tenant.name)
		.then((res) => {
			const jobconfigs = res.job_configs.map((evt) => ({
				...evt,
			}));
			this.setState({ jobconfigs });
		}).catch((err) => {
			alertError(err.response?.data?.message || "Could not fetch job configs");
		}).finally(() => {
			this.props.changePreloader(false);
		});
	}

	toggle = () => {
		this.setState(prevState => ({
		  dropdown: !prevState.dropdown,
		}))
	}

	changeTenantAction = (tenant) => {
		//set language as i18n
		this.setState({ selected_tenant: tenant }, function() {
			this.getJobConfigs();
		})
	}

	// pageListRenderer = ({ pages, onPageChange }) => {
	// 	const lastPage = Math.ceil(this.state.total / 10);
	// 	const pagesArr = getPagesArray(this.state.currentPage, lastPage)
	// 	const customPages = pagesArr.map((v, i) => ({
	// 		page: v,
	// 		title: `${v}`,
	// 		active: this.state.currentPage === v,
	// 		disabled: false,
	// 		last: false, first: false
	// 	}));
	// 	if (pagesArr.indexOf(lastPage) === -1) {
	// 		customPages.push({
	// 			page: lastPage,
	// 			title: `${lastPage}`,
	// 			active: false,
	// 			disabled: false,
	// 			last: true, first: false
	// 		});
	// 	}
	// 	if (pagesArr.indexOf(1) === -1) {
	// 		customPages.unshift({
	// 			page: 1,
	// 			title: `1`,
	// 			active: false,
	// 			disabled: false,
	// 			last: false, first: true
	// 		});
	// 	}
	// 	return (
	// 		<div className="pagination pagination-rounded justify-content-end">
	// 			<ul className="pagination react-bootstrap-table-page-btns-ul">
	// 				{customPages.map(p => (
	// 					<React.Fragment key={`BO${p.page}OM`}>
	// 						{p.last &&
	// 							<li className="page-item">
	// 								<a href="#" onClick={(e) => { e.preventDefault() }} className="page-link">{"..."}</a>
	// 							</li>
	// 						}
	// 						<li className={p.active ? "page-item active" : "page-item"}>
	// 							<a href="#" onClick={() => { onPageChange(p.page); !p.active && this.getQuotes(p.page) }} className="page-link">{p.page}</a>
	// 						</li>
	// 						{p.first &&
	// 							<li className="page-item">
	// 								<a href="#" onClick={(e) => { e.preventDefault() }} className="page-link">{"..."}</a>
	// 							</li>
	// 						}
	// 					</React.Fragment>
	// 				))}
	// 			</ul>
	// 		</div>
	// 	)
	// }

	render() {
		const { jobconfigs, gridColumns, dropdown, tenants, selected_tenant } = this.state;
		document.title = "Job Configs";
		return (
			<React.Fragment>
				<Card style={{ marginTop: '5rem', marginRight: '0.4rem' }}>
					<CardBody>
						<div className="d-sm-flex flex-wrap" style={{ justifyContent: 'space-between' }}>
							<CardTitle className="card-title mb-4 h4">
								Job Configs
							</CardTitle>
							<div>
								<i className="mdi mdi-refresh cursor-pointer" style={{ fontSize: 20 }} onClick={() => { this.getJobConfigs() }} />
							</div>
						</div>
						<div className="d-sm-flex flex-wrap" style={{ justifyContent: 'flex-start', marginBottom: '10px' }}>
							<Dropdown isOpen={dropdown} toggle={this.toggle} direction='down'>
								<DropdownToggle>
									{
										selected_tenant.name? selected_tenant.name:'Tenant'
									}
								</DropdownToggle>
								<DropdownMenu>
									{
										tenants.map((tenant, key) => 
											<DropdownItem
												key={key}
												onClick={() => this.changeTenantAction(tenant)}
												className={`notify-item ${selected_tenant.key === key ? "active" : "none"}`}
											>
												{tenant.name}
											</DropdownItem>
										)
									}
								</DropdownMenu>
							</Dropdown>
						</div>
						{Array.isArray(jobconfigs) && jobconfigs.length > 0 && jobconfigs[0].id &&
							// <PaginationProvider
							// 	pagination={paginationFactory({
							// 		sizePerPage: paginatedTableSize,
							// 		hideSizePerPage: true,
							// 		hidePageListOnlyOnePage: true,
							// 		showTotal: false,
							// 		pageListRenderer: this.pageListRenderer,
							// 	})}
							// 	keyField='id'
							// 	columns={gridColumns}
							// 	data={jobconfigs}
							// >
							// 	{({ paginationProps, paginationTableProps }) => (
									<ToolkitProvider
										keyField="id"
										data={jobconfigs}
										columns={gridColumns}
										bootstrap4
									>
										{toolkitProps => (
											<React.Fragment>
												<div className="table-responsive">
													<BootstrapTable
														{...toolkitProps.baseProps}
														// {...paginationTableProps}
														responsive
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
							// 	)}
							// </PaginationProvider>
						}
					</CardBody>
				</Card>
			</React.Fragment>
		)
	}
}

JobConfig.propTypes = {
	changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { /* saveList, */ changePreloader })(JobConfig));