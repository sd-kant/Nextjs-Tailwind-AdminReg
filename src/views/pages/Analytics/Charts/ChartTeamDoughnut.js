import * as React from 'react';
import {connect} from "react-redux";
import { Chart as ChartJS, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import clsx from 'clsx';
import style from './Chart.module.scss';
import {
  useTranslation,
  withTranslation
} from "react-i18next";
import {useAnalyticsContext} from "../../../../providers/AnalyticsProvider";
import {
  COLORS,
  LABELS_DOUGHNUT
} from "../../../../constant";
import {chartPlugins} from "../../../../utils/anlytics";

ChartJS.register(ArcElement);

const ChartTeamDoughnut = () => {
  const {
    chartData,
  } = useAnalyticsContext();
  const {t} = useTranslation();

  return (
      <div className={clsx(style.chart_body)}>
        <div className={clsx(style.doughnut_grid2)}>
          <div>
            <h1 className={clsx(style.txt_center)}>
              {t(`heat susceptibility`)}
            </h1>
            <Doughnut
                data={chartData.dataHeat}
                plugins={chartPlugins(`doughnut`, t(`no data to display`))}
            />

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
            <h1 className={clsx(style.txt_center)}>
              {t(`sweat rate`)}
            </h1>
            <Doughnut
                data={chartData.dataSweat}
                plugins={chartPlugins(`doughnut`, t(`no data to display`))}
            />

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
