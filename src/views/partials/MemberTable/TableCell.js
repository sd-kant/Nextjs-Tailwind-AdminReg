import * as React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { useUtilsContext } from '../../../providers/UtilsProvider';
import clsx from 'clsx';
import style from './TableCell.module.scss';
import { formatDevice4Digits, formatHeartRate } from '../../../utils/dashboard';
import BatteryV3 from '../../components/BatteryV3';
import { useTranslation } from 'react-i18next';
import {
  DEVICE_CONNECTION_STATUS,
  TIME_FORMAT_YYYYMDHM
} from '../../../constant';
import { hasStatusValue, numMinutesBetweenWithNow as numMinutesBetween } from '../../../utils';

const TableCell = ({ value, member, metric, hideCbtHR }) => {
  const {
    stat,
    alert,
    numberOfAlerts,
    lastSyncStr,
    alertObj,
    connectionObj,
    invisibleAlerts,
    invisibleDeviceMac,
    invisibleBattery,
    invisibleHeatRisk,
    invisibleLastSync,
    invisibleLastUpdates,
    heatSusceptibility
  } = member;
  const {
    formatHeartCbt,
    heartCBTZoneStyles,
    heartRateZoneStyles,
    getHeartRateZone,
    getHeartCBTZone
  } = useUtilsContext();
  // fixme duplicated
  const visibleHeartStats =
    numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 60 && stat?.onOffFlag;
  const cellGray = hasStatusValue(connectionObj?.value, [
    DEVICE_CONNECTION_STATUS.NEVER_CONNECTION,
    DEVICE_CONNECTION_STATUS.CHARGING,
    DEVICE_CONNECTION_STATUS.NO_CONNECTION
  ])
    ? style.NoConnection
    : null;
  const { t } = useTranslation();
  const heartRateZone = getHeartRateZone(member?.dateOfBirth, stat?.heartRateAvg);
  const heartCBTZone = getHeartCBTZone(stat?.cbtAvg);
  // const alertStatusColor = React.useMemo(() => {
  //   if (connectionObj?.value != DEVICE_CONNECTION_STATUS.CONNECTED) return null;
  //   if (alertObj?.value == ALERT_STAGE_STATUS.SAFE) return '#35EA6C';
  //   else if (
  //     hasStatusValue(alertObj?.value, [
  //       ALERT_STAGE_STATUS.AT_RISK,
  //       ALERT_STAGE_STATUS.ELEVATED_RISK
  //     ])
  //   )
  //     return '#F1374E';
  //   return null;
  // }, [alertObj, connectionObj]);

  switch (value) {
    case 'connection':
      return (
        <td className={clsx(style.TableCell, cellGray)}>
          <div className={clsx(style.Device)}>
            {!invisibleDeviceMac && formatDevice4Digits(stat?.deviceId) ? (
              <span>{formatDevice4Digits(stat?.deviceId)}</span>
            ) : null}
            <span>{t(connectionObj?.label)}</span>
            {!invisibleBattery ? (
              stat?.batteryPercent >= 20 ? (
                <BatteryV3 percent={stat?.batteryPercent} charging={stat?.chargingFlag} />
              ) : (
                <span className={clsx('text-risk')}>{t('battery very low')}</span>
              )
            ) : null}
          </div>
        </td>
      );
    case 'heatRisk':
      return (
        <td className={clsx(style.TableCell)}>
          {!invisibleHeatRisk && (
            <div className={clsx(style.Device, cellGray)}>
              <span className={clsx('font-bold')}>{alertObj?.label}</span>
              {alertObj?.value?.toString() !== '5' && (
                <React.Fragment>
                  {!hideCbtHR && (
                    <span>
                      {formatHeartCbt(alert?.heartCbtAvg)}
                      {metric ? '°C' : '°F'}&nbsp;&nbsp;&nbsp;{formatHeartRate(alert?.heartRateAvg)}{' '}
                      BPM
                    </span>
                  )}
                  <span>
                    {alert?.utcTs
                      ? new Date(alert?.utcTs).toLocaleString([], TIME_FORMAT_YYYYMDHM)
                      : ''}
                  </span>
                </React.Fragment>
              )}
            </div>
          )}
        </td>
      );
    case 'alerts':
      return (
        <td className={clsx(style.TableCell, cellGray)}>
          {invisibleAlerts ? '' : numberOfAlerts > 0 ? `${numberOfAlerts} Alerts` : `No Alerts`}
        </td>
      );
    case 'heatSusceptibility':
      return <td className={clsx(style.TableCell, cellGray)}>{heatSusceptibility ?? ''}</td>;
    case 'lastDataSync':
      return (
        <td className={clsx(style.TableCell)}>
          {!invisibleLastSync && (
            <div className={clsx(style.Device, cellGray)}>
              <span className={clsx('font-bold')}>{lastSyncStr}</span>
              {!hideCbtHR && !invisibleLastUpdates && (
                <div>
                  <span
                    style={visibleHeartStats? heartCBTZoneStyles[heartCBTZone?.value?.toString()]: null}>
                    {formatHeartCbt(visibleHeartStats ? stat?.cbtAvg : null)}
                    {metric ? '°C' : '°F'}&nbsp;&nbsp;&nbsp;
                  </span>
                  <span
                    style={
                      visibleHeartStats
                        ? heartRateZoneStyles[heartRateZone?.value?.toString()]
                        : null
                    }>
                    {formatHeartRate(visibleHeartStats ? stat?.heartRateAvg : null)} BPM
                  </span>
                </div>
              )}
            </div>
          )}
        </td>
      );
    default:
      return null;
  }
};

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.measure')
});

export default connect(mapStateToProps, null)(React.memo(TableCell));
