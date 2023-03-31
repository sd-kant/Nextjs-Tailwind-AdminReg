import {
  ANALYTICS_API_KEYS,
  COLOR_WHITE,
  METRIC_TEAM_CHART_VALUES,
  METRIC_TEAM_TABLE_VALUES,
  METRIC_USER_CHART_VALUES,
  METRIC_USER_TABLE_VALUES
} from "../constant";
import spacetime from "spacetime";
import {
  getTeamMemberAlerts,
  queryAmbientTempHumidity,
  queryOrganizationActiveUsers,
  queryOrganizationAlertedUserCount,
  queryOrganizationAlertMetrics,
  queryOrganizationCategoriesUsersInCBTZones,
  queryOrganizationDeviceData,
  queryOrganizationFluidMetricsByTeam,
  queryOrganizationMaxCbt,
  queryOrganizationSWRFluid,
  queryOrganizationTempCateData,
  queryOrganizationUsersInCBTZones,
  queryOrganizationWearTime
} from "../http";
import i18n from "../i18nextInit";

export const getUserNameFromUserId = (members, id) => {
  const user = members?.find(it => it.userId?.toString() === id?.toString());
  return user ? `${user?.firstName} ${user?.lastName}` : ``;
};

export const getTeamNameFromUserId = (members, formattedTeams, userId) => {
  const user = members?.find(it => it.userId?.toString() === userId?.toString());
  if (user?.teamId) {
    const team = formattedTeams?.find(it => it.value?.toString() === user.teamId?.toString());
    return team ? team.label : ``;
  }
  return user ? `${user?.firstName} ${user?.lastName}` : ``;
};

export const getTeamNameFromTeamId = (formattedTeams, teamId) => {
  return formattedTeams?.find(it => it.value?.toString() === teamId?.toString())?.label;
};

export const getTimeSpentFromUserId = (data, str) => {
  let findIndex = data.findIndex(a => a.temperatureCategory === str);
  if (findIndex > -1) {
    return Math.round((data[findIndex]?.count ?? 0) * 100 / 240) / 100;
  } else {
    return 0;
  }
};

export const onCalc = (key, tempRet, total) => {
  if (key !== 2 && key !== 5)
    return Math.floor(tempRet[key] * 1000 / (total ?? 1)) / 10;
  else {
    return (1000 - Math.floor((tempRet[key === 2 ? 0 : 3] + tempRet[key === 2 ? 1 : 4]) * 1000 / (total ?? 1))) / 10;
  }
};

export const getDateList = (startD, endD) => {
  if (!startD || !endD) return '';
  let startDate = startD;
  let dates = [];
  while (startDate.isBefore(endD)) {
    dates.push(startDate.unixFmt(`yyyy-MM-dd`));
    startDate = startDate.add(1, 'day');
  }
  return dates;
};

export const getListPerLabel = (
  {
    list,
    timezone,
    stageIds,
    startD,
    endD,
  }) => {
  let temp = list?.filter(a => stageIds.includes(a.alertStageId));
  let array = [];
  let startDate = startD;
  while (startDate.isBefore(endD)) {
    let endDate = startDate.add(1, 'day');
    let filterList = temp?.filter(it => {
      return spacetime(it.ts, timezone.name).isBefore(endDate) && spacetime(it.ts, timezone.name).isAfter(startDate);
    });
    array.push(filterList?.length);
    startDate = endDate;
  }

  /**
   * counts per day by stageId
   * [1, 4, 7, 0, 0, 3]
   */
  return array;
};

export const getWeeksInMonth = (timezone) => {
  let weeks = [], dates = [], value = 0;

  let timeLocal = new Date(); // 2022-11-24 05:40:00
  let endD = spacetime(timeLocal, timezone.name);
  let startMonthD = endD; // 2022-11-24 05:40:00

  // 2022-10-24 00:00:00
  startMonthD = startMonthD
      .subtract(1, `month`)
      .time('12:00am');

  // day list of month
  let endMonthD = endD;

  while (endMonthD.isAfter(startMonthD)) {
    dates.push({
      value: value,
      label: endMonthD.format('yyyy-mm-DD')
    });
    endMonthD = endMonthD.subtract(1, 'day');
    value += 1;
  }

  value = 0;

  // 2022-11-24 00:00:00, Thur -> 2022-11-20 00:00:00, Sun
  let endWeekD = endD
      .subtract(endD.day(), `day`)
      .time('12:00am');

  while (endWeekD.isAfter(startMonthD)) {
    weeks.push({
      value: value,
      label: endWeekD.format('yyyy-mm-DD')
    });
    value += 1;

    // 2022-11-13 00:00:00, Sun
    endWeekD = endWeekD.subtract(7, 'day');
  }
  if (!endWeekD.isEqual(startMonthD)) {
    weeks.push({
      value: value,
      label: startMonthD.format('yyyy-mm-DD')
    });
  }

  /**
   dates = [
     {value: 0, label: 2022-11-24},
     {value: 1, label: 2022-11-23},
     {value: 2, label: 2022-11-22},
     ... ,
     {value: 21, label: 2022-10-24}
   ]

   weeks = [
     {value: 0, label: 2022-11-20},
     {value: 1, label: 2022-11-13},
     {value: 2, label: 2022-11-06},
     {value: 3, label: 2022-10-30},
     {value: 4, label: 2022-10-24},
   ]
   */
  return {
    dates: dates,
    weeks: weeks,
  };
};

export const onFilterData = (data, key, userIds, members) => {
  if (!key) return [];
  if (!Object.keys(data).includes(key)) return [];
  if (userIds === null && members === null) return data[[key]] || [];

  let ids = members?.map(it => it.userId.toString());
  let list = members?.length > 0
      ?
      data[[key]]?.filter(it => ids.includes(it.userId?.toString()))
      :
      (data[[key]] ?? []);
  return userIds?.length > 0
      ?
      list?.filter(it => userIds.includes(it.userId))
      :
      list;
};

/**
 * filtering by organizationId
 * @param data
 * @param orgId
 * @returns {any}
 */
export const onFilterDataByOrganization = (data, orgId) => {
  return (data && orgId && Object.keys(data).includes(orgId.toString()))
      ?
      JSON.parse(JSON.stringify(data[[orgId]]))
      :
      {};
};

/**
 * type: 1 => cbt/hr chart, 2 => highest CBT
 * @param data
 * @param type
 * @returns {boolean}
 */
export const checkEmptyData = (data, type) => {
  let flag = 0;
  if (type === 1) {
    data?.forEach(it => {
      flag += it.data.filter(it => !!it)?.length;
    });
  } else if (type === 2) {
    if (!data) return true;
    data?.list?.forEach(it => {
      flag += it.filter(a => !!a).length;
    });
  }

  return !flag;
};

export const chartPlugins = (idStr, noDataStr) => {
  return [{
    id: idStr,
    afterDraw(chart) {
      const {ctx} = chart;
      ctx.save();

      if ([`doughnut-sweat`, `doughnut-heat`].includes(idStr)) {
        chart.data.datasets.forEach((dataset, i) => {
          chart.getDatasetMeta(i).data.forEach((dataPoint, index) => {
            const {x, y} = dataPoint.tooltipPosition();
            const text = chart.data.labels[index] + `: ` + chart.data.datasets[i].data[index] + `%`;
            const textWidth = ctx.measureText(text).width;

            if (chart.data.datasets[i].data[index]) {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
              ctx.fillRect(x - ((textWidth + 10) / 2), y - 29, textWidth + 15, 24);

              // triangle
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x - 5, y - 5);
              ctx.lineTo(x + 5, y - 5);
              ctx.fill();
              ctx.restore();

              //text
              ctx.font = `12px Arial`;
              ctx.fillStyle = COLOR_WHITE;
              ctx.fillText(text, x - (textWidth / 2), y - 13);
              ctx.restore();
            }
          })
        });
      }

      if (checkEmptyData(chart?.data?.datasets, 1)) {
        let width = chart.width;
        let height = chart.height;
        ctx.textAlign = `center`;
        ctx.textBaseline = `middle`;
        ctx.font = `20px Arial`;
        ctx.fillStyle = COLOR_WHITE;
        ctx.fillText(noDataStr, width / 2, height / 2);
        ctx.restore();
      }
    }
  }]
};

export const getThisWeek = () => {
  let endDate = new Date();
  // 2022-11-24 00:00:00
  endDate.setHours(0, 0, 0);

  let startDate = new Date(endDate);

  // 2022-11-18 00:00:00
  startDate.setDate(startDate.getDate() - 6);

  return {
    startDate: startDate,
    endDate: endDate
  }
};

export const getThisWeekByTeam = (timeZone) => {
  // 2022-11-24 05:40:00
  let timeLocal = new Date();
  const endD = spacetime(timeLocal, timeZone.name);

  // 2022-11-18 05:40:00
  timeLocal.setDate(timeLocal.getDate() - 6);
  let startD = spacetime(timeLocal, timeZone.name);

  // 2022-11-18 00:00:00
  startD = startD.time('12:00am');

  /**
    startD = 2022-11-18 00:00:00
    endD = 2022-11-24 05:40:00 -> current date
   */
  return {
    startDate: startD,
    endDate: endD
  }
};

/**
 * generating hexadecimal number
 */
export const randomHexColorCode = () => {
  let n = (Math.random() * 0xfffff * 1000000).toString(16);
  return '#' + n.slice(0, 6);
};

/**
 * checking if the constant values include the selected metric
 * data: json data
 */
export const checkMetric = (data, metric) => {
  let keys = Object.keys(data);
  let flag = 0;
  keys.forEach(it => {
    flag += (Number(data[[it]]) === metric ? 1 : 0);
  });
  return flag > 0;
};

/**
 * getting key and apiCall when metric status id changed
 * @param value
 * @returns {{apiCall: null, key: null}}
 */
export const getKeyApiCall = (value) => {
  let keys = null;
  let apiCalls = null;
  switch (value) {
    case METRIC_USER_TABLE_VALUES.WEAR_TIME: // 1, wear time
      apiCalls = [queryOrganizationWearTime];
      keys = [ANALYTICS_API_KEYS.WEAR_TIME];
      break;
    case METRIC_USER_TABLE_VALUES.ALERTS: // 2, alerts
    case METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK: // 31
      apiCalls = [queryOrganizationAlertMetrics];
      keys = [ANALYTICS_API_KEYS.ALERT_METRICS];
      break;
    case METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK: // 32
      apiCalls = [queryOrganizationMaxCbt];
      keys = [ANALYTICS_API_KEYS.MAX_CBT];
      break;
    case METRIC_USER_TABLE_VALUES.TIME_SPENT_IN_CBT_ZONES: // 6
      apiCalls = [queryOrganizationTempCateData];
      keys = [ANALYTICS_API_KEYS.TEMP_CATE_DATA];
      break;
    case METRIC_USER_TABLE_VALUES.DEVICE_DATA: // 7
      apiCalls = [queryOrganizationDeviceData, queryOrganizationMaxCbt];
      keys = [ANALYTICS_API_KEYS.DEVICE_DATA, ANALYTICS_API_KEYS.MAX_CBT];
      break;
    case METRIC_USER_TABLE_VALUES.USERS_IN_VARIOUS_CBT_ZONES: // 8
      apiCalls = [queryOrganizationUsersInCBTZones];
      keys = [ANALYTICS_API_KEYS.USERS_IN_CBT_ZONES];
      break;
    case METRIC_TEAM_TABLE_VALUES.AMBIENT_TEMP_HUMIDITY: // 20
      apiCalls = [queryAmbientTempHumidity];
      keys = [ANALYTICS_API_KEYS.TEMP_HUMIDITY];
      break;
    case METRIC_USER_TABLE_VALUES.SWR_ACCLIM_SWEAT: // 4
    case METRIC_USER_TABLE_VALUES.SWR_ACCLIM_HEAT: // 5
    case METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE: // 23
    case METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE: // 24
      apiCalls = [queryOrganizationSWRFluid];
      keys = [ANALYTICS_API_KEYS.SWR_FLUID];
      break;
    case METRIC_TEAM_TABLE_VALUES.PERCENT_WORKERS_ALERTS: // 21
      apiCalls = [queryOrganizationAlertedUserCount];
      keys = [ANALYTICS_API_KEYS.ALERT_USER_COUNT];
      break;
    case METRIC_TEAM_TABLE_VALUES.ACTIVE_USERS: // 22
      apiCalls = [queryOrganizationActiveUsers];
      keys = [ANALYTICS_API_KEYS.ACTIVE_USERS];
      break;
    case METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_CBT_ZONES: // 25
      apiCalls = [queryOrganizationCategoriesUsersInCBTZones];
      keys = [ANALYTICS_API_KEYS.TEMP_CATE_IN_CBT_ZONES];
      break;
    case METRIC_TEAM_TABLE_VALUES.NO_USERS_UNACCLIMATED_ACCLIMATED: // 26
      apiCalls = [queryOrganizationFluidMetricsByTeam];
      keys = [ANALYTICS_API_KEYS.FLUID_METRICS_BY_TEAM];
      break;
    case METRIC_USER_CHART_VALUES.CBT: // 40
    case METRIC_USER_CHART_VALUES.HR: // 41
      apiCalls = [getTeamMemberAlerts];
      keys = [ANALYTICS_API_KEYS.TEAM_MEMBER_ALERTS];
      break;
    default:
      console.log("metric is not available");
  }
  return {
    keys: keys,
    apiCalls: apiCalls,
  }
};

export const getHeaderMetrics = (metric, unitMetric) => {
  let ret = [i18n.t('name'), i18n.t('team')];
  switch (metric) {
    case METRIC_USER_TABLE_VALUES.WEAR_TIME: // 1
      ret = [
        i18n.t('name'),
        i18n.t('team'),
        i18n.t('avg wear time'),
        i18n.t('total wear time')
      ];
      break;
    case METRIC_USER_TABLE_VALUES.ALERTS: // 2
    case METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK: // 31
      ret = [
        i18n.t('name'),
        i18n.t('team'),
        i18n.t('alert time'),
        i18n.t('alert'),
        i18n.t('heat risk'),
        `${i18n.t('cbt full')} ${unitMetric ? '˚C' : '˚F'}`,
        i18n.t('temp'),
        i18n.t('humidity'),
        i18n.t('heart rate avg')];
      break;
    case METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK: // 32
      ret = [
        i18n.t('name'),
        i18n.t('team'),
        i18n.t('date'),
        i18n.t('max cbt')
      ];
      break;
    case METRIC_USER_TABLE_VALUES.SWR_ACCLIM_SWEAT: // 4
      ret = [
        i18n.t('name'),
        i18n.t('team'),
        i18n.t('swr category'),
        `${i18n.t('swr')} ${unitMetric ? '(l/h)' : '(qt/h)'}`,
        unitMetric ? i18n.t("fluid recmdt n", {n: i18n.t('(l/h)')}) : i18n.t("fluid recmdt n", {n: i18n.t('(qt/h)')}),
      ];
      break;
    case METRIC_USER_TABLE_VALUES.SWR_ACCLIM_HEAT: // 5
      ret = [
        i18n.t('name'),
        i18n.t('team'),
        i18n.t('heat sus'),
        i18n.t('previous illness'),
        i18n.t('acclim status'),
      ];
      break;
    case METRIC_USER_TABLE_VALUES.TIME_SPENT_IN_CBT_ZONES: // 6
      ret = [
        i18n.t('name'),
        i18n.t('team'),
        i18n.t('time spent in safe to work'),
        i18n.t('time spent in mild heat exhaustion'),
        i18n.t('time spent in moderate hyperthermia')
      ];
      break;
    case METRIC_USER_TABLE_VALUES.DEVICE_DATA: // 7
      ret = [
        i18n.t('name'),
        i18n.t('team'),
        i18n.t('firmware version'),
        i18n.t('os version'),
        i18n.t('app version'),
        i18n.t('platform'),
        i18n.t('max cbt'),
        i18n.t('max hr'),
        i18n.t('date')
      ];
      break;
    case METRIC_USER_TABLE_VALUES.USERS_IN_VARIOUS_CBT_ZONES: // 8
      ret = [
        i18n.t('temperature categories'),
        i18n.t('user %')
      ];
      break;
    case METRIC_TEAM_TABLE_VALUES.AMBIENT_TEMP_HUMIDITY: // 20
      ret = [
        i18n.t('team'),
        i18n.t('max temp'),
        i18n.t('min temp'),
        i18n.t('avg temp'),
        i18n.t('max rh'),
        i18n.t('min rh'),
        i18n.t('avg rh')
      ];
      break;
    case METRIC_TEAM_TABLE_VALUES.PERCENT_WORKERS_ALERTS: // 21
      ret = [
        i18n.t('team'),
        i18n.t('% of team with alerts'),
        i18n.t('% of team without alerts'),
        i18n.t('no. of people with alerts'),
        i18n.t('no. of people without alerts')
      ];
      break;
    case METRIC_TEAM_TABLE_VALUES.ACTIVE_USERS: // 22
      ret = [
        i18n.t('team'),
        i18n.t('active users')
      ];
      break;
    case METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE: // 23
      ret = [
        i18n.t('team'),
        i18n.t("n swr", {n: i18n.t('low %')}),
        i18n.t("n swr", {n: i18n.t('moderate')}),
        i18n.t("n swr", {n: i18n.t('high')})
      ];
      break;
    case METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE: // 24
      ret = [
        i18n.t('team'),
        i18n.t("n risk", {n: i18n.t('upper low')}),
        i18n.t("n risk", {n: i18n.t('medium')}),
        i18n.t("n risk", {n: i18n.t('high')})];
      break;
    case METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_CBT_ZONES: // 25
      ret = [
        i18n.t('team'),
        unitMetric ? '<38' : '<100.4',
        unitMetric ? '38-38.5' : '100.4-101.3',
        unitMetric ? '>38.5' : '>101.3',
        i18n.t('total alerts'),
        i18n.t('% of team with alerts'),
        i18n.t('% of team without alerts')
      ];
      break;
    case METRIC_TEAM_TABLE_VALUES.NO_USERS_UNACCLIMATED_ACCLIMATED: // 26
      ret = [
        i18n.t('team'),
        i18n.t('heat acclimatized users'),
        i18n.t('heat unacclimatized users'),
        i18n.t('previous illness'),
        i18n.t('no previous illness')
      ];
      break;

    default:
      console.log('metric not registered');
  }
  return ret;
};
