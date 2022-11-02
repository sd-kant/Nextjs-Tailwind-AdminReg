import * as React from 'react';
import {connect} from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
    Tooltip
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import clsx from 'clsx';
import style from './Chart.module.scss';
import {useTranslation, withTranslation} from "react-i18next";
import {useAnalyticsContext} from "../../../../providers/AnalyticsProvider";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip
);

const ChartTeamVerticalBar = () => {
  const {
    chartData,
  } = useAnalyticsContext();
  const {t} = useTranslation();
  const labels = chartData?.xLabel;

  if (!chartData?.xLabel) return null;
  return (
      <div className={clsx(style.chart_body)}>
        <div className={clsx(style.bar_body)}>
          <h1 className={clsx(style.txt_center)}>{t('number of alerts by week')}</h1>
          <div className={clsx(style.flex_space)}>
            <div className={clsx(style.flex_space, style.txt_label)}>{t('number of alerts')}</div>
            <div className={clsx(style.bar_canvas)}>
              <Bar data={{ labels, datasets: chartData?.data || [], }} />
            </div>
          </div>
          <div className={clsx(style.txt_center, style.txt_week)}>{t('week')}</div>
        </div>
      </div>
  )
};

const mapStateToProps = () => ({
});

export default connect(
    mapStateToProps,
    null
)(withTranslation()(ChartTeamVerticalBar));
