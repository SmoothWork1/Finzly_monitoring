import React from 'react';
import { alertError } from 'config/toast';
import { saveTenantReq, updTenantReq } from 'config/httpRARoutes';
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

class TenantModal extends React.Component {
	constructor(props) {
		super(props);
	}

	handleSubmit = (values) => {
		if(this.props.tenant.id) {
			updTenantReq({...values, id: this.props.tenant.id})
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not update tenant");
			});
		} else {
			saveTenantReq(values)
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not save tenant");
			});
		}
	}

	render() {
		const { tenant } = this.props;
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
					{`${tenant?.id ? 'Update' : 'Add'} Tenant`}
				</ModalHeader>
				<ModalBody>
				<Formik
					enableReinitialize={true}
					initialValues={{
						id: (tenant && tenant.id) || "",
						display_name: (tenant && tenant.display_name) || "",
						tenant_name_id: (tenant && tenant.tenant_name_id) || "",
						status: (tenant && tenant.status) || "Active",
					}}
					validationSchema={Yup.object().shape({
						id: Yup.string().required(
							"Please Enter Tenant ID"
						),
						display_name: Yup.string().required(
							"Please Enter Tenant Display Name"
						),
						tenant_name_id: Yup.string().required(
							"Please Enter Tenant Name ID"
						),
						status: Yup.string().required(
							"Please Select Tenant Status"
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
								<Label for="id" className="form-label">
									ID
								</Label>
								<Field
									name="id"
									placeholder="Enter Tenant ID"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="display_name" className="form-label">
									Display Name
								</Label>
								<Field
									name="display_name"
									placeholder="Enter Tenant Display Name"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="tenant_name_id" className="form-label">
									Name ID
								</Label>
								<Field
									name="tenant_name_id"
									placeholder="Enter Tenant Name ID"
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

TenantModal.propTypes = {
	close: PropTypes.func,
	isOpen: PropTypes.bool,
	tenant: PropTypes.any,
};

export default TenantModal;