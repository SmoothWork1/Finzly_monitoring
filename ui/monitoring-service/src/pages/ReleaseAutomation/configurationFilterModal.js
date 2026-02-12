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

class ConfigurationFilterModal extends Component {
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
				Filter Configurations
			</ModalHeader>
			<ModalBody>
			<Formik
				enableReinitialize={true}
				initialValues={{
					field_group: (filter && filter.field_group) || "",
					application: (filter && filter.application) || "",
					property_key: (filter && filter.property_key) || "",
					property_value: (filter && filter.property_value) || "",
					product: (filter && filter.product) || "",
					app_code: (filter && filter.app_code) || "",
					target: (filter && filter.target) || "",
					type: (filter && filter.type) || "",
					status: (filter && filter.status) || "",
					// release_id: (filter && filter.release_id) || "",
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
							<Label for="field_group" className="form-label">
								Field Group
							</Label>
							<Field
								name="field_group"
								placeholder="Enter Field Group"
								type="text"
								className="form-control"
							/>
						</div>
						<div className="mb-3">
							<Label for="application" className="form-label">
								Application
							</Label>
							<Field
								name="application"
								placeholder="Enter Application"
								type="text"
								className="form-control"
							/>
						</div>
						<div className="mb-3">
							<Label for="property_key" className="form-label">
								Property Key
							</Label>
							<Field
								name="property_key"
								placeholder="Enter Property Key"
								type="text"
								className="form-control"
							/>
						</div>
						<div className="mb-3">
							<Label for="property_value" className="form-label">
								Property Value
							</Label>
							<Field
								name="property_value"
								placeholder="Enter Property Value"
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
								placeholder="Enter Product"
								type="text"
								className="form-control"
							/>
						</div>
						<div className="mb-3">
							<Label for="app_code" className="form-label">
								Host Application
							</Label>
							<Field
								name="app_code"
								placeholder="Enter Host Application"
								type="text"
								className="form-control"
							/>
						</div>
						<div className="mb-3">
							<Label className="form-label">
								Target
							</Label>
							<Field
								name="target"
								as="select"
								className="form-control"
							>
								<option value="">Any</option>
								<option>config_server</option>
								<option>parameter_store</option>
							</Field>
						</div>
						<div className="mb-3">
							<Label className="form-label">
								Type
							</Label>
							<Field
								name="type"
								as="select"
								className="form-control"
							>
								<option value="">Any</option>
								<option>environment</option>
								<option>target</option>
								<option>client_adapter</option>
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
								<option value="">Any</option>
								<option>Active</option>
								<option>Disabled</option>
							</Field>
						</div>
						{/* <div className="mb-3">
							<Label for="release_id" className="form-label">
								Release ID
							</Label>
							<Field
								name="release_id"
								placeholder="Enter Release ID"
								type="text"
								className="form-control"
							/>
						</div> */}
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

ConfigurationFilterModal.propTypes = {
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
  filter: PropTypes.any
};

export default ConfigurationFilterModal;
