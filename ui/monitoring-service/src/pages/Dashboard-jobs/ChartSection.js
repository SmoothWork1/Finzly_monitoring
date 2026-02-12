import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { Row, Col, Card, CardBody } from 'reactstrap';
import ReactApexChart from "react-apexcharts";

class ChartSection extends Component {
    constructor(props) {
        super(props)
        this.state = {
            series: [{
                name: "Job View",
                data: [36, 21, 65, 22, 35, 50, 87, 98],
            },
            ],
            series1: [{
                name: "New Application",
                data: [36, 48, 10, 74, 35, 50, 70, 73],
            }],
            series2: [{
                name: "Total Approved",
                data: [60, 14, 5, 60, 30, 43, 65, 84],
            }],
            series3: [{
                name: "Total Rejected",
                data: [32, 22, 7, 55, 20, 45, 36, 20],
            }],

            options: {
                chart: {
                    width: 130,
                    height: 46,
                    type: "area",
                    sparkline: {
                        enabled: true,
                    },
                    toolbar: {
                        show: false,
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    curve: "smooth",
                    width: 1.5,
                },
                fill: {
                    type: "gradient",
                    gradient: {
                        shadeIntensity: 1,
                        inverseColors: false,
                        opacityFrom: 0.45,
                        opacityTo: 0.05,
                        stops: [50, 100, 100, 100],
                    },
                },
                tooltip: {
                    fixed: {
                        enabled: false
                    },
                    x: {
                        show: false
                    },
                    y: {
                        title: {
                            formatter: function (seriesName) {
                                return ''
                            }
                        }
                    },
                    marker: {
                        show: false
                    }
                },
                colors: ["#34c38f"],
            },
            options1: {
                chart: {
                    width: 130,
                    height: 46,
                    type: "area",
                    sparkline: {
                        enabled: true,
                    },
                    toolbar: {
                        show: false,
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    curve: "smooth",
                    width: 1.5,
                },
                fill: {
                    type: "gradient",
                    gradient: {
                        shadeIntensity: 1,
                        inverseColors: false,
                        opacityFrom: 0.45,
                        opacityTo: 0.05,
                        stops: [50, 100, 100, 100],
                    },
                },
                tooltip: {
                    fixed: {
                        enabled: false
                    },
                    x: {
                        show: false
                    },
                    y: {
                        title: {
                            formatter: function (seriesName) {
                                return ''
                            }
                        }
                    },
                    marker: {
                        show: false
                    }
                },
                colors: ["#f46a6a"],
            }
        }
    }
    render() {
        return (
            <React.Fragment>                
                <Row>
                    <Col lg={3}>
                        <Card className="mini-stats-wid">
                            <CardBody>
                                <div className="d-flex">
                                    <div className="flex-grow-1">
                                        <p className="text-muted fw-medium">Job View</p>
                                        <h4 className="mb-0">14,487</h4>
                                    </div>

                                    <div className="flex-shrink-0 align-self-center">
                                        <ReactApexChart
                                            options={this.state.options}
                                            series={this.state.series}
                                            type="area"
                                            height="46"
                                            width="130"
                                            className="apex-charts"
                                        />
                                    </div>
                                </div>
                            </CardBody>
                            <div className="card-body border-top py-3">
                                <p className="mb-0"> <span className="badge badge-soft-success me-1"><i className="bx bx-trending-up align-bottom me-1"></i> 18.89%</span> Increase last month</p>
                            </div>
                        </Card>
                    </Col>
                    <Col lg={3}>
                        <Card className="mini-stats-wid">
                            <CardBody>
                                <div className="d-flex">
                                    <div className="flex-grow-1">
                                        <p className="text-muted fw-medium">New Application</p>
                                        <h4 className="mb-0">7,402</h4>
                                    </div>

                                    <div className="flex-shrink-0 align-self-center">
                                        <ReactApexChart
                                            options={this.state.options}
                                            series={this.state.series1}
                                            type="area"
                                            height="46"
                                            width="130"
                                            className="apex-charts"
                                        />
                                    </div>
                                </div>
                            </CardBody>
                            <div className="card-body border-top py-3">
                                <p className="mb-0"> <span className="badge badge-soft-success me-1"><i className="bx bx-trending-up align-bottom me-1"></i> 24.07%</span> Increase last month</p>
                            </div>
                        </Card>
                    </Col>
                    <Col lg={3}>
                        <Card className="mini-stats-wid">
                            <CardBody>
                                <div className="d-flex">
                                    <div className="flex-grow-1">
                                        <p className="text-muted fw-medium">Total Approved</p>
                                        <h4 className="mb-0">12,487</h4>
                                    </div>

                                    <div className="flex-shrink-0 align-self-center">
                                        <ReactApexChart
                                            options={this.state.options}
                                            series={this.state.series2}
                                            type="area"
                                            height="46"
                                            width="130"
                                            className="apex-charts"
                                        />
                                    </div>
                                </div>
                            </CardBody>
                            <div className="card-body border-top py-3">
                                <p className="mb-0"> <span className="badge badge-soft-success me-1"><i className="bx bx-trending-up align-bottom me-1"></i> 8.41%</span> Increase last month</p>
                            </div>
                        </Card>
                    </Col>
                    <Col lg={3}>
                        <Card className="mini-stats-wid">
                            <CardBody>
                                <div className="d-flex">
                                    <div className="flex-grow-1">
                                        <p className="text-muted fw-medium">Total Rejected</p>
                                        <h4 className="mb-0">12,487</h4>
                                    </div>

                                    <div className="flex-shrink-0 align-self-center">
                                        <ReactApexChart
                                            options={this.state.options1}
                                            series={this.state.series3}
                                            type="area"
                                            height="46"
                                            width="130"
                                            className="apex-charts"
                                        />
                                    </div>
                                </div>
                            </CardBody>
                            <div className="card-body border-top py-3">
                                <p className="mb-0"> <span className="badge badge-soft-danger me-1"><i className="bx bx-trending-down align-bottom me-1"></i> 20.63%</span> Decrease last month</p>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}

ChartSection.propTypes = {
    chartsData: PropTypes.array
}
export default ChartSection;