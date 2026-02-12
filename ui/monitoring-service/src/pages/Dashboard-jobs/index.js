import React, { Component } from 'react';
import { Container, Row } from 'reactstrap';
import Section from "./Section";
import ChartSection from "./ChartSection";
import StatisticsApplications from "./StatisticsApplications";
import CandidateSection from "./CandidateSection";
import JobVacancy from "./JobVacancy";
import ReceivedTime from "./ReceivedTime";
import ActivityFeed from "./ActivityFeed";
import AddedJobs from './AddedJobs';

class DashboardJobs extends Component {
    constructor(props) {
        super(props)
        this.state = {
            chartsData: [
                {
                    id: 1,
                    title: "Job View",
                    price: "14,487",
                    perstangeValue: "18.89",
                    bagdeColor: "success",
                    seriesData: [{
                        name: "Job View",
                        data: [36, 21, 65, 22, 35, 50, 87, 98],
                    }],
                    color: '["--bs-success", "--bs-transparent"]'
                },
                {
                    id: 2,
                    title: "New Application",
                    price: "7,402",
                    perstangeValue: "24.07",
                    bagdeColor: "success",
                    seriesData: [{
                        name: "New Application",
                        data: [36, 48, 10, 74, 35, 50, 70, 73],
                    }],
                    color: '["--bs-success", "--bs-transparent"]'
                },
                {
                    id: 3,
                    title: "Total Approved",
                    price: "12,487",
                    perstangeValue: " 8.41",
                    bagdeColor: "success",
                    seriesData: [{
                        name: "Total Approved",
                        data: [60, 14, 5, 60, 30, 43, 65, 84],
                    }],
                    color: '["--bs-success", "--bs-transparent"]'
                },
                {
                    id: 4,
                    title: "Total Rejected",
                    price: "12,487",
                    perstangeValue: " 20.63",
                    bagdeColor: "danger",
                    istrendingArrow: true,
                    seriesData: [{
                        name: "Total Rejected",
                        data: [32, 22, 7, 55, 20, 45, 36, 20],
                    }],
                    color: '["--bs-danger", "--bs-transparent"]'
                },
            ]
        }
    }
    render() {
        document.title = "Job Dashboard | Skote - React Admin & Dashboard Template";
        return (
            <React.Fragment>
                <div className="page-content">
                    <Container fluid>
                        <Section />
                        <ChartSection chartsData={this.state.chartsData} />
                        <Row>
                            <StatisticsApplications dataColors='["--bs-primary", "--bs-success", "--bs-warning", "--bs-info"]' />
                            <CandidateSection />
                        </Row>
                        <Row>
                            <JobVacancy />
                        </Row>
                        <Row>
                            <ReceivedTime dataColors='["--bs-primary", "--bs-success", "--bs-warning", "--bs-info"]' />
                            <ActivityFeed />
                            <AddedJobs />
                        </Row>
                    </Container>
                </div>
            </React.Fragment>
        )
    }
}

export default DashboardJobs;