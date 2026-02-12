import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link, withRouter } from "react-router-dom";
import { Col, Container, Row, Alert, Label } from "reactstrap";

import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

// import images
import CarouselPage from "./CarouselPage";
import { passwordRE } from "config/regex";
import { cognitoForgotPassword, cognitoForgotPasswordSubmit } from "config/cognito";

class ForgotPassword extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			email: '',
			password: '',
			confPass: '',
			confirmation_code: '',
			loading: false,
			error: '',
			step: 0
		};
	}

	submitOne = (values) => {
		const { email } = values;

		this.setState({loading: true});
		cognitoForgotPassword(email)
		.then( (res) => {
			this.setState({loading: false, email, step: 1});
		}).catch( (err) => {
			this.setState({loading: false, error: err?.response?.data?.message || err?.data?.message || err?.message || "Could not complete request"});
		});
	}

	handleSubmit = (values) => {
		const { email } = this.state;
		const { password, confPass, confirmation_code } = values;

		this.setState({loading: true});
		cognitoForgotPasswordSubmit(email, confirmation_code, password)
		.then( (res) => {
			this.setState({loading: false});
			this.props.history.push('/login');
		}).catch( (err) => {
			this.setState({loading: false, error: err?.response?.data?.message || err?.data?.message || err?.message || "Could not complete request"});
		});
	}

	render() {
		//meta title
		document.title="Forgot Password";
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
							  <h5 className="text-primary">Forgot Password</h5>
							</div>

							{this.state.step === 0 ?
							  <div className="mt-4">
								<Formik
									enableReinitialize={true}
									initialValues={{
										email: (this.state && this.state.email) || "",
									}}
									validationSchema={Yup.object().shape({
										email: Yup.string().email(
											"Please Enter Valid Email"
										).required(
											"Please Enter Your Email"
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
										<Label for="email" className="form-label">
										  Email
										</Label>
										<Field
										  name="email"
										  placeholder="Enter Email"
										  type="text"
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
							  </div>
							:
							  <div className="mt-4">
								<Formik
								  enableReinitialize={true}
								  initialValues={{
									email: (this.state && this.state.email) || "",
									confirmation_code: (this.state && this.state.confirmation_code) || "",
									password: (this.state && this.state.password) || "",
									confPass: (this.state && this.state.confPass) || "",
								  }}
								  validationSchema={Yup.object().shape({
									confirmation_code: Yup.string().required(
										"Please Enter Valid Confirmation Code"
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
										  disabled
										  className={
											"form-control" +
											(errors.email && touched.email
											  ? " is-invalid"
											  : "")
										  }
										/>
									  </div>

									  <div className="mb-3">
										<Label for="confirmation_code" className="form-label">
										  Confirmation Code
										</Label>
										<Field
										  name="confirmation_code"
										  placeholder="Enter Confirmation Code"
										  type="text"
										  className={
											"form-control" +
											(errors.confirmation_code && touched.confirmation_code
											  ? " is-invalid"
											  : "")
										  }
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

									  <div className="mt-4 d-grid">
										<button
										  className="btn btn-primary waves-effect waves-light"
										  type="submit"
										>
										  {" "}
										  Reset Password{" "}
										</button>
									  </div>
									</Form>
								  )}
								</Formik>
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

export default withRouter(ForgotPassword);