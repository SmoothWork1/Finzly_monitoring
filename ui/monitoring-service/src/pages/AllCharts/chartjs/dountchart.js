import React, { Component } from "react"
import { Doughnut } from "react-chartjs-2"
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

class DountChart extends Component {
  constructor(props) {
    super(props);
    var doughnutChartColors = getChartColorsArray(props.dataColors);
    this.state = {
      data: {
        labels: ["Desktops", "Tablets"],
        datasets: [
          {
            data: [300, 210],
            backgroundColor: doughnutChartColors,
            hoverBackgroundColor: doughnutChartColors,
            hoverBorderColor: "#fff",
          },
        ],
      },
    };
  }
  render() {
    return (
      <React.Fragment>
        <Doughnut width={751} height={260} data={this.state.data} />
      </React.Fragment>
    )
  }
}

export default DountChart
