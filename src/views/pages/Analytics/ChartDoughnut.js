import * as React from 'react';
import {connect} from "react-redux";
import { Chart as ChartJS, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import clsx from 'clsx';
import style from './ChartDoughnut.module.scss';
import {useTranslation, withTranslation} from "react-i18next";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";
ChartJS.register(ArcElement);

const plugins = [{
  id: 'abc',
  afterDraw(chart) {
    const {ctx} = chart;
    ctx.save();

    chart.data.datasets.forEach((dataset, i) => {
      chart.getDatasetMeta(i).data.forEach((dataPoint, index) => {
        const {x, y} = dataPoint.tooltipPosition();
        const text = chart.data.labels[index] + ': ' + chart.data.datasets[i].data[index] + '%';
        const textWidth = ctx.measureText(text).width;

        if (chart.data.datasets[i].data[index]) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(x - ((textWidth + 10) / 2), y - 29, textWidth + 15, 24);

          // triangle
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 5, y - 5);
          ctx.lineTo(x + 5, y - 5);
          ctx.fill();
          ctx.restore();

          //text
          ctx.font = '12px Arial';
          ctx.fillStyle = 'white';
          ctx.fillText(text, x - (textWidth / 2), y - 13);
          ctx.restore();
        }
      })
    })
  }
}];

const ChartDoughnut = () => {
  const {
    chartData,
  } = useAnalyticsContext();

  const {t} = useTranslation();
  const Colors = ['#ffe699', '#ffc000', '#ed7d31'];
  const Labels = [t('low %'), t('medium'), t('high'),];

  const dataHeat = {
    type: 'doughnut',
    labels: Labels,
    datasets: [
      {
        label: '# of Votes',
        data: [chartData ? chartData[0] ?? 0 : 0, chartData ? chartData[1] ?? 0 : 0, chartData ? chartData[2] ?? 0 : 0],
        backgroundColor: Colors,
        borderColor: [
          '#fff',
          '#fff',
          '#fff',
        ],
      },
    ],
  };

  const dataSweat = {
    type: 'doughnut',
    labels: Labels,
    datasets: [
      {
        label: '# of Votes',
        data: [chartData ? chartData[3] ?? 0 : 0, chartData ? chartData[4] ?? 0 : 0, chartData ? chartData[5] ?? 0 : 0],
        backgroundColor: Colors,
        borderColor: [
          '#fff',
          '#fff',
          '#fff',
        ],
      },
    ],
  };

  return (
      <div className={clsx(style.chart_grid2)}>
        <div>
          <h1 className={clsx(style.txt_center)}>Heat Susceptibility</h1>
          <Doughnut data={dataHeat} plugins={plugins} />

          <div className={clsx(style.legend_box_body)}>
            {Colors.map((item, key) => {
              return (
                  <div key={key} className={clsx(style.legend_flex)}>
                    <div className={clsx(style.legend_box_item)} style={{backgroundColor: item}} />
                    <div className={clsx(style.legend_box_txt)}>{Labels[key]}</div>
                  </div>
              )
            })}
          </div>
        </div>
        <div>
          <h1 className={clsx(style.txt_center)}>Sweat Rate</h1>
          <Doughnut data={dataSweat} plugins={plugins} />

          <div className={clsx(style.legend_box_body)}>
            {Colors.map((item, key) => {
              return (
                  <div key={key} className={clsx(style.legend_flex)}>
                    <div className={clsx(style.legend_box_item)} style={{backgroundColor: item}} />
                    <div className={clsx(style.legend_box_txt)}>{Labels[key]}</div>
                  </div>
              )
            })}
          </div>
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
