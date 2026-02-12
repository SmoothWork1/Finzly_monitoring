import React from 'react';
import { alertError } from 'config/toast';
import { getExecInfoQuestionsReq, /* getExecInfoStagingsReq, */ getExecInputsReq, saveExecInfoReq, /* saveStagingsReq, */ /* updStagingsReq, */ updExecInfoReq, updExecInputsReq } from 'config/httpRARoutes';
import { changePreloader } from 'store/actions';
import PropTypes from "prop-types";
import {
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Col,
  Label,
//   NavItem,
//   Nav,
//   Button,
  Collapse,
  CardBody
} from "reactstrap";
import { Link } from "react-router-dom"
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { connect } from 'react-redux';
import { MyMultiSelectField } from './customFormikMultiSelect';

class ExecInfoModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			// all_tenant_envs: props.tenant_envs,
			tenant_envs: props.tenant_envs,
			source_tenant_envs: props.tenant_envs,
			allTenant_envs: props.tenant_envs,
			// all_release_envs: props.release_envs,
			release_envs: props.release_envs,
			allRelease_envs: props.release_envs,
			page: 1,
			allApplications: props.applications,
			filteredApplications: props.applications,

			application_questions: {},
			applications: [],
			application: '',
			exec_id: '',
			applicationsByCode: {}
		};
	}

	componentDidUpdate(prevProps) {
		// if(this.props.all_tenant_envs !== this.state.tenant_envs) {
		// 	this.setState({all_tenant_envs: this.props.tenant_envs, tenant_envs: this.props.tenant_envs});
		// }
		// if(this.props.all_release_envs !== this.state.release_envs) {
		// 	this.setState({all_release_envs: this.props.release_envs, release_envs: this.props.release_envs});
		// }
		if(this.props.tenant_envs?.length !== this.state.allTenant_envs?.length) {
			this.setState({tenant_envs: this.props.tenant_envs, source_tenant_envs: this.props.tenant_envs, allTenant_envs: this.props.tenant_envs});
		}
		if(this.props.release_envs?.length !== this.state.allRelease_envs?.length) {
			this.setState({release_envs: this.props.release_envs, allRelease_envs: this.props.release_envs});
		}
		if(this.props.applications?.length !== this.state.allApplications?.length) {
			this.setState({filteredApplications: this.props.applications, allApplications: this.props.applications});
		}
		if(this.props.isOpen && !prevProps.isOpen) {
			this.setState({
				application_questions: {},
				applications: [],
				application: '',
				exec_id: '',
				page: 1
			});
		}
	}

	getExecQuestions = (exec_id) => {
		this.props.changePreloader(true);
		getExecInfoQuestionsReq(exec_id)
		.then( (res) => {
			const applications = Object.keys(res.application_questions);
			this.setState({
				application_questions: res.application_questions, applications, application: applications[0], 
				exec_id, page: 2
			});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch onboarding questions");
		}).finally( () => {
			this.props.changePreloader(false);
		});
	}

	getExecInputs = () => {
		this.props.changePreloader(true);
		// console.log(this.props.exec.id);
		// getExecInfoStagingsReq(this.props.exec.id)
		getExecInputsReq(this.props.exec.id)
		.then( (res) => {
			// console.log(res);
			const applications = Object.keys(res.application_questions);
			this.setState({
				application_questions: res.application_questions, applications, application: applications[0],
				exec_id: this.props.exec.id, page: 2
			});
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch staging information");
		}).finally( () => {
			this.props.changePreloader(false);
		});
	}

	handleSave = (values) => {
		const questions = [].concat(...Object.values(this.state.application_questions));
		const exec_inputs = questions.map( (ques) => ({/* ...ques, */id: ques.id,  execution_id: this.state.exec_id, question_key: ques.ques_key || ques.question_key, value: values[ques.question]}));
		// console.log(values, exec_inputs);
		// console.log(values, questions, stagings);
		// updStagingsReq({stagings})
		updExecInputsReq({exec_inputs})
		.then( (res) => {
			typeof this.props.close === 'function' && this.props.close({refresh: true});
			// this.getExecStagings();
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not save staging information");
		});
	}

	handleSubmit = (values) => {
		const products = (values.products.map((prod) => prod.value)).join(",");
		const applications = (values.applications.map((app) => app.value)).join(",");
		delete values.tenant_name_id;
		if(this.props.exec.id) {
			updExecInfoReq({...values, id: this.props.exec.id, products, applications})
			.then( (res) => {
				if(values.copy_from_source) {
					typeof this.props.close === 'function' && this.props.close({refresh: true});
					return;
				}
				this.getExecInputs();
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not update execution information");
			});
		} else {
			saveExecInfoReq({...values, products, applications})
			.then( (res) => {
				if(values.copy_from_source) {
					typeof this.props.close === 'function' && this.props.close({refresh: true});
					return;
				}
				this.getExecQuestions(res.execution_id);
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not save execution information");
			});
		}
	}

	handleTab = (application) => {
		if(this.state.application === application) {
			this.setState({application: ''});
			return;
		}
		this.setState({application});
	}
	handlePage = (page) => {
		this.setState({page});
	}

	onTenantChange = (value, setFieldValue) => {
		const { tenant_envs, tenants } = this.props;
		const { tenant_name_id } = (tenants.filter( (tnt) => tnt.id === value))[0];
		setFieldValue('tenant_name_id', tenant_name_id);
		// const fltrTEnv = tenant_envs.filter( (te) => 
		// 	te.tenant_id.indexOf(value) > -1
		// );
		// this.setState({tenant_envs: [...fltrTEnv]});
		this.setState({tenant_envs: [...tenant_envs.filter( (te) => 
			te.tenant_id === value
		)]});
	}
	
	onSourceTenantChange = (value) => {
		const { tenant_envs } = this.props;
		this.setState({source_tenant_envs: [...tenant_envs.filter( (te) => 
			te.tenant_id === value
		)]});
	}
	
	onProductsChange = (value) => {
		const { applications } = this.props;
		this.setState({filteredApplications: applications.filter( (app) => 
			(value.map((v) => v.value)).indexOf(app.group_name) > -1
		)});
	}

	onEnvChange = (value) => {
		const { release_envs } = this.props;
		// const fltrREnv = release_envs.filter( (re) => 
		// 	re.env_id.indexOf(value) > -1
		// );
		// this.setState({release_envs: [...fltrREnv]});
		this.setState({release_envs: release_envs.filter( (re) => 
			re.env_id.indexOf(value) > -1
		)});
	}

	getInitialInputs = () => {
		const obj = {};
		const questions = [].concat(...Object.values(this.state.application_questions));
		for(let i = 0; i <= questions.length; ++i) {
			if(i === questions.length) {
				return obj;
			} else {
				if(questions[i].value_type === 'boolean') {
					obj[questions[i].question] = Boolean(parseInt(questions[i].value));
					continue;
				}
				obj[questions[i].question] = questions[i].value;
			}
		}
	}

	render() {
		const { exec, tenants, /* applications, */ applicationsByCode } = this.props;
		const { tenant_envs, release_envs, page, source_tenant_envs, filteredApplications } = this.state;
		return (
			<React.Fragment>
			<Modal
				isOpen={this.props.isOpen}
				role="dialog"
				autoFocus={true}
				centered={true}
				className="exampleModal"
				tabIndex="-1"
				toggle={() => {this.props.close()}}
			>
				<ModalHeader toggle={() => {this.props.close()}} tag="h4">
					{`${exec?.id ? 'Update' : 'Add'} Execution Information`}
				</ModalHeader>
				<ModalBody>
				{page === 1 ?
					<Formik
						enableReinitialize={true}
						initialValues={{
							exec_type: (exec && exec.exec_type) || "",
							source_tenant: (exec && exec.source_tenant) || "",
							source_tenant_env: (exec && exec.source_tenant_env) || "",
							copy_from_source: (exec && exec.copy_from_source) || false,
							tenant_id: (exec && exec.tenant_id) || "",
							tenant_name_id: (exec && exec.tenant_name_id) || "",
							release_id: (exec && exec.release_id) || "",
							env_id: (exec && exec.env_id) || "",
							products: (exec && exec.products) || [],
							applications: (exec && exec.applications) || [],
							status: (exec && exec.status) || "Active",
						}}
						validationSchema={Yup.object().shape({
							exec_type: Yup.string().required(
								"Please Select an Execution Type"
							),
							source_tenant: Yup.string().required(
								"Please Select a Source Tenant"
							),
							source_tenant_env: Yup.string().required(
								"Please Select a Source Tenant Environment"
							),
							tenant_id: Yup.string().required(
								"Please Select a Tenant"
							),
							release_id: Yup.string().required(
								"Please Select a Release"
							),
							env_id: Yup.string().required(
								"Please Select an Environment"
							),
							// products: Yup.string().required(
							// 	"Please Select a Product"
							// ),
							// applications: Yup.string().required(
							// 	"Please Select an Application"
							// ),
							products: Yup.array().min(1).required(
								"Please select at least one Product"
							),
							applications: Yup.array().min(1).required(
								"Please select at least one Application"
							),
							status: Yup.string().required(
								"Please Select a Status"
							),
						})}
						onSubmit={values => {
							// console.log(values);
							this.handleSubmit(values);
						}}
					>
						{({ errors, status, touched, handleChange, setFieldValue }) => (
						<Form>
							<Row>
							<Col className="col-12">
								{exec?.id ?
									<p className="mb-3">
										Execution ID: <span className="text-primary">{exec.id}</span>
									</p>
								:
									<></>
								}
								<div className="mb-3">
									<Label className="form-label">
										Execution Type
									</Label>
									<div className="d-flex justify-content-between">
										<Label for="exec_type" className="form-label">
											<Field
												name="exec_type"
												type="radio"
												value="onboarding"
											/>
											{"  Onboarding    "}
										</Label>
										<Label for="exec_type" className="form-label">
											<Field
												name="exec_type"
												type="radio"
												value="release"
											/>
											{"  Release    "}
										</Label>
										<Label for="exec_type" className="form-label">
											<Field
												name="exec_type"
												type="radio"
												value="new_environment"
											/>
											{"  New Environment    "}
										</Label>
									</div>
								</div>
								<div className="mb-3">
									<Label className="form-label">
										Source Tenant
									</Label>
									<Field
										name="source_tenant"
										as="select"
										className="form-control"
										onChange={(e) => {this.onSourceTenantChange(e.target.value);handleChange(e);}}
									>
										<option disabled value=""></option>
										{Array.isArray(tenants) && tenants.map( (t, i) =>
											<option key={`st${i}`} value={t.id}>{t.display_name}</option>
										)}
									</Field>
								</div>
								<div className="mb-3">
									<Label className="form-label">
										Source Tenant Environment
									</Label>
									<Field
										name="source_tenant_env"
										as="select"
										className="form-control"
									>
										<option disabled value=""></option>
										{Array.isArray(source_tenant_envs) && source_tenant_envs.map( (e, i) =>
											// <option key={`env${i}`} value={e.id}>{e.display_name}</option>
											<option key={`st_env${i}`} value={e.env_id}>{e.env_id}</option>
										)}
									</Field>
								</div>
								<div className="mb-3">
									<Label for="copy_from_source" className="form-label mr-2">
										Copy inputs from source tenant?
									</Label>
									<Field
										name="copy_from_source"
										type="checkbox"
										// onChange={(e) => {console.log(e.target.value); handleChange(e)}}
									/>
								</div>
								<div className="mb-3">
									<Label className="form-label">
										Tenant
									</Label>
									<Field
										name="tenant_id"
										as="select"
										className="form-control"
										onChange={(e) => {this.onTenantChange(e.target.value, setFieldValue);handleChange(e);}}
									>
										<option disabled value=""></option>
										{Array.isArray(tenants) && tenants.map( (t, i) =>
											<option key={`tnnt${i}`} value={t.id}>{t.display_name}</option>
										)}
									</Field>
								</div>
								<div className="mb-3">
									<Label className="form-label">
										Tenant Name ID
									</Label>
									<Field
										name="tenant_name_id"
										disabled
										type="text"
										className="form-control"
										onChange={(e) => {}}
									/>
								</div>
								<div className="mb-3">
									<Label className="form-label">
										Environment
									</Label>
									<Field
										name="env_id"
										as="select"
										className="form-control"
										onChange={(e) => {this.onEnvChange(e.target.value);handleChange(e);}}
									>
										<option disabled value=""></option>
										{Array.isArray(tenant_envs) && tenant_envs.map( (e, i) =>
											// <option key={`env${i}`} value={e.id}>{e.display_name}</option>
											<option key={`env${i}`} value={e.env_id}>{e.env_id}</option>
										)}
									</Field>
								</div>
								<div className="mb-3">
									<Label className="form-label">
										Release
									</Label>
									<Field
										name="release_id"
										as="select"
										className="form-control"
									>
										<option disabled value=""></option>
										{Array.isArray(release_envs) && release_envs.map( (r, i) =>
											// <option key={`rel${i}`} value={r.id}>{r.display_name}</option>
											<option key={`rel${i}`} value={r.release_id}>{r.release_id}</option>
										)}
									</Field>
								</div>
								<div className="mb-3">
									<MyMultiSelectField
										label="Products"
										name="products"
										className="form-label"
										onChange={(value) => this.onProductsChange(value)}
										options={[
											{label: "bankos", value: "bankos"},
											{label: "cashos", value: "cashos"},
											{label: "dao", value: "dao"},
										]}
									/>
									{/* <select
										name="products"
										multiple
										className="form-control"
										onChange={(e) => {handleChange(e);}}
									>
										<option disabled value=""></option>
										<option>BankOS</option>
										<option>CashOS</option>
										<option>DAO</option>
									</select> */}
								</div>
								<div className="mb-3">
									<MyMultiSelectField
										label="Applications"
										name="applications"
										className="form-label"
										options={Array.isArray(filteredApplications) ?
											filteredApplications.map( (a) => ({label: a.app_name, value: a.app_code}))
										: []}
									/>
									{/* <Label for="applications" className="form-label">
										Applications
									</Label>
									<Field name="applications">
									{({field,
										form: { touched, errors },
										meta,
									}) => (
										<MultiSelect
											options={Array.isArray(applications) ?
												applications.map( (a) => ({label: a.app_name, value: a.id}))
											: []}
											value={field.value}
											onChange={(e) => {handleChange(e);}}
											labelledBy="Applications"
										/>
									)}
									</Field> */}
									{/* <select
										name="applications"
										multiple
										className="form-control"
										onChange={(e) => {handleChange(e);}}
									>
										<option disabled value=""></option>
										{Array.isArray(applications) && applications.map( (t, i) =>
											<option key={`tnnt${i}`} value={t.id}>{t.app_name}</option>
										)}
									</select> */}
								</div>
								<div className="mb-3">
									<Label className="form-label">
										Status
									</Label>
									<Field
										name="status"
										as="select"
										className="form-control"
									>
										<option>Pending</option>
										<option>Active</option>
										<option>Complete</option>
									</Field>
								</div>
							</Col>
							</Row>
							<Row>
							<Col>
								<div className="text-end">
								<button
									type="submit"
									className="btn btn-primary save-user"
								>
									Next
								</button>
								</div>
							</Col>
							</Row>
						</Form>
						)}
					</Formik>
				: page === 2 ?
					<React.Fragment>
						<Formik
							enableReinitialize={true}
							initialValues={this.getInitialInputs()}
							onSubmit={ (values) => {
								// console.log(values);
								this.handleSave(values);
							}}
						>
							{({ errors, status, touched, handleChange }) => (
							<Form>
							{applicationsByCode && Array.isArray(this.state.applications) && this.state.applications.map( (app, i) =>
								<div key={`appAccordion${i}`} className="mb-3">
									<Link
										to="#"
										className="accordion-list d-flex justify-content-between mb-3"
										onClick={() => {this.handleTab(app)}}
										style={{ cursor: "pointer" }}
									>
										<div>{applicationsByCode[app]?.app_name || ''} ({applicationsByCode[app]?.app_code || ''})</div>
										<i className={
												this.state.application === app
												? "mdi mdi-minus accor-plus-icon"
												: "mdi mdi-plus accor-plus-icon"
											}
										/>
									</Link>
									<Collapse isOpen={this.state.application === app}>
										<CardBody>
											<Row>
											{Array.isArray(this.state.application_questions[this.state.application]) && this.state.application_questions[this.state.application].map( (ques, j) =>
												<Col key={`${ques.ques_key || ques.staging_key || ques.question_key}${j}`} className="col-12">
													<div className="mb-3">
														{ques.value_type === 'boolean' ?
															<Label for={ques.question} className="form-label">
																{`${ques.question}  `}
																<Field
																	name={ques.question}
																	type="checkbox"
																	// onChange={(e) => {console.log(e.target.value); handleChange(e)}}
																/>
															</Label>
														:
															<>
																<Label for={ques.question} className="form-label">
																	{ques.question}
																</Label>
																<Field
																	name={ques.question}
																	type="text"
																	className="form-control"
																/>
															</>
														}
													</div>
												</Col>
											)}
											</Row>
										</CardBody>
									</Collapse>
								</div>
							)}
							<Row>
								<Col>
									<div className="text-end">
									{/* <div className="d-flex justify-content-between"> */}
										{/* <button
											type="button"
											className="btn btn-primary save-user"
											onClick={() => {this.handlePage(1);}}
										>
											Prev
										</button> */}
										<button
											type="submit"
											className="btn btn-primary save-user"
										>
											Save
										</button>
									</div>
								</Col>
							</Row>
							</Form>
							)}
						</Formik>

						{/* <Nav className="d-flex mb-3" pills>
							{Array.isArray(this.state.applications) && this.state.applications.map( (app, i) =>
								<NavItem className="mr-2" key={`appTab${i}`}>
									<Button
										className={classNames({
											"selected-filter-button": this.state.application === app,
											"btn-filter": true,
											"fs-filter": true,
											"btn-primary": true,
										})}
										onClick={() => {
											this.handleTab(app)
										}}
									>
										<p className="fw-bold mb-0">{applicationsByCode[app]?.app_name || ''} ({applicationsByCode[app]?.app_code || ''})</p>
									</Button>
								</NavItem>
							)}
						</Nav>
						<Formik
							enableReinitialize={true}
							initialValues={this.getInitialInputs()}
							onSubmit={ (values) => {
								// console.log(values);
								this.handleSave(values);
							}}
						>
							{({ errors, status, touched, handleChange }) => (
							<Form>
								<Row>
								{Array.isArray(this.state.application_questions[this.state.application]) && this.state.application_questions[this.state.application].map( (ques, j) =>
									<Col key={`${ques.ques_key || ques.staging_key}${j}`} className="col-12">
										<div className="mb-3">
											{ques.value_type === 'boolean' ?
												<Label for={ques.question} className="form-label">
													{`${ques.question}  `}
													<Field
														name={ques.question}
														type="checkbox"
														// onChange={(e) => {console.log(e.target.value); handleChange(e)}}
													/>
												</Label>
											:
												<>
													<Label for={ques.question} className="form-label">
														{ques.question}
													</Label>
													<Field
														name={ques.question}
														type="text"
														className="form-control"
													/>
												</>
											}
										</div>
									</Col>
								)}
								</Row>
								<Row>
									<Col>
										<div className="d-flex justify-content-between">
											<button
												type="button"
												className="btn btn-primary save-user"
												onClick={() => {this.handlePage(1);}}
											>
												Prev
											</button>
											<button
												type="submit"
												className="btn btn-primary save-user"
											>
												Save
											</button>
										</div>
									</Col>
								</Row>
							</Form>
							)}
						</Formik> */}
					</React.Fragment>
				:
					<></>
				}
				</ModalBody>
			</Modal>
			</React.Fragment>
		);
	}
}

ExecInfoModal.propTypes = {
	close: PropTypes.func,
	isOpen: PropTypes.bool,
	exec: PropTypes.any,
	tenants: PropTypes.any,
	tenant_envs: PropTypes.any,
	release_envs: PropTypes.any,
	applications: PropTypes.any,
	applicationsByCode: PropTypes.any,
};
// Tenant; Env from tenant_envs; Release from release_envs;
ExecInfoModal.propTypes = {
	changePreloader: PropTypes.func,
};

export default connect(null, { changePreloader })(ExecInfoModal);