import * as React from 'react';
import * as XLSX from 'xlsx/xlsx.mjs';
import {
  queryOrganizationWearTime,
  queryTeamMembers,
  queryOrganizationAlertMetrics,
  getRiskLevels,
  queryOrganizationMaxCbt,
  queryOrganizationActiveUsers,
  queryOrganizationSWRFluid,
  queryAmbientTempHumidity, queryOrganizationUsersInCBTZones,
  // queryOrganizationAlertedUserCount,
} from "../http";
import {
  dateFormat,
} from "../utils";
import {useBasicContext} from "./BasicProvider";
import {formatHeartRate} from "../utils/dashboard";
import {useUtilsContext} from "./UtilsProvider";

const AnalyticsContext = React.createContext(null);

export const AnalyticsProvider = (
  {
    children,
    setLoading,
    metric: unitMetric,
  }) => {
  const {formatAlert, formatHeartCbt} = useUtilsContext();
  const [pickedMembers, setPickedMembers] = React.useState([]);
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const {pickedTeams, organization, formattedTeams} = useBasicContext();
  const [members, _setMembers] = React.useState();
  const membersRef = React.useRef(members);
  const [visibleExport, setVisibleExport] = React.useState(false);
  const [exportOption, setExportOption] = React.useState(null);
  const setMembers = v => {
    _setMembers(v);
    membersRef.current = v;
  }
  const [analytics, setAnalytics] = React.useState(null); // { wearTime: [], alertMetrics: [] }
  const [statsBy, setStatsBy] = React.useState('user'); // user | team
  const exportOptions = [
    {
      label: 'CSV',
      value: 'csv',
    },
    {
      label: 'XLSX',
      value: 'xlsx',
    }];
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
      },
      {
        label: 'Users in Various CBT zones',
        value: 8,
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
      case 8:
        ret = ['Temperature Categories', 'User %'];
        break;
      case 5:
        ret = ['Name', 'Team', 'SWR Category', 'SWR', unitMetric ? 'Fluid Recmdt (L)' : 'Fluid Recmdt (Gal)', 'Previous illness', 'Acclim Status', 'Heat Risk'];
        break;
      case 20:
        ret = ['Team', 'Max Temp', 'Min Temp', 'Avg Temp', 'Max RH', 'Min RH', 'Avg RH'];
        break;
      case 22:
        ret = ['Team', 'Active Users'];
        break;
      case 23:
        ret = ['Team', 'Low SWR', 'Moderate SWR', 'High SWR'];
        break;
      case 24:
        ret = ['Team', 'Low Risk', 'Medium Risk', 'High Risk'];
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

  const processQuery = () => {
    if (pickedTeams?.length > 0) {
      if (startDate && endDate && metric) {
        let key = null;
        let apiCall = null;
        switch (metric) {
          case 1: // wear time
            apiCall = queryOrganizationWearTime;
            key = 'wearTime';
            break;
          case 2: // alerts
            apiCall = queryOrganizationAlertMetrics;
            key = 'alertMetrics';
            break;
          case 3:
            apiCall = queryOrganizationMaxCbt;
            key = 'maxCbt';
            break;
          case 8:
            apiCall = queryOrganizationUsersInCBTZones;
            key = 'usersInCBTZones';
            break;
          case 20:
            apiCall = queryAmbientTempHumidity;
            key = 'tempHumidity';
            break;
          case 5:
          case 23:
          case 24:
            apiCall = queryOrganizationSWRFluid;
            key = 'swrFluid';
            break;
          case 22:
            apiCall = queryOrganizationActiveUsers;
            key = 'activeUsers';
            break;
          case 21:
            /*apiCall = queryOrganizationAlertedUserCount;
            key = 'activeUsers';*/
            break;
          default:
            console.log("metric is not available");
        }

        if (apiCall && key) {
          setLoading(true);
          apiCall(organization, {
            teamIds: pickedTeams,
            startDate: dateFormat(new Date(startDate)),
            endDate: dateFormat(new Date(endDate)),
          })
            .then(response => {
              setAnalytics({
                ...analytics,
                [key]: response.data,
              });
            })
            .finally(() => {
              setLoading(false);
            });
        }
      }
    }
  };
  const formatRiskLevel = id => {
    return riskLevels?.find(it => it.id?.toString() === id?.toString())?.name;
  }
  const data = React.useMemo(() => {
    const getUserNameFromUserId = id => {
      const user = members?.find(it => it.userId?.toString() === id?.toString());
      return user ? `${user?.firstName} ${user?.lastName}` : '';
    };

    const getTeamNameFromUserId = userId => {
      const user = members?.find(it => it.userId?.toString() === userId?.toString());
      if (user?.teamId) {
        const team = formattedTeams?.find(it => it.value?.toString() === user.teamId?.toString());
        return team ? team.label : '';
      }
      return user ? `${user?.firstName} ${user?.lastName}` : '';
    };
    const getTeamNameFromTeamId = teamId => {
      return formattedTeams?.find(it => it.value?.toString() === teamId?.toString())?.label;
    };

    let ret = [];
    if (metric === 1) { // wear time
      ret = analytics?.wearTime?.map(it => ([
        getUserNameFromUserId(it.userId),
        getTeamNameFromUserId(it.userId),
        it.avgWearTime ?? '',
        it.wearTime ?? '',
      ]))
    } else if (metric === 2) { // alert metrics
      ret = analytics?.alertMetrics?.map(it => ([
        getUserNameFromUserId(it.userId),
        getTeamNameFromUserId(it.userId),
        it.ts ? new Date(it.ts)?.toLocaleString() : '',
        it.alertStageId ? formatAlert(it.alertStageId)?.label : '',
        it.risklevelId ? formatRiskLevel(it.risklevelId) : '',
        it.heartCbtAvg ? formatHeartCbt(it.heartCbtAvg) : '',
        it.temperature ? formatHeartCbt(it.temperature) : '',
        it.humidity ?? '',
        it.heartRateAvg ? formatHeartRate(it.heartRateAvg) : '',
      ]))
    } else if (metric === 3) {
      ret = analytics?.maxCbt?.map(it => ([
        getUserNameFromUserId(it.userId),
        getTeamNameFromUserId(it.userId),
        it.maxCbt ? formatHeartCbt(it.maxCbt) : '',
      ]));
    } else if (metric === 5) {
      ret = analytics?.swrFluid?.map(it => ([
        getUserNameFromUserId(it.userId),
        getTeamNameFromUserId(it.userId),
        it.sweatRateCategory ?? '',
        it.sweatRate ?? '',
        unitMetric ? it.fluidRecommendationL ?? '' : it.fluidRecommendationG ?? '',
        it.previousIllness ?? '',
        it.acclimatizationStatus ?? '',
        it.heatSusceptibility ?? '',
      ]));
    } else if (metric === 22) {
      let tempRet = [];
      analytics?.activeUsers?.forEach(it => {
        const member = members?.find(ele => ele.userId === it.userId);
        const memberTeamId = member?.teamId;
        if (memberTeamId) {
          const index = tempRet?.findIndex(e => e.teamId === memberTeamId);

          if (index !== -1) {
            tempRet.splice(index, 1, {
              teamId: memberTeamId,
              cnt: tempRet[index].cnt + 1,
            });
          } else {
            tempRet.push({
              teamId: memberTeamId,
              cnt: 1,
            })
          }
        }
      });
      ret = tempRet?.map(it => ([
        getTeamNameFromTeamId(it.teamId),
        it.cnt,
      ]));
    } else if (metric === 23) {
      let tempRet = [];
      analytics?.swrFluid?.forEach(it => {
        const index = tempRet?.findIndex(e => e.teamId === it.teamId);
        if (["low", "moderate", "high"].includes(it.sweatRateCategory?.toLowerCase())) {
          if (index !== -1) {
            tempRet.splice(index, 1, {
              ...tempRet[index],
              [it.sweatRateCategory?.toLowerCase()]: (tempRet[index][it.sweatRateCategory?.toLowerCase()] ?? 0) + 1,
            });
          } else {
            tempRet.push(
              {
                teamId: it.teamId,
                [it.sweatRateCategory?.toLowerCase()]: 1,
              }
            )
          }
        }
      });
      ret = tempRet?.map(it => ([
        getTeamNameFromTeamId(it.teamId),
        it['low'],
        it['moderate'],
        it['high'],
      ]));
    } else if (metric === 24) {
      let tempRet = [];
      analytics?.swrFluid?.forEach(it => {
        const index = tempRet?.findIndex(e => e.teamId === it.teamId);
        if (["low", "medium", "high"].includes(it.heatSusceptibility?.toLowerCase())) {
          if (index !== -1) {
            tempRet.splice(index, 1, {
              ...tempRet[index],
              [it.heatSusceptibility?.toLowerCase()]: (tempRet[index][it.heatSusceptibility?.toLowerCase()] ?? 0) + 1,
            });
          } else {
            tempRet.push(
              {
                teamId: it.teamId,
                [it.heatSusceptibility?.toLowerCase()]: 1,
              }
            )
          }
        }
      });
      ret = tempRet?.map(it => ([
        getTeamNameFromTeamId(it.teamId),
        it['low'],
        it['medium'],
        it['high'],
      ]));
    } else if (metric === 20) {
      console.log(analytics?.tempHumidity);
    } else if (metric === 8) {
      ret = analytics?.usersInCBTZones?.map(it => ([
        it.temperatureCategory,
        it.percentage,
      ]));
    }

    ret = ret ?? [];

    if (headers?.length > 0) {
      setVisibleExport(ret?.length > 0);

      while (ret?.length < 10) {
        ret.push(Array(headers.length).fill(''));
      }
    }

    return ret;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metric, analytics, members, unitMetric, headers]);

  const handleExport = () => {
    if (visibleExport) {
      if (['xlsx', 'csv'].includes(exportOption?.value)) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data, {
          origin: 'A2',
          skipHeader: true
        });
        XLSX.utils.sheet_add_aoa(ws, [headers]);
        const sheetLabel = metrics?.find(it => it.value === metric)?.label ?? 'Sheet';
        XLSX.utils.book_append_sheet(wb, ws, sheetLabel);
        XLSX.writeFile(wb, `kenzen-analytics-${sheetLabel}-${new Date().toLocaleString()}.${exportOption?.value}`, {
          bookType: exportOption.value,
        });
      }
    }
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
    formatRiskLevel,
    statsBy,
    setStatsBy,
    headers,
    data,
    visibleExport,
    exportOptions,
    exportOption,
    setExportOption,
    handleExport,
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
