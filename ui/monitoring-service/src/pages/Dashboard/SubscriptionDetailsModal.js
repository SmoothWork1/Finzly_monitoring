import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Alert,
} from "reactstrap";
import { eventTypeOptions } from "config/globals";
import { subscribeEventReq, updEventSubscriptionReq } from "config/httpRoutes";
import { Field, Formik, ErrorMessage, Form } from "formik";
import { alertSuccess } from "config/toast";
import { emailRE, mobileRE } from "config/regex";
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
    const { subscription_id } = this.props.subscription;
    const { event_type, delivery_method, deliver_to, tenant_name } = values;
    const user_id = this.props.userid;
    // const deliver_to = delivery_method === 'sms' ? contact_number : delivery_method === 'email' ? email : '';
    // if(!deliver_to) {
    //   this.setState({error: 'Please provide information for notification target'});
    //   return;
    // }
    if(delivery_method === 'sms' && !deliver_to.match(mobileRE)) {
      this.setState({error: 'Contact Number Must Be 12 Digits, Including Country Code'});
      return;
    }
    if(delivery_method === 'email' && !deliver_to.match(emailRE)) {
      this.setState({error: 'Please Enter Valid Email'});
      return;
    }
    if(subscription_id) {
      updEventSubscriptionReq({subscription_id, user_id, event_type, delivery_method, deliver_to, tenant_name})
      .then( (res) => {
        alertSuccess("Event Subscription updated");
        this.props.refresh && this.props.refresh();
      }).catch( (err) => {
        this.setState({error: err.response?.data?.message || 'Could not update subscription'});
      });
    } else {
      subscribeEventReq({user_id, event_type, delivery_method, deliver_to, tenant_name})
      .then( (res) => {
        alertSuccess("Event Subscription added");
        this.props.refresh && this.props.refresh();
      }).catch( (err) => {
        this.setState({error: err.response?.data?.message || 'Could not add subscription'});
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
            <ModalHeader toggle={this.props.toggle}>Event Subscription</ModalHeader>
            <ModalBody>
              {this.props.subscription.subscription_id && <p className="mb-2">
                Subscription id: <span className="text-primary">#{this.props.subscription.subscription_id}</span>
              </p>}
              <div className="mb-2">
              <Formik
                enableReinitialize={true}
                initialValues={{
                  event_type: this.props.subscription.event_type || "SSL_EXPIRATIONS",
                  delivery_method: this.props.subscription.delivery_method || "email",
                  // email: this.props.subscription.delivery_method === 'email' ? (this.props.subscription.deliver_to || "") : '',
                  // contact_number: this.props.subscription.delivery_method === 'sms' ? (this.props.subscription.deliver_to || "") : '',
                  deliver_to: this.props.subscription.deliver_to || "",
                  tenant_name: this.props.subscription.tenant_name || "",
                }}
                validationSchema={Yup.object().shape({
                  event_type: Yup.string().required(
                    "Please Select an Event Type"
                  ),
                  delivery_method: Yup.string().required(
                    "Please Select a Delivery Method"
                  ),
                  deliver_to: Yup.string().required(
                    "Please Enter Valid Notification Target"
                  ),
                })}
                // onSubmit={values => {
                //   console.log("BRUH");
                //   this.handleSubmit(values);
                // }}
              >
                {({ errors, status, touched, values }) => (
                <Form onSubmit={(e) => {this.handleSubmit(e, values)}}>
                  {this.state.error && this.state.error ? (
                    <Alert color="danger">
                      {this.state.error}
                    </Alert>
                  ) : null}
                  <div className="mb-2">
                    <Label className="form-label">
                      Event Type
                    </Label>
                    <Field
                      name="event_type"
                      as="select"
                      className="form-control"
                    >
                      {eventTypeOptions.map( (u, i) =>
                        <option key={`eventType${i}option`} value={u.value}>{u.name}</option>
                      )}
                    </Field>
                  </div>
                  <div className="mb-2">
                    <Label className="form-label">
                      Delivery Method
                    </Label>
                    <Field
                      name="delivery_method"
                      as="select"
                      className="form-control"
                    >
                      <option value="email">E-mail</option>
                      <option value="sms">SMS</option>
                    </Field>
                  </div>
                  {/* {this.state.delivery_method === 'email' ?
                    <div className="mb-2">
                      <Label for="email" className="form-label">
                        Email
                      </Label>
                      <Field
                        name="email"
                        placeholder="Enter email"
                        type="email"
                        className={
                          "form-control" +
                          (errors.email && touched.email
                            ? " is-invalid"
                            : "")
                        }
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="invalid-feedback"
                      />
                    </div>
                  : this.state.delivery_method === 'sms' ?
                    <div className="mb-2">
                      <Label for="contact_number" className="form-label">
                        Contact Number
                      </Label>
                      <Field
                        name="contact_number"
                        placeholder="Enter Contact Number"
                        type="text"
                        className={
                          "form-control" +
                          (errors.contact_number && touched.contact_number
                            ? " is-invalid"
                            : "")
                        }
                      />
                      <ErrorMessage
                        name="contact_number"
                        component="div"
                        className="invalid-feedback"
                      />
                    </div>
                  :
                    <></>
                  } */}
                  <div className="mb-2">
                    <Label for="deliver_to" className="form-label">
                      Notification Target
                    </Label>
                    <Field
                      name="deliver_to"
                      placeholder="Enter Email/Contact Number Here"
                      type="text"
                      className={
                        "form-control" +
                        (errors.deliver_to && touched.deliver_to
                          ? " is-invalid"
                          : "")
                      }
                    />
                    <ErrorMessage
                      name="deliver_to"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>
                  <div className="mb-2">
                    <Label for="tenant_name" className="form-label">
                      Tenant Name
                    </Label>
                    <Field
                      name="tenant_name"
                      placeholder="Enter Tenant Name Here"
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
                      {this.props.subscription.subscription_id ? "Save Changes" : "Add Subscription"}{" "}
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