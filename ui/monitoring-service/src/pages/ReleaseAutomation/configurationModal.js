import React from 'react';
import { alertError } from 'config/toast';
import { saveConfigReq, updConfigReq } from 'config/httpRARoutes';
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

class ConfigModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	handleSubmit = (values) => {
		if(this.props.config.property_key/*  && this.props.config.release_id && this.props.config.env_id */) {
			updConfigReq({...values, id: this.props.config.id})
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not update configuration");
			});
		} else {
			saveConfigReq(values)
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not save configuration");
			});
		}
	}

	render() {
		const { config/* , releases, environments */ } = this.props;
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
					{`${(config?.property_key/*  && config?.release_id && config?.env_id */) ? 'Update' : 'Add'} Configuration`}
				</ModalHeader>
				<ModalBody>
				<Formik
					enableReinitialize={true}
					initialValues={{
						field_group: (config && config.field_group) || "Global",
						application: (config && config.application) || "",
						property_key: (config && config.property_key) || "",
						property_value: (config && config.property_value) || "",
						target: (config && config.target) || "config_server",
						type: (config && config.type) || "environment",
						product: (config && config.product) || "",
						app_code: (config && config.app_code) || "",
						status: (config && config.status) || "Active",
						// property_action: (config && config.property_action) || "Add",
						// release_id: (config && config.release_id) || "",
						// env_id: (config && config.env_id) || "",
					}}
					validationSchema={Yup.object().shape({
						field_group: Yup.string().required(
							"Please Select a field group"
						),
						property_key: Yup.string().required(
							"Please Enter a Property Key"
						),
						target: Yup.string().required(
							"Please Select a Target"
						),
						type: Yup.string().required(
							"Please Select a Type"
						),
						status: Yup.string().required(
							"Please Select a Status"
						),
						product: Yup.string().required(
							"Please Enter Product"
						),
						app_code: Yup.string().required(
							"Please Enter Host Application"
						),
						// property_action: Yup.string().required(
						// 	"Please Select a Property Action"
						// ),
						// release_id: Yup.string().required(
						// 	"Please Select a Release"
						// ),
						// env_id: Yup.string().required(
						// 	"Please Select an Environment"
						// ),
					})}
					onSubmit={values => {
						this.handleSubmit(values);
					}}
				>
					{({ errors, status, touched }) => (
					<Form>
						<Row>
						<Col className="col-12">
							<div className="mb-3">
								<Label className="form-label">
									Field Group
								</Label>
								<Field
									name="field_group"
									as="select"
									className="form-control"
								>
									<option disabled value=""></option>
									<option>Global</option>
									<option>Customer</option>
									<option>Application</option>
								</Field>
							</div>
							<div className="mb-3">
								<Label for="application" className="form-label">
									Application
								</Label>
								<Field
									name="application"
									placeholder="Enter Application"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="property_key" className="form-label">
									Property Key
								</Label>
								<Field
									name="property_key"
									placeholder="Enter Property Key"
									type="text"
									className="form-control"
									disabled={Boolean(config?.property_key)}
								/>
							</div>
							<div className="mb-3">
								<Label for="property_value" className="form-label">
									Property Value
								</Label>
								<Field
									name="property_value"
									placeholder="Enter Property Value"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="product" className="form-label">
									Product
								</Label>
								<Field
									name="product"
									placeholder="Enter Product"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="app_code" className="form-label">
									Host Application
								</Label>
								<Field
									name="app_code"
									placeholder="Enter Host Application"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label className="form-label">
									Target
								</Label>
								<Field
									name="target"
									as="select"
									className="form-control"
								>
									<option disabled value=""></option>
									<option>config_server</option>
									<option>parameter_store</option>
								</Field>
							</div>
							<div className="mb-3">
								<Label className="form-label">
									Type
								</Label>
								<Field
									name="type"
									as="select"
									className="form-control"
								>
									<option disabled value=""></option>
									<option>environment</option>
									<option>target</option>
									<option>client_adapter</option>
								</Field>
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
									<option>Disabled</option>
								</Field>
							</div>
							{/* <div className="mb-3">
								<Label className="form-label">
									Release
								</Label>
								<Field
									name="release_id"
									as="select"
									className="form-control"
									disabled={Boolean(config?.release_id)}
								>
									<option disabled value=""></option>
									{releases.map( (r, i) =>
										<option key={`rel${i}`} value={r.id}>{r.display_name}</option>
									)}
								</Field>
							</div>
							<div className="mb-3">
								<Label className="form-label">
									Environment
								</Label>
								<Field
									name="env_id"
									as="select"
									className="form-control"
									disabled={Boolean(config?.env_id)}
								>
									<option disabled value=""></option>
									{environments.map( (e, i) =>
										<option key={`env${i}`} value={e.id}>{e.display_name}</option>
									)}
								</Field>
							</div> */}
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

ConfigModal.propTypes = {
	close: PropTypes.func,
	isOpen: PropTypes.bool,
	config: PropTypes.any,
	environments: PropTypes.any,
	releases: PropTypes.any,
};

export default ConfigModal;