import * as React from 'react';
import {getTeamMemberEvents, getTeamMemberAlerts, subscribeDataEvents} from "../http";
import axios from "axios";
import {useTranslation} from "react-i18next";
import {useDashboardContext} from "./DashboardProvider";

const UserSubscriptionContext = React.createContext(null);

export const UserSubscriptionProvider = (
  {
    children,
  }) => {
  const {t} = useTranslation();
  const {organization} = useDashboardContext();
  const [duration] = React.useState(30); // 1, 7, or 30 days
  const activitiesFilters = [
    {
      value: 1,
      label: t("24 hours"),
      noText: t("no activity logs in 24 hours"),
    },
    {
      value: 7,
      label: t("week"),
      noText: t("no activity logs in week"),
    },
    {
      value: 30,
      label: t("month"),
      noText: t("no activity logs in month"),
    },
  ];
  const [activitiesFilter, setActivitiesFilter] = React.useState(activitiesFilters[0]);
  const [user, setUser] = React.useState(null);
  const [horizon, _setHorizon] = React.useState(null);
  const horizonRef = React.useRef(horizon);
  const [loading, setLoading] = React.useState(false);
  const setHorizon = v => {
    horizonRef.current = v;
    _setHorizon(v);
  };
  const [alerts, _setAlerts] = React.useState([]);
  const alertsRef = React.useRef(alerts);
  const setAlerts = v => {
    alertsRef.current = v;
    _setAlerts(v);
  };
  const [activities, _setActivities] = React.useState([]);
  const activitiesRef = React.useRef(activities);
  const setActivities = v => {
    activitiesRef.current = v;
    _setActivities(v);
  };

  React.useEffect(() => {
    return () => {
      setAlerts([]);
      setActivities([]);
      setHorizon(null);
      setUser(null);
    }
  }, []);
  React.useEffect(() => {
    setAlerts([]);
    setActivities([]);
    if (user?.userId && user?.teamId) {
      const promises = [];
      const d = new Date();
      d.setDate(d.getDate() - duration);
      const a = getTeamMemberAlerts({teamId: user.teamId, userId: user.userId, since: d.toISOString()});

      const b = getTeamMemberEvents({
        teamId: user.teamId,
        userId: user.userId,
        endDate: getDateStr(new Date()),
        startDate: getDateStr(d),
      });
      const source = axios.CancelToken.source();
      promises.push(a, b);
      if (promises?.length > 0) {
        setLoading(true);
        Promise.allSettled(promises)
          .then(results => {
            // fixme there might be new events between the time when api returned and now
            const ts = new Date().getTime();
            setHorizon(ts);
            subscribe(ts, source.token);
            results.forEach((result, index) => {
              if (result.status === "fulfilled") {
                if (index === 0) {
                  // alerts
                  if (typeof result?.value?.data === "object") {
                    const sortedAlerts = result?.value?.data?.sort((a, b) => new Date(b.ts) - new Date(a.ts))
                      ?.map(it => ({
                        ...it,
                        utcTs: it.ts,
                      }));
                    setAlerts(sortedAlerts ?? []);
                  }
                } else if (index === 1) {
                  // events
                  if (typeof result?.value?.data === "object") {
                    const sortedActivities = result?.value?.data?.sort((a, b) => new Date(b.ts) - new Date(a.ts))
                      ?.map(it => ({
                        ...it,
                        utcTs: it.ts,
                      }));
                    setActivities(sortedActivities ?? []);
                  }
                }
              }
            })
          })
          .finally(() => {setLoading(false)});
      }

      return () => {
        source.cancel("user subscription cancel by user");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, user?.teamId]);

  const subscribe = React.useCallback((ts, cancelToken) => {
    if (organization) {
      let sinceTs = horizonRef.current;
      let subscribeAgain = true;
      subscribeDataEvents({
        filter: {
          userIds: user?.userId ? [user?.userId] : [],
        },
        orgId: organization,
        horizon: ts,
        cancelToken,
      })
        .then(res => {
          if (res.status?.toString() === "200") {
            const events = res.data;
            if (events?.length > 0) {
              const latestTs = events?.sort((a, b) => b.ts - a.ts)?.[0]?.ts;
              if (latestTs) {
                setHorizon(latestTs);
                sinceTs = latestTs;
              }

              const newAlerts = events?.filter(it => it.type === "Alert");
              if (newAlerts?.length > 0) {
                setAlerts([...(newAlerts.map(it => it.data)), ...alertsRef.current]);
              }
              const newActivities = events?.filter(it => it.type === "Event");
              if (newActivities?.length > 0) {
                setActivities([...(newActivities.map(it => it.data)), ...activitiesRef.current]);
              }
            }
          } else if (res.status?.toString() === "204") {
            // when there is no updates
          }
        })
        .catch(error => {
          console.error("user subscribe error", error);
          // fixme check what possible error codes can be
          subscribeAgain = false;
        })
        .finally(() => {
          subscribeAgain && subscribe(sinceTs, cancelToken);
          console.log(`user last event signal received at ${new Date().toLocaleString()}`);
        });
    }
  }, [organization, user?.userId]);

  const logs = React.useMemo(() => {
    let merged = [
      ...(alerts?.map(it => ({...it, type: 'Alert'})) ?? []),
      ...(activities?.map(it => ({...it, type: 'Event'})) ?? [])
    ];
    const d = new Date();
    d.setDate(d.getDate() - (activitiesFilter?.value ?? 1));
    merged = merged?.filter(it => new Date(it.utcTs).getTime() > d.getTime())
      ?.sort((a, b) => new Date(b.utcTs).getTime() - new Date(a.utcTs).getTime());
    const unique = [];
    for (const entry of merged) {
      if (!unique.some(x => (entry.utcTs === x.utcTs) && (entry.type === x.type))) {
        unique.push(entry);
      }
    }
    return unique;
  }, [alerts, activities, activitiesFilter?.value]);

  const getDateStr = date => {
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  const providerValue = {
    setUser,
    logs,
    activitiesFilter,
    setActivitiesFilter,
    activitiesFilters,
    loading,
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
    throw new Error("useUserSubscriptionContext must be used within UserSubscriptionProvider");
  }
  return context;
};