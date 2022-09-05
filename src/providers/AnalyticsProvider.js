import * as React from 'react';
import {
  queryOrganizationWearTime,
  queryTeamMembers,
  queryOrganizationAlertMetrics,
  getRiskLevels,
  queryOrganizationMaxCbt,
  queryOrganizationActiveUsers,
  queryOrganizationSWRFluid, queryOrganizationAlertedUserCount
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
    metric: unitMetric,
  }) => {
  const [pickedMembers, setPickedMembers] = React.useState([]);
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const {pickedTeams, organization, formattedTeams} = useBasicContext();
  const [members, _setMembers] = React.useState();
  console.log("members", members);
  const membersRef = React.useRef(members);
  const setMembers = v => {
    _setMembers(v);
    membersRef.current = v;
  }
  const [analytics, setAnalytics] = React.useState(null); // { wearTime: [], alertMetrics: [] }
  /*const metrics = [
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
  ];*/
  const [statsBy, setStatsBy] = React.useState('user'); // user | team
  const metrics = React.useMemo(() => {
    const userStatsMetrics = [
      {
        label: 'Wear Time',
        value: 1,
      },
      {
        label: 'Alerts',
        value: 2,
      },
      {
        label: 'Max Heart CBT',
        value: 3,
      },
      {
        label: 'SWR & Acclim',
        value: 5,
      },
      {
        label: 'Time spent in CBT zones',
        value: 6,
      },
      {
        label: 'Device Data',
        value: 7,
      }
    ];
    const teamStatsMetrics = [
      {
        label: 'Ambient Temp/Humidity',
        value: 20,
      },
      {
        label: '% of workers with Alerts',
        value: 21,
      },
      {
        label: 'Active Users',
        value: 22,
      },
      {
        label: 'No. of users in SWR Categories',
        value: 23,
      },
      {
        label: 'No. of users in Heat Susceptibility Categories',
        value: 24,
      },
      {
        label: 'No. of users in CBT zones',
        value: 25,
      },
      {
        label: 'No. of users unacclimated, acclimated and persis previous illness',
        value: 26,
      },
    ];
    return statsBy === 'user' ? userStatsMetrics : teamStatsMetrics;
  }, [statsBy]);
  const [metric, setMetric] = React.useState(null);
  const headers = React.useMemo(() => {
    let ret = ['Name', 'Team'];
    switch (metric) {
      case 1:
        ret = ['Name', 'Team', 'Avg Wear Time', 'Total Wear Time'];
        break;
      case 2:
        ret = ['Name', 'Team', 'Alert time', 'Alert', 'Heat Risk', 'CBT', 'Temp', 'Humidity', 'Heart Rate Avg'];
        break;
      case 3:
        ret = ['Name', 'Team', 'Max CBT'];
        break;
      case 4:
        // ret = ['Name', 'Team'];
        break;
      case 5:
        ret = ['Name', 'Team', 'SWR Category', 'SWR', unitMetric ? 'Fluid Recmdt (L)' : 'Fluid Recmdt (Gal)', 'Previous illness', 'Acclim Status', 'Heat Risk'];
        break;
      case 22:
        ret = ['Team', 'Active Users'];
        break;
      case 23:
        ret = ['Team', 'Low SWR', 'Moderate SWR', 'High SWR'];
        break;
      default:
        console.log('metric not registered');
    }

    return ret;
  }, [metric, unitMetric]);
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
          case 1: // wear time
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
          case 2: // alerts
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
          case 5:
          case 23:
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
          case 22:
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
          case 21:
            setLoading(true);
            queryOrganizationAlertedUserCount(organization, {
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
  const getTeamNameFromTeamId = React.useCallback(teamId => {
    return formattedTeams?.find(it => it.value?.toString() === teamId?.toString())?.label;
  }, [formattedTeams]);
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
    getTeamNameFromTeamId,
    formatRiskLevel,
    statsBy,
    setStatsBy,
    headers,
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
