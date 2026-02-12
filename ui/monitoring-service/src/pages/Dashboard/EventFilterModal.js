import React from "react";
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

class EventFilterModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { filter } = this.props;
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
					Filter Event
				</ModalHeader>
				<ModalBody>
				<Formik
					enableReinitialize={true}
					initialValues={{
						name: (filter && filter.name) || "",
						configuration: (filter && filter.configuration) || "",
						application: (filter && filter.application) || "",
						platform: (filter && filter.platform) || "",
						event_type: (filter && filter.event_type) || "",
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
								<Label className="form-label">
									Name
								</Label>
								<Field
									name="name"
									type="text"
									placeholder="Enter Name Here"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label className="form-label">
									Configuration
								</Label>
								<Field
									name="configuration"
									type="text"
									placeholder="Enter Configuration Here"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label className="form-label">
									Application
								</Label>
								<Field
									name="application"
									type="text"
									placeholder="Enter Application Here"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label className="form-label">
									Platform
								</Label>
								<Field
									name="platform"
									type="text"
									placeholder="Enter Platform Here"
									className="form-control"
								/>
							</div>
							<div className="mb-3">
								<Label className="form-label">
									Type
								</Label>
								<Field
									name="event_type"
									type="text"
									placeholder="Enter Type Here"
									className="form-control"
								/>
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

EventFilterModal.propTypes = {
	toggle: PropTypes.func,
	isOpen: PropTypes.bool,
	filter: PropTypes.any,
};

export default EventFilterModal