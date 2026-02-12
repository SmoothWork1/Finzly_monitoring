import React from 'react';
import { alertError } from 'config/toast';
import { saveApplicationReq, updApplicationReq } from 'config/httpRARoutes';
import PropTypes from "prop-types";
import {
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Col,
  Label
} from "reactstrap";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";

class ApplicationModal extends React.Component {
	constructor(props) {
		super(props);
	}

	handleSubmit = (values) => {
		if(this.props.application.id) {
			updApplicationReq({...values, id: this.props.application.id})
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not update application");
			});
		} else {
			saveApplicationReq(values)
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not save application");
			});
		}
	}

	render() {
		const { application } = this.props;
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
					{`${application?.id ? 'Update' : 'Add'} Application`}
				</ModalHeader>
				<ModalBody>
				<Formik
					enableReinitialize={true}
					initialValues={{
						// id: (application && application.id) || "",
						app_name: (application && application.app_name) || "",
						app_code: (application && application.app_code) || "",
						app_context: (application && application.app_context) || "",
						schema_name: (application && application.schema_name) || "",
						is_default_app: (application && application.is_default_app) || false,
						group_name: (application && application.group_name) || "",
						enable_api: (application && application.enable_api) || false,
						api_code: (application && application.api_code) || "",
						status: (application && application.status) || "Active",
					}}
					validationSchema={Yup.object().shape({
						// id: Yup.string().required(
						// 	"Please Enter Application ID"
						// ),
						app_name: Yup.string().required(
							"Please Enter Application Name"
						),
						group_name: Yup.string().required(
							"Please Enter Application Group Name"
						),
						status: Yup.string().required(
							"Please Select Application Status"
						),
					})}
					onSubmit={values => {
						this.handleSubmit(values);
					}}
				>
					{({ errors, status, touched }) => (
					<Form>
						<Row>
						<Col className="col-12">
							{/* <div className="mb-3">
								<Label for="id" className="form-label">
									ID
								</Label>
								<Field
									name="id"
									placeholder="Enter Application ID"
									type="text"
									className="form-control"
								/>
							</div> */}
							{application?.id ?
								<p className="mb-3">
									Application ID: <span className="text-primary">{application.id}</span>
								</p>
							:
								<></>
							}
							<div className="mb-3">
								<Label for="app_name" className="form-label">
									Application Name
								</Label>
								<Field
									name="app_name"
									placeholder="Enter Application Name"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="app_code" className="form-label">
									Application Code
								</Label>
								<Field
									name="app_code"
									placeholder="Enter Application Code"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="app_context" className="form-label">
									Application Context
								</Label>
								<Field
									name="app_context"
									placeholder="Enter Application Context"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="schema_name" className="form-label">
									Schema Name
								</Label>
								<Field
									name="schema_name"
									placeholder="Enter Schema Name"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="is_default_app" className="form-label">
									{"Is Default App  "}
									<Field
										name="is_default_app"
										type="checkbox"
									/>
								</Label>
							</div>
							<div className="mb-3">
								<Label for="group_name" className="form-label">
									Group Name
								</Label>
								<Field
									name="group_name"
									placeholder="Enter Group Name"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="enable_api" className="form-label">
									{"Enable API  "}
									<Field
										name="enable_api"
										type="checkbox"
									/>
								</Label>
							</div>
							<div className="mb-3">
								<Label for="api_code" className="form-label">
									API Code
								</Label>
								<Field
									name="api_code"
									placeholder="Enter API Code"
									type="text"
									className="form-control"
								/>
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
									<option>Active</option>
									<option>Inactive</option>
									<option>Disabled</option>
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
								Save
							</button>
							</div>
						</Col>
						</Row>
					</Form>
					)}
				</Formik>
				</ModalBody>
			</Modal>
			</React.Fragment>
		);
	}
}

ApplicationModal.propTypes = {
	close: PropTypes.func,
	isOpen: PropTypes.bool,
	application: PropTypes.any,
};

export default ApplicationModal;