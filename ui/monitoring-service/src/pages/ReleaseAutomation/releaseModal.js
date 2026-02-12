import React from 'react';
import { alertError } from 'config/toast';
import { saveReleaseReq, updReleaseReq } from 'config/httpRARoutes';
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

class ReleaseModal extends React.Component {
	constructor(props) {
		super(props);
	}

	handleSubmit = (values) => {
		if(this.props.release.id) {
			updReleaseReq({...values, id: this.props.release.id})
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not update release");
			});
		} else {
			saveReleaseReq(values)
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not save release");
			});
		}
	}

	render() {
		const { release } = this.props;
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
					{`${release?.id ? 'Update' : 'Add'} Release`}
				</ModalHeader>
				<ModalBody>
				<Formik
					enableReinitialize={true}
					initialValues={{
						id: (release && release.id) || "",
						display_name: (release && release.display_name) || "",
						branch: (release && release.branch) || "",
						status: (release && release.status) || "Active",
					}}
					validationSchema={Yup.object().shape({
						id: Yup.string().required(
							"Please Enter Release ID"
						),
						display_name: Yup.string().required(
							"Please Enter Release Display Name"
						),
						branch: Yup.string().required(
							"Please Enter Release Branch"
						),
						status: Yup.string().required(
							"Please Select Release Status"
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
									placeholder="Enter Release ID"
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
									placeholder="Enter Release Display Name"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="branch" className="form-label">
									Branch
								</Label>
								<Field
									name="branch"
									placeholder="Enter Release Branch"
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

ReleaseModal.propTypes = {
	close: PropTypes.func,
	isOpen: PropTypes.bool,
	release: PropTypes.any,
};

export default ReleaseModal;