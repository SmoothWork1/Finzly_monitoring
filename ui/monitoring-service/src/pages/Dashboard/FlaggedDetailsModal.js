import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Alert,
} from "reactstrap";
import { flagEventReq, updEventFlagReq } from "config/httpRoutes";
import { Field, Formik, ErrorMessage, Form } from "formik";
import { alertSuccess } from "config/toast";
import * as Yup from "yup";
import { connect } from "react-redux";

class SubscriptionDetailsModal extends Component {
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
    const { flagged_id } = this.props.flagged;
    const { description_substring } = values;
    const user_id = this.props.userid;
    if(flagged_id) {
      updEventFlagReq({flagged_id, user_id, description_substring})
      .then( (res) => {
        alertSuccess("Event Flag updated");
        this.props.refresh && this.props.refresh();
      }).catch( (err) => {
        this.setState({error: err.response?.data?.message || 'Could not update event flag'});
      });
    } else {
      flagEventReq({user_id, description_substring})
      .then( (res) => {
        alertSuccess("Event Flagged");
        this.props.refresh && this.props.refresh();
      }).catch( (err) => {
        this.setState({error: err.response?.data?.message || 'Could not flag event'});
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
          className="exampleModal"
          tabIndex="-1"
          toggle={this.props.toggle}
        >
          <div className="modal-content">
            <ModalHeader toggle={this.props.toggle}>Event Flag</ModalHeader>
            <ModalBody>
              {this.props.flagged.flagged_id && <p className="mb-2">
                Event Flag id: <span className="text-primary">#{this.props.flagged.flagged_id}</span>
              </p>}
              <div className="mb-2">
              <Formik
                enableReinitialize={true}
                initialValues={{
                  description_substring: this.props.flagged.description_substring || "",
                }}
                validationSchema={Yup.object().shape({
                  description_substring: Yup.string().required(
                    "Please Enter Description Substring to Flag"
                  )
                })}
              >
                {({ errors, status, touched, values }) => (
                <Form onSubmit={(e) => {this.handleSubmit(e, values)}}>
                  {this.state.error && this.state.error ? (
                    <Alert color="danger">
                      {this.state.error}
                    </Alert>
                  ) : null}
                  <div className="mb-2">
                    <Label for="description_substring" className="form-label">
                      Description Substring
                    </Label>
                    <Field
                      component="textarea"
                      name="description_substring"
                      placeholder="Enter Description Substring"
                      type="text"
                      className={
                        "form-control" +
                        (errors.description_substring && touched.description_substring
                          ? " is-invalid"
                          : "")
                      }
                    />
                    <ErrorMessage
                      name="description_substring"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>
                  <div className="mt-4 d-grid">
                    <button
                      className="btn btn-primary waves-effect waves-light"
                      type="submit"
                    >
                      {" "}
                      {this.props.flagged.flagged_id ? "Save Changes" : "Add Event Flag"}{" "}
                    </button>
                    {/* <Button
                      type="button"
                      color="secondary"
                      onClick={this.props.toggle}
                      className="mt-2"
                    >
                      Close
                    </Button> */}
                  </div>
                </Form>
                )}
              </Formik>
              </div>
            </ModalBody>
            {/* <ModalFooter>
              <Button
                type="button"
                color="secondary"
                onClick={this.props.toggle}
              >
                Close
              </Button>
            </ModalFooter> */}
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

SubscriptionDetailsModal.propTypes = {
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
  subscription: PropTypes.any,
  userid: PropTypes.string
};

const mapStateToProps = (state) => ({
  userid: state.session.userid
});

export default connect(mapStateToProps)(SubscriptionDetailsModal);