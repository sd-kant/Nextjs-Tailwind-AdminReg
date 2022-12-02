import * as React from 'react';
import {connect} from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
} from 'chart.js';
import {Bar} from 'react-chartjs-2';

import clsx from 'clsx';
import style from './Chart.module.scss';
import {
  useTranslation,
  withTranslation
} from "react-i18next";
import {useAnalyticsContext} from "../../../../providers/AnalyticsProvider";
import {chartPlugins} from "../../../../utils/anlytics";
import {useBasicContext} from "../../../../providers/BasicProvider";
import {METRIC_USER_TABLE_VALUES} from "../../../../constant";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip
);

const ChartTeamVerticalBar = () => {
  const {
    maxCBTTileData: chartData,
    selectedTeams,
    selectedMetric,
    timeZone,
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

  if (!chartData?.labels) return <div className={clsx(style.empty_height)}/>;
  return (
      <div className={clsx(style.chart_body)}>
        <div className={clsx(style.bar_body)}>
          <h1 className={clsx(style.txt_center)}>
            {t(`number of alerts by week`)}
            {
              selectedMetric?.value === METRIC_USER_TABLE_VALUES.ALERTS && (
                  <div className={clsx(style.chart_label)}>{t(`past 7 days of n`, {n: label})}</div>
              )
            }
          </h1>
          <div className={clsx(style.flex_space)}>
            <div className={clsx(style.flex_space, style.txt_label)}>
              {t(`number of alerts`)}
            </div>
            <div className={clsx(style.bar_canvas)}>
              <Bar
                  data={chartData}
                  plugins={chartPlugins(`bar`, t(`no data to display`))}
              />
            </div>
          </div>

          <div className={clsx(style.txt_center)}>
            {timeZone ? timeZone?.displayName + ` - ` + timeZone?.name : ``}
          </div>

          <div className={clsx(style.txt_center, style.txt_week)}>
            {t(`week`)}
          </div>
        </div>
      </div>
  )
};

const mapStateToProps = () => ({});

export default connect(
    mapStateToProps,
    null
)(withTranslation()(ChartTeamVerticalBar));
