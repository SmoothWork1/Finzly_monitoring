import React, {Component} from 'react';
import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';

//import images
import avatar from "../../assets/images/users/avatar-1.jpg";

class Section extends Component {
    render() {
        return (
            <React.Fragment>
                <Row className="mb-4">
                    <Col lg={12}>
                        <div className="d-flex align-items-center">
                            <img src={avatar} alt="" className="avatar-sm rounded" />
                            <div className="ms-3 flex-grow-1">
                                <h5 className="mb-2 card-title">Hello, Henry Franklin</h5>
                                <p className="text-muted mb-0">Ready to jump back in?</p>
                            </div>
                            <div>
                                <Link to="#" className="btn btn-primary"><i className="bx bx-plus align-middle"></i> Add New Jobs</Link>
                            </div>
                        </div>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }

}

export default Section;