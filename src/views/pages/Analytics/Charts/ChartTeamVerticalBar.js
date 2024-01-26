import * as React from 'react';
import { connect } from 'react-redux';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import clsx from 'clsx';
import { useTranslation, withTranslation } from 'react-i18next';

import style from './Chart.module.scss';
import { useAnalyticsContext } from '../../../../providers/AnalyticsProvider';
import { chartPlugins, checkEmptyData } from '../../../../utils/anlytics';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const ChartTeamVerticalBar = () => {
  const { maxCBTTileData: chartData, chartRef, setIsEnablePrint } = useAnalyticsContext();
  const { t } = useTranslation();

  React.useEffect(() => {
    setIsEnablePrint(!checkEmptyData(chartData?.datasets, 1));
  }, [chartData, setIsEnablePrint]);

  if (!chartData?.labels) return <div className={clsx(style.EmptyHeight)} />;

  return (
    <div ref={chartRef} className={clsx(style.ChartBody)}>
      <div className={clsx(style.BarBody)}>
        <h1 className={clsx(style.TxtCenter)}>
          {t(`number of alerts each day`)}
          {/* {selectedMetric?.value === METRIC_USER_TABLE_VALUES.ALERTS && (
            <div className={clsx(style.ChartLabel)}>
              {t(`past 7 days of n`, {
                n: selectedTeams?.length > 0 ? teamLabel : t('n team', { n: 0 })
              })}
            </div>
          )} */}
        </h1>
        <div className={clsx(style.FlexSpace)}>
          <div className={clsx(style.FlexSpace, style.TxtLabel)}>{t(`number of alerts`)}</div>
          <div className={clsx(style.BarCanvas)}>
            <Bar data={chartData} plugins={chartPlugins(`bar`, t(`no data to display`))} />
          </div>
        </div>
        <div className={clsx(style.TxtCenter, style.TxtWeek)}>{t(`number of alerts each day`)}</div>
      </div>
    </div>
  );
};

const mapStateToProps = () => ({});

export default connect(mapStateToProps, null)(withTranslation()(ChartTeamVerticalBar));
