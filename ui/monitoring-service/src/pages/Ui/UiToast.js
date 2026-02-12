import React, { Component } from "react";

import {
  Row,
  Col,
  Card,
  CardBody,
  Container,
  Button,
  Toast,
  ToastHeader,
  ToastBody,
  CardTitle,
} from "reactstrap";

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

//import images
import logo from "../../assets/images/logo.svg";

class UiToast extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toast: false,
      toast2: true,
      toast3: true,
      toast4: true,
      toast5: true,
      toast6: true,
      toast7: true,
      toast8: true,


    };
    this.toggleToast = this.toggleToast.bind(this);
    this.toggleToast2 = this.toggleToast2.bind(this);
    this.toggleToast3 = this.toggleToast3.bind(this);
    this.toggleToast4 = this.toggleToast4.bind(this);
    this.toggleToast5 = this.toggleToast5.bind(this);
    this.toggleToast6 = this.toggleToast6.bind(this);
    this.toggleToast7 = this.toggleToast7.bind(this);
    this.toggleToast8 = this.toggleToast8.bind(this);
  }

  toggleToast = () => {
    this.setState(prevState => ({
      toast: !prevState.toast,
    }))
  };

  toggleToast2 = () => {
    this.setState(prevState => ({
      toast2: !prevState.toast2,
    }))
  };

  toggleToast3 = () => {
    this.setState(prevState => ({
      toast3: !prevState.toast3,
    }))
  };

  toggleToast4 = () => {
    this.setState(prevState => ({
      toast4: !prevState.toast4,
    }))
  };

  toggleToast5 = () => {
    this.setState(prevState => ({
      toast5: !prevState.toast5,
    }))
  };

  toggleToast6 = () => {
    this.setState(prevState => ({
      toast6: !prevState.toast6,
    }))
  };

  toggleToast7 = () => {
    this.setState(prevState => ({
      toast7: !prevState.toast7,
    }))
  };

  toggleToast8 = () => {
    this.setState(prevState => ({
      toast8: !prevState.toast8,
    }))
  };

  render() {

    //meta title
    document.title = "Toast | Skote - React Admin & Dashboard Template";

    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid={true}>
            <Breadcrumbs title="UI Elements" breadcrumbItem="Toast" />

            <Row>
              <Col xl={12}>
                <Card>
                  <CardBody>
                    <h5 className="card-title">Live Example</h5>
                    <p className="card-title-des">
                      Click the button below to show a toast (positioned with
                      our utilities in the lower right corner) that has been
                      hidden by default.
                    </p>

                    <div className="d-flex flex-wrap gap-2">
                      <div>
                        <Button
                          type="button"
                          color="primary"
                          id="liveToastBtn"
                          onClick={this.toggleToast}
                        >
                          Show live toast
                        </Button>

                        <div
                          className="position-fixed top-0 end-0 p-3"
                          style={{ zIndex: "1005" }}
                        >
                          <Toast isOpen={this.state.toast}>
                            <ToastHeader toggle={this.toggleToast}>
                              <img
                                src={logo}
                                alt=""
                                className="me-2"
                                height="18"
                              />
                              Reactstrap
                            </ToastHeader>
                            <ToastBody>
                              Hello, world! This is a toast message.
                            </ToastBody>
                          </Toast>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col xl={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h5">Basic Toast</CardTitle>
                    <p className="card-title-desc">Toasts are as flexible as you need and have very little
                      required markup.
                      At a minimum, we require a single element to contain your
                      “toasted” content and strongly encourage a dismiss button.</p>

                    <div style={{ minHeight: "110px" }}>
                      <Toast
                        isOpen={this.state.toast2}
                        role="alert"
                      >
                        <ToastHeader toggle={this.toggleToast2}>
                          <img src={logo} alt="" className="me-2" height="18" />
                          <strong className="me-auto">Skote</strong>
                          <small style={{ marginLeft: "165px" }} className="text-muted">11 mins ago</small>
                        </ToastHeader>
                        <ToastBody>
                          Hello, world! This is a toast message.
                        </ToastBody>
                      </Toast>
                    </div>
                  </CardBody>
                </Card>
              </Col>


              <Col xl={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h5">Translucent</CardTitle>
                    <p className="card-title-desc">Toasts are slightly translucent, too, so they blend over
                      whatever they might appear over. For browsers that
                      support the <code>backdrop-filter</code> CSS property,
                      we’ll also attempt to blur the elements under a toast.</p>

                    <div style={{ minHeight: "110px" }}>
                      <Toast
                        isOpen={this.state.toast3}
                        role="alert"
                      >
                        <ToastHeader toggle={this.toggleToast3}>
                          <img src={logo} alt="" className="me-2" height="18" />
                          <strong className="me-auto">Skote</strong>
                          <small style={{ marginLeft: "165px" }} className="text-muted">11 mins ago</small>
                        </ToastHeader>
                        <ToastBody>
                          Hello, world! This is a toast message.
                        </ToastBody>
                      </Toast>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col xl={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h5">Stacking</CardTitle>
                    <p className="card-title-desc">For systems that generate more notifications, consider using
                      a wrapping element
                      so they can easily stack.</p>

                    <div style={{ minHeight: "230px" }}>
                      <div aria-live="polite" aria-atomic="true" className="position-relative">
                        <div className="toast-container position-absolute top-0 end-0 p-2 p-lg-3">
                          <Toast
                            isOpen={this.state.toast4}
                            role="alert"
                          >
                            <ToastHeader toggle={this.toggleToast4}>
                              <img src={logo} alt="" className="me-2" height="18" />
                              <strong className="me-auto">Skote</strong>
                              <small style={{ marginLeft: "175px" }} className="text-muted">just now</small>
                            </ToastHeader>
                            <ToastBody>
                              See? Just like this.
                            </ToastBody>
                          </Toast>

                          <Toast
                            isOpen={this.state.toast5}
                            role="alert"
                          >
                            <ToastHeader toggle={this.toggleToast5}>
                              <img src={logo} alt="" className="me-2" height="18" />
                              <strong className="me-auto">Skote</strong>
                              <small style={{ marginLeft: "167px" }} className="text-muted">2 sec ago</small>
                            </ToastHeader>
                            <ToastBody>
                              Heads up, toasts will stack automatically
                            </ToastBody>
                          </Toast>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>


              <Col xl={6}>
                <Card>
                  <CardBody>
                    <CardTitle className="h5">Custom content</CardTitle>
                    <p className="card-title-desc">Customize your toasts by removing sub-components, tweaking them with utilities, or by adding your own markup.</p>

                    <div className="d-flex flex-column gap-3">
                      <div aria-live="polite" aria-atomic="true" className="position-relative">
                        <Toast
                          isOpen={this.state.toast6}
                          role="alert">
                          <ToastBody>
                            Hello, world! This is a toast message.
                            <div className="mt-2 pt-2 border-top">
                              <button type="button" className="btn btn-primary btn-sm me-1">Take
                                action</button>
                              <button onClick={this.toggleToast6} type="button" className="btn btn-secondary btn-sm"
                              >Close</button>
                            </div>
                          </ToastBody>
                        </Toast>
                      </div>

                      <Toast
                        isOpen={this.state.toast7}
                        className="align-items-center fade show"
                        role="alert"
                      >
                        <div className="d-flex">
                          <ToastBody>
                            Hello, world! This is a toast message.
                          </ToastBody>
                          <button onClick={this.toggleToast7} type="button" className="btn-close me-2 m-auto"></button>
                        </div>
                      </Toast>

                      <div aria-live="polite" aria-atomic="true">
                        <Toast
                          isOpen={this.state.toast8}
                          className="align-items-center text-white bg-primary border-0"
                          role="alert"
                        >
                          <div className="d-flex">
                            <ToastBody>
                              Hello, world! This is a toast message.
                            </ToastBody>
                            <button onClick={this.toggleToast8} type="button" className="btn-close btn-close-white me-2 m-auto"
                            ></button>
                          </div>
                        </Toast>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    );
  }
}

export default UiToast;