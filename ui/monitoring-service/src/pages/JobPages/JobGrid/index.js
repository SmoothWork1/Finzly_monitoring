import React, { Component } from 'react';
import { Container } from 'reactstrap';
import Breadcrumbs from "components/Common/Breadcrumb";
import JobFilter from "./JobFilter";
import JobData from "./JobData";

class JobGrid extends Component {
    render() {
        document.title="Jobs Grid | Skote - React Admin & Dashboard Template";
        
        return (
            <React.Fragment>
                <div className="page-content">
                    <Container fluid>
                        <Breadcrumbs title="Jobs" breadcrumbItem="Jobs Grid" />
                        <JobFilter />
                        <JobData />
                    </Container>
                </div>
            </React.Fragment>
        );
    }

}

export default JobGrid;