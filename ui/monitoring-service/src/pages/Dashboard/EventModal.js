import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Alert,
} from "reactstrap";
import { addEventReq, updEventReq } from "config/httpRoutes";
import { Field, Formik, Form } from "formik";
import { alertSuccess } from "config/toast";
import * as Yup from "yup";

class EventModal extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: ''
		};
	}

	componentDidUpdate(prevProps) {
		if(prevProps.isOpen !== this.props.isOpen) {
			this.setState({error: ''});
		}
	}

  handleSubmit = (e, values) => {
    e.preventDefault();
    const { id } = this.props.event;
    const { name, configuration, application, platform, event_type } = values;
    if(id) {
		updEventReq({id, name, configuration, application, platform, event_type})
		.then( (res) => {
			alertSuccess("Event updated");
			this.setState({error: ''});
			this.props.refresh && this.props.refresh();
		}).catch( (err) => {
			this.setState({error: err.response?.data?.message || 'Could not update event'});
		});
    } else {
		addEventReq({name, configuration, application, platform, event_type})
		.then( (res) => {
			alertSuccess("Event added");
			this.setState({error: ''});
			this.props.refresh && this.props.refresh();
		}).catch( (err) => {
			this.setState({error: err.response?.data?.message || 'Could not add event'});
		});
    }
  }

  render() {
    return (
      <React.Fragment>
        <Modal
          isOpen={this.props.isOpen}
          role="dialog"
          autoFocus={true}
          centered={true}
		  size="lg"
          className="exampleModal"
          tabIndex="-1"
          toggle={this.props.toggle}
        >
          <div className="modal-content">
            <ModalHeader toggle={this.props.toggle}>Event</ModalHeader>
            <ModalBody>
              {this.props.event.id && <p className="mb-2">
					Event ID: <span className="text-primary">{this.props.event.id}</span>
              </p>}
              <div className="mb-2">
              <Formik
                enableReinitialize={true}
                initialValues={{
					name: this.props.event.name || "",
					configuration: this.props.event.configuration || "",
					application: this.props.event.application || "",
					platform: this.props.event.platform || "",
					event_type: this.props.event.event_type || "",
                }}
                validationSchema={Yup.object().shape({
					name: Yup.string().required(
						"Please Enter Event's Name"
					),
					configuration: Yup.string().required(
						"Please Enter Event's Configuration"
					),
					application: Yup.string().required(
						"Please Enter Event's Application"
					),
					platform: Yup.string().required(
						"Please Enter Event's Platform"
					),
					event_type: Yup.string().required(
						"Please Enter Event's Type"
					),
                })}
              >
                {({ errors, status, touched, values, handleChange, setFieldValue }) => (
					<Form onSubmit={(e) => {this.handleSubmit(e, values)}}>
						{this.state.error && this.state.error ? (
							<Alert color="danger">
								{this.state.error}
							</Alert>
						) : null}
						<div className="mb-2">
							<Label for="name" className="form-label">
								Name
							</Label>
							<Field
								name="name"
								placeholder="Enter Name Here"
								type="text"
								className="form-control"
							/>
						</div>
						<div className="mb-2">
							<Label for="configuration" className="form-label">
								Configuration
							</Label>
							<Field
								name="configuration"
								placeholder="Enter Configuration Here"
								type="text"
								className="form-control"
							/>
						</div>
						<div className="mb-2">
							<Label for="application" className="form-label">
								Application
							</Label>
							<Field
								name="application"
								placeholder="Enter Application Here"
								type="text"
								className="form-control"
							/>
						</div>
						<div className="mb-2">
							<Label for="platform" className="form-label">
								Platform
							</Label>
							<Field
								name="platform"
								placeholder="Enter Platform Here"
								type="text"
								className="form-control"
							/>
						</div>
						<div className="mb-2">
							<Label for="event_type" className="form-label">
								Type
							</Label>
							<Field
								name="event_type"
								placeholder="Enter Type Here"
								type="text"
								className="form-control"
							/>
						</div>
						<div className="mt-4 d-grid">
							<button
								className="btn btn-primary waves-effect waves-light"
								type="submit"
							>
								{" "}
								{this.props.event.id ? "Save Changes" : "Add Event"}{" "}
							</button>
						</div>
					</Form>
                )}
              </Formik>
              </div>
            </ModalBody>
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

EventModal.propTypes = {
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
  event: PropTypes.any,
  refresh: PropTypes.any,
};

export default EventModal;