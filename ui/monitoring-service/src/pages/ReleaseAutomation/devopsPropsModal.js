import React from 'react';
import { alertError } from 'config/toast';
import { saveDevOpsPropReq, updDevOpsPropReq } from 'config/httpRARoutes';
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

class DevOpsPropsModal extends React.Component {
	constructor(props) {
		super(props);
	}

	handleSubmit = (values) => {
		if(this.props.devops_property.prop_key) {
			updDevOpsPropReq({...values, prop_key: this.props.devops_property.prop_key})
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not update devops property");
			});
		} else {
			saveDevOpsPropReq(values)
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not save devops property");
			});
		}
	}

	render() {
		const { devops_property, environments } = this.props;
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
					{`${devops_property?.prop_key ? 'Update' : 'Add'} DevOps Property`}
				</ModalHeader>
				<ModalBody>
				<Formik
					enableReinitialize={true}
					initialValues={{
						prop_key: (devops_property && devops_property.prop_key) || "",
						value: (devops_property && devops_property.value) || "",
						env: (devops_property && devops_property.env) || "",
						status: (devops_property && devops_property.status) || "Active",
					}}
					validationSchema={Yup.object().shape({
						prop_key: Yup.string().required(
							"Please Enter Property Key"
						),
						value: Yup.string().required(
							"Please Enter Property Value"
						),
						env: Yup.string().required(
							"Please Select Property Environment"
						),
						status: Yup.string().required(
							"Please Select Property Status"
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
							<div className="mb-3">
								<Label for="prop_key" className="form-label">
									Property Key
								</Label>
								<Field
									name="prop_key"
									placeholder="Enter Property Key"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="value" className="form-label">
									Value
								</Label>
								<Field
									name="value"
									placeholder="Enter Property Value"
									as="textarea"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label className="form-label">
									Environment
								</Label>
								<Field
									name="env"
									as="select"
									className="form-control"
								>
									<option disabled value=""></option>
									{environments.map( (e, i) =>
										<option key={`env${i}`} value={e.id}>{e.display_name}</option>
									)}
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

DevOpsPropsModal.propTypes = {
	close: PropTypes.func,
	isOpen: PropTypes.bool,
	devops_property: PropTypes.any,
	environments: PropTypes.any,
};

export default DevOpsPropsModal;