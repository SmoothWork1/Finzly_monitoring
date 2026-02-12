import PropTypes from 'prop-types';
import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import BootstrapTable from "react-bootstrap-table-next"
import ToolkitProvider from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import paginationFactory, { PaginationProvider } from "react-bootstrap-table2-paginator";
import { Card, CardBody, UncontrolledTooltip, CardTitle, DropdownToggle, Dropdown, DropdownMenu, DropdownItem, Row, Col, Button } from "reactstrap"
import { getEventsReq, rmEventReq } from "config/httpRoutes";
import { generalize, shortenString, getPagesArray, getCleanedDateTime } from "config/helpers";
import { alertError } from "config/toast";
import { paginatedTableSize } from 'config/globals.js';
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import EventModal from './EventModal';
import EventFilterModal from './EventFilterModal';

class Events extends Component {
	constructor(props) {
		super(props);
		this.state = {
			viewmodal: false,
			filtermodal: false,
			name: '',
			configuration: '',
			application: '',
			platform: '',
			event_type: '',
			total: 0,
			currentPage: 1,
			event: {},
			events: [],
			gridColumns: [
				{
					dataField: "id",
					text: "Event ID",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
								<span id={`UncontrolledTooltip${generalize(row.id)}EventId`}>{shortenString(row.id, 25)}</span>
								<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}EventId`}>
									{row.id}
								</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "name",
					text: "Name",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
								<span id={`UncontrolledTooltip${generalize(row.id)}EventName`}>{shortenString(row.name, 25)}</span>
								<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}EventName`}>
									{row.name}
								</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "configuration",
					text: "Configuration",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
								<span id={`UncontrolledTooltip${generalize(row.id)}EventConfiguration`}>{shortenString(row.configuration, 25)}</span>
								<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}EventConfiguration`}>
									{row.configuration}
								</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "application",
					text: "Application",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
								<span id={`UncontrolledTooltip${generalize(row.id)}EventApplication`}>{shortenString(row.application, 25)}</span>
								<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}EventApplication`}>
									{row.application}
								</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "platform",
					text: "Platform",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
								<span id={`UncontrolledTooltip${generalize(row.id)}EventPlatform`}>{shortenString(row.platform, 25)}</span>
								<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}EventPlatform`}>
									{row.platform}
								</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "event_type",
					text: "Event Type",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
								<span id={`UncontrolledTooltip${generalize(row.id)}EventType`}>{shortenString(row.event_type, 25)}</span>
								<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}EventType`}>
									{row.event_type}
								</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "created_at",
					text: "Created AT",
					sort: true,
					formatter: (cellContent, row) => {
						return (
							<>
								<span id={`UncontrolledTooltip${generalize(row.id)}CreatedAt`}>{getCleanedDateTime(row.created_at, 25)}</span>
								<UncontrolledTooltip placement="auto" target={`UncontrolledTooltip${generalize(row.id)}CreatedAt`}>
									{row.created_at}
								</UncontrolledTooltip>
							</>
						);
					}
				},
				{
					dataField: "view",
					isDummyField: true,
					text: "Actions",
					sort: false,
					formatter: (cellContent, row, i) => {
						return (
							<Dropdown
								isOpen={row.menu}
								toggle={() => { this.toggleAction(i) }}
								className="dropdown d-inline-block"
								tag="li"
							>
								<DropdownToggle
									className="btn header-item noti-icon position-relative"
									tag="button"
									id={`grid-table-${row.id}`}
								>
									{/* <i className="bx bx-dots-vertical" /> */}
									<i className="bx bx-dots-horizontal-rounded color-primary" />
								</DropdownToggle>

								<DropdownMenu className="dropdown-menu-end">
									<DropdownItem
										className={`notify-item align-middle`}
										onClick={() => { this.toggleViewModal(row) }}
									>
										<span className="text-success">Update</span>
									</DropdownItem>
									<DropdownItem
										className={`notify-item align-middle`}
										onClick={() => { this.removeEvent(row.id) }}
									>
										<span className="text-danger">Delete</span>
									</DropdownItem>
								</DropdownMenu>
							</Dropdown>
						);
					},
				}
			],
		}
		this.toLowerCase1 = this.toLowerCase1.bind(this)
	}

	toLowerCase1(str) {
		return str.toLowerCase();
	}

	componentDidMount() {
		this.getEvents();
	}

	getEvents = (page, filter) => {
		if (!page) {
			page = this.state.currentPage;
		}
		this.props.changePreloader(true);
		const { name, configuration, application, platform, event_type } = this.state;
		getEventsReq(
			page, filter || {
				name, configuration, application, platform, event_type
			}
		)
			.then((res) => {
				const events = res.events.map((evt) => ({
					...evt,
					menu: false
				}));
				this.setState({ events, viewmodal: false, currentPage: page, total: res.total });
			}).catch((err) => {
				alertError(err.response?.data?.message || "Could not fetch events details");
			}).finally(() => {
				this.props.changePreloader(false);
			});
	}

	removeEvent = (id) => {
		rmEventReq({ id })
			.then((res) => {
				this.getEvents();
			}).catch((err) => {
				alertError(err.response?.data?.message || "Could not remove event");
			}).finally(() => {
				this.setState({ fetchLoading: false });
			});
	}

	toggleAction = (i) => {
		const events = this.state.events.map((r, idx) => ({
			...r,
			menu: idx === i ? !r.menu : r.menu
		}));
		this.setState({ events });
	}

	toggleViewModal = (event) => {
		this.setState(prevState => ({
			viewmodal: !prevState.viewmodal, event
		}));
	}

	toggleFilterModal = (values) => {
		console.log('------------------');
		if (!values) {
			this.setState(prevState => ({
				filtermodal: !prevState.filtermodal
			}));
			return;
		}
		const { name, configuration, application, platform, event_type } = values;
		this.getEvents(this.state.currentPage, { name, configuration, application, platform, event_type });
		this.setState({ name, configuration, application, platform, event_type, filtermodal: false });
	}

	pageListRenderer = ({ pages, onPageChange }) => {
		const lastPage = Math.ceil(this.state.total / 10);
		const pagesArr = getPagesArray(this.state.currentPage, lastPage)
		const customPages = pagesArr.map((v, i) => ({
			page: v,
			title: `${v}`,
			active: this.state.currentPage === v,
			disabled: false,
			last: false, first: false
		}));
		if (pagesArr.indexOf(lastPage) === -1) {
			customPages.push({
				page: lastPage,
				title: `${lastPage}`,
				active: false,
				disabled: false,
				last: true, first: false
			});
		}
		if (pagesArr.indexOf(1) === -1) {
			customPages.unshift({
				page: 1,
				title: `1`,
				active: false,
				disabled: false,
				last: false, first: true
			});
		}
		return (
			<div className="pagination pagination-rounded justify-content-end">
				<ul className="pagination react-bootstrap-table-page-btns-ul">
					{customPages.map(p => (
						<React.Fragment key={`BO${p.page}OM`}>
							{p.last &&
								<li className="page-item">
									<a href="#" onClick={(e) => { e.preventDefault() }} className="page-link">{"..."}</a>
								</li>
							}
							<li className={p.active ? "page-item active" : "page-item"}>
								<a href="#" onClick={() => { onPageChange(p.page); !p.active && this.getQuotes(p.page) }} className="page-link">{p.page}</a>
							</li>
							{p.first &&
								<li className="page-item">
									<a href="#" onClick={(e) => { e.preventDefault() }} className="page-link">{"..."}</a>
								</li>
							}
						</React.Fragment>
					))}
				</ul>
			</div>
		)
	}

	render() {
		const { events, event, viewmodal, filtermodal, name, configuration, application, platform, event_type, gridColumns } = this.state;
		document.title = "Manage Events";
		return (
			<React.Fragment>
				<EventModal
					isOpen={viewmodal}
					toggle={() => { this.toggleViewModal({}) }}
					event={event}
					refresh={this.getEvents}
				/>
				<EventFilterModal
					isOpen={filtermodal}
					toggle={this.toggleFilterModal}
					filter={{ name, configuration, application, platform, event_type }}
				/>
				<Card style={{ marginTop: '5rem', marginRight: '0.4rem' }}>
					<CardBody>
						<div className="d-sm-flex flex-wrap" style={{ justifyContent: 'space-between' }}>
							<CardTitle className="card-title mb-4 h4">
								Events
							</CardTitle>
							<div>
								<i className="mdi mdi-filter cursor-pointer mr-2" style={{ fontSize: 20 }} onClick={() => { this.toggleFilterModal() }} />
								<span className="cursor-pointer mr-2" style={{ fontSize: 22 }} onClick={() => { this.toggleViewModal({}) }}>+</span>
								<i className="mdi mdi-refresh cursor-pointer" style={{ fontSize: 20 }} onClick={() => { this.getEvents() }} />
							</div>
						</div>
						{Array.isArray(events) && events.length > 0 && events[0].id &&
							<PaginationProvider
								pagination={paginationFactory({
									sizePerPage: paginatedTableSize,
									hideSizePerPage: true,
									hidePageListOnlyOnePage: true,
									showTotal: false,
									pageListRenderer: this.pageListRenderer,
								})}
								keyField='id'
								columns={gridColumns}
								data={events}
							>
								{({ paginationProps, paginationTableProps }) => (
									<ToolkitProvider
										keyField="id"
										data={events}
										columns={gridColumns}
										bootstrap4
									>
										{toolkitProps => (
											<React.Fragment>
												<div className="table-responsive">
													<BootstrapTable
														{...toolkitProps.baseProps}
														{...paginationTableProps}
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
								)}
							</PaginationProvider>
						}
					</CardBody>
				</Card>
			</React.Fragment>
		)
	}
}

Events.propTypes = {
	changePreloader: PropTypes.func,
};

export default withRouter(connect(null, { /* saveList, */ changePreloader })(Events));