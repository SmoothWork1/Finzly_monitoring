import React from 'react';
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { Col, Container, Row, Alert, Label } from "reactstrap";

import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import CarouselPage from "./CarouselPage";
import { cognitoVerifyUser } from 'config/cognito';

class Verify extends React.Component {
  constructor(props) {
		super(props);

		this.state = {
			username: '',
			confirmation_code: '',
			error: '',
			loading: false
		};
	}

	handleSubmit = (values) => {
		const { username, confirmation_code } = values;
		
		this.setState({loading: true});
		cognitoVerifyUser(username, confirmation_code)
		.then( (res) => {
			this.setState({loading: false});
			this.props.history.push('/login');
		}).catch( (err) => {
			console.log(err);
			this.setState({loading: false, error: err?.response?.data?.msg || err?.response?.data?.message || "Could not verify user"});
		});
	}

	render() {
		// meta title
		document.title = "Verify Account";
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
							  <h5 className="text-primary">Welcome !</h5>
							  <p className="text-muted">
								Verify Account to continue to Monitoring Service.
							  </p>
							</div>
	
							<div className="mt-4">
							  <Formik
								enableReinitialize={true}
								initialValues={{
								  username: (this.state && this.state.username) || "",
								  confirmation_code: (this.state && this.state.confirmation_code) || "",
								}}
								validationSchema={Yup.object().shape({
								  username: Yup.string().email(
									"Please Enter Valid Email"
								  ).required(
									"Please Enter Your username"
								  ),
								  confirmation_code: Yup.string().required(
									"Please Enter Valid Confirmation Code"
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
									  <Label for="username" className="form-label">
										Email
									  </Label>
									  <Field
										name="username"
										placeholder="Enter Email"
										type="text"
										className={
										  "form-control" +
										  (errors.username && touched.username
											? " is-invalid"
											: "")
										}
									  />
									  <ErrorMessage
										name="username"
										component="div"
										className="invalid-feedback"
									  />
									</div>
	
									<div className="mb-3">
									  <Label for="confirmation_code" className="form-label">
										Confirmation Code
									  </Label>
									  <div className="input-group auth-pass-inputgroup">
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
									  <ErrorMessage
										name="confirmation_code"
										component="div"
										className="invalid-feedback"
									  />
									</div>
	
									<div className="mt-3 d-grid">
									  <button
										className="btn btn-primary btn-block"
										type="submit"
									  >
										{" "}
										Verify{" "}
									  </button>
									</div>
								  </Form>
								)}
							  </Formik>
	
							  <div className="mt-5 text-center">
								<p>
								  Don&apos;t have an account ?{" "}
								  <a
									href="register"
									className="fw-medium text-primary"
								  >
									{" "}
									Signup now{" "}
								  </a>{" "}
								</p>
							  </div>
							  <div className="mt-4 text-center">
								<p>
								  Account already verified ?{" "}
								  <a
									href="login"
									className="fw-medium text-primary"
								  >
									{" "}
									Login Here{" "}
								  </a>{" "}
								</p>
							  </div>
							</div>
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

Verify.propTypes = {
  error: PropTypes.any,
};

export default withRouter(Verify);