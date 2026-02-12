import React, { Component } from "react"
import ChartistGraph from "react-chartist"
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

class chartbar extends Component {
  constructor(props) {
    super(props);
    var chatbarchartColors = getChartColorsArray(props.dataColors);
    this.state = {
      barChartData: {
        labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10"],
        series: [[1, 2, 4, 8, 6, -2, -1, -4, -6, -2]],
      },
      barChartOptions: {
        high: 10,
        low: -10,
        color: chatbarchartColors,
      },
    };
  }
  render() {
    return (
      <React.Fragment>
        <ChartistGraph
          style={{ height: "300px" }}
          data={this.state.barChartData}
          options={this.state.barChartOptions}
          type={"Bar"}
        />
      </React.Fragment>
    )
  }
}

export default chartbar
