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
import { chartPlugins } from '../../../../utils/anlytics';

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
  const { chartRef, chartData } = useAnalyticsContext();
  return (
    <div ref={chartRef} className={clsx(style.ChartBody)}>
      <div className={clsx(style.LineBody)}>
        {/*<h1 className={clsx(style.TxtCenter)}/>*/}

        <div className={clsx(style.FlexSpace)}>
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
  metric: get(state, 'ui.metric')
});

export default connect(mapStateToProps, null)(withTranslation()(ChartMaximumCBT));
