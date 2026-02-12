import React, { Component } from "react";
import { Polar } from "react-chartjs-2";
import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";

class PolarChart extends Component {
  constructor(props) {
    super(props);
    var polarAreaChartColors = getChartColorsArray(props.dataColors);
    this.state = {
      data: {
        datasets: [
          {
            data: [11, 16, 7, 18],
            backgroundColor: polarAreaChartColors,
            label: "My dataset", // for legend
            hoverBorderColor: "#fff",
          },
        ],
        labels: ["Series 1", "Series 2", "Series 3", "Series 4"],
      },
    };
  }
  render() {
    return (
      <React.Fragment>
        <Polar width={751} height={300} data={this.state.data} />
      </React.Fragment>
    );
  }
}

export default PolarChart;
