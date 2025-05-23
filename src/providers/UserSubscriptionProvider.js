import * as React from 'react';
import { getTeamMemberEvents, getTeamMemberAlerts, subscribeDataEvents } from '../http';
import axios from 'axios';
import { useDashboardContext } from './DashboardProvider';
import {
  ACTIVITIES_FILTERS,
  ALERT_STAGE_ID_LIST,
  ALERT_STAGE_STATUS,
  EVENT_DATA_TYPE
} from '../constant';
import { useUtilsContext } from './UtilsProvider';
import { formatHeartRate } from '../utils/dashboard';
import { hasStatusValue } from '../utils';

const UserSubscriptionContext = React.createContext(null);

export const UserSubscriptionProvider = ({ children }) => {
  const { organization, formattedMembers, demoEventData } = useDashboardContext();

  const { formatHeartCbt } = useUtilsContext();
  const [duration] = React.useState(30); // 1, 7, or 30 days
  const activitiesFilters = ACTIVITIES_FILTERS;
  const [activitiesFilter, setActivitiesFilter] = React.useState(activitiesFilters[0]);
  const [metricsFilter, setMetricsFilter] = React.useState(activitiesFilters[0]);
  const [user, setUser] = React.useState(null);
  const [horizon, _setHorizon] = React.useState(null);
  const horizonRef = React.useRef(horizon);
  const [loading, setLoading] = React.useState(false);

  const { alertsForMe } = React.useMemo(() => {
    return user && user.userId ? formattedMembers.find((it) => it.userId == user.userId) : [];
  }, [formattedMembers, user]);
  const setHorizon = (v) => {
    horizonRef.current = v;
    _setHorizon(v);
  };
  const [alerts, _setAlerts] = React.useState([]);

  const alertsRef = React.useRef(alerts);
  const setAlerts = (v) => {
    alertsRef.current = v;
    _setAlerts(v);
  };
  const [activities, _setActivities] = React.useState([]);
  const activitiesRef = React.useRef(activities);
  const setActivities = (v) => {
    activitiesRef.current = v;
    _setActivities(v);
  };
  const [metricsLog, _setMetricsLog] = React.useState([]);
  const metricsLogRef = React.useRef(metricsLog);
  const setMetricsLog = (v) => {
    metricsLogRef.current = v;
    _setMetricsLog(v);
  };
  React.useEffect(() => {
    return () => {
      setAlerts([]);
      setActivities([]);
      setMetricsLog([]);
      setHorizon(null);
      setUser(null);
    };
  }, []);
  React.useEffect(() => {
    setAlerts([]);
    setActivities([]);
    setMetricsLog([]);
    if (user?.userId && user?.teamId) {
      const promises = [];
      const d = new Date();
      d.setDate(d.getDate() - duration);
      const a = getTeamMemberAlerts({
        teamId: user.teamId,
        userId: user.userId,
        since: d.toISOString()
      });

      const b = getTeamMemberEvents({
        teamId: user.teamId,
        userId: user.userId,
        endDate: getDateStr(new Date()),
        startDate: getDateStr(d)
      });

      const source = axios.CancelToken.source();
      promises.push(a, b);
      if (promises?.length > 0) {
        setLoading(true);
        Promise.allSettled(promises)
          .then((results) => {
            // fixme there might be new events between the time when api returned and now
            const ts = new Date().getTime();
            setHorizon(ts);
            subscribe(ts, source.token);
            results.forEach((result, index) => {
              if (result.status === 'fulfilled') {
                if (index === 0) {
                  // alerts
                  if (typeof result?.value?.data === 'object') {
                    let sortedAlerts = result?.value?.data
                      ?.sort((a, b) => new Date(b.ts) - new Date(a.ts))
                      ?.map((it) => ({
                        ...it,
                        utcTs: it.ts
                      }));
                    sortedAlerts = sortedAlerts?.filter((it) =>
                      ALERT_STAGE_ID_LIST.includes(it.alertStageId?.toString())
                    );
                    setAlerts(sortedAlerts ?? []);
                  }
                } else if (index === 1) {
                  // events
                  if (typeof result?.value?.data === 'object') {
                    const sortedActivities = result?.value?.data
                      ?.sort((a, b) => new Date(b.ts) - new Date(a.ts))
                      ?.map((it) => ({
                        ...it,
                        utcTs: it.ts
                      }));
                    setActivities(sortedActivities ?? []);
                  }
                }
              }
            });
          })
          .finally(() => {
            if (organization < 0) {
              const userDemoEventData = demoEventData.current?.filter(
                (it) => it.userId === user?.userId
              );
              console.log('first user demo event data', userDemoEventData);
              updateDataFromEvents(userDemoEventData);
            }

            setLoading(false);
          });
      }

      return () => {
        source.cancel('user subscription cancel by user');
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, user?.teamId]);

  const updateDataFromEvents = React.useCallback(
    (events) => {
      if (events?.length > 0) {
        const latestTs = events?.sort((a, b) => b.ts - a.ts)?.[0]?.ts;
        if (latestTs) {
          setHorizon(latestTs);
          // sinceTs = horizonRef.current;
        }

        let newAlerts = events?.filter((it) => it.type === 'Alert');
        if (newAlerts?.length > 0) {
          newAlerts = newAlerts?.filter((it) =>
            ALERT_STAGE_ID_LIST.includes(it.data.alertStageId?.toString())
          );
          setAlerts([...newAlerts.map((it) => it.data), ...alertsRef.current]);
        }
        const newActivities = events?.filter((it) => it.type === 'Event');
        if (newActivities?.length > 0) {
          setActivities([...newActivities.map((it) => it.data), ...activitiesRef.current]);
        }
      }
    },
    [alertsRef, activitiesRef]
  );

  const subscribe = React.useCallback(
    (ts, cancelToken) => {
      if (organization) {
        // let sinceTs = horizonRef.current;
        let subscribeAgain = true;
        subscribeDataEvents({
          filter: {
            userIds: user?.userId ? [user?.userId] : []
          },
          orgId: Math.abs(organization),
          horizon: ts,
          cancelToken
        })
          .then((res) => {
            if (organization > 0) {
              if (res.status?.toString() === '200') {
                // update data with events
                updateDataFromEvents(res.data);
              }
              // else if (res.status?.toString() === '204') {
              //   // when there is no updates
              // }
            }
          })
          .catch((error) => {
            console.error('user subscribe error', error);
            // fixme check what possible error codes can be
            subscribeAgain = false;
          })
          .finally(() => {
            if (organization < 0) {
              //
              const userDemoEventData = demoEventData.current?.filter(
                (it) => it.userId === user?.userId
              );
              console.log('user demo event data', userDemoEventData);
              updateDataFromEvents(userDemoEventData);
            }
            subscribeAgain && subscribe(horizonRef.current, cancelToken);
            console.log(`user last event signal received at ${new Date().toLocaleString()}`);
          });
      }
    },
    [organization, user?.userId, updateDataFromEvents, demoEventData]
  );

  const logs = React.useMemo(() => {
    let merged = [
      ...(alertsForMe ?? []).map((it) => ({ ...it, type: EVENT_DATA_TYPE.ALERT })),
      ...(alerts?.map((it) => ({ ...it, type: EVENT_DATA_TYPE.ALERT })) ?? []),
      ...(activities?.map((it) => ({ ...it, type: EVENT_DATA_TYPE.EVENT })) ?? [])
    ];
    const d = new Date();
    d.setDate(d.getDate() - (activitiesFilter?.value ?? 1));
    merged = merged
      ?.filter((it) => new Date(it.utcTs).getTime() > d.getTime())
      ?.sort((a, b) => new Date(b.utcTs).getTime() - new Date(a.utcTs).getTime());
    const unique = [];
    for (const entry of merged) {
      if (!unique.some((x) => entry.utcTs === x.utcTs && entry.type === x.type)) {
        unique.push(entry);
      }
    }

    return unique;
  }, [alerts, activities, activitiesFilter?.value, alertsForMe]);

  const metricStats = React.useMemo(() => {
    // const d = new Date();
    // d.setDate(d.getDate() - (metricsFilter?.value ?? 1));
    // let tempAlerts = [...alerts]
    //   ?.filter((it) => new Date(it.utcTs).getTime() > d.getTime())
    //   ?.sort((a, b) => new Date(b.utcTs).getTime() - new Date(a.utcTs).getTime());

    // const unique = [];
    // for (const entry of tempAlerts) {
    //   if (!unique.some((x) => entry.utcTs === x.utcTs)) {
    //     unique.push(entry);
    //   }
    // }
    const unique = logs.filter((it) => it.type === EVENT_DATA_TYPE.ALERT);

    const validAlerts =
      unique?.filter((it) =>
        hasStatusValue(it?.alertStageId, [
          ALERT_STAGE_STATUS.AT_RISK,
          ALERT_STAGE_STATUS.ELEVATED_RISK,
          ALERT_STAGE_STATUS.SAFE
        ])
      ) ?? [];

    return {
      totalAlerts: validAlerts?.length || 0,
      stopAlerts: validAlerts?.filter((it) =>
        hasStatusValue(it?.alertStageId, [
          ALERT_STAGE_STATUS.AT_RISK,
          ALERT_STAGE_STATUS.ELEVATED_RISK
        ])
      )?.length,
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
  }, [alerts, metricsFilter?.value, logs]);

  const getDateStr = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  };

  const providerValue = {
    user,
    setUser,
    logs,
    metricStats,
    activitiesFilter,
    setActivitiesFilter,
    activitiesFilters,
    metricsFilter,
    setMetricsFilter,
    loading
  };

  return (
    <UserSubscriptionContext.Provider value={providerValue}>
      {children}
    </UserSubscriptionContext.Provider>
  );
};

export const useUserSubscriptionContext = () => {
  const context = React.useContext(UserSubscriptionContext);
  if (!context) {
    throw new Error('useUserSubscriptionContext must be used within UserSubscriptionProvider');
  }
  return context;
};
