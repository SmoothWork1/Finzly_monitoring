import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link, withRouter } from "react-router-dom";
import { Col, Container, Row, Alert, Label } from "reactstrap";

import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

// import images
import CarouselPage from "./CarouselPage";
import { mobileRE, passwordRE } from "config/regex";
import { registerReq } from "config/httpRoutes";

class Register2 extends Component {
  constructor(props) {
		super(props);

		this.state = {
			first_name: '',
			last_name: '',
			email: '',
			password: '',
			confPass: '',
			address: '',
			type: '',
			devops_type: '',
			contact_number: '',
			loading: false,
      error: '',
      step: 0
		};
	}

  submitOne = (values) => {
    this.setState({...values, step: 1});
  }

	handleSubmit = (values) => {
		const { first_name, last_name, contact_number, address } = this.state;
		const { email, password, type, devops_type } = values;

    if(!email.endsWith('finzly.com')) {
      this.setState({error: "Please Enter Valid Email"});
      return;
    }
    this.setState({loading: true});
    registerReq({first_name, last_name, email, password, address, type, contact_number, devops_type})
    .then( (res) => {
      this.setState({loading: false});
      this.props.history.push('/verify');
    }).catch( (err) => {
      this.setState({loading: false, error: err?.response?.data?.message || "Could not complete request"});
    });
	}

  render() {
     //meta title
     document.title="Register";
    return (
      <React.Fragment>
        <div>
          <Container fluid className="p-0">
            <Row className="g-0">
              <CarouselPage />

              <Col xl={3}>
                <div className="auth-full-page-content p-md-5 p-4">
                  <div className="w-100">
                    <div className="d-flex flex-column h-100">
                      <div className="my-auto">
                        <div>
                          <h5 className="text-primary">Register account</h5>
                        </div>

                        <div style={{display: 'flex', width: '80%', marginLeft: '10%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingRight: '32px', paddingLeft: '32px', paddingTop: '16px', paddingBottom: '16px'}}>
                          <div onClick={() => {this.setState({step: 0})}} style={{width: '24px', height: '24px', textAlign: 'center', fontWeight: 'medium', borderWidth: "2px", borderStyle: 'solid', borderRadius: '40px', backgroundColor: 'indigo', cursor: 'pointer'}} className="text-white">
                            1
                          </div>
                          <div style={{borderTop: '0.2px', borderStyle: 'solid', flex: 'auto', borderColor: 'rgba(35, 35, 35, 0.3)', borderRadius: '2px', marginRight: '5px', marginLeft: '5px'}} className="flex-auto border-t-2" />
                          <div onClick={() => {this.setState({step: 1})}} style={{width: '24px', height: '24px', textAlign: 'center', fontWeight: 'medium', borderWidth: "2px", borderStyle: 'solid', borderRadius: '40px', backgroundColor: this.state.step === 1 ? 'indigo' : '', cursor: 'pointer'}} className={this.state.step === 1 ? "text-white": ""}>
                            2
                          </div>
                        </div>
                        {this.state.step === 0 ?
                          <div className="mt-4">
                            <Formik
                              enableReinitialize={true}
                              initialValues={{
                                first_name: (this.state && this.state.first_name) || "",
                                last_name: (this.state && this.state.last_name) || "",
                                contact_number: (this.state && this.state.contact_number) || "",
                                address: (this.state && this.state.address) || "",
                              }}
                              validationSchema={Yup.object().shape({
                                first_name: Yup.string().required(
                                  "Please Enter Valid First Name"
                                ),
                                last_name: Yup.string().required(
                                  "Please Enter Valid Last Name"
                                ),
                                address: Yup.string().required(
                                  "Please Enter Your Address"
                                ),
                                contact_number: Yup.string().required(
                                  "Please Enter Valid Contact Number"
                                ).matches(
                                  mobileRE,
                                  "Must Be 12 Digits, Including Country Code"
                                ),
                              })}
                              onSubmit={values => {
                                this.submitOne(values);
                              }}
                            >
                              {({ errors, status, touched }) => (
                                <Form className="form-horizontal">
                                  {this.state.error && this.state.error ? (
                                    <Alert color="danger">
                                      {this.state.error}
                                    </Alert>
                                  ) : null}
                                  <div className="mb-3">
                                    <Label for="first_name" className="form-label">
                                      First Name
                                    </Label>
                                    <Field
                                      name="first_name"
                                      placeholder="Enter First Name"
                                      type="text"
                                      className={
                                        "form-control" +
                                        (errors.first_name && touched.first_name
                                          ? " is-invalid"
                                          : "")
                                      }
                                    />
                                    <ErrorMessage
                                      name="first_name"
                                      component="div"
                                      className="invalid-feedback"
                                    />
                                  </div>

                                  <div className="mb-3">
                                    <Label for="last_name" className="form-label">
                                      Last Name
                                    </Label>
                                    <Field
                                      name="last_name"
                                      placeholder="Enter Last Name"
                                      type="text"
                                      className={
                                        "form-control" +
                                        (errors.last_name && touched.last_name
                                          ? " is-invalid"
                                          : "")
                                      }
                                    />
                                    <ErrorMessage
                                      name="last_name"
                                      component="div"
                                      className="invalid-feedback"
                                    />
                                  </div>

                                  <div className="mb-3">
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

                                  <div className="mb-3">
                                    <Label for="address" className="form-label">
                                      Address
                                    </Label>
                                    <Field
                                      component="textarea"
                                      name="address"
                                      placeholder="Enter Address"
                                      type="text"
                                      className={
                                        "form-control" +
                                        (errors.address && touched.address
                                          ? " is-invalid"
                                          : "")
                                      }
                                    />
                                    <ErrorMessage
                                      name="address"
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
                                      Next{" "}
                                    </button>
                                  </div>
                                </Form>
                              )}
                            </Formik>
                            <div className="mt-5 text-center">
                              <p>
                                Already have an account ?{" "}
                                <Link
                                  to="login"
                                  className="fw-medium text-primary"
                                >
                                  {" "}
                                  Login
                                </Link>{" "}
                              </p>
                            </div>
                          </div>
                        :
                          <div className="mt-4">
                            <Formik
                              enableReinitialize={true}
                              initialValues={{
                                email: (this.state && this.state.email) || "",
                                password: (this.state && this.state.password) || "",
                                confPass: (this.state && this.state.confPass) || "",
                                type: (this.state && this.state.type) || "",
                                devops_type: (this.state && this.state.devops_type) || "",
                              }}
                              validationSchema={Yup.object().shape({
                                email: Yup.string().email(
                                  "Please Enter Valid Email"
                                ).required(
                                  "Please Enter Your Email"
                                ),
                                password: Yup.string().required(
                                  "Please Enter Valid Password"
                                ).matches(
                                  passwordRE,
                                  "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
                                ),
                                confPass: Yup.string().required(
                                  "Please Enter Valid Password"
                                ).matches(
                                  passwordRE,
                                  "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
                                ).oneOf([Yup.ref('password'), null], 'Passwords must match'),
                                type: Yup.string().required(
                                  "Please Select User Type"
                                ),
                              })}
                              onSubmit={values => {
                                this.handleSubmit(values);
                              }}
                            >
                              {({ errors, status, touched }) => (
                                <Form className="form-horizontal">
                                  {this.state.error && this.state.error ? (
                                    <Alert color="danger">
                                      {this.state.error}
                                    </Alert>
                                  ) : null}
                                  
                                  <div className="mb-3">
                                    <Label for="email" className="form-label">
                                      Email
                                    </Label>
                                    <Field
                                      name="email"
                                      placeholder="Enter Email"
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

                                  <div className="mb-3">
                                    <Label for="password" className="form-label">
                                      Password
                                    </Label>
                                    <Field
                                      name="password"
                                      placeholder="Enter Password"
                                      type="password"
                                      className={
                                        "form-control" +
                                        (errors.password && touched.password
                                          ? " is-invalid"
                                          : "")
                                      }
                                    />
                                    <ErrorMessage
                                      name="password"
                                      component="div"
                                      className="invalid-feedback"
                                    />
                                  </div>

                                  <div className="mb-3">
                                    <Label for="confPass" className="form-label">
                                      Confirm Password
                                    </Label>
                                    <Field
                                      name="confPass"
                                      placeholder="Re-enter Password"
                                      type="password"
                                      className={
                                        "form-control" +
                                        (errors.confPass && touched.confPass
                                          ? " is-invalid"
                                          : "")
                                      }
                                    />
                                    <ErrorMessage
                                      name="confPass"
                                      component="div"
                                      className="invalid-feedback"
                                    />
                                  </div>

                                  <div className="mb-3">
                                    {/* <Label for="type" className="form-label">
                                      User Type
                                    </Label>
                                    <Field
                                      name="type"
                                      placeholder="Enter User Type"
                                      type="text"
                                      className={
                                        "form-control" +
                                        (errors.type && touched.type
                                          ? " is-invalid"
                                          : "")
                                      }
                                    /> */}
                                    <Label for="type" className="form-label">
                                      User Type
                                    </Label>
                                    <Field
                                      name="type"
                                      placeholder="Select User Type"
                                      as="select"
                                      className="form-control"
                                    >
                                      <option disabled value="">Select User Type</option>
                                      <option value="Support">Support</option>
                                      <option value="Non-Support">Non-Support</option>
                                      {/* <option value="Super Admin">Super Admin</option> */}
                                      <option value="Other User">Other User</option>
                                    </Field>
                                  </div>
                                  <div className="mb-3">
                                    <Label for="devops_type" className="form-label">
                                      DevOps Type
                                    </Label>
                                    <Field
                                      name="devops_type"
                                      placeholder="Select DevOps User Type"
                                      as="select"
                                      className="form-control"
                                    >
                                      <option disabled value="">Select DevOps User Type</option>
                                      <option value="User">DevOps User</option>
                                      <option value="Approver">DevOps Approver</option>
                                      <option value="Admin">DevOps Admin</option>
                                    </Field>
                                  </div>

                                  <div className="mb-2">
                                    <Label for="tenant_id" className="form-label">
                                      Tenant ID
                                    </Label>
                                    <Field
                                      name="tenant_id"
                                      placeholder="Enter Tenant ID Here"
                                      type="text"
                                      className="form-control"
                                    />
                                  </div>

                                  <div>
                                    <p className="mb-0">
                                      By registering you agree to the Skote{" "}
                                      <Link to="#" className="text-primary">
                                        Terms of Use
                                      </Link>
                                    </p>
                                  </div>

                                  {/* <div className="mt-4 d-grid">
                                    <button
                                      className="btn btn-primary waves-effect waves-light"
                                      type="button"
                                      onClick={() => {this.setState({step: 0})}}
                                    >
                                      {" "}
                                      Previous{" "}
                                    </button>
                                  </div> */}
                                  <div className="mt-4 d-grid">
                                    <button
                                      className="btn btn-primary waves-effect waves-light"
                                      type="submit"
                                    >
                                      {" "}
                                      Register{" "}
                                    </button>
                                  </div>
                                </Form>
                              )}
                            </Formik>
                            <div className="mt-5 text-center">
                              <p>
                                Already have an account ?{" "}
                                <Link
                                  to="login"
                                  className="fw-medium text-primary"
                                >
                                  {" "}
                                  Login
                                </Link>{" "}
                              </p>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    );
  }
}

Register2.propTypes = {
  error: PropTypes.any,
};

export default withRouter(Register2);