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

class GridFilterModal extends Component {
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
				Filter Events
			</ModalHeader>
			<ModalBody>
			<Formik
				enableReinitialize={true}
				initialValues={{
					startDate: (filter && filter.startDate) || "",
					endDate: (filter && filter.endDate) || "",
					status: (filter && filter.status) || "",
					source_system: (filter && filter.source_system) || "",
					event_id: (filter && filter.event_id) || "",
					description: (filter && filter.description) || "",
					severity: (filter && filter.severity) || "",
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
							<Label for="event_id" className="form-label">
								Event ID
							</Label>
							<Field
								name="event_id"
								placeholder="Enter Event ID"
								type="text"
								className="form-control"
							/>
						</div>
						<div className="mb-3">
							<Label for="source_system" className="form-label">
								Source System
							</Label>
							<Field
								name="source_system"
								placeholder="Enter Source System"
								type="text"
								className="form-control"
							/>
						</div>
						<div className="mb-3">
							<Label for="description" className="form-label">
								Description
							</Label>
							<Field
								component="textarea"
								name="description"
								placeholder="Enter Description"
								type="text"
								className="form-control"
							/>
						</div>
						<div className="mb-3">
							<Label className="form-label">
								Created On/After
							</Label>
							<Field
								name="startDate"
								type="date"
								className="form-control"
							/>
						</div>
						<div className="mb-3">
							<Label className="form-label">
								Created Before
							</Label>
							<Field
								name="endDate"
								type="date"
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
								<option>Any</option>
								<option>Active</option>
								<option>Ignored</option>
								<option>Resolved</option>
							</Field>
						</div>
						<div className="mb-3">
							<Label className="form-label">
								Severity
							</Label>
							<Field
								name="severity"
								as="select"
								className="form-control"
							>
								<option>Any</option>
								<option value="high">High</option>
								<option value="medium">Medium</option>
								<option value="low">Low</option>
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

GridFilterModal.propTypes = {
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
  filter: PropTypes.any
};

export default GridFilterModal;
