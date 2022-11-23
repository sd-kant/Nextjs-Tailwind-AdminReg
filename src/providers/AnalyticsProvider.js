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
  queryAmbientTempHumidity,
  queryOrganizationUsersInCBTZones,
  queryOrganizationAlertedUserCount,
  queryOrganizationFluidMetricsByTeam,
  queryOrganizationDeviceData,
  queryOrganizationTempCateData,
  queryOrganizationCategoriesUsersInCBTZones,
  getTeamMemberAlerts,
} from "../http";
import {
  celsiusToFahrenheit,
  dateFormat,
  numMinutesBetweenWithNow, timeOnOtherZone,
} from "../utils";
import {
  onCalc,
  getThisWeek,
  getUTCDateList,
  getListPerLabel,
  getUserNameFromUserId,
  getTeamNameFromUserId,
  getTeamNameFromTeamId,
  getTimeSpentFromUserId,
  onFilterData,
  onFilterDataByOrganization,
} from "../utils/anlytics";
import {
  COLOR_WHITE,
  COLORS,
  HEAT_LOW_MEDIUM_HIGH,
  LABELS_DOUGHNUT,
  METRIC_TABLE_TEAM_VALUES,
  METRIC_TABLE_USER_VALUES,
  METRIC_CHART_USER_VALUES,
  METRIC_CHART_TEAM_VALUES,
  DAY_LIST,
  HIGHEST_CHART_CELSIUS_MIN,
  HIGHEST_CHART_CELSIUS_MAX,
  ONE_DAY,
} from "../constant";
import {useBasicContext} from "./BasicProvider";
import {
  formatHeartRate,
  heatSusceptibilityPriorities,
  literToQuart
} from "../utils/dashboard";
import {useUtilsContext} from "./UtilsProvider";
import {useTranslation} from "react-i18next";
import soft from "timezone-soft";

const AnalyticsContext = React.createContext(null);

export const AnalyticsProvider = (
    {
      children,
      setLoading,
      metric: unitMetric,
    }) => {
  const {t} = useTranslation();
  const {formatAlert, formatHeartCbt, alertPriorities} = useUtilsContext();
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
  const [showBy, setShowBy] = React.useState('table');
  const [users, setUsers] = React.useState([]);
  const [detailCbt, setDetailCbt] = React.useState(null); // {dayIndex: 4, timeIndex: 5}

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

  const riskPriorities = {
    "low": 1,
    "medium": 2,
    "high": 3,
    "extreme": 4,
  }
  const selectedTeams = React.useMemo(() => {
    return formattedTeams?.filter(it => pickedTeams.some(ele => ele.toString() === it.value?.toString()))
  }, [pickedTeams, formattedTeams]);

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
        label: t('wear time'),
        value: METRIC_TABLE_USER_VALUES[0], // 1
      },
      {
        label: t('alerts'),
        value: METRIC_TABLE_USER_VALUES[1], // 2
      },
      {
        label: t('max heart cbt'),
        value: METRIC_TABLE_USER_VALUES[2], // 3
      },
      {
        label: t('swr & acclim'),
        value: METRIC_TABLE_USER_VALUES[4], // 5
      },
      {
        label: t('time spent in cbt zones'),
        value: METRIC_TABLE_USER_VALUES[5], // 6
      },
      {
        label: t('device data'),
        value: METRIC_TABLE_USER_VALUES[6], // 7
      },
      {
        label: t('users in various cbt zones'),
        value: METRIC_TABLE_USER_VALUES[7], // 8
      }
    ];
    const teamStatsMetrics = [
      {
        label: t('ambient temp/humidity'),
        value: METRIC_TABLE_TEAM_VALUES[0], // 20
      },
      {
        label: t('% of workers with alerts'),
        value: METRIC_TABLE_TEAM_VALUES[1], // 21
      },
      {
        label: t('active users'),
        value: METRIC_TABLE_TEAM_VALUES[2], // 22
      },
      {
        label: t('no. of users in swr categories'),
        value: METRIC_TABLE_TEAM_VALUES[3], // 23
      },
      {
        label: t('no. of users in heat susceptibility categories'),
        value: METRIC_TABLE_TEAM_VALUES[4], // 24
      },
      {
        label: t('no. of users in cbt zones'),
        value: METRIC_TABLE_TEAM_VALUES[5], // 25
      },
      {
        label: t('no. of users unacclimated, acclimated and persis previous illness'),
        value: METRIC_TABLE_TEAM_VALUES[6], // 26
      },
    ];
    const chartTeamMetrics = [
      {
        label: t('heat susceptibility and sweat rate'),
        value: METRIC_CHART_TEAM_VALUES[0], // 30
      },
      {
        label: t('number of alerts by week'),
        value: METRIC_CHART_TEAM_VALUES[1], // 31
      },
      {
        label: t('highest cbt by time of day and day of week'),
        value: METRIC_CHART_TEAM_VALUES[2], // 32
      },
    ];
    const chartUserMetrics = [
      {
        label: t('cbt'),
        value: METRIC_CHART_USER_VALUES[0], // 40
      },
      {
        label: t('hr'),
        value: METRIC_CHART_USER_VALUES[1], // 41
      },
    ];
    if (showBy === 'table') {
      return statsBy === 'user' ? userStatsMetrics : teamStatsMetrics;
    } else {
      return statsBy === 'user' ? chartUserMetrics : chartTeamMetrics;
    }
  }, [statsBy, showBy, t]);
  const [metric, setMetric] = React.useState(null);
  const [sort, setSort] = React.useState([]);
  React.useEffect(() => {
    setSort(null);
  }, [metric]);
  const sortTitles = [
    t('a - z'),
    t('z - a'),
    t('min to max'),
    t('max to min'),
    t('most recent'),
    t('oldest'),
    t('risk to safe'),
    t('safe to risk'),
    t('extreme to low'),
    t('low to extreme'),
    t('high to low'),
    t('low to high'),
  ];

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
  }
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
      case METRIC_TABLE_USER_VALUES[0]: // 1
        ret = [
          makeSort('Sort', [[sortTitles[0], [[0, 'asc', 'string']]], [sortTitles[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[0], [[1, 'asc', 'string']]], [sortTitles[1], [[1, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[2], [[2, 'asc', 'number']]], [sortTitles[3], [[2, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[3, 'asc', 'number']]], [sortTitles[3], [[3, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_TABLE_USER_VALUES[1]: // 2
        ret = [
          makeSort('Sort', [[sortTitles[0], [[0, 'asc', 'string']]], [sortTitles[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[0], [[1, 'asc', 'string']]], [sortTitles[1], [[1, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[4], [[2, 'desc', 'date']]], [sortTitles[5], [[2, 'asc', 'date']]]]),
          makeSort('Sort', [[sortTitles[6], [[3, 'desc', 'alert']]], [sortTitles[7], [[3, 'asc', 'alert']]]]),
          makeSort('Sort', [[sortTitles[8], [[4, 'desc', 'risk']]], [sortTitles[9], [[4, 'asc', 'risk']]]]),
          makeSort('Sort', [[sortTitles[2], [[5, 'asc', 'number']]], [sortTitles[3], [[5, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[6, 'asc', 'number']]], [sortTitles[3], [[6, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[7, 'asc', 'number']]], [sortTitles[3], [[7, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[8, 'asc', 'number']]], [sortTitles[3], [[8, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_TABLE_USER_VALUES[2]: // 3
      case METRIC_CHART_TEAM_VALUES[2]: // 32
        ret = [
          makeSort('Sort', [[sortTitles[0], [[0, 'asc', 'string']]], [sortTitles[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[0], [[1, 'asc', 'string']]], [sortTitles[1], [[1, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[4], [[2, 'asc', 'date']]], [sortTitles[5], [[2, 'desc', 'date']]]]),
          makeSort('Sort', [[sortTitles[2], [[3, 'asc', 'number']]], [sortTitles[3], [[3, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_TABLE_USER_VALUES[4]: // 5
        ret = [
          makeSort('Sort', [[sortTitles[0], [[0, 'asc', 'string']]], [sortTitles[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[0], [[1, 'asc', 'string']]], [sortTitles[1], [[1, 'desc', 'string']]]]),
          null,
          makeSort('Sort', [[sortTitles[2], [[3, 'asc', 'number']]], [sortTitles[3], [[3, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[4, 'asc', 'number']]], [sortTitles[3], [[4, 'desc', 'number']]]]),
          null,
          null,
          makeSort('Sort', [[sortTitles[10], [[7, 'asc', 'susceptibility']]], [sortTitles[11], [[7, 'desc', 'susceptibility']]]]),
        ];
        break;
      case METRIC_TABLE_USER_VALUES[5]: // 6
        ret = [
          makeSort('Sort', [[sortTitles[0], [[0, 'asc', 'number']]], [sortTitles[1], [[0, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[0], [[1, 'asc', 'string']]], [sortTitles[1], [[1, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[2], [[2, 'asc', 'number']]], [sortTitles[3], [[2, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[3, 'asc', 'number']]], [sortTitles[3], [[3, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[4, 'asc', 'number']]], [sortTitles[3], [[4, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_TABLE_USER_VALUES[6]: // 7
        ret = [
          makeSort('Sort', [[sortTitles[0], [[0, 'asc', 'string']]], [sortTitles[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[0], [[1, 'asc', 'string']]], [sortTitles[1], [[1, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[2], [[2, 'asc', 'string']]], [sortTitles[3], [[2, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[0], [[3, 'asc', 'string']]], [sortTitles[1], [[3, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[0], [[4, 'asc', 'string']]], [sortTitles[1], [[4, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[4], [[5, 'asc', 'date']]], [sortTitles[5], [[5, 'desc', 'date']]]]),
        ];
        break;
      case METRIC_TABLE_USER_VALUES[7]: // 8
        ret = [
          null,
          makeSort('Sort', [[sortTitles[2], [[1, 'asc', 'number']]], [sortTitles[3], [[1, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_TABLE_TEAM_VALUES[0]: // 20
      case METRIC_TABLE_TEAM_VALUES[5]: // 25
        ret = [
          makeSort('Sort', [[sortTitles[0], [[0, 'asc', 'string']]], [sortTitles[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[2], [[1, 'asc', 'number']]], [sortTitles[3], [[1, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[2, 'asc', 'number']]], [sortTitles[3], [[2, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[3, 'asc', 'number']]], [sortTitles[3], [[3, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[4, 'asc', 'number']]], [sortTitles[3], [[4, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[5, 'asc', 'number']]], [sortTitles[3], [[5, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[6, 'asc', 'number']]], [sortTitles[3], [[6, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_TABLE_TEAM_VALUES[1]: // 21
      case METRIC_TABLE_TEAM_VALUES[6]: // 26
        ret = [
          makeSort('Sort', [[sortTitles[0], [[0, 'asc', 'string']]], [sortTitles[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[2], [[1, 'asc', 'number']]], [sortTitles[3], [[1, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[2, 'asc', 'number']]], [sortTitles[3], [[2, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[3, 'asc', 'number']]], [sortTitles[3], [[3, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[4, 'asc', 'number']]], [sortTitles[3], [[4, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_TABLE_TEAM_VALUES[2]: // 22
        ret = [
          makeSort('Sort', [[sortTitles[0], [[0, 'asc', 'string']]], [sortTitles[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[2], [[1, 'asc', 'number']]], [sortTitles[3], [[1, 'desc', 'number']]]]),
        ];
        break;
      case METRIC_TABLE_TEAM_VALUES[3]: // 23
      case METRIC_TABLE_TEAM_VALUES[4]: // 24
        ret = [
          makeSort('Sort', [[sortTitles[0], [[0, 'asc', 'string']]], [sortTitles[1], [[0, 'desc', 'string']]]]),
          makeSort('Sort', [[sortTitles[2], [[1, 'asc', 'number']]], [sortTitles[3], [[1, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[2, 'asc', 'number']]], [sortTitles[3], [[2, 'desc', 'number']]]]),
          makeSort('Sort', [[sortTitles[2], [[3, 'asc', 'number']]], [sortTitles[3], [[3, 'desc', 'number']]]]),
        ];
        break;
    }

    return ret;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metric, sort]);
  const headers = React.useMemo(() => {
    let ret = [t('name'), t('team')];
    switch (metric) {
      case METRIC_TABLE_USER_VALUES[0]: // 1
        ret = [t('name'), t('team'), t('avg wear time'), t('total wear time')];
        break;
      case METRIC_TABLE_USER_VALUES[1]: // 2
        ret = [t('name'), t('team'), t('alert time'), t('alert'), t('heat risk'), t('cbt'), t('temp'), t('humidity'), t('heart rate avg')];
        break;
      case METRIC_TABLE_USER_VALUES[2]: // 3
      case METRIC_CHART_TEAM_VALUES[2]: // 32
        ret = [t('name'), t('team'), t('date'), t('max cbt')];
        break;
      case METRIC_TABLE_USER_VALUES[3]: // 4
        // ret = [t('name'), t('team')];
        break;
      case METRIC_TABLE_USER_VALUES[4]: // 5
        ret = [t('name'), t('team'), t('swr category'), unitMetric ? 'SWR (l/h)' : 'SWR (qt/h)', unitMetric ? t("fluid recmdt n", {n: t('(l/h)')}) : t("fluid recmdt n", {n: t('(qt/h)')}), t('previous illness'), t('acclim status'), t('heat sus')];
        break;
      case METRIC_TABLE_USER_VALUES[5]: // 6
        ret = [t('name'), t('team'), t('time spent in safe to work'), t('time spent in mild heat exhaustion'), t('time spent in moderate hyperthermia')];
        break;
      case METRIC_TABLE_USER_VALUES[6]: // 7
        ret = [t('name'), t('team'), t('firmware version'), t('app version'), t('platform'), t('date')];
        break;
      case METRIC_TABLE_USER_VALUES[7]: // 8
        ret = [t('temperature categories'), t('user %')];
        break;
      case METRIC_TABLE_TEAM_VALUES[0]: // 20
        ret = [t('team'), t('max temp'), t('min temp'), t('avg temp'), t('max rh'), t('min rh'), t('avg rh')];
        break;
      case METRIC_TABLE_TEAM_VALUES[1]: // 21
        ret = [t('team'), t('% of team with alerts'), t('% of team without alerts'), t('no. of people with alerts'), t('no. of people without alerts')];
        break;
      case METRIC_TABLE_TEAM_VALUES[2]: // 22
        ret = [t('team'), t('active users')];
        break;
      case METRIC_TABLE_TEAM_VALUES[3]: // 23
        ret = [t('team'), t("n swr", {n: t('upper low')}), t("n swr", {n: t('moderate')}), t("n swr", {n: t('high')})];
        break;
      case METRIC_TABLE_TEAM_VALUES[4]: // 24
        ret = [t('team'), t("n risk", {n: t('upper low')}), t("n risk", {n: t('medium')}), t("n risk", {n: t('high')})];
        break;
      case METRIC_TABLE_TEAM_VALUES[5]: // 25
        ret = [t('team'), unitMetric ? '<38' : '<100.4', unitMetric ? '38-38.5' : '100.4-101.3', unitMetric ? '>38.5' : '>101.3', t('total alerts'), t('% of team with alerts'), t('% of team without alerts')];
        break;
      case METRIC_TABLE_TEAM_VALUES[6]: // 26
        ret = [t('team'), t('heat acclimatized users'), t('heat unacclimatized users'), t('previous illness'), t('no previous illness')];
        break;

      default:
        console.log('metric not registered');
    }

    return ret;
  }, [metric, unitMetric, t]);
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
          case METRIC_TABLE_USER_VALUES[0]: // 1, wear time
            apiCall = queryOrganizationWearTime;
            key = 'wearTime';
            break;
          case METRIC_TABLE_USER_VALUES[1]: // 2, alerts
          case METRIC_CHART_TEAM_VALUES[1]: // 31
            apiCall = queryOrganizationAlertMetrics;
            key = 'alertMetrics';
            break;
          case METRIC_TABLE_USER_VALUES[2]: // 3
            apiCall = queryOrganizationMaxCbt;
            key = 'maxCbt';
            break;
          case METRIC_TABLE_USER_VALUES[5]: // 6
            apiCall = queryOrganizationTempCateData;
            key = 'tempCateData';
            break;
          case METRIC_TABLE_USER_VALUES[6]: // 7
            apiCall = queryOrganizationDeviceData;
            key = 'deviceData';
            break;
          case METRIC_TABLE_USER_VALUES[7]: // 8
            apiCall = queryOrganizationUsersInCBTZones;
            key = 'usersInCBTZones';
            break;
          case METRIC_TABLE_TEAM_VALUES[0]: // 20
            apiCall = queryAmbientTempHumidity;
            key = 'tempHumidity';
            break;
          case METRIC_TABLE_USER_VALUES[4]: // 5
          case METRIC_TABLE_TEAM_VALUES[3]: // 23
          case METRIC_TABLE_TEAM_VALUES[4]: // 24
          case METRIC_CHART_TEAM_VALUES[0]: // 30
            apiCall = queryOrganizationSWRFluid;
            key = 'swrFluid';
            break;
          case METRIC_TABLE_TEAM_VALUES[1]: // 21
            apiCall = queryOrganizationAlertedUserCount;
            key = 'alertedUserCount';
            break;
          case METRIC_TABLE_TEAM_VALUES[2]: // 22
            apiCall = queryOrganizationActiveUsers;
            key = 'activeUsers';
            break;
          case METRIC_TABLE_TEAM_VALUES[5]: // 25
            apiCall = queryOrganizationCategoriesUsersInCBTZones;
            key = 'tempCateInCBTZones';
            break;
          case METRIC_TABLE_TEAM_VALUES[6]: // 26
            apiCall = queryOrganizationFluidMetricsByTeam;
            key = 'fluidMetricsByTeam';
            break;
          case METRIC_CHART_TEAM_VALUES[2]: // 32
            apiCall = queryOrganizationMaxCbt;
            key = 'chartCbt';
            break;
          case METRIC_CHART_USER_VALUES[0]: // 40
          case METRIC_CHART_USER_VALUES[1]: // 41
            apiCall = getTeamMemberAlerts;
            key = 'teamMemberAlerts';
            break;
          default:
            console.log("metric is not available");
        }

        if (apiCall && key) {
          let focusAnalytics = onFilterDataByOrganization(analytics, organization);
          if (!METRIC_CHART_USER_VALUES.includes(metric)) {
            setLoading(true);
            apiCall(organization, {
              teamIds: pickedTeams,
              startDate: dateFormat(new Date(startDate)),
              endDate: dateFormat(new Date(endDate)),
            })
                .then(response => {
                  setAnalytics({
                    ...analytics,
                    [organization]: {
                      ...focusAnalytics,
                      [key]: response.data
                    },
                  });
                })
                .finally(() => {
                  setLoading(false);
                });
          } else {
            let userFilter = members.filter(it => !!users.includes(it.userId));

            const userPromises = [];
            if (userFilter?.length > 0) {
              userFilter.forEach(user => {
                userPromises.push(apiCall({
                  teamId: user.teamId,
                  userId: user.userId,
                  since: new Date(startDate).toISOString()
                }));
              });
              setLoading(true);
              let list = [];
              const a = () => new Promise(resolve => {
                Promise.allSettled(userPromises)
                    .then(response => {
                      response?.forEach((result) => {
                        if (result.status === "fulfilled") {
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
                          ...focusAnalytics,
                          [key]: list
                        },
                      });
                      setLoading(false);
                      resolve();
                    });
              });
              Promise.allSettled([a()]).then();
            }
          }
        }
      }
    }
  };

  const formatRiskLevel = id => {
    return riskLevels?.find(it => it.id?.toString() === id?.toString())?.name;
  };

  const selectedMembers = React.useMemo(() => {
    let formattedMembersTemp = formattedMembers.filter(it => members.some(ele => ele.userId?.toString() === it.value?.toString() && ele.orgId?.toString() === organization?.toString()));
    return formattedMembersTemp?.filter(it => pickedMembers.some(ele => ele.toString() === it.value?.toString()))
  }, [pickedMembers, formattedMembers, members, organization]);

  const selectedMetric = React.useMemo(() => {
    return metrics?.find(it => it.value?.toString() === metric?.toString())
  }, [metric, metrics]);

  const selectedUsers = React.useMemo(() => {
    return selectedMembers?.filter(it => users.some(ele => ele?.toString() === it.value?.toString()))
  }, [selectedMembers, users]);

  const timeZone = React.useMemo(() => {
    const a = (selectedTeams?.length === 1 && selectedTeams[0]?.region) ? soft(selectedTeams?.length === 1 && selectedTeams[0]?.region)[0] : null;
    if (a) {
      return {
        name: a?.iana,
        valid: true,
        displayName: a.standard?.abbr,
      };
    } else {
      return {
        name: null,
        valid: false,
        displayName: null,
      };
    }
  }, [selectedTeams]);

  React.useEffect(() => {
    setDetailCbt(null)
  }, [showBy, statsBy, selectedMembers, selectedMetric, selectedTeams]);

  const chartData = React.useMemo(() => {
    let focusAnalytics = selectedTeams?.length > 0 ? onFilterDataByOrganization(analytics, organization) : {};

    if (metric === METRIC_CHART_TEAM_VALUES[0]) { // 30
      let tempRet = [0, 0, 0, 0, 0, 0];
      let totalHeat = 0, totalSweat = 0;

      focusAnalytics?.swrFluid?.forEach(it => {
        let findHeatIndex = HEAT_LOW_MEDIUM_HIGH.findIndex(a => a === it.heatSusceptibility?.toLowerCase());
        let findSweatIndex = HEAT_LOW_MEDIUM_HIGH.findIndex(a => a === it.sweatRateCategory?.toLowerCase());

        if (findHeatIndex > -1) {
          tempRet[findHeatIndex] += 1;
          totalHeat += 1;
        }
        if (findSweatIndex > -1) {
          tempRet[findSweatIndex + 3] += 1;
          totalSweat += 1;
        }
      });

      const dataHeat = {
        type: 'doughnut',
        labels: LABELS_DOUGHNUT,
        datasets: [
          {
            label: '# of Heat',
            data: [
              onCalc(0, tempRet, totalSweat, totalHeat),
              onCalc(1, tempRet, totalSweat, totalHeat),
              onCalc(2, tempRet, totalSweat, totalHeat)
            ],
            backgroundColor: COLORS,
            borderColor: [
              COLOR_WHITE,
              COLOR_WHITE,
              COLOR_WHITE
            ],
          },
        ],
      };

      const dataSweat = {
        type: 'doughnut',
        labels: LABELS_DOUGHNUT,
        datasets: [
          {
            label: '# of Sweat',
            data: [
              onCalc(3, tempRet, totalSweat, totalHeat),
              onCalc(4, tempRet, totalSweat, totalHeat),
              onCalc(5, tempRet, totalSweat, totalHeat)
            ],
            backgroundColor: COLORS,
            borderColor: [
              COLOR_WHITE,
              COLOR_WHITE,
              COLOR_WHITE
            ],
          },
        ],
      };

      return {
        dataHeat: dataHeat,
        dataSweat: dataSweat
      };
    } else if (metric === METRIC_CHART_TEAM_VALUES[1]) { // 31
      let thisWeek = getThisWeek(timeZone);

      let thisData = (focusAnalytics?.alertMetrics || [])?.map(it => ({
        userId: it?.userId,
        risklevelId: it?.risklevelId,
        alertStageId: it?.alertStageId,
        heartCbtAvg: it?.heartCbtAvg,
        heartRateAvg: it?.heartRateAvg,
        humidity: it?.humidity,
        temperature: it?.temperature,
        ts: timeOnOtherZone(it?.ts, timeZone),
      }))?.filter(a =>
          new Date(a.ts).getTime() >= new Date(thisWeek.firstDate).getTime() &&
          new Date(a.ts).getTime() < new Date(thisWeek.endDate).getTime() + ONE_DAY
      );

      let arrayPerDate = [
        getListPerLabel(thisData, [1], thisWeek), // At Risk id
        getListPerLabel(thisData, [2], thisWeek), // Elevated Risk id
        getListPerLabel(thisData, [3, 4], thisWeek), // Safe ids
      ];
      const xLabel = getUTCDateList(thisWeek?.firstDate);
      let dataSet = [];
      COLORS.forEach((item, key) => {
        dataSet.push({
          label: formatAlert(key + 1).label,
          data: xLabel?.map((it, index) => arrayPerDate[key][index]),
          backgroundColor: COLORS[key],
        });
      });

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
    } else if (metric === METRIC_CHART_TEAM_VALUES[2]) { // 32
      const day1 = DAY_LIST.slice(0, new Date(endDate).getDay() + 1);
      const day2 = DAY_LIST.slice(new Date(endDate).getDay() + 1,);

      let list = [];
      let focusDate = new Date(endDate);
      let dataCbt = focusAnalytics.chartCbt?.map(it => ({
        maxCbt: it?.maxCbt,
        userId: it?.userId,
        utcTs: timeOnOtherZone(it?.utcTs, timeZone),
      }));

      for (let i = 0; i < 7; i++) {
        let subList = [];
        let filterDataByDate = dataCbt?.filter(it =>
            selectedMembers?.findIndex(a => a?.value === it?.userId) > -1 &&
            new Date(it?.utcTs).getTime() >= new Date(focusDate).getTime() &&
            new Date(it?.utcTs).getTime() < new Date(focusDate).getTime() + ONE_DAY
        );

        for (let j = 0; j < 24; j++) {
          let filterDataByTime = filterDataByDate?.filter(it =>
              new Date(it?.utcTs).getHours() === j
          ).sort((a, b) => {
            return a?.maxCbt > b?.maxCbt ? -1 : 1;
          }).map(it => ([
            getUserNameFromUserId(members, it.userId),
            getTeamNameFromUserId(members, formattedTeams, it.userId),
            it.utcTs ? it.utcTs : ``,
            it?.maxCbt ? celsiusToFahrenheit(it?.maxCbt) : ``,
          ]));
          let tempCbt = filterDataByTime?.length > 0 ? filterDataByTime[0][3] : 0;
          tempCbt = Math.min(Math.max(tempCbt, HIGHEST_CHART_CELSIUS_MIN), HIGHEST_CHART_CELSIUS_MAX);
          tempCbt = ((HIGHEST_CHART_CELSIUS_MAX - tempCbt) * 255) / (HIGHEST_CHART_CELSIUS_MAX - HIGHEST_CHART_CELSIUS_MIN);
          subList.push(
              filterDataByTime?.length > 0 ? {
                    maxCbt: tempCbt.toFixed(2),
                    details: filterDataByTime
                  }
                  :
                  null
          );
        }

        list.push(subList);
        focusDate.setDate(new Date(focusDate).getDate() - 1);
      }

      return {
        list: list,
        dayList: day2.concat(day1).reverse(),
      };
    } else if (METRIC_CHART_USER_VALUES.includes(metric)) { // 40, 41
      return (focusAnalytics?.teamMemberAlerts || []).map(it => ({
        userId: it?.userId,
        teamId: it?.teamId,
        alertCounter: it?.alertCounter,
        alertResponseId: it?.alertResponseId,
        alertStageId: it?.alertStageId,
        gmt: it?.gmt,
        heartCbtAvg: it?.heartCbtAvg,
        heartRateAvg: it?.heartRateAvg,
        ts: timeOnOtherZone(it?.ts, timeZone),
      }));
    } else {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analytics, metric, formatAlert, organization, selectedTeams, selectedMembers, timeZone]);

  const data = React.useMemo(() => {
    let ret = [], focusAnalytics = selectedTeams?.length > 0 ? onFilterDataByOrganization(analytics, organization) : {};

    if (metric === METRIC_TABLE_USER_VALUES[0]) { // 1, wear time
      ret = onFilterData(focusAnalytics?.wearTime, pickedMembers, members)?.map(it => ([
        getUserNameFromUserId(members, it.userId),
        getTeamNameFromUserId(members, formattedTeams, it.userId),
        it.avgWearTime ?? ``,
        it.wearTime ?? ``,
      ]))
    } else if (metric === METRIC_TABLE_USER_VALUES[1]) { // 2, alert metrics
      ret = onFilterData(focusAnalytics?.alertMetrics, pickedMembers, members)?.map(it => ([
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
    } else if (metric === METRIC_TABLE_USER_VALUES[2]) { // 3
      ret = onFilterData(focusAnalytics?.maxCbt, pickedMembers, members)?.map(it => ([
        getUserNameFromUserId(members, it.userId),
        getTeamNameFromUserId(members, formattedTeams, it.userId),
        it.utcTs ? new Date(it.utcTs)?.toLocaleString() : ``,
        it.maxCbt ? formatHeartCbt(it.maxCbt) : ``,
      ]));
    } else if (metric === METRIC_TABLE_USER_VALUES[4]) { // 5
      ret = onFilterData(focusAnalytics?.swrFluid, pickedMembers, members)?.map(it => ([
        getUserNameFromUserId(members, it.userId),
        getTeamNameFromUserId(members, formattedTeams, it.userId),
        it.sweatRateCategory ?? ``,
        unitMetric ? it.sweatRate ?? `` : literToQuart(it.sweatRate) ?? ``,
        unitMetric ? it.fluidRecommendationL ?? `` : literToQuart(it.fluidRecommendationL) ?? ``,
        it.previousIllness ?? ``,
        it.acclimatizationStatus ?? ``,
        it.heatSusceptibility ?? ``,
      ]));
    } else if (metric === METRIC_TABLE_USER_VALUES[5]) { // 6
      ret = onFilterData(focusAnalytics?.tempCateData, pickedMembers, members)?.map(it => ([
        getUserNameFromUserId(members, it.userId),
        getTeamNameFromUserId(members, formattedTeams, it.userId),
        getTimeSpentFromUserId(it?.temperatureCategoryCounts, `Safe to Work 38C`),
        getTimeSpentFromUserId(it?.temperatureCategoryCounts, `Mild Heat Exhaustion 38C – 38.49C`),
        getTimeSpentFromUserId(it?.temperatureCategoryCounts, `Moderate Hyperthermia > 38.5C`),
      ]));
    } else if (metric === METRIC_TABLE_USER_VALUES[6]) { // 7
      ret = onFilterData(focusAnalytics?.deviceData, pickedMembers, members)?.map(it => ([
        it.fullname ?? ``,
        getTeamNameFromTeamId(formattedTeams, it.teamId),
        it.firmwareVersion ?? ``,
        it.version ?? ``,
        it.type,
        it.ts ?? ``,
      ]));
    } else if (metric === METRIC_TABLE_USER_VALUES[7]) { // 8
      ret = focusAnalytics?.usersInCBTZones?.map(it => ([
        it.temperatureCategory,
        it.percentage,
      ]));
    } else if (metric === METRIC_TABLE_TEAM_VALUES[0]) { // 20
      ret = focusAnalytics?.tempHumidity?.map(it => ([
        it.teamName ?? ``,
        it.maxTemp ? formatHeartCbt(it.maxTemp) : ``,
        it.minTemp ? formatHeartCbt(it.minTemp) : ``,
        it.avgTemp ? formatHeartCbt(it.avgTemp) : ``,
        it.maxHumidity ?? ``,
        it.minHumidity ?? ``,
        it.avgHumidity ?? ``,
      ]));
    } else if (metric === METRIC_TABLE_TEAM_VALUES[1]) { // 21
      ret = focusAnalytics?.alertedUserCount?.map(it => ([
        it.teamName ?? ``,
        it.alertPercentage ?? ``,
        it.noAlertPercentage ?? ``,
        it.usersWithAlerts,
        it.activeUsers - it.usersWithAlerts,
      ]))
    } else if (metric === METRIC_TABLE_TEAM_VALUES[2]) { // 22
      let tempRet = [];
      focusAnalytics?.activeUsers?.forEach(it => {
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
    } else if (metric === METRIC_TABLE_TEAM_VALUES[3]) { // 23
      let tempRet = [];
      focusAnalytics?.swrFluid?.forEach(it => {
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
    } else if (metric === METRIC_TABLE_TEAM_VALUES[4]) { // 24
      let tempRet = [];
      focusAnalytics?.swrFluid?.forEach(it => {
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
    } else if (metric === METRIC_TABLE_TEAM_VALUES[5]) { // 25
      ret = focusAnalytics?.tempCateInCBTZones?.map(it => ([
        it.teamName ?? ``,
        it.lowCount ?? ``,
        it.mediumCount ?? ``,
        it.highCount,
        it.alertCount ?? ``,
        it.alertPercentage ?? ``,
        it.noAlertPercentage ?? ``,
      ]));
    } else if (metric === METRIC_TABLE_TEAM_VALUES[6]) { // 26
      ret = focusAnalytics?.fluidMetricsByTeam?.map(it => ([
        it.teamName ?? ``,
        it.heatAcclimatized ?? ``,
        it.heatUnacclimatized ?? ``,
        it.previousIllness,
        it.noPreviousIllness ?? ``,
      ]));
    } else if (
        showBy === `chart` &&
        statsBy === `team` &&
        detailCbt &&
        metric === METRIC_CHART_TEAM_VALUES[2]
    ) { // detail table of highest CBT chart, 30, 31, 32
      ret = chartData?.list?.length > 0 ? chartData.list[detailCbt.dayIndex][detailCbt.timeIndex]?.details || [] : [];
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
          const v = riskPriorities[a?.[sort[0].index]?.toLowerCase()] - riskPriorities[b?.[sort[0].index]?.toLowerCase()];
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
          const v = heatSusceptibilityPriorities[a?.[sort[0].index]?.toLowerCase()] -
              heatSusceptibilityPriorities[b?.[sort[0].index]?.toLowerCase()];
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
    processQuery,
    formatRiskLevel,
    statsBy,
    setStatsBy,
    headers,
    sortOptions,
    data,
    visibleExport,
    exportOptions,
    exportOption,
    setExportOption,
    handleExport,
    page,
    setPage,
    sizePerPage,
    setSizePerPage,
    pageData,
    chartData,
    showBy,
    setShowBy,
    users,
    setUsers,
    selectedUsers,
    detailCbt,
    setDetailCbt,
    timeZone,
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
