import React from 'react';
import { alertError } from 'config/toast';
import { saveDBSchemaUpdateReq, updDBSchemaUpdateReq } from 'config/httpRARoutes';
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

class DBSchemaModal extends React.Component {
	constructor(props) {
		super(props);
	}

	handleSubmit = (values) => {
		if(this.props.db_schema.id) {
			updDBSchemaUpdateReq({...values, id: this.props.db_schema.id})
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not update DB Schema");
			});
		} else {
			saveDBSchemaUpdateReq(values)
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				console.log(err.response?.data || err);
				alertError(err.response?.data?.message || "Could not save DB Schema");
			});
		}
	}

	render() {
		const { db_schema } = this.props;
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
					{`${db_schema?.id ? 'Update' : 'Add'} DB Schema`}
				</ModalHeader>
				<ModalBody>
				<Formik
					enableReinitialize={true}
					initialValues={{
						// id: (db_schema && db_schema.id) || "",
						app_code: (db_schema && db_schema.app_code) || "",
						entity_type: (db_schema && db_schema.entity_type) || "",
						schema_sql: (db_schema && db_schema.schema_sql) || "",
						schema_order: (db_schema && db_schema.schema_order) || "",
						schema_release: (db_schema && db_schema.schema_release) || "",
						status: (db_schema && db_schema.status) || "Active",
						comments: (db_schema && db_schema.comments) || "",
					}}
					validationSchema={Yup.object().shape({
						// id: Yup.string().required(
						// 	"Please Enter DB Schema ID"
						// ),
						app_code: Yup.string().required(
							"Please Enter DB Schema App Code"
						),
						entity_type: Yup.string().required(
							"Please Select DB Schema Entity Type"
						),
						schema_sql: Yup.string().required(
							"Please Enter DB Schema SQL"
						),
						comments: Yup.string().required(
							"Please Enter DB Schema Comments"
						),
						status: Yup.string().required(
							"Please Select DB Schema Status"
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
									placeholder="Enter DB Schema ID"
									type="text"
									className="form-control"
								/>
							</div> */}
							{db_schema?.id ?
								<p className="mb-3">
									DB Schema ID: <span className="text-primary">{db_schema.id}</span>
								</p>
							:
								<></>
							}
							<div className="mb-3">
								<Label for="app_code" className="form-label">
									Application Code
								</Label>
								<Field
									name="app_code"
									placeholder="Enter DB Schema Application Code"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label className="form-label">
									Entity Type
								</Label>
								<Field
									name="entity_type"
									as="select"
									className="form-control"
								>
									<option disabled value=""></option>
									<option>table</option>
									<option>sp</option>
									<option>view</option>
									<option>function</option>
									<option>key</option>
									<option>column</option>
								</Field>
							</div>
							<div className="mb-3">
								<Label for="schema_sql" className="form-label">
									SQL
								</Label>
								<Field
									name="schema_sql"
									placeholder="Enter DB Schema SQL"
									as="textarea"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="schema_order" className="form-label">
									Order
								</Label>
								<Field
									name="schema_order"
									placeholder="Enter DB Schema Order"
									type="number"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="schema_release" className="form-label">
									Release
								</Label>
								<Field
									name="schema_release"
									placeholder="Enter DB Schema Release"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="comments" className="form-label">
									Comments
								</Label>
								<Field
									name="comments"
									placeholder="Enter DB Schema Comments"
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

DBSchemaModal.propTypes = {
	close: PropTypes.func,
	isOpen: PropTypes.bool,
	db_schema: PropTypes.any,
};

export default DBSchemaModal;