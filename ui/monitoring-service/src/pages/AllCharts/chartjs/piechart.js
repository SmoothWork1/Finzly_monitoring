import React, { Component } from "react"
import { Pie } from "react-chartjs-2"
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

class PieChart extends Component {
  constructor(props) {
    super(props);
    var pieChartColors = getChartColorsArray(props.dataColors);
    this.state = {
      data: {
        labels: ["Desktops", "Tablets"],
        datasets: [
          {
            data: [300, 180],
            backgroundColor: pieChartColors,
            hoverBackgroundColor: pieChartColors,
            hoverBorderColor: "#fff",
          },
        ],
      },
    };
  }
  render() {
    return (
      <React.Fragment>
        <Pie width={751} height={260} data={this.state.data} />
      </React.Fragment>
    )
  }
}

export default PieChart
