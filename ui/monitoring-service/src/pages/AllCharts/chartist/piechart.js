import React, { Component } from "react"
import ChartistGraph from "react-chartist"
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

class piechart extends Component {
  constructor(props) {
    super(props);
    var simplePieChartColors = getChartColorsArray(props.dataColors);
    this.state = {
      pieChartData: {
        series: [5, 3, 4],
        labels: ["42%", "25%", "33%"],
      },
      pieChartOptions: {
        showLabel: true,
        color: simplePieChartColors,
      },
    };
  }
  render() {
    return (
      <React.Fragment>
        <ChartistGraph
          data={this.state.pieChartData}
          options={this.state.pieChartOptions}
          style={{ height: "300px" }}
          type={"Pie"}
        />
      </React.Fragment>
    )
  }
}

export default piechart
