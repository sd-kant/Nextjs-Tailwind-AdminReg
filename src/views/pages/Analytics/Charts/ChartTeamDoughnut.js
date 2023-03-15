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

  if (!chartData) return null;
  return (
      <div ref={chartRef} className={clsx(style.ChartBody)}>
        <div className={clsx(style.DoughnutGrid2)}>
          {
            selectedMetric?.value !== 23 && (
                <div>
                  <h1 className={clsx(style.TxtCenter)}>
                    {t(`heat susceptibility`)}
                    {
                      selectedMetric?.value === METRIC_USER_TABLE_VALUES.SWR_ACCLIM && (
                          <div className={clsx(style.ChartLabel)}>
                            {t('for n', {n: selectedTeams?.length > 0 ? teamLabel : t("n team", {n: 0})})}
                          </div>
                      )
                    }
                  </h1>

                  <Doughnut
                      data={chartData?.dataHeat}
                      plugins={chartPlugins(`doughnut1`, t(`no data to display`))}
                      options={{
                        plugins: {
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return (context.dataset.label || '') + ': ' + chartData?.counts[context?.dataIndex];
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
                            <div className={clsx(style.LegendBoxTxt)}>{LABELS_HEAT_DOUGHNUT[key]}</div>
                          </div>
                      )
                    })}
                  </div>
                </div>
            )
          }

          {
            selectedMetric?.value !== 24 && (
                <div>
                  <h1 className={clsx(style.TxtCenter)}>
                    {t(`sweat rate`)}
                    {
                      selectedMetric?.value === METRIC_USER_TABLE_VALUES.SWR_ACCLIM && teamLabel && (
                          <div className={style.ChartLabel}>{t('for n', {n: selectedTeams?.length > 0 ? teamLabel : t("n team", {n: 0})})}</div>
                      )
                    }
                  </h1>
                  <Doughnut
                      data={chartData?.dataSweat}
                      plugins={chartPlugins(`doughnut2`, t(`no data to display`))}
                      options={{
                        plugins: {
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return (context.dataset.label || '') + ': ' + chartData?.counts[context?.dataIndex + 3];
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
                            <div className={clsx(style.LegendBoxTxt)}>{LABELS_SWEAT_DOUGHNUT[key]}</div>
                          </div>
                      )
                    })}
                  </div>
                </div>
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
