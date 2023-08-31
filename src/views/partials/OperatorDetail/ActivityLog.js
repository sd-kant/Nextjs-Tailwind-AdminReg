import * as React from 'react';
import clsx from 'clsx';
import thermometer from 'assets/images/thermometer-orange.svg';
import heart from 'assets/images/heart.svg';
import { formatHeartRate } from 'utils/dashboard';
import { useUtilsContext } from 'providers/UtilsProvider';
import { timeOnOtherZone } from 'utils';
import blockIcon from 'assets/images/no.svg';
import { useOperatorDashboardContext } from 'providers/operator/OperatorDashboardProvider';

const ActivityLog = ({ item, timezone }) => {
  const { formatHeartCbt, formatAlertForDetail, formatActivityLog } = useUtilsContext();
  const {
    userData: { organization }
  } = useOperatorDashboardContext();
  const hideCbtHR = organization?.settings?.hideCbtHR;
  return (
    <div className={clsx('tw-grid tw-grid-cols-12 mt-0 tw-items-center tw-gap-2')}>
      <div className={clsx('tw-overflow-hidden tw-text-ellipsis tw-col-span-12 md:tw-col-span-6')}>
        <div
          className={clsx(
            'font-binary',
            'tw-flex tw-items-center tw-justify-center tw-h-[40px] tw-rounded-[8px] tw-text-app-white tw-bg-app-ts tw-text-center',
            'tw-max-w-[200px] tw-break-words'
          )}>
          {item.type === 'Alert'
            ? formatAlertForDetail(item.alertStageId)
            : formatActivityLog(item)}
        </div>
      </div>

      <div
        className={clsx('tw-col-span-3', item.type !== 'Alert' ? 'tw-hidden md:tw-block' : null)}>
        <div className="tw-grid tw-grid-cols-2">
          <div
            className={clsx(
              'font-binary tw-col-span-1 tw-m-auto',
              'tw-flex tw-justify-center tw-w-[60px] tw-h-[40px] tw-rounded-[8px] tw-text-app-white tw-bg-app-ts tw-items-center'
            )}>
            <img
              className="tw-block md:tw-hidden"
              src={thermometer}
              alt="thermometer"
              width={8}
              style={{ marginRight: '3px' }}
            />
            <div className="tw-inline-flex tw-items-center tw-justify-center tw-w-[31px] tw-h-[24px]">
              {hideCbtHR ? (
                <img src={blockIcon} className={clsx('tw-w-[20px]')} alt="block icon" />
              ) : (
                <span>{item.type === 'Alert' ? formatHeartCbt(item.heartCbtAvg) : '--'}</span>
              )}
            </div>
          </div>
          <div
            className={clsx(
              'font-binary tw-col-span-1 tw-m-auto',
              'tw-flex tw-justify-center tw-w-[60px] tw-h-[40px] tw-rounded-[8px] tw-text-app-white tw-bg-app-ts tw-items-center'
            )}>
            <img
              className="tw-block md:tw-hidden"
              src={heart}
              alt="heart"
              width={13}
              style={{ marginRight: '3px' }}
            />
            <div
              className={clsx(
                'tw-inline-flex tw-items-center tw-justify-center tw-w-[31px] tw-h-[24px]'
              )}>
              {hideCbtHR ? (
                <img src={blockIcon} className={clsx('tw-w-[20px]')} alt="block icon" />
              ) : (
                <span>{item.type === 'Alert' ? formatHeartRate(item.heartRateAvg) : '--'}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="tw-col-span-12 md:tw-col-span-3">
        <span className={clsx('font-binary text-gray-2 mt-5', 'tw-py-2')}>
          {timeOnOtherZone(item.utcTs, timezone)}{' '}
          <span className={'tw-bock md:tw-hidden'}>({timezone.displayName})</span>
        </span>
      </div>
    </div>
  );
};

export default React.memo(ActivityLog);
