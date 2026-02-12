import React, { Component } from "react"
import PropTypes from 'prop-types';
import ReactApexChart from "react-apexcharts"
import getChartColorsArray from "../../components/Common/ChartsDynamicColor";

class StackedColumnChart extends Component {
  constructor(props) {
    super(props)

    this.state = {
      options: {
        chart: {
          height: 360,
          type: 'bar',
          stacked: true,
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: true,
          },

        },

        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "15%",
            endingShape: "rounded",
          },
        },

        dataLabels: {
          enabled: false,
        },
        series: [{
          name: 'Series A',
          data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48]
        }, {
          name: 'Series B',
          data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22]
        }, {
          name: 'Series C',
          data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18]
        }],
        xaxis: {
          categories: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
        },
        colors: getChartColorsArray(this.props.dataColors),
        legend: {
          position: "bottom",
        },
        fill: {
          opacity: 1,
        },
      },
    }
  }

  render() {
    return (
      <React.Fragment>
        <ReactApexChart
          options={this.state.options}
          series={this.props.chartSeries || []}
          type="bar"
          height="360"
          className="apex-charts"
        />
      </React.Fragment>
    )
  }
}

StackedColumnChart.propTypes = {
  chartSeries: PropTypes.any,
  periodData: PropTypes.any,
  dataColors: PropTypes.any
}
export default StackedColumnChart
