import React from 'react';
import { alertError } from 'config/toast';
import { saveOnboardingQuestionReq, updOnboardingQuestionReq } from 'config/httpRARoutes';
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

class OnboardingQuestionsModal extends React.Component {
	constructor(props) {
		super(props);
	}

	handleSubmit = (values) => {
		if(this.props.onboarding_question.ques_key) {
			updOnboardingQuestionReq({...values, ques_key: this.props.onboarding_question.ques_key})
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not update onboarding question");
			});
		} else {
			saveOnboardingQuestionReq(values)
			.then( (res) => {
				typeof this.props.close === 'function' && this.props.close({refresh: true});
			}).catch( (err) => {
				alertError(err.response?.data?.message || "Could not save onboarding question");
			});
		}
	}

	render() {
		const { onboarding_question, applications } = this.props;
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
					{`${onboarding_question?.ques_key ? 'Update' : 'Add'} Onboarding Question`}
				</ModalHeader>
				<ModalBody>
				<Formik
					enableReinitialize={true}
					initialValues={{
						ques_key: (onboarding_question && onboarding_question.ques_key) || "",
						question: (onboarding_question && onboarding_question.question) || "",
						value: (onboarding_question && onboarding_question.value) || "",
						value_type: (onboarding_question && onboarding_question.value_type) || "",
						product: (onboarding_question && onboarding_question.product) || "",
						application: (onboarding_question && onboarding_question.application_code) || "",
						status: (onboarding_question && onboarding_question.status) || "Active",
					}}
					validationSchema={Yup.object().shape({
						ques_key: Yup.string().required(
							"Please Enter Question Key"
						),
						question: Yup.string().required(
							"Please Enter Question"
						),
						value_type: Yup.string().required(
							"Please Select Value Type "
						),
						product: Yup.string().required(
							"Please Enter Onboarding Question Product"
						),
						application: Yup.string().required(
							"Please Select Application"
						),
						status: Yup.string().required(
							"Please Select Onboarding Question Status"
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
								<Label for="ques_key" className="form-label">
									Question Key
								</Label>
								<Field
									name="ques_key"
									placeholder="Enter Onboarding Question Key"
									type="text"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label for="question" className="form-label">
									Question
								</Label>
								<Field
									name="question"
									placeholder="Enter Onboarding Question"
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
									placeholder="Enter Onboarding Question Value"
									as="textarea"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label className="form-label">
									Value Type
								</Label>
								<Field
									name="value_type"
									as="select"
									className="form-control"
								>
									<option disabled value=""></option>
									<option>boolean</option>
									<option>text</option>
								</Field>
							</div>
							<div className="mb-3">
								<Label for="product" className="form-label">
									Product
								</Label>
								<Field
									name="product"
									as="select"
									className="form-control"
								>
									<option disabled value=""></option>
									<option>bankos</option>
									<option>cashos</option>
									<option>dao</option>
								</Field>
							</div>
							<div className="mb-3">
								<Label className="form-label">
									Application
								</Label>
								<Field
									name="application"
									as="select"
									className="form-control"
								>
									<option disabled value=""></option>
									{applications.map( (a, i) =>
										<option key={`app${i}`} value={a.app_code}>{a.app_name}</option>
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

OnboardingQuestionsModal.propTypes = {
	close: PropTypes.func,
	isOpen: PropTypes.bool,
	onboarding_question: PropTypes.any,
	applications: PropTypes.any
};

export default OnboardingQuestionsModal;