import React, { Component } from "react"
import ReactApexChart from "react-apexcharts"

import getChartColorsArray from "../../../components/Common/ChartsDynamicColor";
class barchart extends Component {
  constructor(props) {
    super(props)
    const spineareaChartColors = getChartColorsArray(props.dataColors);

    this.state = {
      series: [
        {
          data: [380, 430, 450, 475, 550, 584, 780, 1100, 1220, 1365],
        },
      ],
      options: {
        chart: {
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        dataLabels: {
          enabled: false,
        },

        colors: spineareaChartColors,
        grid: {
          borderColor: "#f1f1f1",
        },
        xaxis: {
          categories: [
            "South Korea",
            "Canada",
            "United Kingdom",
            "Netherlands",
            "Italy",
            "France",
            "Japan",
            "United States",
            "China",
            "Germany",
          ],
        },
      },
    }
  }
  render() {
    return (
      <React.Fragment>
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type="bar"
          height="350"
          className="apex-charts"
        />
      </React.Fragment>
    )
  }
}

export default barchart
