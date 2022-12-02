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
import {chartPlugins} from "../../../../utils/anlytics";
import {useBasicContext} from "../../../../providers/BasicProvider";

ChartJS.register(ArcElement);

const ChartTeamDoughnut = () => {
  const {
    chartData,
    selectedMetric,
    selectedTeams
  } = useAnalyticsContext();
  const {t} = useTranslation();

  const {
    formattedTeams: teams
  } = useBasicContext();

  const label = React.useMemo(() => {
    if (selectedTeams?.length > 0) {
      if (teams?.length > 1 && (selectedTeams?.length === teams?.length)) {
        return t("all teams");
      } else if (selectedTeams?.length > 1) {
        return t("n teams selected", {n: selectedTeams?.length});
      } else {
        return teams?.find(it => it.value?.toString() === selectedTeams[0]?.value?.toString())?.label;
      }
    } else {
      return t("n team", {n: 0});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeams, teams]);

  if (!chartData) return null;
  return (
      <div className={clsx(style.chart_body)}>
        <div className={clsx(style.doughnut_grid2)}>
          <div>
            <h1 className={clsx(style.txt_center)}>
              {t(`heat susceptibility`)}
              {
                selectedMetric?.value === METRIC_USER_TABLE_VALUES.SWR_ACCLIM && (
                    <div className={clsx(style.chart_label)}>{t('for n', {n: label})}</div>
                )
              }
            </h1>

            <Doughnut
                data={chartData?.dataHeat}
                plugins={chartPlugins(`doughnut`, t(`no data to display`))}
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
                selectedMetric?.value === METRIC_USER_TABLE_VALUES.SWR_ACCLIM && label && (
                    <div className={style.chart_label}>{t('for n', {n: label})}</div>
                )
              }
            </h1>
            <Doughnut
                data={chartData?.dataSweat}
                plugins={chartPlugins(`doughnut`, t(`no data to display`))}
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
