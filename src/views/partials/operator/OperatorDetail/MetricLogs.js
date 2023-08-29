import * as React from 'react';
import clsx from 'clsx';
import style from './MetricLogs.module.scss';
import { useTranslation } from 'react-i18next';
import { useOperatorDashboardContext } from 'providers/operator/OperatorDashboardProvider';

const MetricLogs = ({ metricStats }) => {
  const { t } = useTranslation();
  const { logsLoading } = useOperatorDashboardContext();

  return (
    <React.Fragment>
      {logsLoading ? (
        <div className={clsx(style.DataRow, style.Header, 'font-binary text-white')}>
          <span className={clsx('text-capitalize', style.Padding)}>{t('loading')}</span>
        </div>
      ) : (
        <React.Fragment>
          <div className={clsx(style.DataRow, 'font-button-label text-orange')}>
            <div className={clsx(style.DataBoxBody)}>
              <div className={clsx('font-binary', style.Padding)}>{t('alert total')}</div>
              <div className={clsx(style.DataBox)}>{metricStats?.totalAlerts ?? 0}</div>
            </div>

            <div className={clsx(style.DataBoxBody)}>
              <div className={clsx('font-binary', style.Padding)}>{t('stop work alerts')}</div>
              <div className={clsx(style.DataBox)}>{metricStats?.stopAlerts ?? 0}</div>
            </div>

            <div className={clsx(style.DataBoxBody)}>
              <div className={clsx('font-binary', style.Padding)}>{`${t('highest')} CBT`}</div>
              <div className={clsx(style.DataBox)}>{metricStats?.highestCbt ?? 0}</div>
            </div>

            <div className={clsx(style.DataBoxBody)}>
              <div className={clsx('font-binary', style.Padding)}>{`${t('highest')} HR`}</div>
              <div className={clsx(style.DataBox)}>{metricStats?.highestHr ?? 0}</div>
            </div>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default React.memo(MetricLogs);
