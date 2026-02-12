import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Alert,
} from "reactstrap";
import { pageTypes } from "config/globals";
import { addAgentQueryReq, updAgentQueryReq } from "config/httpRoutes";
import { Field, Formik, Form } from "formik";
import { alertSuccess } from "config/toast";
import * as Yup from "yup";

class AgentQueryModal extends Component {
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
    const { query_name:def_query_name, lambda_name } = this.props.query;
    const { query_name, query, query_result, query_order } = values;
    if(lambda_name && def_query_name) {
      updAgentQueryReq({lambda_name, query_name: def_query_name, query, query_result, query_order})
      .then( (res) => {
        alertSuccess("Agent Query updated");
        this.props.refresh && this.props.refresh();
      }).catch( (err) => {
        this.setState({error: err.response?.data?.message || 'Could not update query'});
      });
    } else {
      addAgentQueryReq({lambda_name: pageTypes[this.props.match.params.key], query_name, query, query_result, query_order})
      .then( (res) => {
        alertSuccess("Agent Query added");
        this.props.refresh && this.props.refresh();
      }).catch( (err) => {
        this.setState({error: err.response?.data?.message || 'Could not add query'});
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
            <ModalHeader toggle={this.props.toggle}>Agent Query</ModalHeader>
            <ModalBody>
              {this.props.query.query_name && <p className="mb-2">
                Query Name: <span className="text-primary">{this.props.query.query_name}</span>
              </p>}
              {this.props.query.lambda_name && <p className="mb-2">
                Lambda Name: <span className="text-primary">{this.props.query.lambda_name}</span>
              </p>}
              <div className="mb-2">
              <Formik
                enableReinitialize={true}
                initialValues={{
                  query_name: this.props.query.query_name || "",
                  query: this.props.query.query || "",
                  query_result: this.props.query.query_result || "",
                  query_order: this.props.query.query_order || "",
                }}
                validationSchema={Yup.object().shape({
                  query_name: Yup.string().required(
                    "Please Enter a Query Name"
                  ),
                  query: Yup.string().required(
                    "Please Enter a Query"
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
                  {this.props.query.query_name ?
                    <></>
                  :
                    <div className="mb-2">
                      <Label for="query_name" className="form-label">
                        Query Name
                      </Label>
                      <Field
                        name="query_name"
                        placeholder="Enter Query Name Here"
                        type="text"
                        className="form-control"
                      />
                    </div>
                  }
                  <div className="mb-2">
                    <Label for="query" className="form-label">
                      Query
                    </Label>
                    <Field
                      name="query"
                      component="textarea"
                      placeholder="Enter Query Here"
                      type="text"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-2">
                    <Label for="query_result" className="form-label">
                      Query Result
                    </Label>
                    <Field
                      name="query_result"
                      placeholder="Enter Query Result Here"
                      type="text"
                      className="form-control"
                    />
                  </div>
                  <div className="mb-2">
                    <Label for="query_order" className="form-label">
                      Query Order
                    </Label>
                    <Field
                      name="query_order"
                      placeholder="Enter Query Order Here"
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
                      {this.props.query.lambda_name && this.props.query.query_name ? "Save Changes" : "Add Agent Query"}{" "}
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

AgentQueryModal.propTypes = {
  toggle: PropTypes.func,
  isOpen: PropTypes.bool,
  query: PropTypes.any,
};

export default AgentQueryModal;