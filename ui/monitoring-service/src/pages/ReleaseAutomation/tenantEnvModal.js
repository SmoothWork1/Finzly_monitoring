import React from 'react';
import { alertError } from 'config/toast';
import { saveTenantEnvironmentReq, updTenantEnvironmentReq } from 'config/httpRARoutes';
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

class TenantEnvModal extends React.Component {
	constructor(props) {
		super(props);
	}

	handleSubmit = (values) => {
		if(this.props.tenant_env.id) {
			updTenantEnvironmentReq({...values, id: this.props.tenant_env.id})
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not update tenant environment");
			});
		} else {
			saveTenantEnvironmentReq({
				tenant_id: values.tenant_id,
				env_id: values.env_id,
				status: values.status
			}).then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not save tenant environment");
			});
		}
	}

	render() {
		const { tenant_env, tenants, environments } = this.props;
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
					{`${tenant_env?.id ? 'Update' : 'Add'} Tenant Environment`}
				</ModalHeader>
				<ModalBody>
				<Formik
					enableReinitialize={true}
					initialValues={{
						// id: (tenant_env && tenant_env.id) || "",
						tenant_id: (tenant_env && tenant_env.tenant_id) || "",
						env_id: (tenant_env && tenant_env.env_id) || "",
						status: (tenant_env && tenant_env.status) || "Active",
					}}
					validationSchema={Yup.object().shape({
						// id: Yup.string().required(
						// 	"Please Enter Tenant Environment ID"
						// ),
						tenant_id: Yup.string().required(
							"Please Select Tenant"
						),
						env_id: Yup.string().required(
							"Please Select Environment"
						),
						status: Yup.string().required(
							"Please Select Tenant Environment Status"
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
							{tenant_env?.id ?
								<p className="mb-3">
									Tenant Environment ID: <span className="text-primary">{tenant_env.id}</span>
								</p>
							:
								<></>
							}
							{/* {tenant_env && tenant_env.id ?
								<div className="mb-3">
									<Label for="id" className="form-label">
										ID
									</Label>
									<Field
										name="id"
										placeholder="Enter Tenant Environment ID"
										type="text"
										className="form-control"
										disabled
									/>
								</div>
							:
								<></>
							} */}
							<div className="mb-3">
								<Label className="form-label">
									Tenant
								</Label>
								<Field
									name="tenant_id"
									as="select"
									className="form-control"
								>
									<option disabled value=""></option>
									{tenants.map( (t, i) =>
										<option key={`tnnt${i}`} value={t.id}>{t.display_name}</option>
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

TenantEnvModal.propTypes = {
	close: PropTypes.func,
	isOpen: PropTypes.bool,
	tenant_env: PropTypes.any,
	tenants: PropTypes.any,
	environments: PropTypes.any,
};

export default TenantEnvModal;