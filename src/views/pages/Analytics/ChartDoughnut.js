import * as React from 'react';
import {connect} from "react-redux";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import clsx from 'clsx';
import style from './ChartDoughnut.module.scss';
import {withTranslation} from "react-i18next";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";
ChartJS.register(ArcElement, Tooltip, Legend);

export const data = {
  type: 'doughnut',
  labels: ['Low', 'Medium', 'High',],
  datasets: [
    {
      label: '# of Votes',
      data: [19, 36, 45],
      backgroundColor: [
        '#ffe699',
        '#ffc000',
        '#ed7d31',
      ],
      borderColor: [
        '#ffe699',
        '#ffc000',
        '#ed7d31',
      ],
    },
  ],
};
const options = {
  plugins: {
    title: {
      display: true,
      text: 'Doughnut Chart',
      color:'blue',
      font: {
        size:34
      },
      padding:{
        top:30,
        bottom:30
      },
      responsive:true,
      animation:{
        animateScale: true,
      }
    }
  }
};

const plugins = [{
  id: 'abc',
  afterDraw(chart, args, options) {
    const {ctx} = chart;
    console.log(args, options);
    ctx.save();
    chart.data.datasets.forEach((dataset, i) => {
      chart.getDatasetMeta(i).data.forEach((dataPoint, index) => {
        console.log(index);
        const {x, y} = dataPoint.tooltipPosition();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, 10, 10);
      })
    })
  }
}];

const ChartDoughnut = () => {
  const {
    pageData,
  } = useAnalyticsContext();

  console.log(pageData, '=== pageData');

  return (
      <div className={clsx(style.chart_grid2)}>
        <div>
          <h1 className={clsx(style.txt_center)}>Heat Susceptibility</h1>
          <Doughnut data={data} options={options} plugins={plugins} />
        </div>
        <div>
          <h1 className={clsx(style.txt_center)}>Sweat Rate</h1>
          <Doughnut data={data} options={options} />
        </div>
      </div>
  )
};

const mapStateToProps = () => ({
});

export default connect(
    mapStateToProps,
    null
)(withTranslation()(ChartDoughnut));
