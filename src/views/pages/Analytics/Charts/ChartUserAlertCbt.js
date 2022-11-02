import * as React from 'react';
import {connect} from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {COLORS} from "../../../../constant";

import clsx from 'clsx';
import style from './Chart.module.scss';
import {useTranslation, withTranslation} from "react-i18next";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
);

const labels = [
    '6:56:54', '7:07:41', '7:18:28', '7:29:31', '7:56:20', '8:00:29', '8:21:35', '8:22:45', '8:23:19', '8:32:23',
    '9:56:54', '10:07:41', '10:18:28', '10:29:31', '10:56:20', '11:00:29', '11:21:35', '11:22:45', '11:23:19', '11:32:23',
    '12:56:54', '13:07:41', '13:18:28', '13:29:31', '13:56:20', '14:00:29', '14:21:35', '14:22:45', '14:23:19', '14:32:23',
    '15:56:54', '16:07:41', '16:18:28', '16:29:31', '16:56:20', '17:00:29', '17:21:35', '17:22:45', '17:23:19', '17:32:23',
    '18:56:54', '19:07:41', '19:18:28', '19:29:31', '19:56:20', '20:00:29', '20:21:35', '20:22:45', '20:23:19', '20:32:23',
];

export const data = {
  labels,
  datasets: [
    {
      label: 'CBT',
      data: labels.map(() => (Math.random() * 4.5) + 97),
      borderWidth: 4,
      borderColor: COLORS[2],
      backgroundColor: COLORS[2],
    },
  ],
};

export const options = {
  radius: 0
};

const ChartUserAlertCbt = () => {
  const {t} = useTranslation();

  return (
      <div className={clsx(style.chart_body)}>
        <div className={clsx(style.line_body)}>
          <h1 className={clsx(style.txt_center)}>{t('cbt')}</h1>
          <div className={clsx(style.flex_space)}>
            <Line options={options} data={data} />
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
)(withTranslation()(ChartUserAlertCbt));
