import React, { Component } from "react"
import ChartistGraph from "react-chartist"
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

class barchart extends Component {
  constructor(props) {
    super(props);
    var barChartistColors = getChartColorsArray(props.dataColors);
    this.state = {
      barChartData: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mai",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        series: [
          [5, 4, 3, 7, 5, 10, 3, 4, 8, 10, 6, 8],
          [3, 2, 9, 5, 4, 6, 4, 6, 7, 8, 7, 4],
        ],
        color: barChartistColors,
      },
      barChartOptions: {
        low: 0,
        showArea: true,
        seriesBarDistance: 10,
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

export default barchart
