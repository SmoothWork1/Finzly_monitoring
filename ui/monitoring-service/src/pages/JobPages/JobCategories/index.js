import React, { Component } from 'react';
import { Col, Container, Row } from 'reactstrap';

//Import Breadcrumb
import Breadcrumbs from "components/Common/Breadcrumb";
import { Link } from 'react-router-dom';

class JobCategories extends Component {
    constructor() {
        super()
        this.state = {
            jobCategories1: [
                { id: 1, name: "Accounting & Finance", category: 52 },
                { id: 2, name: "Development", category: 10 },
                { id: 3, name: "Customer Service", category: 64 },
                { id: 4, name: "Marketing", category: 105 },
                { id: 5, name: "Human Resource", category: 142 },
                { id: 6, name: "Health and Care", category: "01" },
                { id: 7, name: "Project Management", category: 254 },
                { id: 8, name: "Automotive Jobs", category: 79 },
            ],
            jobCategories2: [
                { id: 1, name: "Accounting & Finance", category: 85 },
                { id: 2, name: "Development", category: 19 },
                { id: 3, name: "Customer Service", category: 48 },
                { id: 4, name: "Marketing", category: 34 },
                { id: 5, name: "Human Resource", category: 33 },
                { id: 6, name: "Health and Care", category: 748 },
                { id: 7, name: "Project Management", category: 16 },
                { id: 8, name: "Automotive Jobs", category: 94 },
            ],
            jobCategories3: [
                { id: 1, name: "Accounting & Finance", category: 17 },
                { id: 2, name: "Development", category: 64 },
                { id: 3, name: "Customer Service", category: 72 },
                { id: 4, name: "Marketing", category: 19 },
                { id: 5, name: "Human Resource", category: 305 },
                { id: 6, name: "Health and Care", category: 64 },
                { id: 7, name: "Project Management", category: 112 },
                { id: 8, name: "Automotive Jobs", category: 31 },
            ],
            jobCategories4: [
                { id: 1, name: "Accounting & Finance", category: 85 },
                { id: 2, name: "Development", category: 19 },
                { id: 3, name: "Customer Service", category: 48 },
                { id: 4, name: "Marketing", category: 34 },
                { id: 5, name: "Human Resource", category: 33 },
                { id: 6, name: "Health and Care", category: 748 },
                { id: 7, name: "Project Management", category: 16 },
                { id: 8, name: "Automotive Jobs", category: 94 },
            ],
        };
    };
    render() {
        document.title = "Job Categories | Skote - React Admin & Dashboard Template";

        return (
            <React.Fragment>
                <div className="page-content">
                    <Container fluid>
                        {/* Render Breadcrumbs */}
                        <Breadcrumbs title="Jobs" breadcrumbItem="Job Categories" />

                        <Row className="justify-content-center text-center">
                            <Col xl={4}>
                                <div className="mb-4">
                                    <h4>Browse Job By Categories</h4>
                                    <p className="text-muted">Post a job to tell us about your project. We&apos;ll quickly match you with the right freelancers.</p>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col xl={3} md={6}>
                                <div className="card jobs-categories">
                                    <div className="card-body">
                                        {(this.state.jobCategories1 || []).map((item, key) => (
                                            <Link key={key} to="#!" className="px-3 py-2 rounded bg-light bg-opacity-50 d-block mb-2">{item.name}<span className="badge text-bg-info float-end bg-opacity-100">{item.category}</span></Link>
                                        ))}
                                    </div>
                                </div>
                            </Col>

                            <Col xl={3} md={6}>
                                <div className="card jobs-categories">
                                    <div className="card-body">
                                        {(this.state.jobCategories2 || []).map((item, key) => (
                                            <Link key={key} to="#!" className="px-3 py-2 rounded bg-light bg-opacity-50 d-block mb-2">{item.name}<span className="badge text-bg-info float-end bg-opacity-100">{item.category}</span></Link>
                                        ))}
                                    </div>
                                </div>
                            </Col>

                            <Col xl={3} md={6}>
                                <div className="card jobs-categories">
                                    <div className="card-body">
                                        {(this.state.jobCategories3 || []).map((item, key) => (
                                            <Link key={key} to="#!" className="px-3 py-2 rounded bg-light bg-opacity-50 d-block mb-2">{item.name}<span className="badge text-bg-info float-end bg-opacity-100">{item.category}</span></Link>
                                        ))}
                                    </div>
                                </div>
                            </Col>

                            <Col xl={3} md={6}>
                                <div className="card jobs-categories">
                                    <div className="card-body">
                                        {(this.state.jobCategories4 || []).map((item, key) => (
                                            <Link key={key} to="#!" className="px-3 py-2 rounded bg-light bg-opacity-50 d-block mb-2">{item.name}<span className="badge text-bg-info float-end bg-opacity-100">{item.category}</span></Link>
                                        ))}
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

export default JobCategories;