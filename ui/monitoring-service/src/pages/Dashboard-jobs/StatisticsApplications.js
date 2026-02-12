import React, { Component } from 'react';
import { Card, CardBody, Col, Nav, NavItem, NavLink } from 'reactstrap';
import ReactApexChart from "react-apexcharts";
import getChartColorsArray from "../../components/Common/ChartsDynamicColor";

class StatisticsApplications extends Component {
    constructor(props) {
        super(props)
        var areacharteathereumColors = getChartColorsArray(props.dataColors);
        this.state = {
            series: [{
                name: 'Companay',
                type: 'column',
                data: [30, 48, 28, 74, 39, 87, 54, 36, 50, 87, 84]
            }, {
                name: 'New Jobs',
                type: 'column',
                data: [20, 50, 42, 10, 24, 28, 60, 35, 47, 64, 78]
            }, {
                name: 'Total Jobs',
                type: 'area',
                data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43]
            }, {
                name: 'Job View',
                type: 'line',
                data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39]
            }],
            options: {
                chart: {
                    height: 350,
                    type: 'line',
                    stacked: false,
                    toolbar: {
                        show: false,
                    },
                },
                legend: {
                    show: true,
                    offsetY: 10,
                },
                stroke: {
                    width: [0, 0, 2, 2],
                    curve: 'smooth'
                },
                plotOptions: {
                    bar: {
                        columnWidth: '30%'
                    }
                },
                fill: {
                    opacity: [1, 1, 0.1, 1],
                    gradient: {
                        inverseColors: false,
                        shade: 'light',
                        type: "vertical",
                        opacityFrom: 0.85,
                        opacityTo: 0.55,
                        stops: [0, 100, 100, 100]
                    }
                },
                labels: ['01/01/2022', '02/01/2022', '03/01/2022', '04/01/2022', '05/01/2022', '06/01/2022', '07/01/2022',
                    '08/01/2022', '09/01/2022', '10/01/2022', '11/01/2022'
                ],
                colors: areacharteathereumColors,
                markers: {
                    size: 0
                },
                xaxis: {
                    type: 'datetime'
                },
                tooltip: {
                    shared: true,
                    intersect: false,
                    y: {
                        formatter: function (y) {
                            if (typeof y !== "undefined") {
                                return y.toFixed(0) + " points";
                            }
                            return y;

                        }
                    }
                }
            }
        }
    }
    render() {
        return (
            <React.Fragment>
                <Col lg={8}>
                    <Card>
                        <CardBody>
                            <div className="d-sm-flex flex-wrap">
                                <h4 className="card-title mb-4">Statistics Applications</h4>
                                <div className="ms-auto">
                                    <Nav pills>
                                        <NavItem>
                                            <NavLink href="#">Week</NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink href="#">Month</NavLink>
                                        </NavItem>
                                        <NavItem>
                                            <NavLink className="active" href="#">Year</NavLink>
                                        </NavItem>
                                    </Nav>
                                </div>
                            </div>
                            <ReactApexChart
                                options={this.state.options}
                                series={this.state.series}
                                type="line"
                                height="350"
                                className="apex-charts pb-3"
                            />
                        </CardBody>
                    </Card>
                </Col>
            </React.Fragment>
        );
    }
}

export default StatisticsApplications;