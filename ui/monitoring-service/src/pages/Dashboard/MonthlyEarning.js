import React, { Component } from "react"

import { Row, Col, Card, CardBody, CardTitle } from "reactstrap"
import { Link } from "react-router-dom"

import ApexRadial from "./ApexRadial"

class MonthlyEarning extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <React.Fragment>
        {" "}
        <Card>
          <CardBody>
            <h4 className="mb-4 card-title">Customer Satisfaction</h4>
            <Row>
              <Col sm="6">
                <p className="text-muted">Issues Reported</p>
                <h3>30</h3>
                <p className="text-muted">
                  <span className="text-success me-2">
                    {" "}
                    12% <i className="mdi mdi-arrow-down"></i>{" "}
                  </span>{" "}
                  From previous period
                </p>
                <div className="mt-4">
                  <Link
                    to=""
                    className="btn btn-primary waves-effect waves-light btn-sm"
                  >
                    View More <i className="mdi mdi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </Col>
              <Col sm="6">
                <div className="mt-4 mt-sm-0">
                  <ApexRadial dataColors='["--bs-primary"]' />
                </div>
              </Col>
            </Row>
            {/* <p className="text-muted mb-0">
              We craft digital, graphic and dimensional thinking.
            </p> */}
          </CardBody>
        </Card>
      </React.Fragment>
    )
  }
}

export default MonthlyEarning
