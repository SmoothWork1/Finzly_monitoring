import React from 'react';
import { getDashboardReq, getUsersReq } from 'config/httpRoutes';
import { alertError } from 'config/toast';
import Breadcrumbs from 'components/Common/Breadcrumb';
import { Card, CardBody, CardTitle, Col, Container, Row, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import WelcomeComp from './WelcomeComp';
import MonthlyEarning from './MonthlyEarning';
import WeeklyMonitoringPieChart from './WeeklyMonitoringPieChart';
import { propTypes } from 'react-bootstrap-editable';
import { withTranslation } from 'react-i18next';
import { eventTitles } from 'config/globals';
import { getCleanedDateTime, getTimeDifferenceFromNow, safelyParseJSONObj, shortenString } from 'config/helpers';
import GridDetailsModal from './GridDetailsModal';
import { connect } from 'react-redux';
import { changePreloader } from 'store/actions';
import { sendMessage } from 'config/websocket';
import { saveList } from 'actions/lists';

class Dashboard extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			totals: null,
			active: null,
			ignored: null,
			resolved: null,
			userActives: null,
			"Assigned Active": null,
			userResolved: null,
			latest: null,
			selectedStatus: 'active',
			viewmodal: false,
			event: {},
			users: null,
			activeTab: '1'
		};

		this.toggleTab = this.toggleTab.bind(this);
	}

	selectStatus = (selectedStatus) => {
		this.setState({ selectedStatus });
	}

	componentDidMount() {
		this.getDashboard();
		this.getUsers();
	}

	getUsers = () => {
		getUsersReq()
			.then((res) => {
				this.setState({ users: res.users });
			}).catch((err) => {
				alertError(err.response?.data?.message || "Could not fetch required data");
			});
	}

	getDashboard = () => {
		const error = sendMessage('events', { actionPack: 'dashboard', user_id: this.props.userid });
		if (error) {
			this.getDashboardAsync();
		}
	}
	getDashboardAsync = () => {
		this.props.changePreloader(true);
		getDashboardReq()
			.then((res) => {
				res.active = res.active.map((r) => ({
					...r,
					created_atStr: getCleanedDateTime(r.created_at),
					updated_atStr: getCleanedDateTime(r.updated_at),
					created_at: new Date(r.created_at),
					updated_at: new Date(r.updated_at),
					details: safelyParseJSONObj(r.details),
					badgeclass: r.status === "Active" ? 'danger' : (r.status === "Resolved" ? 'success' : 'warning')
				}));
				res.ignored = res.ignored.map((r) => ({
					...r,
					created_atStr: getCleanedDateTime(r.created_at),
					updated_atStr: getCleanedDateTime(r.updated_at),
					created_at: new Date(r.created_at),
					updated_at: new Date(r.updated_at),
					details: safelyParseJSONObj(r.details),
					badgeclass: r.status === "Active" ? 'danger' : (r.status === "Resolved" ? 'success' : 'warning')
				}));
				res.resolved = res.resolved.map((r) => ({
					...r,
					created_atStr: getCleanedDateTime(r.created_at),
					updated_atStr: getCleanedDateTime(r.updated_at),
					created_at: new Date(r.created_at),
					updated_at: new Date(r.updated_at),
					details: safelyParseJSONObj(r.details),
					badgeclass: r.status === "Active" ? 'danger' : (r.status === "Resolved" ? 'success' : 'warning')
				}));
				res["Assigned Active"] = res.userActives.map((r) => ({
					...r,
					created_atStr: getCleanedDateTime(r.created_at),
					updated_atStr: getCleanedDateTime(r.updated_at),
					created_at: new Date(r.created_at),
					updated_at: new Date(r.updated_at),
					details: safelyParseJSONObj(r.details),
					badgeclass: r.status === "Active" ? 'danger' : (r.status === "Resolved" ? 'success' : 'warning')
				}));
				// this.setState({...res, latest: res.active});
				this.props.saveList({ ...res, latest: res.active });
			}).catch((err) => {
				alertError(err.response?.data?.message || "Could not fetch dashboard");
			}).finally(() => {
				this.props.changePreloader(false);
			});
	}

	toggleViewModal = (event) => {
		this.setState(prevState => ({
			viewmodal: !prevState.viewmodal, event
		}))
	}

	cleanStatus = (status) => {
		if (status === 'userActives') {
			return 'Assigned Active';
		}
	}

	toggleTab(tab) {
		if (this.state.activeTab !== tab) {
			this.setState({
				activeTab: tab
			});
		}
	}

	render() {
		document.title = "Monitoring Dashboard";
		return (
			<React.Fragment>
				<GridDetailsModal
					isOpen={this.state.viewmodal}
					toggle={() => { this.toggleViewModal({}) }}
					event={this.state.event}
					users={this.state.users}
				// refresh={this.getDashboard}
				/>
				<div className="page-content">
					<Container fluid>
						{/* Render Breadcrumb */}
						<Breadcrumbs
							title={this.props.t("Dashboards")}
							breadcrumbItem={this.props.t("Dashboard")}
						/>
						<Nav tabs>
							<NavItem>
								<NavLink
									className={this.state.activeTab === '1'? 'active':''}
									onClick={() => { this.toggleTab('1'); }}
								>
									Incidents
								</NavLink>
							</NavItem>
							<NavItem>
								<NavLink
									className={this.state.activeTab === '2'? 'active':''}
									onClick={() => { this.toggleTab('2'); }}
								>
									Chart
								</NavLink>
							</NavItem>
						</Nav>
						<TabContent activeTab={this.state.activeTab} style={{ paddingTop: '10px'}}>
							<TabPane tabId="1">
								<Row>
									<Col xl="4">
										<WelcomeComp
											// actives={this.state['Assigned Active'] && this.state['Assigned Active'].length}
											// resolveds={this.state.userResolved && this.state.userResolved.length}
											actives={this.props.userActives && this.props.userActives.length}
											resolveds={this.props.userResolved && this.props.userResolved.length}
											selectStatus={this.selectStatus}
										/>
										<MonthlyEarning />
									</Col>
									<Col xl="8">
										<Row>
											<Col md="4">
												<Card className={`mini-stats-wid cursor-pointer ${this.state.selectedStatus === 'active' ? 'selected-list-box' : ''}`} onClick={() => { this.selectStatus('active') }}>
													<CardBody>
														<div className="d-flex">
															<div className="flex-grow-1">
																<p className="text-muted fw-medium">
																	Open Items
																</p>
																<h4 className="mb-0">{this.props.totals?.Active || 0}</h4>
															</div>
															<div className="mini-stat-icon avatar-sm rounded-circle bg-primary align-self-center">
																<span className="avatar-title bg-danger">
																	<i className={"bx bx-copy-alt font-size-24"} />
																</span>
															</div>
														</div>
													</CardBody>
												</Card>
											</Col>
											<Col md="4">
												<Card className={`mini-stats-wid cursor-pointer ${this.state.selectedStatus === 'ignored' ? 'selected-list-box' : ''}`} onClick={() => { this.selectStatus('ignored') }}>
													<CardBody>
														<div className="d-flex">
															<div className="flex-grow-1">
																<p className="text-muted fw-medium">
																	Ignored Items
																</p>
																<h4 className="mb-0">{this.props.totals?.Ignored || 0}</h4>
															</div>
															<div className="mini-stat-icon avatar-sm rounded-circle bg-primary align-self-center">
																<span className="avatar-title bg-info">
																	<i className={"bx bx-copy-alt font-size-24"} />
																</span>
															</div>
														</div>
													</CardBody>
												</Card>
											</Col>
											<Col md="4">
												<Card className={`mini-stats-wid cursor-pointer ${this.state.selectedStatus === 'resolved' ? 'selected-list-box' : ''}`} onClick={() => { this.selectStatus('resolved') }}>
													<CardBody>
														<div className="d-flex">
															<div className="flex-grow-1">
																<p className="text-muted fw-medium">
																	Resolved Items
																</p>
																<h4 className="mb-0">{this.props.totals?.Resolved || 0}</h4>
															</div>
															<div className="mini-stat-icon avatar-sm rounded-circle bg-primary align-self-center">
																<span className="avatar-title bg-success">
																	<i className={"bx bx-copy-alt font-size-24"} />
																</span>
															</div>
														</div>
													</CardBody>
												</Card>
											</Col>
										</Row>

										<Row>
											<Col>
												<Card>
													<CardBody>
														<div className="d-sm-flex flex-wrap" style={{ justifyContent: 'space-between' }}>
															<CardTitle className="card-title mb-4 h4 text-capitalize">
																Latest {this.cleanStatus(this.state.selectedStatus)} Events
															</CardTitle>
															<i className="mdi mdi-refresh cursor-pointer" style={{ fontSize: 20 }} onClick={this.getDashboard} />
														</div>
														<div className="clearfix" />
														<Row>
															{Array.isArray(this.props[this.state.selectedStatus]) && this.props[this.state.selectedStatus].length > 0
																&& this.props[this.state.selectedStatus].map((n, i) =>
																	<Col key={`events${i}`} md="6" onClick={() => { this.toggleViewModal(n) }} className="text-reset notification-item cursor-pointer">
																		<div className="d-flex">
																			<div className="flex-grow-1">
																				<h6 className="mt-0 mb-1">
																					{this.props.t(`${eventTitles[n.event_type]} #${n.event_id}`)}
																				</h6>
																				<div className="font-size-12 text-muted">
																					<p className="mb-1">
																						{this.props.t(
																							shortenString(n.description, 50)
																						)}
																					</p>
																					<div className="d-flex p-0 justify-content-between">
																						<p className="mb-0">
																							<i className="mdi mdi-clock-outline" />{" "}
																							{this.props.t(getTimeDifferenceFromNow(n.created_at))}{" "}
																						</p>
																						<span className={`badge badge-pill font-size-11 text-primary severity-text-${n.severity}`}>
																							{n.severity}
																						</span>
																					</div>
																				</div>
																			</div>
																		</div>
																	</Col>
																)}
														</Row>
													</CardBody>
												</Card>
											</Col>
										</Row>
									</Col>
								</Row>
							</TabPane>
							<TabPane tabId="2">
								<Row>
									<Col>
										<WeeklyMonitoringPieChart />
									</Col>
								</Row>
							</TabPane>
						</TabContent>
					</Container>
				</div>
			</React.Fragment>
		);
	}
}

Dashboard.propTypes = {
	t: propTypes.any,
	changePreloader: propTypes.func
}

const mapStateToProps = (state) => ({
	totals: state.lists.totals,
	active: state.lists.active,
	ignored: state.lists.ignored,
	resolved: state.lists.resolved,
	userActives: state.lists.userActives,
	userResolved: state.lists.userResolved,
	userid: state.session.userid
});

export default (withTranslation()(connect(mapStateToProps, { changePreloader, saveList })(Dashboard)));