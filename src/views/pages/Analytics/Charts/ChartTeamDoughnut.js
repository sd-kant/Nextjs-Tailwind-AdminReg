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
  LABELS_HEAT_DOUGHNUT,
  LABELS_SWEAT_DOUGHNUT,
  METRIC_TEAM_TABLE_VALUES,
  METRIC_USER_TABLE_VALUES
} from "../../../../constant";
import {
  chartPlugins,
  checkEmptyData,
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
    setIsEnablePrint(
        !checkEmptyData(chartData?.dataHeat?.datasets, 1) ||
        !checkEmptyData(chartData?.dataHeat?.dataSweat, 1)
    );
  }, [chartData, setIsEnablePrint]);

  const ChartComponent = (title, data, mode, labels) => {
    return (
        <div>
          <h1 className={clsx(style.TxtCenter)}>
            {title}
            {
              [METRIC_USER_TABLE_VALUES.SWR_ACCLIM_HEAT, METRIC_USER_TABLE_VALUES.SWR_ACCLIM_SWEAT].includes(selectedMetric?.value) && (
                  <div className={clsx(style.ChartLabel)}>
                    {t('for n', {n: selectedTeams?.length > 0 ? teamLabel : t("n team", {n: 0})})}
                  </div>
              )
            }
          </h1>
          <Doughnut
              data={data}
              plugins={chartPlugins(`doughnut-${mode}`, t(`no data to display`))}
              options={{
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return (context.dataset.label || '') + ': ' + chartData?.counts[context?.dataIndex + (mode === 'heat' ? 0 : 3)];
                      }
                    }
                  }
                }
              }}
          />
          <div className={clsx(style.LegendBoxBody)}>
            {HEAT_SWEAT_CHART_COLORS.map((item, key) => {
              return (
                  <div key={key} className={clsx(style.LegendFlex)}>
                    <div className={clsx(style.LegendBoxItem)} style={{backgroundColor: item}} />
                    <div className={clsx(style.LegendBoxTxt)}>{labels[key]}</div>
                  </div>
              )
            })}
          </div>
        </div>
    )
  };

  if (!chartData) return null;
  return (
      <div ref={chartRef} className={clsx(style.ChartBody)}>
        <div className={clsx(style.DoughnutGrid2)}>
          {
            [
              METRIC_USER_TABLE_VALUES.SWR_ACCLIM_HEAT,
              METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE,
            ].includes(selectedMetric?.value) && (
                ChartComponent(t(`heat susceptibility`), chartData?.dataHeat, 'heat', LABELS_HEAT_DOUGHNUT)
            )
          }

          {
            [
              METRIC_USER_TABLE_VALUES.SWR_ACCLIM_SWEAT,
              METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE,
            ].includes(selectedMetric?.value) && (
                ChartComponent(t(`sweat rate`), chartData?.dataSweat, 'sweat', LABELS_SWEAT_DOUGHNUT)
            )
          }
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
