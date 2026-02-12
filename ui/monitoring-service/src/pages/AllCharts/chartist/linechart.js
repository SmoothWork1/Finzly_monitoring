import React, { Component } from "react"
import ChartistGraph from "react-chartist"
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

class linechart extends Component {
  constructor(props) {
    super(props);
    var stackedbarchartColors = getChartColorsArray(props.dataColors);
    this.state = {
      lineChartData: {
        labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        series: [
          [12, 9, 7, 8, 5],
          [2, 1, 3.5, 7, 3],
          [1, 3, 4, 5, 6],
        ],
      },
      lineChartOptions: {
        fullWidth: true,
        chartPadding: {
          right: 40,
        },
        color: stackedbarchartColors,
      },
    };
  }
  render() {
    return (
      <React.Fragment>
        <ChartistGraph
          data={this.state.lineChartData}
          options={this.state.lineChartOptions}
          type={"Line"}
          style={{ height: "300px" }}
        />
      </React.Fragment>
    )
  }
}

export default linechart
