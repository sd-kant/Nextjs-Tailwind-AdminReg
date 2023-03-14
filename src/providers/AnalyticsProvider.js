import * as React from 'react';
import * as XLSX from 'xlsx/xlsx.mjs';
import {
  queryTeamMembers,
  getRiskLevels,
} from "../http";
import {
  celsiusToFahrenheit,
  dateFormat,
  numMinutesBetweenWithNow,
} from "../utils";
import {
  onCalc,
  getDateList,
  getListPerLabel,
  getUserNameFromUserId,
  getTeamNameFromUserId,
  getTeamNameFromTeamId,
  getTimeSpentFromUserId,
  onFilterData,
  onFilterDataByOrganization,
  getThisWeekByTeam,
  checkMetric,
  getKeyApiCall,
  getHeaderMetrics,
} from "../utils/anlytics";
import {
  COLOR_WHITE,
  HEAT_SWEAT_CHART_COLORS,
  HEAT_LOW_MEDIUM_HIGH,
  METRIC_TEAM_TABLE_VALUES,
  METRIC_USER_TABLE_VALUES,
  METRIC_USER_CHART_VALUES,
  METRIC_TEAM_CHART_VALUES,
  DAY_LIST,
  HIGHEST_CHART_CELSIUS_MIN,
  HIGHEST_CHART_CELSIUS_MAX,
  ANALYTICS_API_KEYS,
  RISK_PRIORITIES,
  HEAT_SUSCEPTIBILITY_PRIORITIES,
  USER_STATUS_METRICS,
  TEAM_STATUS_METRICS,
  SORT_TITLES,
  SWEAT_LOW_MEDIUM_HIGH,
  LABELS_HEAT_DOUGHNUT,
  LABELS_SWEAT_DOUGHNUT,
  INVALID_VALUES2,
} from "../constant";
import {useBasicContext} from "./BasicProvider";
import {
  formatHeartRate,
  literToQuart
} from "../utils/dashboard";
import {useUtilsContext} from "./UtilsProvider";
import {useTranslation} from "react-i18next";
import soft from "timezone-soft";
import spacetime from "spacetime";

const AnalyticsContext = React.createContext(null);

export const AnalyticsProvider = (
  {
    children,
    setLoading,
    metric: unitMetric,
  }) => {
  const {t} = useTranslation();
  const {
    formatAlert,
    formatHeartCbt,
    alertPriorities
  } = useUtilsContext();
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
  };
  const [analytics, setAnalytics] = React.useState(null); // { 1: {wearTime: [], alertMetrics: []} }
  const [statsBy, setStatsBy] = React.useState('user'); // user | team
  const [page, setPage] = React.useState(null);
  const [sizePerPage, setSizePerPage] = React.useState(10);
  const [users, setUsers] = React.useState([]);
  const [detailCbt, setDetailCbt] = React.useState(null); // {dayIndex: 4, timeIndex: 5}
  const chartRef = React.useRef(null); // for chart print

  React.useEffect(() => {
    let mounted = true;
    getRiskLevels().then(response => {
      if (mounted) setRiskLevels(response.data);
    });

    return () => {
      mounted = false;
    }
  }, []);

  const selectedTeams = React.useMemo(() => {
    return formattedTeams?.filter(it => pickedTeams.some(ele => ele.toString() === it.value?.toString()))
  }, [pickedTeams, formattedTeams]);

  const [isEnablePrint, setIsEnablePrint] = React.useState(false);

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
              if (result.status === `fulfilled`) {
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
    return statsBy === `user` ? USER_STATUS_METRICS : TEAM_STATUS_METRICS;
  }, [statsBy]);

  const [metric, setMetric] = React.useState(null);
  const [sort, setSort] = React.useState([]);
  React.useEffect(() => {
    setSort(null);
  }, [metric]);

  const makeOption = (title, actionSorts) => {
    return {
      title,
      action: () => {
        const v = actionSorts?.map(it => ({
          index: it[0],
          direction: it[1],
          type: it[2],
        }));
        setSort(v);
      },
      highlight: sort?.[0]?.index === actionSorts?.[0]?.[0] &&
        sort?.[0]?.direction === actionSorts?.[0]?.[1],
    }
  };
  /**
   *
   * @param title
   * @param options
   * @return {{options: *, title: *}}
   * @description return data will look like below
   * {
        title: 'Sort',
        options: [
          {
            title: 'A - Z',
            action: () => {},
            highlight: true,
          },
          {
            title: 'Z - A',
            action: () => {},
            highlight: false,
          }
        ]
      }
   *
   *
   */
  const makeSort = (title, options) => ({
    title,
    options: options?.map(it => makeOption(it[0], it[1]))
  });

  const sortOptions = React.useMemo(() => {
    let ret = [];
    switch (metric) {
      case METRIC_USER_TABLE_VALUES.WEAR_TIME: // 1
        ret = [
          makeSort('Sort', [[SORT_TITLES[0], [[0, 'asc', 'string']]], [SORT_TITLES[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[0], [[1, 'asc', 'string']]], [SORT_TITLES[1], [[1, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[2, 'asc', 'number']]], [SORT_TITLES[3], [[2, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[3, 'asc', 'number']]], [SORT_TITLES[3], [[3, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_USER_TABLE_VALUES.ALERTS: // 2
      case METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK: // 31
        ret = [
          makeSort('Sort', [[SORT_TITLES[0], [[0, 'asc', 'string']]], [SORT_TITLES[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[0], [[1, 'asc', 'string']]], [SORT_TITLES[1], [[1, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[4], [[2, 'desc', 'date']]], [SORT_TITLES[5], [[2, 'asc', 'date']]]]),
          makeSort('Sort', [[SORT_TITLES[6], [[3, 'desc', 'alert']]], [SORT_TITLES[7], [[3, 'asc', 'alert']]]]),
          makeSort('Sort', [[SORT_TITLES[8], [[4, 'desc', 'risk']]], [SORT_TITLES[9], [[4, 'asc', 'risk']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[5, 'asc', 'number']]], [SORT_TITLES[3], [[5, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[6, 'asc', 'number']]], [SORT_TITLES[3], [[6, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[7, 'asc', 'number']]], [SORT_TITLES[3], [[7, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[8, 'asc', 'number']]], [SORT_TITLES[3], [[8, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_USER_TABLE_VALUES.MAX_HEART_CBT: // 3
      case METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK: // 32
        ret = [
          makeSort('Sort', [[SORT_TITLES[0], [[0, 'asc', 'string']]], [SORT_TITLES[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[0], [[1, 'asc', 'string']]], [SORT_TITLES[1], [[1, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[4], [[2, 'asc', 'date']]], [SORT_TITLES[5], [[2, 'desc', 'date']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[3, 'asc', 'number']]], [SORT_TITLES[3], [[3, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_USER_TABLE_VALUES.SWR_ACCLIM: // 5
        ret = [
          makeSort('Sort', [[SORT_TITLES[0], [[0, 'asc', 'string']]], [SORT_TITLES[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[0], [[1, 'asc', 'string']]], [SORT_TITLES[1], [[1, 'desc', 'string']]]]),
          null,
          makeSort('Sort', [[SORT_TITLES[2], [[3, 'asc', 'number']]], [SORT_TITLES[3], [[3, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[4, 'asc', 'number']]], [SORT_TITLES[3], [[4, 'desc', 'number']]]]),
          null,
          null,
          makeSort('Sort', [[SORT_TITLES[10], [[7, 'asc', 'susceptibility']]], [SORT_TITLES[11], [[7, 'desc', 'susceptibility']]]]),
        ];
        break;
      case METRIC_USER_TABLE_VALUES.TIME_SPENT_IN_CBT_ZONES: // 6
        ret = [
          makeSort('Sort', [[SORT_TITLES[0], [[0, 'asc', 'number']]], [SORT_TITLES[1], [[0, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[0], [[1, 'asc', 'string']]], [SORT_TITLES[1], [[1, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[2, 'asc', 'number']]], [SORT_TITLES[3], [[2, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[3, 'asc', 'number']]], [SORT_TITLES[3], [[3, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[4, 'asc', 'number']]], [SORT_TITLES[3], [[4, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_USER_TABLE_VALUES.DEVICE_DATA: // 7
        ret = [
          makeSort('Sort', [[SORT_TITLES[0], [[0, 'asc', 'string']]], [SORT_TITLES[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[0], [[1, 'asc', 'string']]], [SORT_TITLES[1], [[1, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[2, 'asc', 'string']]], [SORT_TITLES[3], [[2, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[3, 'asc', 'string']]], [SORT_TITLES[3], [[3, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[0], [[4, 'asc', 'string']]], [SORT_TITLES[1], [[4, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[0], [[5, 'asc', 'string']]], [SORT_TITLES[1], [[5, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[4], [[6, 'asc', 'date']]], [SORT_TITLES[5], [[6, 'desc', 'date']]]]),
        ];
        break;
      case METRIC_USER_TABLE_VALUES.USERS_IN_VARIOUS_CBT_ZONES: // 8
        ret = [
          null,
          makeSort('Sort', [[SORT_TITLES[2], [[1, 'asc', 'number']]], [SORT_TITLES[3], [[1, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_TEAM_TABLE_VALUES.AMBIENT_TEMP_HUMIDITY: // 20
      case METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_CBT_ZONES: // 25
        ret = [
          makeSort('Sort', [[SORT_TITLES[0], [[0, 'asc', 'string']]], [SORT_TITLES[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[1, 'asc', 'number']]], [SORT_TITLES[3], [[1, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[2, 'asc', 'number']]], [SORT_TITLES[3], [[2, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[3, 'asc', 'number']]], [SORT_TITLES[3], [[3, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[4, 'asc', 'number']]], [SORT_TITLES[3], [[4, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[5, 'asc', 'number']]], [SORT_TITLES[3], [[5, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[6, 'asc', 'number']]], [SORT_TITLES[3], [[6, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_TEAM_TABLE_VALUES.PERCENT_WORKERS_ALERTS: // 21
      case METRIC_TEAM_TABLE_VALUES.NO_USERS_UNACCLIMATED_ACCLIMATED: // 26
        ret = [
          makeSort('Sort', [[SORT_TITLES[0], [[0, 'asc', 'string']]], [SORT_TITLES[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[1, 'asc', 'number']]], [SORT_TITLES[3], [[1, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[2, 'asc', 'number']]], [SORT_TITLES[3], [[2, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[3, 'asc', 'number']]], [SORT_TITLES[3], [[3, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[4, 'asc', 'number']]], [SORT_TITLES[3], [[4, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_TEAM_TABLE_VALUES.ACTIVE_USERS: // 22
        ret = [
          makeSort('Sort', [[SORT_TITLES[0], [[0, 'asc', 'string']]], [SORT_TITLES[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[1, 'asc', 'number']]], [SORT_TITLES[3], [[1, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE: // 23
      case METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE: // 24
      case METRIC_TEAM_CHART_VALUES.HEAT_SUSCEPTIBILITY_SWEAT_RATE: // 30
        ret = [
          makeSort('Sort', [[SORT_TITLES[0], [[0, 'asc', 'string']]], [SORT_TITLES[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[1, 'asc', 'number']]], [SORT_TITLES[3], [[1, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[2, 'asc', 'number']]], [SORT_TITLES[3], [[2, 'desc', 'number']]]]),
          makeSort('Sort', [[SORT_TITLES[2], [[3, 'asc', 'number']]], [SORT_TITLES[3], [[3, 'desc', 'number']]]]),
        ];
        break;
    }

    return ret;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metric, sort]);

  const headers = React.useMemo(() => {
    return getHeaderMetrics(metric, unitMetric);
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

  const organizationAnalytics = React.useMemo(
    () => selectedTeams?.length > 0 ? (onFilterDataByOrganization(analytics, organization) ?? {}) : {},
    [analytics, organization, selectedTeams]
  );

  const processQuery = () => {
    if (pickedTeams?.length > 0) {
      if (startDate && endDate && metric) {
        let keyApiCall = getKeyApiCall(metric);
        let key = keyApiCall.key;
        let apiCall = keyApiCall.apiCall;

        if (apiCall && key) {
          if (checkMetric(METRIC_USER_CHART_VALUES, metric)) {
            let userFilter = members?.filter(it => users.includes(it.userId));

            const userPromises = [];
            if (userFilter?.length > 0) {
              let startD = new Date(startDate); // e.g. 2022-10-24
              startD.setDate(startD.getDate() - 2); // e.g. 2022-10-22

              userFilter.forEach(user => {
                userPromises.push(apiCall({
                  teamId: user.teamId,
                  userId: user.userId,
                  since: new Date(startD).toISOString()
                }));
              });
              setLoading(true);
              let list = [];
              const a = () => new Promise(resolve => {
                Promise.allSettled(userPromises)
                  .then(response => {
                    response?.forEach((result) => {
                      if (result.status === `fulfilled`) {
                        if (result.value?.data?.length > 0) {
                          list = list.concat(result.value.data);
                        }
                      }
                    })
                  })
                  .finally(() => {
                    setAnalytics({
                      ...analytics,
                      [organization]: {
                        ...organizationAnalytics,
                        [key]: list
                      },
                    });
                    setLoading(false);
                    resolve();
                  });
              });
              Promise.allSettled([a()]).then();
            }
          } else {
            let startD = new Date(startDate); // e.g. 2022-04-05
            let endD = new Date(endDate); // e.g. 2022-11-24

            if (checkMetric(METRIC_TEAM_CHART_VALUES, metric)) { // team chart only
              startD.setDate(startD.getDate() - 2); // e.g. 2022-04-03
              endD.setDate(endD.getDate() + 2); // e.g. 2022-11-26
            }
            setLoading(true);
            apiCall(organization, {
              teamIds: pickedTeams,
              startDate: dateFormat(new Date(startD)),
              endDate: dateFormat(new Date(endD)),
            })
              .then(response => {
                setAnalytics({
                  ...analytics,
                  [organization]: {
                    ...organizationAnalytics,
                    [key]: response.data
                  },
                });
              })
              .finally(() => {
                setLoading(false);
              });
          }
        }
      }
    }
  };

  const formatRiskLevel = id => {
    return riskLevels?.find(it => it.id?.toString() === id?.toString())?.name;
  };

  const selectedMembers = React.useMemo(() => {
    let formattedMembersTemp = formattedMembers?.filter(it =>
      members?.some(ele =>
        ele.userId?.toString() === it.value?.toString() &&
        ele.orgId?.toString() === organization?.toString()
      ));
    return formattedMembersTemp?.filter(it => pickedMembers?.some(ele => ele.toString() === it.value?.toString()));
  }, [pickedMembers, formattedMembers, members, organization]);

  const selectedMetric = React.useMemo(() => {
    let _metric = metrics?.find(it => it.value?.toString() === metric?.toString());
    if (checkMetric(METRIC_USER_CHART_VALUES, _metric?.value) && selectedMembers.filter(it => users.includes(it.value))?.length === 0) {
      setUsers(selectedMembers.map(it => it.value));
    }
    return _metric
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metric, metrics]);

  React.useEffect(() => {
    if (checkMetric(METRIC_USER_CHART_VALUES, selectedMetric?.value) && selectedMembers.filter(it => users.includes(it.value))?.length === 0) {
      setUsers(selectedMembers.map(it => it.value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMetric, selectedMembers]);

  const selectedUsers = React.useMemo(() => {
    return selectedMembers?.filter(it => users.some(ele => ele?.toString() === it.value?.toString()))
  }, [selectedMembers, users]);

  const timeZone = React.useMemo(() => {
    let a = null;
    if (selectedTeams?.length === 1 && selectedTeams[0]?.region) {
      a = soft(selectedTeams[0]?.region)[0];
    }
    if (!a) {
      a = soft('UTC')[0];
    }

    return {
      name: a?.iana,
      valid: true,
      displayName: a.standard?.abbr,
    };
  }, [selectedTeams]);

  React.useEffect(() => {
    setDetailCbt(null)
  }, [statsBy, selectedMembers, selectedMetric, selectedTeams]);

  const chartData = React.useMemo(() => {
    if (
        [
          METRIC_USER_TABLE_VALUES.SWR_ACCLIM,
          METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE,
          METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE,
          METRIC_TEAM_CHART_VALUES.HEAT_SUSCEPTIBILITY_SWEAT_RATE
        ].includes(metric)
    ) { // 5, 23, 24, 30
      let tempRet = [0, 0, 0, 0, 0, 0];
      let totalHeat = 0, totalSweat = 0;

      onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.SWR_FLUID, null, null)?.forEach(it => {
        let findHeatIndex = HEAT_LOW_MEDIUM_HIGH.findIndex(a => a === it.heatSusceptibility?.toLowerCase());
        let findSweatIndex = SWEAT_LOW_MEDIUM_HIGH.findIndex(a => a === it.sweatRateCategory?.toLowerCase());

        if (findHeatIndex > -1) {
          tempRet[findHeatIndex] += 1;
          totalHeat += 1;
        }
        if (findSweatIndex > -1) {
          tempRet[findSweatIndex + 3] += 1;
          totalSweat += 1;
        }
      });

      const dataChart = (mode) => {
        if (['heat', 'sweat'].includes(mode)) {
          let label = null;
          let data = null;
          switch (mode) {
            case 'heat':
              label = '# of Heat';
              data = [
                onCalc(0, tempRet, totalSweat, totalHeat), // Low Data
                onCalc(1, tempRet, totalSweat, totalHeat), // Medium Data
                onCalc(2, tempRet, totalSweat, totalHeat), // High Data
              ];
              break;
            case 'sweat':
              label = '# of Sweat';
              data = [
                onCalc(3, tempRet, totalSweat, totalHeat), // Low Data
                onCalc(4, tempRet, totalSweat, totalHeat), // Medium Data
                onCalc(5, tempRet, totalSweat, totalHeat), // High Data
              ];
              break;
            default:
              console.error('chart mode not recognized');
          }
          return {
            type: 'doughnut',
            labels: mode === 'heat' ? LABELS_HEAT_DOUGHNUT : LABELS_SWEAT_DOUGHNUT,
            datasets: [
              {
                label: label,
                data,
                backgroundColor: HEAT_SWEAT_CHART_COLORS,
                borderColor: [
                  COLOR_WHITE,
                  COLOR_WHITE,
                  COLOR_WHITE
                ],
              },
            ],
          };
        }
        return null;
      };

      return {
        dataHeat: dataChart('heat'),
        dataSweat: dataChart('sweat'),
      };
    } else if (checkMetric(METRIC_USER_CHART_VALUES, metric)) { // 40, 41
      return onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.TEAM_MEMBER_ALERTS, null, null).sort((a, b) => {
        return new Date(a?.ts).getTime() > new Date(b.ts).getTime() ? -1 : 1;
      });
    } else {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analytics, metric, formatAlert, organization, selectedTeams, selectedMembers, timeZone]);

  const maxCBTTileData = React.useMemo(() => {
    let list = [];
    let dayList = [];
    const thisWeek = getThisWeekByTeam(timeZone);
    const endD = thisWeek.endDate;
    let startD = thisWeek.startDate;

    if (
        metric === METRIC_USER_TABLE_VALUES.ALERTS ||
        metric === METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK
    ) { // 2, 31
      let thisData = onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.ALERT_METRICS, null, null)?.filter(it => spacetime(it.ts).isBefore(endD) && spacetime(it.ts).isAfter(startD));

      let arrayPerDate = [
        getListPerLabel({
          list: thisData,
          timezone: timeZone,
          stageIds: [1],
          startD,
          endD
        }), // At Risk id
        getListPerLabel({
          list: thisData,
          timezone: timeZone,
          stageIds: [2],
          startD,
          endD
        }), // Elevated Risk id
        getListPerLabel({
          list: thisData,
          timezone: timeZone,
          stageIds: [3, 4],
          startD,
          endD
        }), // Safe ids
      ];
      const xLabel = getDateList(startD, endD);
      const dataSet = [
        {
          label: formatAlert(1).label, // At Risk
          data: xLabel?.map((it, index) => arrayPerDate[0][index]),
          backgroundColor: HEAT_SWEAT_CHART_COLORS[0],
        },
        {
          label: formatAlert(2).label, // Elevated Risk
          data: xLabel?.map((it, index) => arrayPerDate[1][index]),
          backgroundColor: HEAT_SWEAT_CHART_COLORS[1],
        },
        {
          label: formatAlert(3).label, // Safe
          data: xLabel?.map((it, index) => arrayPerDate[2][index]),
          backgroundColor: HEAT_SWEAT_CHART_COLORS[2],
        },
      ];

      /**
       * {
       *   labels: ['2022-10-27', '2022-10-28', ..., '2022-11-02'],
       *   datasets: [
       *      {
       *       "label": "At Risk",
       *       "data": [ 0, 2, 0, 3, 9, 11, 0 ],
       *       "backgroundColor": "#ffe699"
       *       },
       *       {
       *       "label": "Elevated Risk",
       *       "data": [ 0, 2, 0, 3, 9, 11, 0 ],
       *       "backgroundColor": "#ffe699"
       *       },
       *       {
       *       "label": "Safe",
       *       "data": [ 0, 2, 0, 3, 9, 11, 0 ],
       *       "backgroundColor": "#ed7d31"
       *       }
       *   ],
       * }
       */
      return {
        labels: xLabel,
        datasets: dataSet,
      };
    } else if (
        metric === METRIC_USER_TABLE_VALUES.MAX_HEART_CBT ||
        metric === METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK
    ) { // 3, 32
      while (startD.isBefore(endD)) {
        const subList = [];
        const endDByOneDay = startD.add(1, `day`);

        const dailyData = onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.MAX_CBT, null, null)?.filter(it =>
          selectedMembers?.findIndex(a => a?.value === it?.userId) > -1 &&
          spacetime(it.utcTs).isBefore(endDByOneDay) &&
          spacetime(it.utcTs).isAfter(startD)
        );

        let startHour = startD;

        while (startHour.isBefore(endDByOneDay)) {
          let endHour = startHour.add(1, `hour`);
          const hourlyData = [];
          const tempData = [];
          dailyData?.filter(it => {
            return spacetime(it.utcTs).isBefore(endHour) && spacetime(it.utcTs).isAfter(startHour);
          })
            .sort((a, b) => {
              return a?.maxCbt > b?.maxCbt ? -1 : 1;
            })
            .forEach(it => {
              hourlyData.push([
                getUserNameFromUserId(members, it.userId),
                getTeamNameFromUserId(members, formattedTeams, it.userId),
                it.utcTs ? it.utcTs : ``,
                it?.maxCbt ? formatHeartCbt(it?.maxCbt) : ``,
              ]);
              tempData.push(it?.maxCbt ? it?.maxCbt : ``);
            });
          let maxCbtColor = tempData?.length > 0 ? celsiusToFahrenheit(tempData[0]) : 0;
          maxCbtColor = Math.min(Math.max(maxCbtColor, HIGHEST_CHART_CELSIUS_MIN), HIGHEST_CHART_CELSIUS_MAX);
          maxCbtColor = ((HIGHEST_CHART_CELSIUS_MAX - maxCbtColor) * 255) / (HIGHEST_CHART_CELSIUS_MAX - HIGHEST_CHART_CELSIUS_MIN);

          let tooltip = ``;
          if (hourlyData?.length > 0) {
            let firstItem = hourlyData?.length > 0 ? hourlyData[0] : ``;
            tooltip = firstItem[1] + `, ` + firstItem[0] + `, ` + firstItem[3];
          }

          subList.push(
              hourlyData?.length > 0 ? {
                maxCbtColor: maxCbtColor.toFixed(2),
                details: hourlyData,
                tooltip: tooltip,
              }
              :
              null
          );

          startHour = startHour.add(1, 'hour');
        }
        list.unshift(subList);

        dayList.unshift(DAY_LIST[startD.day()] + `, ` + (startD.month() + 1) + `/` + startD.date());
        startD = endDByOneDay;
      }

      return {
        list: list?.length === 0 ? new Array(7).fill(new Array(24).fill('')) : list,
        dayList: dayList?.length > 0 ? dayList : DAY_LIST.reverse()
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analytics, metric, formatAlert, organization, selectedTeams, selectedMembers, timeZone, startDate, endDate]);

  const data = React.useMemo(() => {
    let ret = [];

    if (metric === METRIC_USER_TABLE_VALUES.WEAR_TIME) { // 1, wear time
      ret = onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.WEAR_TIME, pickedMembers, members)?.map(it => ([
        getUserNameFromUserId(members, it.userId),
        getTeamNameFromUserId(members, formattedTeams, it.userId),
        it.avgWearTime ?? ``,
        it.wearTime ?? ``,
      ]))
    } else if (
        metric === METRIC_USER_TABLE_VALUES.ALERTS ||
        metric === METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK
    ) { // 2, 31
      ret = onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.ALERT_METRICS, pickedMembers, members)?.map(it => ([
        getUserNameFromUserId(members, it.userId),
        getTeamNameFromUserId(members, formattedTeams, it.userId),
        it.ts ? new Date(it.ts)?.toLocaleString() : ``,
        it.alertStageId ? formatAlert(it.alertStageId)?.label : ``,
        it.risklevelId ? formatRiskLevel(it.risklevelId) : ``,
        it.heartCbtAvg ? formatHeartCbt(it.heartCbtAvg) : ``,
        it.temperature ? formatHeartCbt(it.temperature) : ``,
        it.humidity ?? '',
        it.heartRateAvg ? formatHeartRate(it.heartRateAvg) : ``,
      ]))
    } else if (
        (metric === METRIC_USER_TABLE_VALUES.MAX_HEART_CBT ||
        metric === METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK) && !detailCbt
    ) { // 3, 32
      ret = onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.MAX_CBT, pickedMembers, members)?.map(it => ([
        getUserNameFromUserId(members, it.userId),
        getTeamNameFromUserId(members, formattedTeams, it.userId),
        it.utcTs ? new Date(it.utcTs)?.toLocaleString() : ``,
        it.maxCbt ? formatHeartCbt(it.maxCbt) : ``,
      ]));
    } else if (metric === METRIC_USER_TABLE_VALUES.SWR_ACCLIM) { // 5 only, 30
      ret = onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.SWR_FLUID, pickedMembers, members)?.map(it => ([
        getUserNameFromUserId(members, it.userId),
        getTeamNameFromUserId(members, formattedTeams, it.userId),
        it.sweatRateCategory ?? ``,
        unitMetric ? ((!INVALID_VALUES2.includes(it.sweatRate) && it.sweatRate >= 0) ? it.sweatRate : ``) : literToQuart((!INVALID_VALUES2.includes(it.sweatRate) && it.sweatRate >= 0) ? it.sweatRate : ``),
        unitMetric ? it.fluidRecommendationL ?? `` : literToQuart(it.fluidRecommendationL) ?? ``,
        it.previousIllness ?? ``,
        it.acclimatizationStatus ?? ``,
        it.heatSusceptibility ?? ``,
      ]));
    } else if (metric === METRIC_USER_TABLE_VALUES.TIME_SPENT_IN_CBT_ZONES) { // 6
      ret = onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.TEMP_CATE_DATA, pickedMembers, members)?.map(it => ([
        getUserNameFromUserId(members, it.userId),
        getTeamNameFromUserId(members, formattedTeams, it.userId),
        getTimeSpentFromUserId(it?.temperatureCategoryCounts, `Safe to Work 38C`),
        getTimeSpentFromUserId(it?.temperatureCategoryCounts, `Mild Heat Exhaustion 38C – 38.49C`),
        getTimeSpentFromUserId(it?.temperatureCategoryCounts, `Moderate Hyperthermia > 38.5C`),
      ]));
    } else if (metric === METRIC_USER_TABLE_VALUES.DEVICE_DATA) { // 7
      ret = onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.DEVICE_DATA, pickedMembers, members)?.map(it => ([
        it.fullname ?? ``,
        getTeamNameFromTeamId(formattedTeams, it.teamId),
        it.type === `kenzen` ? (it?.version || ``) : ``,
        it.type === `kenzen` ? `` : (it.osVersion ?? ``),
        it.type === `kenzen` ? `` : (it.version ?? ``),
        it.type ?? ``,
        it.ts ?? ``,
      ]));
    } else if (metric === METRIC_USER_TABLE_VALUES.USERS_IN_VARIOUS_CBT_ZONES) { // 8
      ret = onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.USERS_IN_CBT_ZONES, null, null)?.map(it => ([
        it.temperatureCategory,
        it.percentage,
      ]));
    } else if (metric === METRIC_TEAM_TABLE_VALUES.AMBIENT_TEMP_HUMIDITY) { // 20
      ret = onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.TEMP_HUMIDITY, null, null)?.map(it => ([
        it.teamName ?? ``,
        it.maxTemp ? formatHeartCbt(it.maxTemp) : ``,
        it.minTemp ? formatHeartCbt(it.minTemp) : ``,
        it.avgTemp ? formatHeartCbt(it.avgTemp) : ``,
        it.maxHumidity ?? ``,
        it.minHumidity ?? ``,
        it.avgHumidity ?? ``,
      ]));
    } else if (metric === METRIC_TEAM_TABLE_VALUES.PERCENT_WORKERS_ALERTS) { // 21
      ret = onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.ALERT_USER_COUNT, null, null)?.map(it => ([
        it.teamName ?? ``,
        it.alertPercentage ?? ``,
        it.noAlertPercentage ?? ``,
        it.usersWithAlerts,
        it.activeUsers - it.usersWithAlerts,
      ]))
    } else if (metric === METRIC_TEAM_TABLE_VALUES.ACTIVE_USERS) { // 22
      let tempRet = [];
      onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.ACTIVE_USERS, null, null)?.forEach(it => {
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
        getTeamNameFromTeamId(formattedTeams, it.teamId),
        it.cnt,
      ]));
    } else if (
        metric === METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE ||
        metric === METRIC_TEAM_CHART_VALUES.HEAT_SUSCEPTIBILITY_SWEAT_RATE
    ) { // 23, 30
      let tempRet = [];
      onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.SWR_FLUID, null, null)?.forEach(it => {
        const index = tempRet?.findIndex(e => e.teamId === it.teamId);
        if ([`low`, `moderate`, `high`].includes(it.sweatRateCategory?.toLowerCase())) {
          if (index !== -1) {
            tempRet.splice(index, 1, {
              ...tempRet[index],
              [it.sweatRateCategory?.toLowerCase()]: (tempRet[index][it.sweatRateCategory?.toLowerCase()] ?? 0) + 1,
            });
          } else {
            tempRet.push({
              teamId: it.teamId,
              [it.sweatRateCategory?.toLowerCase()]: 1,
            })
          }
        }
      });
      ret = tempRet?.map(it => ([
        getTeamNameFromTeamId(formattedTeams, it.teamId),
        it[`low`],
        it[`moderate`],
        it[`high`],
      ]));
    } else if (metric === METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE) { // 24 only, 30
      let tempRet = [];
      onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.SWR_FLUID, null, null)?.forEach(it => {
        const index = tempRet?.findIndex(e => e.teamId === it.teamId);
        if (HEAT_LOW_MEDIUM_HIGH.includes(it.heatSusceptibility?.toLowerCase())) {
          if (index !== -1) {
            tempRet.splice(index, 1, {
              ...tempRet[index],
              [it.heatSusceptibility?.toLowerCase()]: (tempRet[index][it.heatSusceptibility?.toLowerCase()] ?? 0) + 1,
            });
          } else {
            tempRet.push({
              teamId: it.teamId,
              [it.heatSusceptibility?.toLowerCase()]: 1,
            })
          }
        }
      });
      ret = tempRet?.map(it => ([
        getTeamNameFromTeamId(formattedTeams, it.teamId),
        it[`low`],
        it[`medium`],
        it[`high`],
      ]));
    } else if (metric === METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_CBT_ZONES) { // 25
      ret = onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.TEMP_CATE_IN_CBT_ZONES, null, null)?.map(it => ([
        it.teamName ?? ``,
        it.lowCount ?? ``,
        it.mediumCount ?? ``,
        it.highCount,
        it.alertCount ?? ``,
        it.alertPercentage ?? ``,
        it.noAlertPercentage ?? ``,
      ]));
    } else if (metric === METRIC_TEAM_TABLE_VALUES.NO_USERS_UNACCLIMATED_ACCLIMATED) { // 26
      ret = onFilterData(organizationAnalytics, ANALYTICS_API_KEYS.FLUID_METRICS_BY_TEAM, null, null)?.map(it => ([
        it.teamName ?? ``,
        it.heatAcclimatized ?? ``,
        it.heatUnacclimatized ?? ``,
        it.previousIllness,
        it.noPreviousIllness ?? ``,
      ]));
    } else if (
        (
            metric === METRIC_USER_TABLE_VALUES.MAX_HEART_CBT ||
            metric === METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK
        ) && detailCbt
    ) { // detail table of highest CBT chart
      ret = maxCBTTileData?.list?.length > 0 ? maxCBTTileData.list[detailCbt.dayIndex][detailCbt.timeIndex]?.details || [] : [];
    }

    ret = ret ?? [];
    setPage(ret.length === 0 ? null : 1);

    // sort
    if (ret?.length > 0 && Boolean(sort) && sort?.length > 0) {
      // todo update function to accommodate multi-level sort
      ret = ret.sort((a, b) => {
        if ([null, undefined, ""].includes(a?.[sort[0].index])) return 1;
        if ([null, undefined, ""].includes(b?.[sort[0].index])) return -1;

        if (sort[0].type === `string`) {
          const v = a?.[sort[0].index]?.localeCompare(b?.[sort[0].index], undefined, {sensitivity: `accent`});
          if (sort[0].direction === `asc`) {
            return v;
          } else if (sort[0].direction === `desc`) {
            return v * -1;
          }
        } else if (sort[0].type === `number`) {
          const v = a?.[sort[0].index] - b?.[sort[0].index];
          if (sort[0].direction === `asc`) {
            return v;
          } else if (sort[0].direction === `desc`) {
            return v * -1;
          }
        } else if (sort[0].type === `date`) {
          const aGap = numMinutesBetweenWithNow(new Date(), new Date(a?.[sort[0].index]));
          const bGap = numMinutesBetweenWithNow(new Date(), new Date(b?.[sort[0].index]));
          const v = aGap - bGap;
          if (sort[0].direction === `asc`) {
            return v * -1;
          } else if (sort[0].direction === `desc`) {
            return v;
          }
        } else if (sort[0].type === `risk`) {
          const v = RISK_PRIORITIES[a?.[sort[0].index]?.toLowerCase()] - RISK_PRIORITIES[b?.[sort[0].index]?.toLowerCase()];
          if (sort[0].direction === `asc`) {
            return v;
          } else if (sort[0].direction === `desc`) {
            return v * -1;
          }
        } else if (sort[0].type === `alert`) {
          const v = alertPriorities(sort[0].direction)[a?.[sort[0].index]?.toLowerCase()] -
            alertPriorities(sort[0].direction)[b?.[sort[0].index]?.toLowerCase()];
          if (sort[0].direction === `asc`) {
            return v * -1;
          } else if (sort[0].direction === `desc`) {
            return v;
          }
        } else if (sort[0].type === `susceptibility`) {
          const v = HEAT_SUSCEPTIBILITY_PRIORITIES[a?.[sort[0].index]?.toLowerCase()] -
              HEAT_SUSCEPTIBILITY_PRIORITIES[b?.[sort[0].index]?.toLowerCase()];
          if (sort[0].direction === `asc`) {
            return v;
          } else if (sort[0].direction === `desc`) {
            return v * -1;
          }
        }

        return 0;
      });
    }

    if (headers?.length > 0) {
      setVisibleExport(ret?.length > 0);
    }

    return ret;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, metric, analytics, members, selectedTeams, pickedMembers, unitMetric, headers, sort, detailCbt]);

  const pageData = React.useMemo(() => {
    let ret = [];
    if (data?.length > 0) {
      let start = ((page ?? 1) - 1) * sizePerPage;
      ret = data.slice(start, start + sizePerPage);
    }

    while (ret?.length < 10) {
      ret.push(Array(headers.length).fill(``));
    }
    return ret;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, page, sizePerPage, headers]);

  const teamLabel = React.useMemo(() => {
    if (selectedTeams?.length > 0) {
      if (formattedTeams?.length > 1 && (selectedTeams?.length === formattedTeams?.length)) {
        return t("all teams");
      } else if (selectedTeams?.length > 1) {
        return t("n teams selected", {n: selectedTeams?.length});
      } else {
        return formattedTeams?.find(it => it.value?.toString() === selectedTeams[0]?.value?.toString())?.label;
      }
    } else {
      return t("select team");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeams, formattedTeams]);
  const userLabel = React.useMemo(() => {
    if (selectedMembers?.length > 0) {
      if (formattedMembers?.length > 1 && (selectedMembers?.length === formattedMembers?.length)) {
        return t("all users");
      } else if (selectedMembers?.length > 1) {
        return t("n users selected", {n: selectedMembers?.length});
      } else {
        return formattedMembers?.find(it => it.value?.toString() === selectedMembers?.[0]?.value?.toString())?.label;
      }
    } else {
      return t("select user");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMembers, formattedMembers, organization]);

  const handleExport = () => {
    if (visibleExport) {
      if ([`xlsx`, `csv`].includes(exportOption?.value)) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data, {
          origin: `A2`,
          skipHeader: true
        });
        XLSX.utils.sheet_add_aoa(ws, [headers]);
        const sheetLabel = metrics?.find(it => it.value === metric)?.label ?? `Sheet`;
        XLSX.utils.book_append_sheet(wb, ws, sheetLabel);
        XLSX.writeFile(wb, `kenzen-analytics-${sheetLabel}-${new Date().toLocaleString()}.${exportOption?.value}`, {
          bookType: exportOption.value,
        });
      }
    }
  };

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
    selectedMetric,
    selectedTeams,
    selectedMembers,
    analytics,
    organizationAnalytics,
    processQuery,
    formatRiskLevel,
    statsBy,
    setStatsBy,
    headers,
    sortOptions,
    data,
    visibleExport,
    exportOption,
    setExportOption,
    handleExport,
    page,
    setPage,
    sizePerPage,
    setSizePerPage,
    pageData,
    chartData,
    users,
    setUsers,
    selectedUsers,
    detailCbt,
    setDetailCbt,
    timeZone,
    maxCBTTileData,
    teamLabel,
    userLabel,
    chartRef,
    setLoading,
    isEnablePrint,
    setIsEnablePrint,
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
