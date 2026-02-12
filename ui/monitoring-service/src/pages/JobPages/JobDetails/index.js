import React, { Component } from 'react';
import { Container, Row } from 'reactstrap';

//Import Breadcrumb
import Breadcrumbs from "components/Common/Breadcrumb";
import Overview from './Overview';
import DetailsSection from './DetailsSection';

class JobDetails extends Component {
    render() {
        document.title = "Job Details | Skote - React Admin & Dashboard Template";
        
        return (
            <React.Fragment>
                <div className="page-content">
                    <Container fluid>
                        <Breadcrumbs title="Jobs" breadcrumbItem="Job Details" />

                        <Row>
                            <Overview />
                            <DetailsSection />
                        </Row>
                    </Container>
                </div>
            </React.Fragment>
        );
    }

}

export default JobDetails;