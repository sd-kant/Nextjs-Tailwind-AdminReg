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
          <span className={clsx('text-capitalize', 'tw-py-2')}>{t('loading')}</span>
        </div>
      ) : (
        <React.Fragment>
          <div
            className={clsx(
              'tw-grid tw-grid-cols-2 md:tw-grid-cols-4',
              'font-button-label text-orange'
            )}>
            <div className={'tw-flex tw-flex-col tw-items-center tw-col-span-1'}>
              <div className={clsx('font-binary', 'tw-py-2')}>{t('alert total')}</div>
              <div
                className={
                  'tw-flex tw-justify-center tw-w-[60px] tw-h-[40px] tw-rounded-[8px] tw-text-app-white tw-bg-app-ts tw-items-center'
                }>
                {metricStats?.totalAlerts ?? 0}
              </div>
            </div>

            <div className={'tw-flex tw-flex-col tw-items-center tw-col-span-1'}>
              <div className={clsx('font-binary', 'tw-py-2')}>{t('stop work alerts')}</div>
              <div
                className={
                  'tw-flex tw-justify-center tw-w-[60px] tw-h-[40px] tw-rounded-[8px] tw-text-app-white tw-bg-app-ts tw-items-center'
                }>
                {metricStats?.stopAlerts ?? 0}
              </div>
            </div>

            <div className={'tw-flex tw-flex-col tw-items-center tw-col-span-1'}>
              <div className={clsx('font-binary', 'tw-py-2')}>{`${t('highest')} CBT`}</div>
              <div
                className={
                  'tw-flex tw-justify-center tw-w-[60px] tw-h-[40px] tw-rounded-[8px] tw-text-app-white tw-bg-app-ts tw-items-center'
                }>
                {metricStats?.highestCbt ?? 0}
              </div>
            </div>

            <div className={'tw-flex tw-flex-col tw-items-center tw-col-span-1'}>
              <div className={clsx('font-binary', 'tw-py-2')}>{`${t('highest')} HR`}</div>
              <div
                className={
                  'tw-flex tw-justify-center tw-w-[60px] tw-h-[40px] tw-rounded-[8px] tw-text-app-white tw-bg-app-ts tw-items-center'
                }>
                {metricStats?.highestHr ?? 0}
              </div>
            </div>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default React.memo(MetricLogs);
