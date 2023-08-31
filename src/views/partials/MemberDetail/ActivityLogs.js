import * as React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useUserSubscriptionContext } from '../../../providers/UserSubscriptionProvider';
import ActivityLog from './ActivityLog';
import soft from 'timezone-soft';

const ActivityLogs = ({ logs, gmt }) => {
  const { t } = useTranslation();
  const { activitiesFilter, loading: logsLoading } = useUserSubscriptionContext();
  const timezone = React.useMemo(() => {
    const a = gmt ? soft(gmt)[0] : null;
    if (a) {
      return {
        name: gmt,
        valid: true,
        displayName: a.standard?.abbr
      };
    } else {
      return {
        name: gmt,
        valid: false,
        displayName: gmt
      };
    }
  }, [gmt]);

  return (
    <React.Fragment>
      {logsLoading ? (
        <div className={clsx('tw-grid tw-grid-cols-3 mt-2', 'font-binary text-white')}>
          <span className={clsx('text-capitalize', 'tw-py-2')}>{t('loading')}</span>
        </div>
      ) : (
        <React.Fragment>
          {logs?.length > 0 ? (
            <div
              className={clsx(
                'tw-hidden tw-grid-cols-12 mt-2 tw-gap-2',
                'font-button-label text-orange',
                'md:tw-grid'
              )}>
              <span className={clsx('font-binary', 'tw-py-2 tw-col-span-6')}>{t('details')}</span>
              <div className="tw-col-span-3 tw-grid-cols-2 tw-hidden md:tw-grid">
                <span className={clsx('font-binary', 'tw-py-2 tw-col-span-1 tw-text-center')}>
                  {t('cbt')}
                </span>
                <span className={clsx('font-binary', 'tw-py-2 tw-col-span-1 tw-text-center')}>
                  {t('hr')}
                </span>
              </div>
              <span
                className={clsx('font-binary', 'tw-py-2 tw-col-span-3', 'tw-hidden md:tw-block')}>
                {t('datetime')}
                {gmt ? ` (${timezone.displayName})` : ''}
              </span>
            </div>
          ) : (
            <div className={clsx('tw-grid tw-grid-cols-3 mt-2', 'font-button-label text-orange')}>
              <span className={clsx('font-binary text-capitalize', 'tw-py-2')}>
                {activitiesFilter?.noText}
              </span>
            </div>
          )}
          {logs?.map((item, index) => {
            return <ActivityLog timezone={timezone} item={item} key={`user-alert-${index}`} />;
          })}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default React.memo(ActivityLogs);
