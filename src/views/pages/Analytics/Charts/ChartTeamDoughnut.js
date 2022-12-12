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
  HEAT_SWEAT_CHART_COLORS,
  LABELS_DOUGHNUT,
  METRIC_USER_TABLE_VALUES
} from "../../../../constant";
import {
  chartPlugins, checkEmptyData,
} from "../../../../utils/anlytics";

ChartJS.register(ArcElement);

const ChartTeamDoughnut = () => {
  const {
    chartData,
    selectedMetric,
    selectedTeams,
    teamLabel,
    chartRef,
    setIsEnablePrint,
  } = useAnalyticsContext();
  const {t} = useTranslation();

  React.useEffect(() => {
    setIsEnablePrint(!checkEmptyData(chartData?.dataHeat?.datasets, 1) || !checkEmptyData(chartData?.dataHeat?.dataSweat, 1));
  }, [chartData, setIsEnablePrint]);

  if (!chartData) return null;
  return (
      <div ref={chartRef} className={clsx(style.chart_body)}>
        <div className={clsx(style.doughnut_grid2)}>
          <div>
            <h1 className={clsx(style.txt_center)}>
              {t(`heat susceptibility`)}
              {
                selectedMetric?.value === METRIC_USER_TABLE_VALUES.SWR_ACCLIM && (
                    <div className={clsx(style.chart_label)}>
                      {t('for n', {n: selectedTeams?.length > 0 ? teamLabel : t("n team", {n: 0})})}
                    </div>
                )
              }
            </h1>

            <Doughnut
                data={chartData?.dataHeat}
                plugins={chartPlugins(`doughnut1`, t(`no data to display`))}
            />

            <div className={clsx(style.legend_box_body)}>
              {HEAT_SWEAT_CHART_COLORS.map((item, key) => {
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
              {
                selectedMetric?.value === METRIC_USER_TABLE_VALUES.SWR_ACCLIM && teamLabel && (
                    <div className={style.chart_label}>{t('for n', {n: selectedTeams?.length > 0 ? teamLabel : t("n team", {n: 0})})}</div>
                )
              }
            </h1>
            <Doughnut
                data={chartData?.dataSweat}
                plugins={chartPlugins(`doughnut2`, t(`no data to display`))}
            />

            <div className={clsx(style.legend_box_body)}>
              {HEAT_SWEAT_CHART_COLORS.map((item, key) => {
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
