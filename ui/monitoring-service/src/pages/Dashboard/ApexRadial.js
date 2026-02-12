import React, { Component } from "react"
import ReactApexChart from "react-apexcharts"
import getChartColorsArray from "../../components/Common/ChartsDynamicColor";
import "./dashboard.scss"

class ApexRadial extends Component {
  constructor(props) {
    super(props)

    const apexRadialColors = getChartColorsArray(props.dataColors);

    this.state = {
      chart: {
        height: 200,
        type: 'radialBar',
        offsetY: -10
      },
      options: {
        plotOptions: {
          radialBar: {
            startAngle: -135,
            endAngle: 135,
            dataLabels: {
              name: {
                fontSize: "13px",
                color: void 0,
                offsetY: 60,
              },
              value: {
                offsetY: 22,
                fontSize: "16px",
                color: void 0,
                formatter: function (e) {
                  return e + "%"
                },
              },
            },
          },
        },
        colors: apexRadialColors,
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            shadeIntensity: 0.15,
            inverseColors: !1,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 65, 91],
          },
        },
        stroke: {
          dashArray: 4,
        },
        labels: ["Happiness %"],
      },
      series: [95],
    }
  }

  render() {
    return (
      <React.Fragment>
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type="radialBar"
          height="200"
          className='apex-charts'
        />
      </React.Fragment>
    )
  }
}

export default ApexRadial
