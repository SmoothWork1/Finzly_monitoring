import React, { Component } from "react"
import { Radar } from "react-chartjs-2"
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

class RadarChart extends Component {
  constructor(props) {
    super(props);
    var radarChartColors = getChartColorsArray(props.dataColors);
    this.state = {
      data: {
        labels: [
          "Eating",
          "Drinking",
          "Sleeping",
          "Designing",
          "Coding",
          "Cycling",
          "Running",
        ],
        datasets: [
          {
            label: "Desktops",
            backgroundColor: radarChartColors[0],
            borderColor: radarChartColors[1],
            pointBackgroundColor: radarChartColors[1],
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: radarChartColors[1],
            data: [65, 59, 90, 81, 56, 55, 40],
          },
          {
            label: "Tablets",
            backgroundColor: radarChartColors[2],
            borderColor: radarChartColors[3],
            pointBackgroundColor: radarChartColors[3],
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: radarChartColors[3],
            data: [28, 48, 40, 19, 96, 27, 100],
          },
        ],
      },
    };
  }
  render() {
    return (
      <React.Fragment>
        <Radar width={751} height={300} data={this.state.data} />
      </React.Fragment>
    )
  }
}

export default RadarChart
