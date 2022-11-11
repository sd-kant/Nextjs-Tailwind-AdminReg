import * as React from 'react';
import {connect} from "react-redux";
import { Chart as ChartJS, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import clsx from 'clsx';
import style from './Chart.module.scss';
import {useTranslation, withTranslation} from "react-i18next";
import {useAnalyticsContext} from "../../../../providers/AnalyticsProvider";
import {
  COLORS,
  COLOR_WHITE,
  LABELS_DOUGHNUT
} from "../../../../constant";

ChartJS.register(ArcElement);

const ChartTeamDoughnut = () => {
  const {
    chartData,
  } = useAnalyticsContext();
  const {t} = useTranslation();

  const plugins = [{
    id: 'doughnut',
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
            ctx.fillStyle = COLOR_WHITE;
            ctx.fillText(text, x - (textWidth / 2), y - 13);
            ctx.restore();
          }
        })
      });

      if (chart.data.datasets[0].data && !chart.data.datasets[0].data[0] && !chart.data.datasets[0].data[1] && !chart.data.datasets[0].data[2]) {
        let width = chart.width;
        let height = chart.height;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "20px Arial";
        ctx.fillStyle = COLOR_WHITE;
        ctx.fillText(t('no data to display'), width / 2, height / 2);
        ctx.restore();
      }
    }
  }];

  return (
      <div className={clsx(style.chart_body)}>
        <div className={clsx(style.doughnut_grid2)}>
          <div>
            <h1 className={clsx(style.txt_center)}>{t('heat susceptibility')}</h1>
            <Doughnut data={chartData.dataHeat} plugins={plugins} />

            <div className={clsx(style.legend_box_body)}>
              {COLORS.map((item, key) => {
                return (
                    <div key={key} className={clsx(style.legend_flex)}>
                      <div className={clsx(style.legend_box_item)} style={{backgroundColor: item}} />
                      <div className={clsx(style.legend_box_txt)}>{LABELS_DOUGHNUT[key]}</div>
                    </div>
                )
              })}
            </div>
          </div>
          <div>
            <h1 className={clsx(style.txt_center)}>Sweat Rate</h1>
            <Doughnut data={chartData.dataSweat} plugins={plugins} />

            <div className={clsx(style.legend_box_body)}>
              {COLORS.map((item, key) => {
                return (
                    <div key={key} className={clsx(style.legend_flex)}>
                      <div className={clsx(style.legend_box_item)} style={{backgroundColor: item}} />
                      <div className={clsx(style.legend_box_txt)}>{LABELS_DOUGHNUT[key]}</div>
                    </div>
                )
              })}
            </div>
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
)(withTranslation()(ChartTeamDoughnut));
