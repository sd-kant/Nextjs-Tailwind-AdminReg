import * as React from 'react';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
  Tooltip,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-spacetime';

import clsx from 'clsx';
import style from './Chart.module.scss';
import { withTranslation } from 'react-i18next';
import { useAnalyticsContext } from '../../../../providers/AnalyticsProvider';
import { chartPlugins, checkEmptyData } from '../../../../utils/anlytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  TimeScale,
  Legend
);

const ChartMaximumCBT = ({ t }) => {
  const { chartRef, chartData, setIsEnablePrint } = useAnalyticsContext();
  React.useEffect(() => {
    setIsEnablePrint(!checkEmptyData(chartData?.datasets, 1));
  }, [chartData, setIsEnablePrint]);

  return (
    <div ref={chartRef} className={clsx(style.ChartBody)}>
      <div
        className={clsx(
          style.LineBody,
          'tw-flex',
          'tw-flex-col',
          'tw-items-center',
          'tw-justify-center',
          'tw-grow',
          'tw-w-full'
        )}>
        <h1 className={clsx(style.TxtCenter)}>{t('maximum cbt time of day')}</h1>

        <div
          className={clsx('tw-flex', 'tw-justify-center', 'tw-grow', 'tw-w-full', 'lg:tw-w-4/5')}>
          <Bar
            options={{
              scales: {
                y: {
                  min: 0,
                  suggestedMax: 10,
                  beginAtZero: true,
                  stacked: true,
                  ticks: {
                    stepSize: 1
                  },
                  title: {
                    display: true,
                    text: 'Number of Observations'
                  }
                },
                x: {
                  stacked: true,
                  title: {
                    display: true,
                    text: 'Time of Day'
                  }
                }
              }
            }}
            data={chartData}
            plugins={chartPlugins(`bar`, t(`no data to display`))}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.measure')
});

export default connect(mapStateToProps, null)(withTranslation()(ChartMaximumCBT));
