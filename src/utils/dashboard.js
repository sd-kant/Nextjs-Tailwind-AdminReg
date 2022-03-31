import {minutesToDaysHoursMinutes, numMinutesBetween} from "./index";

export const formatDevice4Digits = str => {
  const splits = str?.split(":");
  const lastTwo = splits?.slice(-2);
  return lastTwo?.length === 2 ? `Kenzen_${lastTwo.join("")}` : '';
};

export const formatLastSync = lastTimestamp => {
  const lastSync = lastTimestamp ? numMinutesBetween(new Date(), new Date(lastTimestamp)) : null;
  const {days, minutes, hours} = minutesToDaysHoursMinutes(lastSync);
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

export const formatHeartRate = rate => {
  if ([null, undefined, "0", ""].includes(rate?.toString())) {
    return "--";
  }
  return Math.ceil(parseFloat(rate));
};
