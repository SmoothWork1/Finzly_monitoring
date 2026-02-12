import React, { Component } from "react"
import ChartistGraph from "react-chartist"
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

class dountchart extends Component {
  constructor(props) {
    super(props);
    var dountchartColors = getChartColorsArray(props.dataColors);
    this.state = {
      dountChartData: {
        series: [10, 20, 50, 20, 5, 50, 15],
        labels: [1, 2, 3, 4, 5, 6, 7],
      },
      dountChartOptions: {
        donut: true,
        showLabel: false,
        "stroke-dashoffset": {
          //id: 'anim' + data.index,
          dur: 1000,
          // from: -pathLength + 'px',
          to: "0px",
          // easing: Chartist.Svg.Easing.easeOutQuint,
          fill: "freeze",
        },
        color: dountchartColors,
      },
    };
  }
  render() {
    return (
      <React.Fragment>
        <ChartistGraph
          style={{ height: "300px" }}
          data={this.state.dountChartData}
          options={this.state.dountChartOptions}
          type={"Pie"}
        />
      </React.Fragment>
    )
  }
}

export default dountchart
