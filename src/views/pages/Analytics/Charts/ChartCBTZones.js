import * as React from 'react';
import { connect } from 'react-redux';
import { Chart as ChartJS, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import clsx from 'clsx';
import style from './Chart.module.scss';
import { withTranslation } from 'react-i18next';
import { useAnalyticsContext } from '../../../../providers/AnalyticsProvider';
import { chartPlugins, checkEmptyData } from '../../../../utils/anlytics';
import { get } from 'lodash';

ChartJS.register(ArcElement);

const ChartCBTZones = ({ t }) => {
  const { chartData, chartRef, setIsEnablePrint, selectedTeams, teamLabel } = useAnalyticsContext();
  React.useEffect(() => {
    setIsEnablePrint(
      !checkEmptyData(chartData?.dataHeat?.datasets, 1) ||
        !checkEmptyData(chartData?.dataHeat?.dataSweat, 1)
    );
  }, [chartData, setIsEnablePrint]);

  const ChartComponent = ({ data }) => {
    return (
      <div>
        <h1 className={clsx(style.TxtCenter)}>
          {t('percent of time in cbt zones')}

          <div className={clsx(style.ChartLabel)}>
            {t('for n', { n: selectedTeams?.length > 0 ? teamLabel : t('n team', { n: 0 }) })}
          </div>
        </h1>
        <Doughnut
          data={data}
          options={{
            plugins: {
              legend: {
                display: true,
                labels: {
                  color: 'white'
                },
                position: 'bottom'
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return ' ' + context.dataset?.data?.[context?.dataIndex] + '%';
                  }
                }
              }
            }
          }}
          plugins={chartPlugins('Doughnut', null)}
        />
      </div>
    );
  };

  if (!chartData) return null;
  return (
    <div ref={chartRef} className={clsx(style.ChartBody)}>
      <div className={clsx(style.DoughnutGrid2)}>
        <ChartComponent data={chartData?.dataCBTZones} />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.metric')
});

export default connect(mapStateToProps, null)(withTranslation()(ChartCBTZones));
