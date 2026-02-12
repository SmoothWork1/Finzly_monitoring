import React, { Component } from "react"
import { Carousel } from "react-responsive-carousel"
import "react-responsive-carousel/lib/styles/carousel.min.css"
import { Col } from "reactstrap"

export default class CarouselPage extends Component {
  render() {
    return (
      <React.Fragment>
        <Col xl={9}>
        <div className="auth-full-bg pt-lg-5 p-4">
          <div className="w-100">
            <div className="bg-overlay"></div>
            <div className="d-flex h-100 flex-column">
              <div className="p-4 mt-auto">
                <div className="row justify-content-center">
                  <div className="col-lg-7">
                    <div className="text-center">
                      <h4 className="mb-3">
                        <i className="bx bxs-quote-alt-left text-primary h1 align-middle me-3"></i>
                        <span className="text-primary">30</span>+ Satisfied
                        Client & Counting...
                      </h4>
                      <div dir="ltr">
                        <Carousel className="owl-carousel owl-theme auth-review-carousel slider_css" id="auth-review-carousel" 
                        showThumbs={false}>
                          <div>
                            <div className="item">
                              <div className="pb-5 pt-3">
                                <p className="font-size-16 mb-4">
                                  &quot;Always customer first&quot;
                                </p>

                                {/* <div>
                                  <h4 className="font-size-16 text-primary">
                                    Abs1981
                                  </h4>
                                  <p className="font-size-14 mb-0">
                                    - Skote User
                                  </p>
                                </div> */}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="item">
                              <div className="pb-5 pt-3">
                                <p className="font-size-16 mb-4">
                                  &quot;We are not vendors.. We are partners.&quot;
                                </p>

                                {/* <div>
                                  <h4 className="font-size-16 text-primary">
                                    Abs1981
                                  </h4>
                                  <p className="font-size-14 mb-0">
                                    - Skote User
                                  </p>
                                </div> */}
                              </div>
                            </div>
                          </div>
                        </Carousel>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Col>
      </React.Fragment>
    )
  }
}
