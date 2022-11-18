import {dateFormat} from "./index";
import {COLOR_WHITE} from "../constant";

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

export const getThisWeek = () => {
  let firstDate = new Date();
  firstDate.setDate(firstDate.getDate() - 6);
  firstDate.setHours(0, 0, 0);
  let endDate = new Date(firstDate);
  endDate.setDate(endDate.getDate() + 7);
  return {
    firstDate: firstDate,
    endDate: endDate
  }
};

export const getUTCDateList = (dateStr) => {
  if (!dateStr) return '';
  let date = new Date(dateStr);
  let dates = [];
  for (let k = 0; k <= 6; k++) {
    let m = date.getMonth() + 1;
    let d = date.getDate();
    m = m >= 10 ? m : `0` + m;
    d = d >= 10 ? d : `0` + d;
    dates.push(date.getFullYear() + `-` + m + `-` + d);
    date.setDate(new Date(date).getDate() + 1);
  }
  return dates;
};

export const getListPerLabel = (list, stageIds, thisWeek) => {
  let temp = list?.filter(a => stageIds.includes(a.alertStageId));
  let array = [];
  let date = thisWeek.firstDate;
  for (let k = 0; k <= 6; k++) {
    let nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    let filterList = temp?.filter(a =>
        new Date(a.ts).getTime() >= new Date(date).getTime() &&
        new Date(a.ts).getTime() < new Date(nextDate).getTime()
    );
    array.push(filterList.length);
    date = nextDate;
  }
  return array;
};

export const getWeeksInMonth = () => {
  let weeks = [], firstDate = new Date(), lastDate = new Date();
  firstDate.setMonth(new Date(firstDate).getMonth() - 1);

  // day list of month
  let dates = [], date = new Date(lastDate.getTime()), value = 0;
  while (date >= firstDate) {
    dates.push({
      value: value,
      label: dateFormat(new Date(date))
    });
    date.setDate(date.getDate() - 1);
    value += 1;
  }
  dates.shift();

  date = lastDate;
  let flag = false;
  value = 1;
  do {
    if (!flag) {
      date.setDate(date.getDate() - date.getDay());
      flag = true;
    } else {
      date.setDate(date.getDate() - 7);
    }
    weeks.push({
      value: value,
      label: dateFormat(new Date(date >= firstDate ? date : firstDate))
    });
    value += 1;
  } while (date >= firstDate);

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

export const onFilterDataByOrganization = (data, key) => {
  return (data && key && Object.keys(data).includes(key.toString()))
      ?
      JSON.parse(JSON.stringify(data[[key]]))
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