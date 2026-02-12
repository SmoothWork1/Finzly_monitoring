import React, { Component } from "react";
import PropTypes from "prop-types";
import {
	Label,
	Modal,
	ModalBody,
	ModalHeader,
	Alert,
} from "reactstrap";
import { addUserReq, updUserReq } from "config/httpRoutes";
import { Field, Formik, Form } from "formik";
import { alertSuccess } from "config/toast";
import * as Yup from "yup";

class UserModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: ''
		};
	}

	componentDidUpdate(prevProps) {
		if (prevProps.isOpen !== this.props.isOpen) {
			this.setState({ error: '' });
		}
	}

	handleSubmit = (e, values) => {
		e.preventDefault();
		const { id } = this.props.user;
		const { first_name, last_name, email, contact_number, address, devops_type, tenant_id, password } = values;
		if (id) {
			updUserReq({ id, first_name, last_name, email, contact_number, address, type, devops_type, tenant_id })
				.then((res) => {
					alertSuccess("User updated");
					this.setState({ error: '' });
					this.props.refresh && this.props.refresh();
				}).catch((err) => {
					this.setState({ error: err.response?.data?.message || 'Could not update user' });
				});
		} else {
			addUserReq({ first_name, last_name, email, contact_number, address, type, devops_type, tenant_id, password })
				.then((res) => {
					alertSuccess("User added");
					this.setState({ error: '' });
					this.props.refresh && this.props.refresh();
				}).catch((err) => {
					this.setState({ error: err.response?.data?.message || 'Could not add user' });
				});
		}
	}

	onTypeChange = (type, setFieldValue) => {
		if (type === 'Other User') {
			setFieldValue('devops_type', '');
		}
	}

	render() {
		return (
			<React.Fragment>
				<Modal
					isOpen={this.props.isOpen}
					role="dialog"
					autoFocus={true}
					centered={true}
					className="exampleModal"
					tabIndex="-1"
					toggle={this.props.toggle}
				>
					<div className="modal-content">
						<ModalHeader toggle={this.props.toggle}>User</ModalHeader>
						<ModalBody>
							{this.props.user.id && <p className="mb-2">
								User ID: <span className="text-primary">{this.props.user.id}</span>
							</p>}
							<div className="mb-2">
								<Formik
									enableReinitialize={true}
									initialValues={{
										first_name: this.props.user.first_name || "",
										last_name: this.props.user.last_name || "",
										email: this.props.user.email || "",
										contact_number: this.props.user.contact_number || "",
										address: this.props.user.address || "",
										type: this.props.user.type || "",
										devops_type: this.props.user.devops_type || "",
										tenant_id: this.props.user.tenant_id || "",
									}}
									validationSchema={Yup.object().shape({
										first_name: Yup.string().required(
											"Please Enter User's First Name"
										),
										last_name: Yup.string().required(
											"Please Enter User's Last Name"
										),
										email: Yup.string().required(
											"Please Enter User's Email"
										),
										password: this.props.user.id ? null : Yup.string().required(
											"Please Enter User's Password"
										),
										contact_number: Yup.string().required(
											"Please Enter User's Contact Number"
										),
										address: Yup.string().required(
											"Please Enter User's Address"
										),
										devops_type: Yup.string().required(
											"Please Select a DevOps Type"
										),
										type: Yup.string().required(
											"Please Select a Type"
										),
									})}
								>
									{({ errors, status, touched, values, handleChange, setFieldValue }) => (
										<Form onSubmit={(e) => { this.handleSubmit(e, values) }}>
											{this.state.error && this.state.error ? (
												<Alert color="danger">
													{this.state.error}
												</Alert>
											) : null}
											<div className="mb-2">
												<Label for="first_name" className="form-label">
													First Name
												</Label>
												<Field
													name="first_name"
													placeholder="Enter First Name Here"
													type="text"
													className="form-control"
												/>
											</div>
											<div className="mb-2">
												<Label for="last_name" className="form-label">
													Last Name
												</Label>
												<Field
													name="last_name"
													placeholder="Enter Last Name Here"
													type="text"
													className="form-control"
												/>
											</div>
											<div className="mb-2">
												<Label for="email" className="form-label">
													Email
												</Label>
												<Field
													name="email"
													placeholder="Enter Email Here"
													type="text"
													className="form-control"
												/>
											</div>
											{this.props.user.id ?
												<></>
												:
												<div className="mb-2">
													<Label for="password" className="form-label">
														Password
													</Label>
													<Field
														name="password"
														placeholder="Enter Password Here"
														type="password"
														className="form-control"
													/>
												</div>
											}
											<div className="mb-2">
												<Label for="contact_number" className="form-label">
													Contact Number
												</Label>
												<Field
													name="contact_number"
													placeholder="Enter Contact Number Here"
													type="text"
													className="form-control"
												/>
											</div>
											<div className="mb-2">
												<Label for="address" className="form-label">
													Address
												</Label>
												<Field
													component="textarea"
													name="address"
													placeholder="Enter Address Here"
													type="text"
													className="form-control"
												/>
											</div>
											{
												this.props.user.id ?
												<div className="mb-3">
													<Label for="type" className="form-label">
														User Type
													</Label>
													<Field
														name="type"
														placeholder="Select User Type"
														as="select"
														className="form-control"
														onChange={(e) => { this.onTypeChange(e.target.value, setFieldValue); handleChange(e); }}
													>
														<option disabled value="">Select User Type</option>
														<option value="Support">Support</option>
														<option value="Non-Support">Non-Support</option>
														<option value="Other User">Other User</option>
													</Field>
												</div>
												:
												<div className="mb-3">
													<Label for="type" className="form-label">
														User Type
													</Label>
													<Field
														name="type"
														placeholder="Select User Type"
														as="select"
														className="form-control"
														onChange={(e) => { this.onTypeChange(e.target.value, setFieldValue); handleChange(e); }}
													>
														<option disabled value="">Select User Type</option>
														<option value="Other User">Other User</option>
													</Field>
												</div>
											}
											
											<div className="mb-3">
												<Label for="devops_type" className="form-label">
													DevOps Type
												</Label>
												<Field
													disabled={values?.type === 'Other User'}
													name="devops_type"
													placeholder="Select DevOps User Type"
													as="select"
													className="form-control"

												>
													<option disabled value="">Select DevOps User Type</option>
													<option value="User">DevOps User</option>
													<option value="Approver">DevOps Approver</option>
													<option value="Admin">DevOps Admin</option>
												</Field>
											</div>
											<div className="mb-2">
												<Label for="tenant_id" className="form-label">
													Tenant ID
												</Label>
												<Field
													name="tenant_id"
													placeholder="Enter Tenant ID Here"
													type="text"
													className="form-control"
												/>
											</div>
											<div className="mt-4 d-grid">
												<button
													className="btn btn-primary waves-effect waves-light"
													type="submit"
												>
													{" "}
													{this.props.user.id ? "Save Changes" : "Add User"}{" "}
												</button>
											</div>
										</Form>
									)}
								</Formik>
							</div>
						</ModalBody>
					</div>
				</Modal>
			</React.Fragment>
		);
	}
}

UserModal.propTypes = {
	toggle: PropTypes.func,
	isOpen: PropTypes.bool,
	user: PropTypes.any,
	refresh: PropTypes.any,
};

export default UserModal;