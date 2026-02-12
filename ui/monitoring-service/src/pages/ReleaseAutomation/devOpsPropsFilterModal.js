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

class DevOpsPropsFilterModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
	const { filter, environments } = this.props;
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
					prop_key: (filter && filter.prop_key) || "",
					value: (filter && filter.value) || "",
					env: (filter && filter.env) || "",
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
							<Label for="prop_key" className="form-label">
								Property Key
							</Label>
							<Field
								name="prop_key"
								placeholder="Enter Property Key"
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
								placeholder="Enter Property Value"
								type="text"
								className="form-control"
							/>
						</div>
						<div className="mb-3">
							<Label className="form-label">
								Environment
							</Label>
							<Field
								name="env"
								as="select"
								className="form-control"
							>
								<option value=""></option>
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
								<option value="">Any</option>
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

DevOpsPropsFilterModal.propTypes = {
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
  filter: PropTypes.any,
  environments: PropTypes.any
};

export default DevOpsPropsFilterModal;
