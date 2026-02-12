import React, { Component } from "react"
import { Bar } from "react-chartjs-2"
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

class BarChart extends Component {
  constructor(props) {
    super(props);
    var barChartColor = getChartColorsArray(props.dataColors);
    this.state = {
      data: {
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
        ],
        datasets: [
          {
            label: "Sales Analytics",
            backgroundColor: barChartColor[0],
            borderColor: barChartColor[0],
            borderWidth: 1,
            hoverBackgroundColor: barChartColor[1],
            hoverBorderColor: barChartColor[1],
            data: [65, 59, 81, 45, 56, 80, 50, 20],
          },
        ],
      },
      option: {
        scales: {
          dataset: [
            {
              barPercentage: 0.4,
            },
          ],
        },
      }
    };
  }
  render() {
    return (
      <React.Fragment>
        <Bar width={751} height={300} data={this.state.data} options={this.state.option} />
      </React.Fragment>
    )
  }
}

export default BarChart
