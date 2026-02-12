import React, { Component } from "react";
import PropTypes from "prop-types";
import { /* Link, */ Link, withRouter } from "react-router-dom";
import { Col, Container, Row, Alert, Label } from "reactstrap";

import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

// import images
// import logodark from "../../assets/images/logo-dark.png";
// import logolight from "../../assets/images/logo-light.png";
import CarouselPage from "./CarouselPage";
import { cognitoGetUser, cognitoLoginUser } from "config/cognito";
import { connect } from "react-redux";
import { login, loginSaga } from "actions/session";
import { profileReq } from "config/httpRoutes";
// import { createSocket } from "socketApp";
import { createSocket } from "config/websocket";

class Login2 extends Component {
  constructor(props) {
		super(props);

		this.state = {
			email: '',
			password: '',
			loading: false,
      show: false,
      error: ''
		};
    this.t_show.bind(this)
	}

  t_show = () => {
    this.setState(prevState => ({ show: !prevState.show }));
  }

	handleSubmit = (values) => {
		const { email, password } = values;
    this.setState({loading: true});
    cognitoLoginUser(email, password)
    .then( async (res) => {
      this.setState({loading: false});
      const user = await cognitoGetUser();
      const { attributes: { name, email, ['custom:userid']:userid, sub } } = user;
      await createSocket(userid);
      const userFull = await profileReq();
      const { /* id, */ first_name, last_name, /* email, */ address, type, contact_number, devops_type } = userFull;
      this.props.login({ name, email, userid, sub, first_name, last_name, address, type, contact_number, devops_type });
      this.props.history.push('/dashboard');
    }).catch( (err) => {
      this.setState({loading: false, error: err?.response?.data?.msg || err?.response?.data?.message || "Could not complete request"});
      if(err?.response?.data?.code === "UserNotConfirmedException") {
        this.props.history.push('/verify');
      }
    });
	}

  render() {
    // meta title
    document.title = "Login";
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
                      {/* <div className="mb-4 mb-md-5">
                        <Link to="dashboard" className="d-block auth-logo">
                          <img
                            src={logodark}
                            alt=""
                            height="18"
                            className="auth-logo-dark"
                          />
                          <img
                            src={logolight}
                            alt=""
                            height="18"
                            className="auth-logo-light"
                          />
                        </Link>
                      </div> */}

                      <div className="my-auto">
                        <div>
                          <h5 className="text-primary">Welcome Back !</h5>
                          <p className="text-muted">
                            Sign in to continue to Monitoring Service.
                          </p>
                        </div>

                        <div className="mt-4">
                          <Formik
                            enableReinitialize={true}
                            initialValues={{
                              email: (this.state && this.state.email) || "",
                              password:
                                (this.state && this.state.password) || "",
                            }}
                            validationSchema={Yup.object().shape({
                              email: Yup.string().email(
                                "Please Enter Valid Email"
                              ).required(
                                "Please Enter Your Email"
                              ),
                              password: Yup.string().required(
                                "Please Enter Valid Password"
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

                                <div className="mb-3">
                                  <Label for="password" className="form-label">
                                    Password
                                  </Label>
                                  <div className="input-group auth-pass-inputgroup">
                                    <Field
                                      name="password"
                                      placeholder="Enter Password"
                                      type={this.state.show ? "text" : "password"}
                                      autoComplete="true"
                                      className={
                                        "form-control" +
                                        (errors.password && touched.password
                                          ? " is-invalid"
                                          : "")
                                      }
                                    />
                                    <button onClick={this.t_show} className="btn btn-light " type="button" id="password-addon">
                                      <i className="mdi mdi-eye-outline"></i></button>
                                  </div>
                                  <ErrorMessage
                                    name="password"
                                    component="div"
                                    className="invalid-feedback"
                                  />
                                </div>

                                <div className="mt-4 text-center">
                                  <Link
                                    to="/forgot"
                                    className="text-muted"
                                  >
                                    <i className="mdi mdi-lock me-1" /> Forgot your
                                    password?
                                  </Link>
                                </div>

                                <div className="mt-3 d-grid">
                                  <button
                                    className="btn btn-primary btn-block"
                                    type="submit"
                                  >
                                    {" "}
                                    Log In{" "}
                                  </button>
                                </div>
                              </Form>
                            )}
                          </Formik>

                          <div className="mt-5 text-center">
                            <p>
                              Don&apos;t have an account ?{" "}
                              <a
                                href="/register"
                                className="fw-medium text-primary"
                              >
                                {" "}
                                Signup now{" "}
                              </a>{" "}
                            </p>
                          </div>
                          <div className="mt-4 text-center">
                            <p>
                              Account not verified ?{" "}
                              <a
                                href="/verify"
                                className="fw-medium text-primary"
                              >
                                {" "}
                                Verify now{" "}
                              </a>{" "}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* <div className="mt-4 mt-md-5 text-center">
                        <p className="mb-0">
                          © {new Date().getFullYear()} Skote. Crafted with{" "}
                          <i className="mdi mdi-heart text-danger"></i> by
                          Themesbrand
                        </p>
                      </div> */}
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

Login2.propTypes = {
  error: PropTypes.any,
  loginSaga: PropTypes.func,
  login: PropTypes.func,
};

export default withRouter(connect(null, { login, loginSaga })(Login2));
