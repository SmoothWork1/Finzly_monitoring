import React, { Component } from "react";
import { Row, Col, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";

import avatar1 from "../../assets/images/users/avatar-1.jpg";
import supportAvatar from "../../assets/images/users/support_user.png";
import nonSupportAvatar from "../../assets/images/users/non_support.png";
import profileImg from "../../assets/images/profile-img.png";
import { connect } from "react-redux";

class WelcomeComp extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <React.Fragment>
        <Card className="overflow-hidden">
          <div className="bg-primary bg-soft">
            <Row>
              <Col xs="7">
                <div className="text-primary p-3">
                  <h5 className="text-primary">Welcome Back !</h5>
                  <p>Finzly Dashboard</p>
                </div>
              </Col>
              <Col xs="5" className="align-self-end">
                <img src={profileImg} alt="" className="img-fluid" />
              </Col>
            </Row>
          </div>
          <CardBody className="pt-0">
            <Row>
              <Col sm="4">
                <div className="avatar-md profile-user-wid mb-4">
                  {this.props.usertype === 'Support' ?
                    <img
                      src={supportAvatar}
                      alt=""
                      className="img-thumbnail rounded-circle"
                    />
                  : this.props.usertype === 'Non-Support' ?
                    <img
                      src={nonSupportAvatar}
                      alt=""
                      className="img-thumbnail rounded-circle"
                    />
                  :
                    <img
                      src={avatar1}
                      alt=""
                      className="img-thumbnail rounded-circle"
                    />
                  }
                </div>
                <h5 className="font-size-15 text-truncate">{this.props.name.split("$~")[0]}</h5>
                <p className="text-muted mb-0 text-truncate">{this.props.usertype}</p>
              </Col>

              <Col sm="8">
                <div className="pt-4">
                  <Row>
                    <Col xs="6">
                      <h5 className="font-size-15">{this.props.actives}</h5>
                      <p className="text-muted font-size-11 mb-0">Active Issues</p>
                    </Col>
                    <Col xs="6">
                      <h5 className="font-size-15">{this.props.resolveds}</h5>
                      <p className="text-muted font-size-11 mb-0">Resolved Issues</p>
                    </Col>
                  </Row>
                  <div className="mt-4">
                    <button
                      onClick={() => {this.props.selectStatus('userActives')}}
                      className="btn btn-primary btn-sm"
                    >
                      View Active Issues {" "}<i className="mdi mdi-arrow-right ms-1"/>
                    </button>
                  </div>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  name: state.session.name,
  usertype: state.session.type,
});

export default connect(mapStateToProps)(WelcomeComp);