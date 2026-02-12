import React, { Component } from "react";
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

class OnboardingQuestionsFilterModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
	const { filter, applications } = this.props;
    return (
      <React.Fragment>
        <Modal
			isOpen={this.props.isOpen}
			role="dialog"
			autoFocus={true}
			centered={true}
			className="exampleModal"
			tabIndex="-1"
			toggle={() => {this.props.toggle()}}
		>
			<ModalHeader toggle={() => {this.props.toggle()}} tag="h4">
				Filter DevOps Properties
			</ModalHeader>
			<ModalBody>
			<Formik
				enableReinitialize={true}
				initialValues={{
					ques_key: (filter && filter.ques_key) || "",
					question: (filter && filter.question) || "",
					product: (filter && filter.product) || "",
					application: (filter && filter.application) || "",
					status: (filter && filter.status) || "",
				}}
				onSubmit={values => {
					this.props.toggle(values);
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
								placeholder="Enter Question Key"
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
								placeholder="Enter Question"
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
								as="select"
								className="form-control"
							>
								<option value="">Any</option>
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
								<option value="">Any</option>
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
								<option>Any</option>
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
							Filter
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

OnboardingQuestionsFilterModal.propTypes = {
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
  filter: PropTypes.any,
  applications: PropTypes.any
};

export default OnboardingQuestionsFilterModal;
