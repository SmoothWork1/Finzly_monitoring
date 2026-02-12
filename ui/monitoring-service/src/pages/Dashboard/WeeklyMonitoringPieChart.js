import React, { Component } from "react"
import { alertError } from 'config/toast';
import { Row, Col, Card, CardBody, CardTitle } from "reactstrap"
import { Pie } from 'react-chartjs-2';
import { getPieChartDataReq } from 'config/httpRoutes';

class WeeklyMonitoringPieChart extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selected_tenant: '',
      selected_type: '',
      tenants: {
        labels: [],
        datasets: [
          {
            label: '# of Votes',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
          },
        ],
      },
      types: {
        labels: [],
        datasets: [
          {
            label: '# of Votes',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
          },
        ],
      },
      status: {
        labels: [],
        datasets: [
          {
            label: '# of Votes',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
          },
        ],
      },
      tenant_options: {
        responsive: true,
        zoomOutPercentage: 90,
        legend: {
          position: 'left'
        },
        title: {
          display: true,
          text: 'Issues by Client',
          position: 'bottom',
        },
        onClick: this.handleTenantPieClick,
      },
      type_options: {
        responsive: true,
        zoomOutPercentage: 90,
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Issues by Type for',
          position: 'bottom'
        },
        onClick: this.handleTypePieClick,
      },
      status_options: {
        responsive: true,
        zoomOutPercentage: 90,
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Issues by Status for',
          position: 'bottom'
        },
      },
    }
  }

  componentDidMount() {
    this.getPieChartData();
  }

  stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  getPieChartData = () => {
    const { selected_tenant, selected_type } = this.state;
		// this.props.changePreloader(true);
		getPieChartDataReq(selected_tenant, selected_type)
		.then( (res) => {
			const tenant_kinds = res.tenant_kinds || [];
      const tenant_counts = res.tenant_counts || [];
      // const tenant_backgroundColor = tenant_kinds.map(() => getRandomColor());
      // const tenant_borderColor = tenant_kinds.map(() => getRandomBorderColor());

      const types_kinds = res.types_kinds || [];
      const types_counts = res.types_counts || [];
      // const types_backgroundColor = types_kinds.map(() => getRandomColor());
      // const types_borderColor = types_kinds.map(() => getRandomBorderColor());

      const status_kinds = res.status_kinds || [];
      const status_counts = res.status_counts || [];
      // const status_backgroundColor = status_kinds.map(() => getRandomColor());
      // const status_borderColor = status_kinds.map(() => getRandomBorderColor());

      this.setState({
        tenants: {
          labels : tenant_kinds,
          datasets: [
            {
              label: '# of Votes',
              data: tenant_counts,
              backgroundColor: tenant_kinds.map(this.stringToColor),
              borderColor: tenant_kinds.map(this.stringToColor),
              borderWidth: 1,
            },
          ],
        },
        types: {
          labels : types_kinds,
          datasets: [
            {
              label: '# of Votes',
              data: types_counts,
              backgroundColor: types_kinds.map(this.stringToColor),
              borderColor: types_kinds.map(this.stringToColor),
              borderWidth: 1,
            },
          ],
        },
        status: {
          labels : status_kinds,
          datasets: [
            {
              label: '# of Votes',
              data: status_counts,
              backgroundColor: status_kinds.map(this.stringToColor),
              borderColor: status_kinds.map(this.stringToColor),
              borderWidth: 1,
            },
          ],
        },
        selected_tenant: res.active_tenant,
        selected_type: res.active_type,
        type_options: {
          responsive: true,
          zoomOutPercentage: 90,
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Issues by Type for ' + res.active_tenant,
            position: 'bottom'
          },
          onClick: this.handleTypePieClick,
        },
        status_options: {
          responsive: true,
          zoomOutPercentage: 90,
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Issues by Status for ' + res.active_type,
            position: 'bottom'
          },
        },
      });
		}).catch( (err) => {
			alertError(err.response?.data?.message || "Could not fetch dashboard");
		}).finally( () => {
			// this.props.changePreloader(false);
		});
	}

  handleTenantPieClick = (event, elements) => {
    console.log(elements);
    if (elements.length > 0) {
      const chartElement = elements[0];
      const index = chartElement._index;
      const selected_tenant = this.state.tenants.labels[index];
      console.log(`Clicked on ${selected_tenant}!`);
      this.setState({
        selected_tenant: selected_tenant,
        selected_type: ''
      }, function() {
        this.getPieChartData()
      });
    }
  }

  handleTypePieClick = (event, elements) => {
    console.log(elements);
    if (elements.length > 0) {
      const chartElement = elements[0];
      const index = chartElement._index;
      const selected_type = this.state.types.labels[index];
      console.log(`Clicked on ${selected_type}!`);
      this.setState({
        selected_type: selected_type
      }, function() {
        this.getPieChartData()
      })
    }
  }

  render() {
    return (
      <React.Fragment>
        <Card>
          <CardBody>
            <div className="d-sm-flex flex-wrap" style={{ justifyContent: 'space-between' }}>
              <CardTitle className="card-title mb-4 h4 text-capitalize">
                Weekly Events Situation
              </CardTitle>
              <i className="mdi mdi-refresh cursor-pointer" style={{ fontSize: 20 }} onClick={() => this.getPieChartData() }/>
            </div>
            <div className="clearfix" />
            <Row style={{ alignItems: 'center' }}>
              <Col md="6" className="text-reset">
                <div className="d-flex">
                  <div className="flex-grow-1">
                    <div className="font-size-12 text-muted">
                      <Pie data={this.state.tenants} options={this.state.tenant_options}/>
                    </div>
                  </div>
                </div>
              </Col>
              <Col md="6" className="text-reset">
                <div className="d-flex">
                  <div className="flex-grow-1">
                    <div className="font-size-12 text-muted">
                      <Pie data={this.state.types} options={this.state.type_options} />
                    </div>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="flex-grow-1">
                    <div className="font-size-12 text-muted">
                      <Pie data={this.state.status} options={this.state.status_options} />
                    </div>
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

export default WeeklyMonitoringPieChart
