import * as React from 'react';
import { withTranslation } from 'react-i18next';
import { get } from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setLoadingAction } from 'redux/action/ui';
import { gerUserData, getUserAlerts, getUserOrganization, subscribeDataEvents } from 'http/user';
import { formatLastSync, formatHeartRate } from 'utils/dashboard';
import { ACTIVITIES_FILTERS, ALERT_STAGE_ID_LIST } from 'constant';
import { getLatestDateBeforeNow as getLatestDate } from 'utils';
import { useUtilsContext } from 'providers/UtilsProvider';
import moment from 'moment-timezone';

const OperatorDashboardContext = React.createContext(null);

const OperatorDashboardProviderDraft = ({ children, profile }) => {
  const [loading, setLoading] = React.useState(false);
  const activitiesFilters = ACTIVITIES_FILTERS;
  const [activitiesFilter, setActivitiesFilter] = React.useState(activitiesFilters[0]);
  const [metricsFilter, setMetricsFilter] = React.useState(activitiesFilters[0]);
  const { formatAlert, formatConnectionStatusV2, formatHeartCbt } = useUtilsContext();
  const [isSubscribled, subscribleAPI] = React.useState(false);
  const [reloadCount, setReloadCount] = React.useState(0);
  const [alerts, _setAlerts] = React.useState([]);
  const timerRef = React.useRef();
  const setAlerts = (v) => {
    alertsRef.current = v;
    _setAlerts(v);
  };
  const alertsRef = React.useRef(alerts);
  const [activities, _setActivities] = React.useState([]);
  const activitiesRef = React.useRef(activities);
  const setActivities = (v) => {
    activitiesRef.current = v;
    _setActivities(v);
  };

  const [userData, _setUserData] = React.useState({
    devices: [],
    events: [],
    alertObj: {},
    alerts: [],
    stat: {
      batteryPercent: 0,
      cbtAvg: 0,
      chargingFlag: false,
      deviceId: '',
      deviceLogTs: '',
      connected: false,
      heartRateAvg: 0,
      heartRateTs: '',
      lastTimestamp: '',
      onOffFlag: false,
      skinTemp: 0,
      sourceDeviceId: 'test',
      tempHumidityTs: '',
      userId: 0
    }
  });

  const userDataRef = React.useRef(userData);
  const setUserData = (v) => {
    userDataRef.current = v;
    _setUserData(v);
  };

  const subscribe = React.useCallback(
    (sinceTs) => {
      let subscribeAgain = true;
      let ts = sinceTs;
      subscribeDataEvents(ts)
        .then((res) => {
          if (res.status?.toString() === '200') {
            const events = res.data;
            if (events?.length > 0) {
              const latestTs = events?.sort((a, b) => b.ts - a.ts)?.[0]?.ts;
              if (latestTs) {
                ts = latestTs;
              }
              let newAlerts = events?.filter((it) => it.type === 'Alert');
              if (newAlerts?.length > 0) {
                newAlerts = newAlerts?.filter((it) =>
                  ALERT_STAGE_ID_LIST.includes(it.data.alertStageId?.toString())
                );
                setAlerts([
                  ...newAlerts.map((it) => ({ ...it.data, ts: it.data.utcTs })),
                  ...alertsRef.current
                ]);
              }
              const newActivities = events?.filter((it) => it.type === 'Event');
              if (newActivities?.length > 0) {
                setActivities([
                  ...newActivities.map((it) => ({ ...it.data, ts: it.data.utcTs })),
                  ...activitiesRef.current
                ]);
              }

              const latestHeartRate = events
                ?.filter((it) => it.type === 'HeartRate')
                ?.sort(
                  (a, b) => new Date(b.data.utcTs).getTime() - new Date(a.data.utcTs).getTime()
                )?.[0]?.data;

              if (latestHeartRate) {
                setUserData({
                  ...userDataRef.current,
                  ...{
                    stat: {
                      ...userDataRef.current.stat,
                      ...{
                        cbtAvg: latestHeartRate.heartCbtAvg,
                        heartRateAvg: latestHeartRate.heartRateAvg,
                        heartRateTs: latestHeartRate.utcTs
                      }
                    }
                  }
                });
              }

              const deviceLog = events
                ?.filter((it) => it.type === 'DeviceLog')
                ?.sort(
                  (a, b) => new Date(b.data.utcTs).getTime() - new Date(a.data.utcTs).getTime()
                )?.[0]?.data;
              if (deviceLog) {
                const formatDeviceLog = {
                  batteryPercent: deviceLog.batteryPercent,
                  chargingFlag: deviceLog.charging,
                  userId: deviceLog.userId,
                  deviceId: deviceLog.deviceId,
                  sourceDeviceId: deviceLog.source,
                  deviceLogTs: deviceLog.utcTs,
                  onOffFlag: deviceLog.onOff,
                  connected: deviceLog.connected
                };

                if (deviceLog.connected) {
                  formatDeviceLog['lastConnectedTs'] = deviceLog.utcTs;
                }

                if (deviceLog.onOff) {
                  formatDeviceLog['lastOnTs'] = deviceLog.utcTs;
                }

                const newstat = {
                  ...userDataRef.current.stat,
                  ...formatDeviceLog
                };

                const connectionObj = formatConnectionStatusV2({
                  flag: formatDeviceLog?.onOffFlag,
                  connected: formatDeviceLog?.connected,
                  lastTimestamp: userDataRef.current.stat.tempHumidityTs,
                  deviceId: formatDeviceLog?.deviceId,
                  numberOfAlerts: userDataRef.numberOfAlerts,
                  stat: newstat,
                  alert: userDataRef.current.alert
                });

                const updateUserData = {
                  ...userDataRef.current,
                  ...{
                    connectionObj,
                    stat: newstat
                  }
                };
                setUserData(updateUserData);
              }

              // const latestTempHumidity = events
              //   ?.filter((it) => it.type === 'TempHumidity')
              //   ?.sort(
              //     (a, b) => new Date(b.data.utcTs).getTime() - new Date(a.data.utcTs).getTime()
              //   )?.[0]?.data;
            }
          } else if (res.status?.toString() === '204') {
            // when there is no updates
          }
        })
        .catch((error) => {
          console.error('user subscribe error', error);
          // fixme check what possible error codes can be
          subscribeAgain = false;
        })
        .finally(() => {
          subscribeAgain && subscribe(ts);
          console.log(`user last event signal received at ${new Date().toLocaleString()}`);
        });
    },
    [formatConnectionStatusV2]
  );

  const fetchUserData = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (profile) {
      let userDataPromises = [gerUserData(), getUserOrganization(profile.orgId)];
      if (alerts.length == 0) {
        const oneMonthAgo = moment().subtract(30, 'days').utc().format('YYYY-MM-DD');
        userDataPromises.push(getUserAlerts(oneMonthAgo));
      }

      Promise.all(userDataPromises)
        .then((resArr) => {
          const { stat, alert, devices, events } = resArr[0].data;
          const organization = resArr[1].data;
          let newUserData = {
            stat,
            devices,
            organization
          };
          if (resArr[2]) {
            const alerts = resArr[2].data;
            const numberOfAlerts = (
              alerts?.filter(
                (it) =>
                  moment(it.ts).isAfter(moment().subtract(1, 'day')) &&
                  ['1', '2', '3'].includes(it?.alertStageId?.toString())
              ) ?? []
            )?.length;
            newUserData = {
              ...newUserData,
              numberOfAlerts
            };
            setAlerts(alerts);
            setActivities(events);
          }
          const alertObj = formatAlert(alert?.alertStageId);
          newUserData = {
            ...newUserData,
            alertObj
          };

          const lastSync = getLatestDate(
            getLatestDate(
              stat?.heartRateTs ? new Date(stat?.heartRateTs) : null,
              stat?.deviceLogTs ? new Date(stat?.deviceLogTs) : null
            ),
            getLatestDate(
              stat?.tempHumidityTs ? new Date(stat?.tempHumidityTs) : null,
              alert?.utcTs ? new Date(alert?.utcTs) : null
            )
          );
          const lastSyncStr = formatLastSync(lastSync);
          newUserData = {
            ...newUserData,
            lastSyncStr
          };

          // const userKenzenDevice = devices
          //   ?.filter(
          //     (it) =>
          //       it.type === 'kenzen' && it.deviceId?.toLowerCase() === stat?.deviceId?.toLowerCase()
          //   )
          //   ?.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())?.[0];

          const connectionObj = formatConnectionStatusV2({
            flag: stat?.onOffFlag,
            connected: stat?.connected,
            lastTimestamp: stat?.tempHumidityTs,
            deviceId: stat?.deviceId,
            numberOfAlerts: newUserData.numberOfAlerts,
            stat,
            alert
          });

          newUserData = {
            ...newUserData,
            connectionObj
          };

          const invisibleHeatRisk =
            !alert || ['1', '2', '8'].includes(connectionObj?.value?.toString());

          newUserData = {
            ...newUserData,
            invisibleHeatRisk
          };

          setUserData(newUserData);
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
          timerRef.current = setTimeout(() => {
            fetchUserData();
          }, 30000);
          subscribleAPI(true);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatAlert, formatConnectionStatusV2, profile]);

  React.useEffect(() => {
    if (isSubscribled) {
      subscribe(new Date().getTime());
    }
  }, [isSubscribled, subscribe, reloadCount]);

  React.useEffect(() => {
    // fetch user data
    setLoading(true);
    if (profile?.userId) {
      fetchUserData();
    }
  }, [profile, fetchUserData, reloadCount]);

  const logs = React.useMemo(() => {
    let merged = [
      ...(alerts?.map((it) => ({ ...it, type: 'Alert' })) ?? []),
      ...(activities?.map((it) => ({ ...it, type: 'Event' })) ?? [])
    ];
    const d = new Date();
    d.setDate(d.getDate() - (activitiesFilter?.value ?? 1));

    merged = merged
      ?.filter((it) => new Date(it.ts).getTime() > d.getTime())
      ?.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
    const unique = [];
    for (const entry of merged) {
      if (!unique.some((x) => entry.ts === x.ts && entry.type === x.type)) {
        unique.push(entry);
      }
    }
    return unique;
  }, [alerts, activities, activitiesFilter?.value]);

  const metricStats = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - (metricsFilter?.value ?? 1));
    const filterDate = moment().subtract(metricsFilter?.value ?? 1, 'days');
    let tempAlerts = [...alerts]
      ?.filter((it) => moment(it.ts).isAfter(filterDate))
      ?.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

    const unique = [];
    for (const entry of tempAlerts) {
      if (!unique.some((x) => moment(entry.ts).isSame(moment(x.ts)))) {
        unique.push(entry);
      }
    }

    const validAlerts =
      unique?.filter((it) => ['1', '2', '3'].includes(it?.alertStageId?.toString())) ?? [];

    return {
      totalAlerts: validAlerts?.length || 0,
      stopAlerts: validAlerts?.filter((it) => ['1', '2'].includes(it?.alertStageId?.toString()))
        ?.length,
      highestCbt:
        validAlerts?.length > 0
          ? formatHeartCbt(
              validAlerts?.sort((a, b) => (b?.heartCbtAvg ?? 0) - (a?.heartCbtAvg ?? 0))[0]
                ?.heartCbtAvg
            )
          : 0,
      highestHr:
        validAlerts?.length > 0
          ? formatHeartRate(
              validAlerts?.sort((a, b) => (b?.heartRateAvg ?? 0) - (a?.heartRateAvg ?? 0))[0]
                ?.heartRateAvg
            )
          : 0
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities, metricsFilter?.value]);

  const refresh = React.useCallback(() => {
    setReloadCount(reloadCount + 1);
  }, [reloadCount]);

  const providerValue = {
    userData,
    loading,
    refresh,
    logs,
    metricStats,
    activitiesFilter,
    activitiesFilters,
    metricsFilter,
    setActivitiesFilter,
    setMetricsFilter
  };

  return (
    <OperatorDashboardContext.Provider value={providerValue}>
      {children}
    </OperatorDashboardContext.Provider>
  );
};

const mapStateToProps = (state) => ({
  profile: get(state, 'profile.profile')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction
    },
    dispatch
  );

export const OperatorDashboardProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(OperatorDashboardProviderDraft));

export const useOperatorDashboardContext = () => {
  const context = React.useContext(OperatorDashboardContext);
  if (!context) {
    throw new Error('useOperatorDashboardContext must be used within UserSubscriptionProvider');
  }
  return context;
};
