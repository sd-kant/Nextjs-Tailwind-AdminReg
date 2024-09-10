
// callbackFns: numMinutesBetween, formatConnectionStatusV2, formatAlert, formatLastSync, getLatestDate
// constants: ALERT_STAGE_STATUS, ALERT_STAGE_STATUS, ALERT_STAGE_STATUS
const _ = require('lodash');

const numMinutesBetween = (d1 = new Date(), d2 = new Date(1900, 1, 1)) => {
  if (d2.getTime() > d1.getTime() + 60 * 1000) {
    return 100000;
  }
  const diff = d1.getTime() - d2.getTime();
  // const diff = Math.abs(d1.getTime() - d2.getTime());
  return Math.ceil(diff / (1000 * 60));
};

export const minutesToDaysHoursMinutes = (minutes) => {
  if (!minutes) {
    return {
      days: null,
      hours: null,
      minutes: null
    };
  }
  return {
    days: Math.floor(minutes / 24 / 60),
    hours: Math.floor((minutes / 60) % 24),
    minutes: Math.ceil(minutes % 60)
  };
};

export const getLatestDate = (d1, d2) => {
  const now = new Date().getTime();
  const gap1 = now - d1;
  const gap2 = now - d2;
  if (gap1 < 0 && gap2 < 0) {
    return null;
  }
  if (gap1 < 0) {
    return d2;
  }
  if (gap2 < 0) {
    return d1;
  }
  if (!d1) return d2;
  if (!d2) return d1;
  if (d2?.getTime() <= d1?.getTime()) {
    return d1;
  }

  return d2;
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

// Web Worker code
self.onmessage = function (e) {
    const { data } = e;
    const {members, alerts, stats, devices, teams, filter, constants } = data;

    const formatConnectionStatusV2 = ({
      flag: onOffFlag,
      deviceId,
      connected,
      stat,
      alert,
      deviceType,
      lastSyncDataDateTime
    }) => {
      const calc = () => {
        if (
          numMinutesBetween(new Date(), new Date(alert?.utcTs)) <= 60 ||
          numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 60
        ) {
          if (numMinutesBetween(new Date(), new Date(stat?.deviceLogTs)) <= 20) {
            return {
              label: 'device connected',
              value: constants.DEVICE_CONNECTION_STATUS.CONNECTED
            };
          } else {
            return {
              label: 'limited connectivity',
              value: constants.DEVICE_CONNECTION_STATUS.LIMITED_CONNECTION
            };
          }
        } else if (
          numMinutesBetween(new Date(), new Date(alert?.utcTs)) > 60 &&
          numMinutesBetween(new Date(), new Date(alert?.utcTs)) <= 90 &&
          numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) > 60 &&
          numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 90
        ) {
          return {
            label: 'limited connectivity',
            value: constants.DEVICE_CONNECTION_STATUS.LIMITED_CONNECTION
          };
        } 
        else if (
          (numMinutesBetween(new Date(), new Date(alert?.utcTs)) > 90 &&
            numMinutesBetween(new Date(), new Date(alert?.utcTs)) <= 120) ||
          numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 120
        ) {
          return {
            label: 'check device',
            value: constants.DEVICE_CONNECTION_STATUS.CHECK_DEVICE
          };
        } 
        else {
          return {
            label: 'no connection',
            value: constants.DEVICE_CONNECTION_STATUS.NO_CONNECTION
          };
        }
      };
    
      if (!deviceId || deviceId?.toString().includes('none')) {
        // if no device
        return {
          label: 'no connection',
          value: constants.DEVICE_CONNECTION_STATUS.NO_CONNECTION
        };
      }
      if (stat?.chargingFlag) {
        if (numMinutesBetween(new Date(), new Date(stat?.deviceLogTs)) <= 2) {
          return {
            label: 'charging',
            value: constants.DEVICE_CONNECTION_STATUS.CHARGING
          };
        }
        return {
          label: 'no connection',
          value: constants.DEVICE_CONNECTION_STATUS.NO_CONNECTION
        };
      }
    
      if (connected && onOffFlag) {
        return calc();
      } else {
        if (
          numMinutesBetween(new Date(), new Date(stat?.lastConnectedTs)) <= 5 &&
          numMinutesBetween(new Date(), new Date(stat?.lastOnTs)) <= 5
        ) {
          return calc();
        } else if (
          connected &&
          !onOffFlag &&
          numMinutesBetween(new Date(), new Date(stat?.lastOnTs)) <= 20
        ) {
          return {
            label: 'check device',
            value: constants.DEVICE_CONNECTION_STATUS.CHECK_DEVICE
          };
        } else if (
          onOffFlag &&
          !connected &&
          numMinutesBetween(new Date(), new Date(stat?.lastConnectedTs)) <= 20
        ) {
          return {
            label: deviceType === 'hub' ? 'check device':'check app',
            value: constants.DEVICE_CONNECTION_STATUS.CHECK_DEVICE
          };
        } else if(
          (onOffFlag || connected) &&
          numMinutesBetween(new Date(), new Date(lastSyncDataDateTime)) <= 20){
          return {
            label: deviceType === 'hub' ? 'check device' : 'check app',
            value: constants.DEVICE_CONNECTION_STATUS.NO_CONNECTION
          };
        } else {
          return {
            label: deviceType === 'hub' ? 'no hub connection' : 'no connection',
            value: constants.DEVICE_CONNECTION_STATUS.NO_CONNECTION
          };
        }
      }
    };

    const formatAlert = (stageId) => {
      if (!stageId) {
        return constants.STAGE_VALUES[0]; // N/A
      }
  
      switch (stageId?.toString()) {
        case '1':
          return constants.STAGE_VALUES[1]; // At Risk
        case '2':
          return constants.STAGE_VALUES[2]; // Elevated Risk
        case '3':
          return constants.STAGE_VALUES[3]; // Safe
        case '4':
          return constants.STAGE_VALUES[4]; // Safe
        case '5':
          return constants.STAGE_VALUES[5]; // Manual Test Alert
        default:
          return constants.STAGE_VALUES[0]; // N/A
      }
    };
    const sortMembers = ({ arrOrigin, filter }) => {
      const chooseConProperty = (m, p = constants.PRIORITIES) => {
        if (m?.others) {
          const c = [p[m?.connectionObj?.value]];
          m?.others.forEach((o) => c.push(p[o?.connectionObj?.value]));
          return Math.min(...c);
        } else {
          return p[m?.connectionObj?.value];
        }
      };

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
                  ? columnPriorities[_.get(a, path)?.toString()?.toLowerCase()] -
                    columnPriorities[_.get(b, path)?.toString()?.toLowerCase()]
                  : columnPriorities[_.get(b, path)?.toString()?.toLowerCase()] -
                    columnPriorities[_.get(a, path)?.toString()?.toLowerCase()];
              if (v === 0) {
                flag = true;
              }
            }
    
            if (flag) {
              v =
                chooseConProperty(a, connectionPriorities) - chooseConProperty(b, connectionPriorities);
              if (v === 0) {
                if (a.invisibleLastSync) {
                  v = 1;
                } else if (b.invisibleLastSync) {
                  v = -1;
                } else {
                  const aGap = numMinutesBetween(new Date(), new Date(a.lastSync));
                  const bGap = numMinutesBetween(new Date(), new Date(b.lastSync));
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
        return constants.HEAT_SUSCEPTIBILITY_PRIORITIES[key] ?? (direction === 1 ? 4 : 0);
      };
    
      if ([1, 2].includes(filter?.lastSync)) {
        // sort by last sync
        arr = arr?.sort((a, b) => {
          if (a.invisibleLastSync) {
            return 1;
          } else if (b.invisibleLastSync) {
            return -1;
          } else {
            const aGap = numMinutesBetween(new Date(), new Date(a.lastSync));
            const bGap = numMinutesBetween(new Date(), new Date(b.lastSync));
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
          connectionPriorities: constants.PRIORITIES,
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
              const aGap = numMinutesBetween(new Date(), new Date(a.lastSync));
              const bGap = numMinutesBetween(new Date(), new Date(b.lastSync));
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
              ? chooseConProperty(a) - chooseConProperty(b)
              : chooseConProperty(b) - chooseConProperty(a);
          if (v === 0) {
            if (a.invisibleLastSync) {
              v = 1;
            } else if (b.invisibleLastSync) {
              v = -1;
            } else {
              const aGap = numMinutesBetween(new Date(), new Date(a.lastSync));
              const bGap = numMinutesBetween(new Date(), new Date(b.lastSync));
              v = aGap - bGap;
            }
          }
    
          return v;
        });
      }
    
      return arr;
    };
    
    // Example: Perform a time-consuming task (e.g., calculating large Fibonacci numbers)
    const formatingMembers = () => {
        let arr = [];
        members?.forEach((member) => {
          if (teams?.findIndex(t => t == member.teamId) < 0) return;
    
          const statsPerMember = stats
            ?.filter((it) => it.userId?.toString() === member.userId?.toString())
            .sort((a, b) => new Date(b.deviceLogTs).getTime() - new Date(a.deviceLogTs).getTime());
    
          const devicesPerMember = devices?.find(
            (it) => it.userId?.toString() === member.userId?.toString()
          )?.devices;
          const alertsForMember = alerts?.filter(
            (it) =>
              it.userId?.toString() === member.userId?.toString() &&
              (!(it?.alertStageId?.toString() === '5') ||
              numMinutesBetween(new Date(), new Date(it.utcTs)) <= 1)
          );
          // get a latest alert
          const alertLatest = alertsForMember?.sort(function (a, b) {
            return new Date(b.utcTs) - new Date(a.utcTs);
          })?.[0];
          const numberOfAlerts = (
            alertsForMember?.filter((it) =>
                [
                    constants.ALERT_STAGE_STATUS.AT_RISK,
                    constants.ALERT_STAGE_STATUS.ELEVATED_RISK,
                    constants.ALERT_STAGE_STATUS.SAFE
                  ].findIndex( a => a == it?.alertStageId)
            ) ?? []
          )?.length;
          const alertObj = formatAlert(alertLatest?.alertStageId);
          let i = 0,
            subArr = [],
            availableDevices = [];
          function calData(stat = null) {
            const userKenzenDevices = devicesPerMember
              ?.filter(
                (it) =>
                  it.deviceId?.toLowerCase() === stat?.deviceId?.toLowerCase() &&
                  ['kenzen'].includes(it?.type)
              )
              ?.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
            const sourceDevice = devicesPerMember?.find(d => d.deviceId == stat?.sourceDeviceId);
            if (stat?.deviceId) availableDevices.push(stat?.deviceId);
    
            const lastSync = getLatestDate(
                getLatestDate(
                stat?.heartRateTs ? new Date(stat?.heartRateTs) : null,
                stat?.deviceLogTs ? new Date(stat?.deviceLogTs) : null
              ),
              getLatestDate(
                stat?.tempHumidityTs ? new Date(stat?.tempHumidityTs) : null,
                alertLatest?.utcTs ? new Date(alertLatest?.utcTs) : null
              )
            );
    
            const connectionObj = formatConnectionStatusV2({
              flag: stat?.onOffFlag,
              connected: userKenzenDevices?.[0]?.connected,
              lastSyncDataDateTime: lastSync,
              deviceId: stat?.deviceId,
              numberOfAlerts,
              stat,
              alert: alertLatest,
              deviceType: sourceDevice?.type
            });
    
            const lastSyncStr = formatLastSync(lastSync);
    
            const invisibleAlerts = ['1'].includes(connectionObj?.value?.toString()) || !numberOfAlerts;
            const invisibleDeviceMac = ['1'].includes(connectionObj?.value?.toString());
            const invisibleBattery =
              ['1', '8'].includes(connectionObj?.value?.toString()) ||
              (['2', '4'].includes(connectionObj?.value?.toString()) &&
              numMinutesBetween(new Date(), new Date(stat?.deviceLogTs)) > 240);
            const invisibleHeatRisk =
              !alertLatest || ['1', '2', '8'].includes(connectionObj?.value?.toString());
            const invisibleLastSync =
              new Date(lastSync).getTime() > new Date().getTime() + 60 * 1000 ||
              ['1'].includes(connectionObj?.value?.toString());
            const invisibleLastUpdates = ['1', '2', '8'].includes(connectionObj?.value?.toString());
            (i === 0 ? arr : subArr).push({
              ...member,
              stat,
              alert: alertLatest,
              numberOfAlerts,
              alertsForMe: alertsForMember,
              alertObj,
              connectionObj,
              lastSync,
              lastSyncStr,
              invisibleAlerts,
              invisibleDeviceMac,
              invisibleBattery,
              invisibleHeatRisk,
              invisibleLastSync,
              invisibleLastUpdates
            });
            i = i + 1;
          }
    
          if (statsPerMember?.length > 0) {
            statsPerMember.forEach((s) => calData(s));
          } else {
            calData();
          }
    
          if (subArr.length > 0) {
            arr[arr.length - 1]['others'] = subArr;
          }
    
          arr[arr.length - 1]['devices'] = availableDevices;
        });
    
        return sortMembers({ arrOrigin: arr, filter });
    }
  
    const result = formatingMembers();
    
    // Post the result back to the main thread
    self.postMessage(result);
};