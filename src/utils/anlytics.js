import {COLOR_WHITE} from "../constant";
import spacetime from "spacetime";

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
    return Math.ceil((data[findIndex]?.count ?? 0) / 60)
  } else {
    return 0;
  }
};

export const onCalc = (key, tempRet, totalSweat, totalHeat) => {
  if (key !== 2 && key !== 5)
    return Math.floor(tempRet[key] * 100 / ((key >= 3 ? totalSweat : totalHeat) ?? 1));
  else {
    return 100 - Math.floor(tempRet[key === 2 ? 0 : 3] * 100 / ((key >= 3 ? totalSweat : totalHeat) ?? 1)) - Math.floor(tempRet[key === 2 ? 1 : 4] * 100 / ((key >= 3 ? totalSweat : totalHeat) ?? 1))
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

export const onFilterData = (data, userIds, members) => {
  let ids = members?.map(it => it.userId.toString());
  let list = members?.length > 0
      ?
      data?.filter(it => ids.includes(it.userId?.toString()))
      :
      data;
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

export const chartPlugins = (idStr, noDataStr) => {
  return [{
    id: idStr,
    afterDraw(chart) {
      const {ctx} = chart;
      ctx.save();

      if (idStr === `doughnut`) {
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

      let flag = chart.data.datasets[0].data.filter(it => !!it);
      if (chart.data.datasets[0].data && flag.length === 0) {
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
