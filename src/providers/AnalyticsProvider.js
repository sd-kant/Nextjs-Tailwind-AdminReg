import * as React from 'react';
import {
  queryOrganizationWearTime,
  queryTeamMembers,
  queryOrganizationAlertMetrics,
  getRiskLevels,
  queryOrganizationMaxCbt,
  queryOrganizationActiveUsers,
  queryOrganizationSWRFluid
} from "../http";
import {
  dateFormat,
} from "../utils";
import {useBasicContext} from "./BasicProvider";

const AnalyticsContext = React.createContext(null);

export const AnalyticsProvider = (
  {
    children,
    setLoading,
  }) => {
  const [pickedMembers, setPickedMembers] = React.useState([]);
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const {pickedTeams, organization, formattedTeams} = useBasicContext();
  const [members, _setMembers] = React.useState();
  const membersRef = React.useRef(members);
  const setMembers = v => {
    _setMembers(v);
    membersRef.current = v;
  }
  const [analytics, setAnalytics] = React.useState(null); // { wearTime: [], alertMetrics: [] }
  const metrics = [
    {
      label: 'Wear Time',
      value: 1,
    },
    {
      label: 'Alerts Metric',
      value: 2,
    },
    {
      label: 'Max HeartCBT',
      value: 3,
    },
    {
      label: 'Active Users',
      value: 4,
    },
    {
      label: 'SWR & Fluid',
      value: 5,
    },
    {
      label: 'Percentage of Workers',
      value: 6,
    }
  ];
  const [metric, setMetric] = React.useState(null);
  const [riskLevels, setRiskLevels] = React.useState(null);
  const formattedMembers = React.useMemo(() => {
    const ret = [];
    members?.forEach(user => {
      ret.push({
        value: user.userId,
        label: `${user.firstName} ${user.lastName}`,
      });
    });

    return ret;
  }, [members]);
  React.useEffect(() => {
    let mounted = true;
    getRiskLevels().then(response => {
      if (mounted) setRiskLevels(response.data);
    })

    return () => {
      mounted = false;
    }
  }, []);

  React.useEffect(() => {
    const membersPromises = [];
    setMembers([]);
    if (pickedTeams?.length > 0) {
      pickedTeams.forEach(team => {
        membersPromises.push(queryTeamMembers(team));
      });
      const a = () => new Promise(resolve => {
        Promise.allSettled(membersPromises)
          .then(results => {
            results?.forEach((result, index) => {
              if (result.status === "fulfilled") {
                if (result.value?.data?.members?.length > 0) {
                  const operators = result.value?.data?.members?.filter(it => it.teamId?.toString() === pickedTeams?.[index]?.toString()) ?? [];
                  setMembers([...membersRef.current, ...operators]);
                }
              }
            })
          })
          .finally(() => resolve());
      });
      Promise.allSettled([a()]).then();
    }
  }, [pickedTeams]);

  const processQuery = () => {
    if (pickedTeams?.length > 0) {
      setAnalytics(null);
      if (startDate && endDate && metric) {
        switch (metric) {
          case 1:
            setLoading(true);
            queryOrganizationWearTime(organization, {
              teamIds: pickedTeams,
              startDate: dateFormat(new Date(startDate)),
              endDate: dateFormat(new Date(endDate)),
            })
              .then(response => {
                setAnalytics({
                  ...analytics,
                  wearTime: response.data,
                });
              })
              .finally(() => {
                setLoading(false);
              });
            break;
          case 2:
            setLoading(true);
            queryOrganizationAlertMetrics(organization, {
              teamIds: pickedTeams,
              startDate: dateFormat(new Date(startDate)),
              endDate: dateFormat(new Date(endDate)),
            })
              .then(response => {
                setAnalytics({
                  ...analytics,
                  alertMetrics: response.data,
                });
              })
              .finally(() => {
                setLoading(false);
              });
            break;
          case 3:
            setLoading(true);
            queryOrganizationMaxCbt(organization, {
              teamIds: pickedTeams,
              startDate: dateFormat(new Date(startDate)),
              endDate: dateFormat(new Date(endDate)),
            })
              .then(response => {
                setAnalytics({
                  ...analytics,
                  maxCbt: response.data,
                });
              })
              .finally(() => {
                setLoading(false);
              });
            break;
          case 4:
            setLoading(true);
            queryOrganizationActiveUsers(organization, {
              teamIds: pickedTeams,
              startDate: dateFormat(new Date(startDate)),
              endDate: dateFormat(new Date(endDate)),
            })
              .then(response => {
                setAnalytics({
                  ...analytics,
                  activeUsers: response.data,
                });
              })
              .finally(() => {
                setLoading(false);
              });
            break;
          case 5:
            setLoading(true);
            queryOrganizationSWRFluid(organization, {
              teamIds: pickedTeams,
              startDate: dateFormat(new Date(startDate)),
              endDate: dateFormat(new Date(endDate)),
            })
              .then(response => {
                setAnalytics({
                  ...analytics,
                  swrFluid: response.data,
                });
              })
              .finally(() => {
                setLoading(false);
              });
            break;
          default:
            console.log("metric is not available");
        }
      }
    }
  };

  console.log("**", analytics);

  const getUserNameFromUserId = React.useCallback(id => {
    const user = members?.find(it => it.userId?.toString() === id?.toString());
    return user ? `${user?.firstName} ${user?.lastName}` : '';
  }, [members]);

  const getTeamNameFromUserId = React.useCallback(userId => {
    const user = members?.find(it => it.userId?.toString() === userId?.toString());
    if (user?.teamId) {
      const team = formattedTeams?.find(it => it.value?.toString() === user.teamId?.toString());
      return team ? team.label : '';
    }
    return user ? `${user?.firstName} ${user?.lastName}` : '';
  }, [members, formattedTeams]);
  const formatRiskLevel = id => {
    return riskLevels?.find(it => it.id?.toString() === id?.toString())?.name;
  }

  const providerValue = {
    members,
    setMembers,
    formattedMembers,
    pickedMembers,
    setPickedMembers,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    metrics,
    metric,
    setMetric,
    analytics,
    processQuery,
    getUserNameFromUserId,
    getTeamNameFromUserId,
    formatRiskLevel,
  };

  return (
    <AnalyticsContext.Provider value={providerValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => {
  const context = React.useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalyticsContext must be used within AnalyticsProvider");
  }
  return context;
};
