import React from 'react';
import { alertError } from 'config/toast';
import { saveReleaseEnvironmentReq, updReleaseEnvironmentReq } from 'config/httpRARoutes';
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

class ReleaseEnvModal extends React.Component {
	constructor(props) {
		super(props);
	}

	handleSubmit = (values) => {
		if(this.props.release_env.id) {
			updReleaseEnvironmentReq({...values, id: this.props.release_env.id})
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not update release environment");
			});
		} else {
			saveReleaseEnvironmentReq({
				release_id: values.release_id,
				env_id: values.env_id,
				status: values.status
			}).then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not save release environment");
			});
		}
	}

	render() {
		const { release_env, releases, environments } = this.props;
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
					{`${release_env?.id ? 'Update' : 'Add'} Release Environment`}
				</ModalHeader>
				<ModalBody>
				<Formik
					enableReinitialize={true}
					initialValues={{
						// id: (release_env && release_env.id) || "",
						release_id: (release_env && release_env.release_id) || "",
						env_id: (release_env && release_env.env_id) || "",
						status: (release_env && release_env.status) || "Active",
					}}
					validationSchema={Yup.object().shape({
						// id: Yup.string().required(
						// 	"Please Enter Release Environment ID"
						// ),
						release_id: Yup.string().required(
							"Please Select Release"
						),
						env_id: Yup.string().required(
							"Please Select Environment"
						),
						status: Yup.string().required(
							"Please Select Release Environment Status"
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
							{release_env?.id ?
								<p className="mb-3">
									Release Environment ID: <span className="text-primary">{release_env.id}</span>
								</p>
							:
								<></>
							}
							{/* {release_env && release_env.id ?
								<div className="mb-3">
									<Label for="id" className="form-label">
										ID
									</Label>
									<Field
										name="id"
										placeholder="Enter Release Environment ID"
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
									Release
								</Label>
								<Field
									name="release_id"
									as="select"
									className="form-control"
								>
									<option disabled value=""></option>
									{releases.map( (r, i) =>
										<option key={`rls${i}`} value={r.id}>{r.display_name}</option>
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

ReleaseEnvModal.propTypes = {
	close: PropTypes.func,
	isOpen: PropTypes.bool,
	release_env: PropTypes.any,
	releases: PropTypes.any,
	environments: PropTypes.any,
};

export default ReleaseEnvModal;