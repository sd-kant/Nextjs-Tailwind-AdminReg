import * as React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { get } from 'lodash';

import { numMinutesBetweenWithNow as numMinutesBetween } from 'utils';
import { formatHeartRate } from 'utils/dashboard';

import clsx from 'clsx';
import style from './OperatorDetail.module.scss';

import avatar from 'assets/images/logo_round.png';
import lockIcon from 'assets/images/lock.svg';
import blockIcon from 'assets/images/no.svg';
import alertsIcon from 'assets/images/alerts-icon.svg';
import thermometer from 'assets/images/thermometer-orange.svg';
import heart from 'assets/images/heart.svg';

import { useUtilsContext } from 'providers/UtilsProvider';
import { useOperatorDashboardContext } from 'providers/operator/OperatorDashboardProvider';

import Button from 'views/components/Button';
import ResponsiveSelect from 'views/components/ResponsiveSelect';
import BatteryV3 from 'views/components/BatteryV3';

import { customStyles } from 'views/pages/DashboardV2';

import MetricLogs from './MetricLogs';
import ActivityLogs from './ActivityLogs';

const OperatorDetail = ({ t, profile, metric }) => {
  const {
    getHeartRateZone,
    formatHeartCbt,
    getHeartCBTZone,
    heartCBTZoneStyles,
    heartRateZoneStyles
  } = useUtilsContext();

  const {
    userData,
    metricStats,
    activitiesFilters,
    activitiesFilter,
    metricsFilter,
    setActivitiesFilter,
    setMetricsFilter
  } = useOperatorDashboardContext();
  const {
    devices,
    events,
    stat,
    lastSyncStr,
    numberOfAlerts,
    invisibleHeatRisk,
    alertObj,
    connectionObj,
    organization
  } = userData;

  // const {
  //   setUser,
  //   logs,
  //   metricStats,
  //   activitiesFilters,
  //   activitiesFilter,
  //   setActivitiesFilter,
  //   metricsFilter,
  //   setMetricsFilter
  // } = useUserSubscriptionContext();
  const [warningModal, setWarningModal] = React.useState({ visible: false, title: '', mode: null }); // mode: 'move', 'unlock'
  const [confirmModal, setConfirmModal] = React.useState({ visible: false, title: '', mode: null }); // mode: move, unlock
  const memberId = React.useRef(origin?.userId);

  // const data = React.useMemo(() => {
  //   return origin
  //     ? origin
  //     : formattedMembers.find((it) => it.userId?.toString() === memberId.current?.toString());
  // }, [formattedMembers, origin]);

  // const { stat, alertObj, lastSyncStr, numberOfAlerts, connectionObj, invisibleHeatRisk } =
  //   data ?? {
  //     stat: null,
  //     alertsForMe: null,
  //     lastSyncStr: null,
  //     numberOfAlerts: null,
  //     settings: { hideCbtHR: false }
  //   };

  const hideCbtHR = organization?.settings?.hideCbtHR;
  let badgeColorStyle = style.Off;
  if (connectionObj?.value?.toString() === '3') {
    if (['1', '2'].includes(alertObj?.value?.toString())) {
      badgeColorStyle = style.Red;
    } else {
      badgeColorStyle = style.Green;
    }
  } else if (connectionObj?.value?.toString() === '4') {
    badgeColorStyle = style.Yellow;
  }
  // const [team, setTeam] = React.useState(null);
  // React.useEffect(() => {
  //   if (data?.teamId) {
  //     setTeam(formattedTeams?.find((it) => it.value?.toString() === data?.teamId?.toString()));
  //   } else {
  //     setTeam(null);
  //   }
  //   setUser(data);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [data]);

  // const userDevices = devices?.find(
  //   (it) => it.userId?.toString() === data?.userId?.toString()
  // )?.devices;

  let apiDevice = null;
  let kenzenDevice = null;
  if (devices?.length > 0) {
    if (stat.deviceId) {
      kenzenDevice = devices
        ?.filter(
          (it) =>
            it.type === 'kenzen' && it.deviceId?.toLowerCase() === stat.deviceId?.toLowerCase()
        )
        ?.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())?.[0];
    }
    const filterFunc = (it) => {
      if (['', null, undefined, 'null', 'undefined', 'none'].includes(stat.sourceDeviceId)) {
        return it.type !== 'kenzen';
      } else {
        return (
          it.type !== 'kenzen' && it.deviceId?.toLowerCase() === stat.sourceDeviceId?.toLowerCase()
        );
      }
    };
    apiDevice = devices
      ?.filter(filterFunc)
      ?.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())?.[0];
    if (!apiDevice)
      apiDevice = devices
        ?.filter((it) => it.type !== 'kenzen')
        ?.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())?.[0];
  }

  // fixme duplicated
  const visibleHeartStats =
    numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 60 && stat?.onOffFlag;
  const heartRateZone = getHeartRateZone(profile?.dateOfBirth, stat?.heartRateAvg);
  const heartCBTZone = getHeartCBTZone(stat?.cbtAvg);

  // const hideWarningModal = () => {
  //   setWarningModal({ visible: false, title: '', mode: null });
  // };

  // const handleConfirm = React.useCallback(() => {
  //   switch (confirmModal.mode) {
  //     case 'move':
  //       setMember(null);
  //       setConfirmModal({ visible: false, title: '', mode: null });
  //       break;
  //     case 'unlock':
  //       setConfirmModal({ visible: false, title: '', mode: null });
  //       break;
  //     default:
  //       console.log('action not registered');
  //   }
  // }, [confirmModal, setMember]);

  // const renderActionContent = () => {
  //   return (
  //     <>
  //       {/*<div className={clsx(style.Control)}>
  //         <Button
  //           size="sm"
  //           bgColor={'transparent'}
  //           borderColor={'orange'}
  //           title={t("send a message")}
  //         />
  //       </div>*/}
  //       {data?.locked ? (
  //         <div className={clsx(style.Control)}>
  //           <Button
  //             size="sm"
  //             bgColor={'transparent'}
  //             borderColor={'orange'}
  //             title={t('unlock user')}
  //             onClick={handleClickUnlock}
  //           />
  //         </div>
  //       ) : null}
  //     </>
  //   );
  // };

  // const handleClickMoveTeam = () => {
  //   setWarningModal({
  //     visible: true,
  //     title: t('move user to team warning title', {
  //       user: `${data?.firstName} ${data?.lastName}`,
  //       team: team?.label
  //     }),
  //     mode: 'move'
  //   });
  // };

  // const handleClickUnlock = () => {
  //   setWarningModal({
  //     visible: true,
  //     title: t('unlock user warning title'),
  //     mode: 'unlock'
  //   });
  // };

  // const handleWarningClick = React.useCallback(() => {
  //   const handleMove = () => {
  //     moveMember([data], team?.value)
  //       .then(() => {
  //         hideWarningModal();
  //         setConfirmModal({
  //           visible: true,
  //           title: t('move user to team confirmation title', {
  //             user: `${data?.firstName} ${data?.lastName}`,
  //             team: team?.label
  //           }),
  //           mode: 'move'
  //         });
  //       })
  //       .catch((e) => {
  //         console.log('moving member error', e);
  //       });
  //   };

  //   const handleUnlock = () => {
  //     unlockMember(data)
  //       .then(() => {
  //         hideWarningModal();
  //         setConfirmModal({
  //           visible: true,
  //           title: t('unlock user confirmation title', {
  //             name: `${data?.firstName} ${data?.lastName}`
  //           }),
  //           mode: 'unlock'
  //         });
  //       })
  //       .catch((e) => {
  //         console.log('moving member error', e);
  //       });
  //   };

  //   switch (warningModal.mode) {
  //     case 'move':
  //       handleMove();
  //       break;
  //     case 'unlock':
  //       handleUnlock();
  //       break;
  //     default:
  //       console.log('action moe not registered');
  //   }
  // }, [data, moveMember, unlockMember, t, team, warningModal]);

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

  return (
    <div className={clsx(style.Wrapper)}>
      <div className={clsx(style.LeftCard)}>
        <div className={clsx(style.UserActionCard)}>
          <div className={clsx(style.UserCard, style.Card)}>
            <div className={clsx(style.UserMain)}>
              <div className={clsx(style.AvatarArea)}>
                <img className={clsx(style.Avatar)} src={avatar} alt="avatar" />
                {/* {data?.locked ? (
                  <img
                    className={clsx(style.LockIcon)}
                    src={lockIcon}
                    alt="lock icon"
                    onClick={() => {}}
                  />
                ) : null} */}
                {/* <span className={clsx('text-orange cursor-pointer text-capitalize')}>
                  {t('edit')}
                </span> */}
              </div>

              <div className={clsx(style.NameDevice)}>
                <div
                  title={profile?.firstName + ' ' + profile?.lastName}
                  className={clsx(style.NameDeviceElement)}>
                  <span className={clsx('font-heading-small')}>
                    {`${profile?.firstName}  ${profile?.lastName}`}
                  </span>
                </div>

                <div title={profile?.email} className={clsx(style.NameDeviceElement)}>
                  <span className={clsx('font-binary')}>{profile?.email}</span>
                </div>

                <div>
                  <div className={clsx(style.Mac_Battery)}>
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

            <div className={clsx(style.Divider)} />

            <div className={clsx(style.InformationArea)}>
              <div>
                <div className={clsx(style.InformationEntity)}>
                  <div>
                    <span className={clsx(style.HelperText, 'font-helper-text')}>
                      {t('last sync')}
                    </span>
                  </div>
                  <div style={{ height: '21px' }}>
                    <span className={clsx('font-input-label')}>{userData.lastSyncStr}</span>
                  </div>
                </div>

                <div className={clsx(style.InformationEntity)}>
                  <div>
                    <span className={clsx(style.HelperText, 'font-helper-text')}>
                      {t('status')}
                    </span>
                  </div>
                  <div
                    className={clsx(style.StatusCell)}
                    title={invisibleHeatRisk ? null : alertObj?.label}
                    style={{ height: '18.38px' }}>
                    <div className={clsx(style.BadgeWrapper)}>
                      <div className={clsx(style.StatusBadge, badgeColorStyle)} />
                    </div>
                    <span className={clsx('font-input-label')}>
                      {!invisibleHeatRisk ? alertObj?.label : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className={clsx(style.InformationEntity)}>
                  <div>
                    <span className={clsx(style.HelperText, 'font-helper-text')}>
                      {t('alert(24hr)')}
                    </span>
                  </div>
                  <div>
                    <span className={clsx('font-input-label')}>{numberOfAlerts ?? 0}</span>
                  </div>
                </div>

                <div className={clsx(style.InformationEntity)}>
                  <div>
                    <span className={clsx(style.HelperText, 'font-helper-text', 'text-uppercase')}>
                      {t('connection status')}
                    </span>
                  </div>
                  <div className={clsx(style.Cell)}>
                    <span className={clsx('font-input-label')} title={connectionObj?.label}>
                      {connectionObj?.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <div className={clsx(style.FirstRolesCard)}>{renderActionContent()}</div> */}
        </div>

        <div className={clsx(style.HeartRiskCard)}>
          <div className={clsx(style.RiskCard, style.Card)}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
              <span className={clsx('font-input-label')}>{t('cbt avg')}</span>
              <span className={'font-input-label text-uppercase'}>{metric ? '(°C)' : '(°F)'}</span>
            </div>

            <div
              className={clsx(style.InformationContent)}
              style={{ display: 'flex', justifyContent: 'center', height: '55px' }}>
              <img src={thermometer} alt="thermometer" width={15} />
              {hideCbtHR ? (
                <img className={clsx(style.BlockIcon)} src={blockIcon} alt="block icon" />
              ) : (
                <span className={'font-big-number'}>
                  {stat?.chargingFlag
                    ? '--'
                    : formatHeartCbt(visibleHeartStats ? stat?.cbtAvg : null)}
                </span>
              )}
            </div>

            {!hideCbtHR && visibleHeartStats && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span
                  className={clsx('font-binary')}
                  style={heartCBTZoneStyles[heartCBTZone?.value?.toString()]}>
                  {heartCBTZone?.label}
                </span>
              </div>
            )}
          </div>

          <div className={clsx(style.HeartCard, style.Card)}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}>
              <span className={clsx('font-input-label text-capitalize')}>
                {t('heart rate avg')}
              </span>
              <span className={clsx('font-input-label text-uppercase')}>(bpm)</span>
            </div>

            <div
              className={clsx(style.InformationContent)}
              style={{ display: 'flex', justifyContent: 'center', height: '55px' }}>
              <img src={heart} alt="heart" width={30} />
              {hideCbtHR ? (
                <img className={clsx(style.BlockIcon)} src={blockIcon} alt="block icon" />
              ) : (
                <span className={clsx('font-big-number')}>
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
        </div>
      </div>

      <div className={clsx(style.RightCard)}>
        <div className={clsx(style.AlertsCard, style.Card)}>
          <div className={clsx(style.CardTop)}>
            <div className={clsx(style.CardHeader, 'font-heading-small')}>
              <img src={alertsIcon} alt="alerts icon" />
              &nbsp;&nbsp;
              <span>{t('activity logs')}</span>
            </div>

            <div className={clsx(style.FilterArea)}>
              <ResponsiveSelect
                className={clsx('font-binary text-black', style.Dropdown)}
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

          <div className={clsx(style.AlertCardContent)}>
            <ActivityLogs gmt={profile?.gmt} />
          </div>
        </div>

        <div className={clsx(style.AlertsCard, style.MetricsCard, style.Card, style.CardMetric)}>
          <div className={clsx(style.CardTop)}>
            <div className={clsx(style.CardHeader, 'font-heading-small')}>
              <img src={alertsIcon} alt="alerts icon" />
              &nbsp;&nbsp;
              <span>{t('alert metrics')}</span>
            </div>

            <div className={clsx(style.FilterArea)}>
              <ResponsiveSelect
                className={clsx('font-binary text-black', style.Dropdown)}
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

          <div className={clsx(style.MetricCardContent)}>
            <MetricLogs metricStats={metricStats} />
          </div>
        </div>

        <div className={clsx(style.ActivityRoleCard)}>
          <div className={clsx(style.ActivityCard, style.Card_No_Back)}>
            <div className="d-flex justify-end">
              {/* <Button
                title={'update team'}
                size="sm"
                disabled={team?.value?.toString() === data?.teamId?.toString()}
                onClick={handleClickMoveTeam}
              /> */}
            </div>
          </div>

          <div className={clsx(style.SecondRoleCard, style.Card_No_Back)}>
            {/* {renderActionContent()} */}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.metric'),
  profile: get(state, 'profile.profile')
});

export default connect(mapStateToProps, null)(withTranslation()(React.memo(OperatorDetail)));
