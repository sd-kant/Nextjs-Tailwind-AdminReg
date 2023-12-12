import { minutesToDaysHoursMinutes, numMinutesBetween, numMinutesBetweenWithNow } from './index';
import { HEAT_SUSCEPTIBILITY_PRIORITIES, INVALID_VALUES2, PRIORITIES } from '../constant';
import { get } from 'lodash';

export const formatDevice4Digits = (str) => {
  const splits = str?.split(':');
  const lastTwo = splits?.slice(-2);
  return lastTwo?.length === 2 ? `Kenzen_${lastTwo.join('')}` : '';
};

export const formatLastSync = (lastTimestamp) => {
  const lastSync = lastTimestamp ? numMinutesBetween(new Date(), new Date(lastTimestamp)) : null;
  const { days, minutes, hours } = minutesToDaysHoursMinutes(lastSync);
  let lastSyncStr = '';
  if (days > 365) {
    lastSyncStr = `> 365`;
  } else if (days >= 1) {
    lastSyncStr = `${days} ${days > 1 ? 'days' : 'day'} ago`;
  } else if (hours >= 1) {
    lastSyncStr = `${hours} ${hours > 1 ? 'hours' : 'hour'} ago`;
  } else if (minutes >= 1) {
    lastSyncStr = `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} ago`;
  } else if (minutes > 0) {
    lastSyncStr = `less than a minute ago`;
  }

  return lastSyncStr;
};

export const formatHeartRate = (rate) => {
  if (INVALID_VALUES2.includes(rate?.toString())) {
    return '--';
  }
  return Math.round(parseFloat(rate));
};

export const literToQuart = (v) => {
  if (INVALID_VALUES2.includes(v?.toString())) {
    return '';
  }

  return (v * 1.05669).toFixed(2);
};

export const sortMembers = ({ arrOrigin, filter }) => {
  const common = ({
    arr,
    invisibleKey,
    columnPriorities,
    connectionPriorities,
    path,
    filterDirection
  }) => {
    return arr?.sort((a, b) => {
      let v;
      if (a[invisibleKey] ^ b[invisibleKey]) {
        v = a[invisibleKey] ? 1 : -1;
      } else {
        let flag = false;
        if (a[invisibleKey]) {
          flag = true;
        } else {
          v =
            filterDirection === 1
              ? columnPriorities[get(a, path)?.toString()?.toLowerCase()] -
                columnPriorities[get(b, path)?.toString()?.toLowerCase()]
              : columnPriorities[get(b, path)?.toString()?.toLowerCase()] -
                columnPriorities[get(a, path)?.toString()?.toLowerCase()];
          if (v === 0) {
            flag = true;
          }
        }

        if (flag) {
          v =
            connectionPriorities[a.connectionObj?.value] -
            connectionPriorities[b.connectionObj?.value];
          if (v === 0) {
            if (a.invisibleLastSync) {
              v = 1;
            } else if (b.invisibleLastSync) {
              v = -1;
            } else {
              const aGap = numMinutesBetweenWithNow(new Date(), new Date(a.lastSync));
              const bGap = numMinutesBetweenWithNow(new Date(), new Date(b.lastSync));
              v = aGap - bGap;
            }
          }
        }
      }
      return v;
    });
  };

  let arr = arrOrigin;

  const heatRiskPriorities = (filterDirection) => ({
    1: filterDirection === 1 ? 2 : 1,
    2: filterDirection === 1 ? 1 : 2,
    3: 3,
    4: 3,
    5: 3
  });

  const getHeatSusceptibilityPriority = ({ key, direction }) => {
    return HEAT_SUSCEPTIBILITY_PRIORITIES[key] ?? (direction === 1 ? 4 : 0);
  };

  if ([1, 2].includes(filter?.lastSync)) {
    // sort by last sync
    arr = arr?.sort((a, b) => {
      if (a.invisibleLastSync) {
        return 1;
      } else if (b.invisibleLastSync) {
        return -1;
      } else {
        const aGap = numMinutesBetweenWithNow(new Date(), new Date(a.lastSync));
        const bGap = numMinutesBetweenWithNow(new Date(), new Date(b.lastSync));
        return filter?.lastSync === 1 ? aGap - bGap : bGap - aGap;
      }
    });
  }
  if ([1, 2].includes(filter?.alerts)) {
    // sort by number of alerts
    arr = arr?.sort((a, b) => {
      return filter?.alerts === 1
        ? b.numberOfAlerts - a.numberOfAlerts
        : a.numberOfAlerts - b.numberOfAlerts;
    });
  }
  if ([1, 2].includes(filter?.username)) {
    // sort by username
    arr = arr?.sort((a, b) => {
      return filter?.username === 1
        ? a.lastName?.localeCompare(b.lastName) === 0
          ? a.firstName?.localeCompare(b.firstName)
          : a.lastName?.localeCompare(b.lastName)
        : b.lastName?.localeCompare(a.lastName) === 0
          ? b.firstName?.localeCompare(a.firstName)
          : b.lastName?.localeCompare(a.lastName);
    });
  }
  if ([1, 2].includes(filter?.heatRisk)) {
    // sort by heat risk
    arr = common({
      arr,
      invisibleKey: 'invisibleHeatRisk',
      columnPriorities: heatRiskPriorities(filter?.heatRisk),
      connectionPriorities: PRIORITIES,
      path: 'alertObj.value',
      filterDirection: filter?.heatRisk
    });
  }
  if ([1, 2].includes(filter?.heatSusceptibility)) {
    arr = arr?.sort((a, b) => {
      const aPriority = getHeatSusceptibilityPriority({
        key: a.heatSusceptibility?.toLowerCase(),
        direction: filter?.heatSusceptibility
      });
      const bPriority = getHeatSusceptibilityPriority({
        key: b.heatSusceptibility?.toLowerCase(),
        direction: filter?.heatSusceptibility
      });
      let v = filter?.heatSusceptibility === 1 ? aPriority - bPriority : bPriority - aPriority;
      if (v === 0) {
        if (a.invisibleLastSync) {
          v = 1;
        } else if (b.invisibleLastSync) {
          v = -1;
        } else {
          const aGap = numMinutesBetweenWithNow(new Date(), new Date(a.lastSync));
          const bGap = numMinutesBetweenWithNow(new Date(), new Date(b.lastSync));
          v = aGap - bGap;
        }
      }

      return v;
    });
  }
  if ([1, 2].includes(filter?.connection)) {
    arr = arr?.sort((a, b) => {
      let v =
        filter?.connection === 1
          ? PRIORITIES[a.connectionObj?.value] - PRIORITIES[b.connectionObj?.value]
          : PRIORITIES[b.connectionObj?.value] - PRIORITIES[a.connectionObj?.value];
      if (v === 0) {
        if (a.invisibleLastSync) {
          v = 1;
        } else if (b.invisibleLastSync) {
          v = -1;
        } else {
          const aGap = numMinutesBetweenWithNow(new Date(), new Date(a.lastSync));
          const bGap = numMinutesBetweenWithNow(new Date(), new Date(b.lastSync));
          v = aGap - bGap;
        }
      }

      return v;
    });
  }

  return arr;
};
