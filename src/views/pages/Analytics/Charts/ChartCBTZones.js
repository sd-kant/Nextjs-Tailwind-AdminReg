import * as React from 'react';
import { connect } from 'react-redux';
import { Chart as ChartJS, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import clsx from 'clsx';
import style from './Chart.module.scss';
import { useTranslation, withTranslation } from 'react-i18next';
import { useAnalyticsContext } from '../../../../providers/AnalyticsProvider';
import { HEAT_SWEAT_CHART_COLORS, LABELS_CBT_ZONES_DOUGHNUT } from '../../../../constant';
import { chartPlugins, checkEmptyData } from '../../../../utils/anlytics';

ChartJS.register(ArcElement);

const ChartCBTZones = () => {
  const { chartData, chartRef, setIsEnablePrint } = useAnalyticsContext();
  const { t } = useTranslation();

  React.useEffect(() => {
    setIsEnablePrint(
      !checkEmptyData(chartData?.dataHeat?.datasets, 1) ||
        !checkEmptyData(chartData?.dataHeat?.dataSweat, 1)
    );
  }, [chartData, setIsEnablePrint]);

  const ChartComponent = ({ title, data, labels }) => {
    return (
      <div>
        <h1 className={clsx(style.TxtCenter)}>{title}</h1>
        <Doughnut
          data={data}
          plugins={chartPlugins('doughnut-heat', t(`no data to display`))}
          options={{
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return (
                      (context.dataset.label || '') + ': ' + chartData?.counts[context?.dataIndex]
                    );
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
                <div className={clsx(style.LegendBoxItem)} style={{ backgroundColor: item }} />
                <div className={clsx(style.LegendBoxTxt)}>{labels[key]}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!chartData) return null;
  return (
    <div ref={chartRef} className={clsx(style.ChartBody)}>
      <div className={clsx(style.DoughnutGrid2)}>
        <ChartComponent
          title={''}
          data={chartData?.dataCBTZones}
          labels={LABELS_CBT_ZONES_DOUGHNUT}
        />
      </div>
    </div>
  );
};

const mapStateToProps = () => ({});

export default connect(mapStateToProps, null)(withTranslation()(ChartCBTZones));
