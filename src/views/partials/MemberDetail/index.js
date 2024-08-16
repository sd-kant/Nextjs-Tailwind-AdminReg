import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import clsx from 'clsx';
import avatar from 'assets/images/logo_round.png';
import alertsIcon from 'assets/images/alerts-icon.svg';
import closeIcon from 'assets/images/close-orange.svg';
import Button from 'views/components/Button';
import { useDashboardContext } from 'providers/DashboardProvider';
import thermometer from 'assets/images/thermometer-orange.svg';
import heart from 'assets/images/heart.svg';
import { get } from 'lodash';
import ResponsiveSelect from 'views/components/ResponsiveSelect';
import { customStyles } from 'views/pages/team/dashboard/DashboardV2';
import { hasStatusValue, numMinutesBetweenWithNow as numMinutesBetween } from 'utils';
import BatteryV3 from 'views/components/BatteryV3';
import { formatHeartRate } from 'utils/dashboard';
import { useUtilsContext } from 'providers/UtilsProvider';
import { useUserSubscriptionContext } from 'providers/UserSubscriptionProvider';
import ActivityLogs from './ActivityLogs';
import lockIcon from 'assets/images/lock.svg';
import blockIcon from 'assets/images/no.svg';
import MetricLogs from './MetricLogs';
import Card from './Card';
import Divider from './Divider';
import Badge from './Badge';
import { ALERT_STAGE_STATUS, DEVICE_CONNECTION_STATUS, EVENT_DATA_TYPE } from '../../../constant';

export const filters = [
  {
    value: '1',
    label: 'most recent'
  },
  {
    value: '2',
    label: 'most highest'
  }
];

const MemberDetail = ({
  t,
  closeModal = () => {},
  data: origin,
  metric,
  handleClickMoveTeam,
  handleClickUnlock,
  team,
  setTeam
}) => {
  const {
    getHeartRateZone,
    formatHeartCbt,
    getHeartCBTZone,
    heartCBTZoneStyles,
    heartRateZoneStyles
  } = useUtilsContext();
  const {
    values: { devices },
    formattedMembers,
    formattedTeams
  } = useDashboardContext();
  const {
    user,
    setUser,
    logs,
    metricStats,
    activitiesFilters,
    activitiesFilter,
    setActivitiesFilter,
    metricsFilter,
    setMetricsFilter
  } = useUserSubscriptionContext();
  const numberOfAlerts = React.useMemo(() => {
    return logs.filter((it) => it.type === EVENT_DATA_TYPE.ALERT)?.length;
  }, [logs]);
  const memberId = React.useRef(origin?.userId);
  const teamId = React.useRef(origin?.teamId);
  const orgId = React.useRef(origin?.orgId);
  const data = React.useMemo(() => {
    return origin
      ? origin
      : formattedMembers.find((it) => it.userId?.toString() === memberId.current?.toString());
  }, [formattedMembers, origin]);

  const { stat, alertObj, lastSyncStr, connectionObj, invisibleHeatRisk } = data ?? {
    stat: null,
    alertsForMe: null,
    lastSyncStr: null,
    settings: { hideCbtHR: false }
  };
  const hideCbtHR = data?.settings?.hideCbtHR;

  let connectStatus = 'off';
  if (connectionObj?.value == DEVICE_CONNECTION_STATUS.CONNECTED) {
    if (
      hasStatusValue(alertObj?.value, [
        ALERT_STAGE_STATUS.AT_RISK,
        ALERT_STAGE_STATUS.ELEVATED_RISK
      ])
    ) {
      connectStatus = 'risk';
    } else {
      connectStatus = 'safe';
    }
  } else if (connectionObj?.value == DEVICE_CONNECTION_STATUS.LIMITED_CONNECTION) {
    connectStatus = 'sleep';
  }

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

  // const [team, setTeam] = React.useState(null);
  React.useEffect(() => {
    if (data?.teamId) {
      setTeam(formattedTeams?.find((it) => it.value?.toString() === data?.teamId?.toString()));
    } else {
      setTeam(null);
    }
    setUser(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  const userDevices = devices?.find(
    (it) => it.userId?.toString() === data?.userId?.toString()
  )?.devices;
  let apiDevice = null;
  let kenzenDevice = null;
  if (userDevices?.length > 0) {
    if (stat && stat.deviceId) {
      kenzenDevice = userDevices
        ?.filter(
          (it) =>
            it.type === 'kenzen' && it.deviceId?.toLowerCase() === stat.deviceId?.toLowerCase()
        )
        ?.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())?.[0];
    }
    const filterFunc = (it) => {
      if (['', null, undefined, 'null', 'undefined', 'none'].includes(stat?.sourceDeviceId)) {
        return it.type !== 'kenzen';
      } else {
        return (
          it.type !== 'kenzen' && it.deviceId?.toLowerCase() === stat?.sourceDeviceId?.toLowerCase()
        );
      }
    };
    apiDevice = userDevices
      ?.filter(filterFunc)
      ?.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())?.[0];
    if (!apiDevice)
      apiDevice = userDevices
        ?.filter((it) => it.type !== 'kenzen')
        ?.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())?.[0];
  }
  // fixme duplicated
  const visibleHeartStats =
    numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 60 && stat?.onOffFlag;
  const heartRateZone = getHeartRateZone(data?.dateOfBirth, stat?.heartRateAvg);
  const heartCBTZone = getHeartCBTZone(stat?.cbtAvg);

  const renderActionContent = () => {
    return (
      <>
        {data?.locked ? (
          <div>
            <Button
              size="sm"
              bgColor={'transparent'}
              borderColor={'orange'}
              title={t('unlock user')}
              onClick={handleClickUnlock}
            />
          </div>
        ) : null}
      </>
    );
  };

  const apiDeviceInfo = React.useMemo(() => {
    if (!apiDevice) return null;
    let ret = 'Not Recognized';
    if (apiDevice?.type === 'ios') {
      ret = `iOS Ver. ${apiDevice?.osVersion ?? 'N/A'}`;
    } else if (apiDevice?.type === 'android') {
      ret = `Android Ver. ${apiDevice?.osVersion ?? 'N/A'}`;
    } else if (apiDevice?.type === 'hub') {
      ret = `Hub MAC: ${apiDevice?.deviceId ?? 'N/A'}`;
    }
    return ret;
  }, [apiDevice]);

  const appInfo = React.useMemo(() => {
    if (!apiDevice) return null;
    return `App Ver. ${apiDevice?.version ?? 'N/A'}`;
  }, [apiDevice]);

  const userFullName = React.useMemo(() => {
    return data?.firstName + ' ' + data?.lastName;
  }, [data]);

  return (
    <div className="tw-p-2 lg:tw-p-12 tw-relative">
      <img
        className={clsx('tw-absolute tw-top-4 tw-right-4')}
        src={closeIcon}
        alt="close icon"
        onClick={closeModal}
      />
      <div className={'tw-grid tw-grid-cols-12 tw-gap-2 lg:tw-gap-8 tw-bg-app-list-bg'}>
        <div className="tw-col-span-12 lg:tw-col-span-5 xl:tw-col-span-4">
          <Card className="tw-grid tw-grid-cols-12 lg:tw-grid-cols-1 tw-gap-4">
            <div className="tw-col-span-7 md:tw-col-span-8 lg:tw-col-span-1 tw-grid tw-grid-cols-12 tw-gap-4">
              <div className="tw-hidden tw-col-span-3 lg:tw-col-span-4 md:tw-flex tw-flex-col tw-justify-between tw-items-center tw-relative">
                <img
                  className={'tw-w-12 tw-h-12 lg:tw-w-[80px] lg:tw-h-[80px]'}
                  src={avatar}
                  alt="avatar"
                />
                {data?.locked ? (
                  <img
                    className={clsx('tw-absolute tw-top-2 tw-right-4 tw-w-[24px] tw-h-[24px]')}
                    src={lockIcon}
                    alt="lock icon"
                    onClick={() => {}}
                  />
                ) : null}
                <span className={clsx('text-orange cursor-pointer text-capitalize')}>
                  {t('edit')}
                </span>
              </div>

              <div className="tw-col-span-12 md:tw-col-span-9 lg:tw-col-span-8 tw-flex tw-flex-col tw-gap-4">
                <div>
                  <div
                    title={userFullName}
                    className="tw-text-ellipsis tw-whitespace-nowrap tw-overflow-hidden">
                    <span className={clsx('font-heading-small')}>{userFullName}</span>
                  </div>

                  <div
                    title={data?.email}
                    className="tw-text-ellipsis tw-whitespace-nowrap tw-overflow-hidden">
                    <span className={clsx('font-binary')}>{data?.email}</span>
                  </div>
                </div>

                <div>
                  <div className="tw-flex tw-items-center">
                    <span className={clsx('font-binary')}>{stat?.deviceId ?? 'N/A'}</span>
                    &nbsp;&nbsp;
                    <BatteryV3 charging={stat?.chargingFlag} percent={stat?.batteryPercent} />
                  </div>
                  {kenzenDevice && (
                    <div>
                      <span className={clsx('font-binary')}>FW Ver. {kenzenDevice?.version}</span>
                    </div>
                  )}
                  {apiDeviceInfo && (
                    <div>
                      <span className={clsx('font-binary')}>{apiDeviceInfo}</span>
                    </div>
                  )}
                  {appInfo && (
                    <div>
                      <span className={clsx('font-binary')}>{appInfo}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Divider className="tw-my-4 tw-hidden lg:tw-block" />

            <div
              className={
                'tw-col-span-5 md:tw-col-span-4 tw-grid-cols-4 lg:tw-col-span-1 tw-grid lg:tw-grid-cols-12 tw-gap-4'
              }>
              <div className="tw-col-span-4 lg:tw-col-span-4">
                <div>
                  <div>
                    <span className="font-helper-text tw-text-app-ns">{t('last sync')}</span>
                  </div>
                  <div>
                    <span className={clsx('font-input-label')}>{lastSyncStr}</span>
                  </div>
                </div>

                <div className="tw-mt-2">
                  <div>
                    <span className="tw-text-app-ns font-helper-text">{t('status')}</span>
                  </div>
                  <div title={invisibleHeatRisk ? null : alertObj?.label}>
                    <div className="tw-text-ellipsis tw-whitespace-nowrap tw-overflow-hidden">
                      <span className={clsx('font-input-label')} title={connectionObj?.label}>
                        {connectionObj?.label}
                      </span>
                    </div>
                    <div className="tw-flex tw-items-center tw-mt-2">
                      <Badge status={connectStatus} />
                    </div>
                    <span className={clsx('font-input-label')}>
                      {!invisibleHeatRisk ? alertObj?.label : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div className="tw-col-span-4 lg:tw-col-span-8">
                <div>
                  <div>
                    <span className="tw-text-app-ns font-helper-text">{t('alert(24hr)')}</span>
                  </div>
                  <div>
                    <span className={clsx('font-input-label')}>{numberOfAlerts ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={'tw-py-4'}>{renderActionContent()}</div>
          </Card>

          <div className="tw-grid tw-grid-cols-12 tw-gap-2 lg:tw-gap-2 xl:tw-gap-8 tw-mt-2 lg:tw-mt-8">
            <Card className="tw-col-span-6 tw-hidden lg:tw-block">
              <div className="tw-flex tw-flex-col tw-items-center tw-text-center">
                <span className={clsx('font-input-label')}>{t('cbt avg')}</span>
                <span className={'font-input-label tw-uppercase'}>{metric ? '(°C)' : '(°F)'}</span>
              </div>

              <div className="tw-flex tw-items-center tw-justify-center tw-h-[55px]">
                <img src={thermometer} alt="thermometer" width={15} />
                {hideCbtHR ? (
                  <img className="tw-w-[25px] tw-ml-[10px]" src={blockIcon} alt="block icon" />
                ) : (
                  <span className={'font-big-number tw-ml-2'}>
                    {stat?.chargingFlag
                      ? '--'
                      : formatHeartCbt(visibleHeartStats ? stat?.cbtAvg : null)}
                  </span>
                )}
              </div>

              {!hideCbtHR && visibleHeartStats && (
                <div className="tw-flex tw-justify-center">
                  <span
                    className={clsx('font-binary')}
                    style={heartCBTZoneStyles[heartCBTZone?.value?.toString()]}>
                    {heartCBTZone?.label}
                  </span>
                </div>
              )}
            </Card>
            <Card className="tw-col-span-6 tw-hidden lg:tw-block">
              <div className="tw-flex tw-flex-col tw-items-center tw-text-center">
                <span className={clsx('font-input-label tw-text-capitalize')}>
                  {t('heart rate avg')}
                </span>
                <span className={clsx('font-input-label tw-uppercase')}>(bpm)</span>
              </div>

              <div className="tw-flex tw-items-center tw-justify-center tw-h-[55px]">
                <img src={heart} alt="heart" width={30} />
                {hideCbtHR ? (
                  <img className="tw-w-[25px] tw-ml-[10px]" src={blockIcon} alt="block icon" />
                ) : (
                  <span className={clsx('font-big-number tw-ml-2')}>
                    {stat?.chargingFlag
                      ? '--'
                      : formatHeartRate(visibleHeartStats ? stat?.heartRateAvg : null)}
                  </span>
                )}
              </div>
              {!hideCbtHR && visibleHeartStats && (
                <div className="tw-flex tw-justify-center">
                  <span
                    className={clsx('font-binary')}
                    style={heartRateZoneStyles[heartRateZone?.value?.toString()]}>
                    {heartRateZone?.label}
                  </span>
                </div>
              )}
            </Card>
            <Card className="tw-col-span-12 tw-grid tw-grid-cols-12 lg:tw-hidden">
              <div className="tw-col-span-6">
                <div className="tw-flex tw-flex-col tw-items-center tw-text-center">
                  <span className={clsx('font-input-label')}>{t('cbt avg')}</span>
                  <span className={'font-input-label tw-uppercase'}>
                    {metric ? '(°C)' : '(°F)'}
                  </span>
                </div>

                <div className="tw-flex tw-items-center tw-justify-center tw-h-[55px]">
                  <img src={thermometer} alt="thermometer" width={15} />
                  {hideCbtHR ? (
                    <img className="tw-w-[25px] tw-ml-[10px]" src={blockIcon} alt="block icon" />
                  ) : (
                    <span className={'font-big-number tw-ml-2'}>
                      {stat?.chargingFlag
                        ? '--'
                        : formatHeartCbt(visibleHeartStats ? stat?.cbtAvg : null)}
                    </span>
                  )}
                </div>

                {!hideCbtHR && visibleHeartStats && (
                  <div className="tw-flex tw-justify-center">
                    <span
                      className={clsx('font-binary')}
                      style={heartCBTZoneStyles[heartCBTZone?.value?.toString()]}>
                      {heartCBTZone?.label}
                    </span>
                  </div>
                )}
              </div>
              <div className="tw-col-span-6">
                <div className="tw-flex tw-flex-col tw-items-center tw-text-center">
                  <span className={clsx('font-input-label tw-text-capitalize')}>
                    {t('heart rate avg')}
                  </span>
                  <span className={clsx('font-input-label tw-uppercase')}>(bpm)</span>
                </div>

                <div className="tw-flex tw-items-center tw-justify-center tw-h-[55px]">
                  <img src={heart} alt="heart" width={30} />
                  {hideCbtHR ? (
                    <img className="tw-w-[25px] tw-ml-[10px]" src={blockIcon} alt="block icon" />
                  ) : (
                    <span className={clsx('font-big-number tw-ml-2')}>
                      {stat?.chargingFlag
                        ? '--'
                        : formatHeartRate(visibleHeartStats ? stat?.heartRateAvg : null)}
                    </span>
                  )}
                </div>
                {!hideCbtHR && visibleHeartStats && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span
                      className={clsx('font-binary')}
                      style={heartRateZoneStyles[heartRateZone?.value?.toString()]}>
                      {heartRateZone?.label}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="mt-15">
            <div className={clsx('tw-flex tw-items-center', 'font-heading-small')}>
              <span>{t('modify team')}</span>
            </div>

            <div>
              <ResponsiveSelect
                className="mt-10 font-heading-small text-black"
                placeholder={t('select')}
                styles={customStyles()}
                options={formattedTeams}
                value={team}
                onChange={(e) => setTeam(e)}
                maxMenuHeight={190}
              />
            </div>
          </div>
        </div>
        <div className="tw-col-span-12 lg:tw-col-span-7 xl:tw-col-span-8 tw-flex tw-flex-col-reverse tw-gap-2 lg:tw-flex-col lg:tw-gap-8">
          <Card>
            <div className="tw-flex tw-flex-col lg:tw-flex-row lg:tw-justify-between lg:tw-items-center">
              <div className={'tw-flex tw-items-center tw-font-heading-small'}>
                <img src={alertsIcon} alt="alerts icon" />
                &nbsp;&nbsp;
                <span>{t('activity logs')}</span>
              </div>
              <div>
                <ResponsiveSelect
                  className={clsx('font-binary tw-text-black tw-my-2', 'md:tw-w-[250px]')}
                  placeholder={t('filter by')}
                  styles={customStyles()}
                  options={activitiesFilters}
                  value={activitiesFilter}
                  onChange={setActivitiesFilter}
                  maxMenuHeight={190}
                  writable={false}
                />
              </div>
            </div>

            <div className="md:tw-max-h-[205px] md:tw-overflow-y-auto tw-mt-2 lg:tw-mt-4">
              <ActivityLogs logs={logs} gmt={data?.gmt} />
            </div>
          </Card>
          <Card>
            <div className="tw-flex tw-flex-col lg:tw-flex-row lg:tw-justify-between lg:tw-items-center">
              <div className={clsx('tw-flex tw-items-center', 'font-heading-small')}>
                <img src={alertsIcon} alt="alerts icon" />
                &nbsp;&nbsp;
                <span>{t('alert metrics')}</span>
              </div>

              <div>
                <ResponsiveSelect
                  className={clsx('font-binary tw-text-black tw-my-2', 'md:tw-w-[250px]')}
                  placeholder={t('filter by')}
                  styles={customStyles()}
                  options={activitiesFilters}
                  value={metricsFilter}
                  onChange={setMetricsFilter}
                  maxMenuHeight={190}
                  writable={false}
                />
              </div>
            </div>

            <div className="tw-mt-2 lg:tw-mt-4 h-auto tw-overflow-y-auto">
              <MetricLogs metricStats={metricStats} />
            </div>
          </Card>
          <div className={clsx('tw-flex', 'tw-gap-2', 'tw-justify-between')}>
            <div className="tw-flex tw-gap-2">
              <div>
                <div className="d-flex justify-end">
                  <Button
                    title={'update team'}
                    size="sm"
                    disabled={team?.value?.toString() === data?.teamId?.toString()}
                    onClick={handleClickMoveTeam}
                  />
                </div>
              </div>

              <div>{renderActionContent()}</div>
            </div>
            <div>
              <div>
                <Button
                  disabled={!user?.heatSusceptibility}
                  onClick={() => {
                    window.open(
                      `/connect/member/${orgId.current}/device/${teamId.current}/${memberId.current}?tab=new&name=${userFullName}`,
                      '_blank'
                    );
                  }}
                  title={'assign new device'}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.measure')
});

export default connect(mapStateToProps, null)(withTranslation()(React.memo(MemberDetail)));
