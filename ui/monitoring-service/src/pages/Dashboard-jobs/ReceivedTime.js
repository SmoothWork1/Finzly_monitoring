import React, { Component } from 'react';
import { Card, CardBody, Col, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import ReactApexChart from "react-apexcharts";

import getChartColorsArray from "../../components/Common/ChartsDynamicColor";

class ReceivedTime extends Component {
    constructor(props) {
        super(props)
        var ApplicationReveicedTimeColors = getChartColorsArray(props.dataColors);
        this.state = {
            series: [{
                name: 'Received Application',
                data: [34, 44, 54, 21, 12, 43, 33, 80, 66]
            }],
            options: {
                chart: {
                    type: 'line',
                    height: 378,
                    toolbar: {
                        show: false,
                    },
                },
                // stroke: {
                //     curve: 'stepline',
                // },
                stroke: {
                    width: 3,
                    curve: 'smooth'
                },
                labels: ['8 PM', '9 PM', '10 PM', '11 PM', '12 PM', '1 AM', '2 AM',
                    '3 AM', '4 AM'
                ],
                dataLabels: {
                    enabled: false
                },
                colors: ApplicationReveicedTimeColors,
                markers: {
                    hover: {
                        sizeOffset: 4
                    }
                }
            },
        }
    }
    render() {
        return (
            <React.Fragment>
                <Col lg={4}>
                    <Card>
                        <CardBody>
                            <div className="d-flex">
                                <h4 className="card-title">Applications Received Time</h4>
                                <UncontrolledDropdown className="ms-auto">
                                    <DropdownToggle tag="a" className="text-muted font-size-16" type="button">
                                        <i className="mdi mdi-dots-horizontal"></i>
                                    </DropdownToggle>
                                    <DropdownMenu className="dropdown-menu-end">
                                        <DropdownItem href="#">Action</DropdownItem>
                                        <DropdownItem href="#">Another action</DropdownItem>
                                        <DropdownItem href="#">Something else here</DropdownItem>
                                        <div className="dropdown-divider"></div>
                                        <DropdownItem href="#">Separated link</DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                            </div>

                            <ReactApexChart
                                options={this.state.options}
                                series={this.state.series}
                                type="line"
                                height="378px"
                                width="456px"
                                className="apex-charts"
                            />
                        </CardBody>
                    </Card>
                </Col>
            </React.Fragment>
        );
    }

}

export default ReceivedTime;