import React, { Component } from "react"
import ChartistGraph from "react-chartist"
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

class lineareachart extends Component {
  constructor(props) {
    super(props);
    var lineareaChartColors = getChartColorsArray(props.dataColors);
    this.state = {
      lineChartData: {
        labels: [1, 2, 3, 4, 5, 6, 7, 8],
        series: [[5, 9, 7, 8, 5, 3, 5, 4]],
      },
      lineChartOptions: {
        low: 0,
        showArea: true,
        color: lineareaChartColors,
      },
    };
  }
  render() {
    return (
      <React.Fragment>
        <ChartistGraph
          style={{ height: "300px" }}
          data={this.state.lineChartData}
          options={this.state.lineChartOptions}
          type={"Line"}
        />
      </React.Fragment>
    )
  }
}

export default lineareachart
