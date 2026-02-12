import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Alert,
} from "reactstrap";
import { addDevOpsRequestReq, updDevOpsRequestReq } from "config/httpRoutes";
import { Field, Formik, Form } from "formik";
import { alertSuccess } from "config/toast";
import * as Yup from "yup";
import { getFieldFormattedDate } from "config/helpers";

class DevOpsRequestModal extends Component {
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
    const { id } = this.props.request;
    const { execution_date, command } = values;
    // const user_id = this.props.userid;
    if(id) {
      updDevOpsRequestReq({id, execution_date, command})
      .then( (res) => {
        alertSuccess("DevOps Request updated");
        this.props.refresh && this.props.refresh();
      }).catch( (err) => {
        this.setState({error: err.response?.data?.message || 'Could not update request'});
      });
    } else {
      addDevOpsRequestReq({execution_date, command})
      .then( (res) => {
        alertSuccess("DevOps Request added");
        this.props.refresh && this.props.refresh();
      }).catch( (err) => {
        this.setState({error: err.response?.data?.message || 'Could not add request'});
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
            <ModalHeader toggle={this.props.toggle}>DevOps Request</ModalHeader>
            <ModalBody>
              {this.props.request.id && <p className="mb-2">
                Request ID: <span className="text-primary">{this.props.request.id}</span>
              </p>}
              <div className="mb-2">
              <Formik
                enableReinitialize={true}
                initialValues={{
                  execution_date: getFieldFormattedDate(this.props.request.execution_date) || "",
                  command: this.props.request.command || "",
                }}
                validationSchema={Yup.object().shape({
                  execution_date: Yup.string().required(
                    "Please Select an Execution Date"
                  ),
                  command: Yup.string().required(
                    "Please Enter a Command"
                  ),
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
                    <Label for="execution_date" className="form-label">
                      Execution Date
                    </Label>
                    <Field
                      name="execution_date"
                      type="date"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-2">
                    <Label for="command" className="form-label">
                      Command
                    </Label>
                    <Field
                      component="textarea"
                      name="command"
                      placeholder="Enter Command Here"
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
                      {this.props.request.id ? "Save Changes" : "Submit DevOps Request"}{" "}
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

DevOpsRequestModal.propTypes = {
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
  request: PropTypes.any,
  // userid: PropTypes.string
};

// const mapStateToProps = (state) => ({
//   userid: state.session.userid
// });

// export default connect(mapStateToProps)(DevOpsRequestModal);
export default DevOpsRequestModal;