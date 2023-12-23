import * as React from 'react';
import { connect } from 'react-redux';
import { Chart as ChartJS, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import clsx from 'clsx';
import style from './Chart.module.scss';
import { withTranslation } from 'react-i18next';
import { useAnalyticsContext } from '../../../../providers/AnalyticsProvider';
import { checkEmptyData } from '../../../../utils/anlytics';
import { get } from 'lodash';

ChartJS.register(ArcElement);

const ChartCBTZones = () => {
  const { chartData, chartRef, setIsEnablePrint } = useAnalyticsContext();

  React.useEffect(() => {
    setIsEnablePrint(
      !checkEmptyData(chartData?.dataHeat?.datasets, 1) ||
        !checkEmptyData(chartData?.dataHeat?.dataSweat, 1)
    );
  }, [chartData, setIsEnablePrint]);

  const ChartComponent = ({ title, data }) => {
    return (
      <div>
        <h1 className={clsx(style.TxtCenter)}>{title}</h1>
        <Doughnut
          data={data}
          options={{
            plugins: {
              legend: {
                display: true,
                labels: {
                  color: 'gray'
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
        />
      </div>
    );
  };

  if (!chartData) return null;
  return (
    <div ref={chartRef} className={clsx(style.ChartBody)}>
      <div className={clsx(style.DoughnutGrid2)}>
        <ChartComponent title={''} data={chartData?.dataCBTZones} />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.metric')
});

export default connect(mapStateToProps, null)(withTranslation()(ChartCBTZones));
