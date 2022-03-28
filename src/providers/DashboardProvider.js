import * as React from 'react';
import {connect} from "react-redux";
import {
  getTeamAlerts,
  getTeamDevices,
  getTeamStats, inviteTeamMember,
  queryAllOrganizations,
  queryTeamMembers,
  queryTeams,
  subscribeDataEvents
} from "../http";
import axios from "axios";
import MemberDetail from "../views/modals/MemberDetail";
import {
  celsiusToFahrenheit,
  getLatestDateBeforeNow as getLatestDate,
  getParamFromUrl,
  minutesToDaysHoursMinutes,
  numMinutesBetweenWithNow as numMinutesBetween,
  updateUrlParam,
} from "../utils";
import {withTranslation} from "react-i18next";
import {get} from "lodash";
import {USER_TYPE_ADMIN, USER_TYPE_OPERATOR, USER_TYPE_ORG_ADMIN, USER_TYPE_TEAM_ADMIN} from "../constant";
import useForceUpdate from "../hooks/useForceUpdate";
import {useNotificationContext} from "./NotificationProvider";

const DashboardContext = React.createContext(null);
let timeout = undefined;
const timeoutCycle = 30000;

const DashboardProviderDraft = (
  {
    children,
    setLoading,
    metric,
    userType,
    t,
  }) => {
  const sortBy = getParamFromUrl('sortBy');
  const sortDirection = getParamFromUrl('sortDirection');
  const keywordInUrl = getParamFromUrl('keyword');
  const organizationInUrl = getParamFromUrl("organization");
  const teamsInUrl = getParamFromUrl('teams');

  const [refreshCount, setRefreshCount] = React.useState(0);
  const [organizations, setOrganizations] = React.useState([]);
  const [organization, setOrganization] = React.useState(organizationInUrl ?? null);
  const [teams, setTeams] = React.useState([]);
  const [team, setTeam] = React.useState(null);
  const [member, setMember] = React.useState(null);
  const [pickedTeams, setPickedTeams] = React.useState(teamsInUrl ? teamsInUrl.split(',') : []);
  const [visibleMemberModal, setVisibleMemberModal] = React.useState(false);
  const [filter, setFilter] = React.useState(sortBy ? {[sortBy]: parseInt(sortDirection)} : {});
  const [multiMode, setMultiMode] = React.useState(true);
  const [page, setPage] = React.useState(null);
  const [sizePerPage] = React.useState(10);
  const [keyword, setKeyword] = React.useState(keywordInUrl ?? "");
  const {addNotification} = useNotificationContext();
  const [values, setValues] = React.useState({
    members: [],
    alerts: [],
    stats: [],
  });
  const [valuesV2, _setValuesV2] = React.useState({
    members: [],
    alerts: [],
    stats: [],
    devices: [],
  });
  const valuesV2Ref = React.useRef(valuesV2);
  const setValuesV2 = v => {
    valuesV2Ref.current = v;
    _setValuesV2(v);
  };
  const [formattedMembers, setFormattedMembers] = React.useState([]);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [horizon, _setHorizon] = React.useState(null);
  const horizonRef = React.useRef(horizon);
  const setHorizon = v => {
    horizonRef.current = v;
    _setHorizon(v);
  };
  const forceUpdate = useForceUpdate();
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    setIsAdmin(userType?.some(it => [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].includes(it)));
  }, [userType]);
  React.useEffect(() => {
    queryAllOrganizations()
      .then(res => {
        const allOrganizations = res.data;
        allOrganizations.sort((a, b) => {
          return a.name?.toLowerCase() > b.name?.toLowerCase() ? 1 : -1;
        });
        setOrganizations(allOrganizations);
      })
      .catch(e => {
        console.error("getting companies error", e);
        // todo show error
      });
  }, [isAdmin]);
  React.useEffect(() => {
    queryTeams()
      .then(res => {
        const allTeams = res.data;
        allTeams.sort((a, b) => {
          return a.name?.toLowerCase() > b.name?.toLowerCase() ? 1 : -1;
        });
        setTeams(allTeams);
      })
      .catch(e => {
        console.error("getting teams error", e);
        // todo show error
      });
  }, []);
  React.useEffect(() => {
    if (team?.value) {
      fetchTeamMembers(team.value);
      fetch();
    } else {
      setValues({
        members: [],
        stats: [],
        alerts: [],
      });
    }

    return () => {
      clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team?.value]);
  React.useEffect(() => {
    const sortBy = Object.keys(filter)?.[0];
    let sortDirection = undefined;
    if (sortBy) {
      sortDirection = filter[sortBy];
    }
    updateUrlParam({param: {key: 'sortBy', value: sortBy}});
    updateUrlParam({param: {key: 'sortDirection', value: sortDirection}});
    localStorage.setItem("kop-params", location.search);
  }, [filter]);
  React.useEffect(() => {
    const pickedTeamIds = pickedTeams?.toString();
    updateUrlParam({param: {key: 'teams', value: pickedTeamIds}});
    localStorage.setItem("kop-params", location.search);
    setPage(null);
    setValuesV2({
      members: [],
      alerts: [],
      stats: [],
      devices: [],
    });
    const source = axios.CancelToken.source();
    if (pickedTeams?.length > 0) {
      const membersPromises = [];
      const statsPromises = [];
      const alertsPromises = [];
      const devicePromises = [];
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      // d.setDate(d.getDate() - 1);
      // todo filter daily alerts every time you got response from subscribe
      const since = d.toISOString();
      pickedTeams.forEach(team => {
        membersPromises.push(queryTeamMembers(team));
        statsPromises.push(getTeamStats(team));
        alertsPromises.push(getTeamAlerts(team, since));
        devicePromises.push(getTeamDevices(team));
      });
      const a = () => new Promise(resolve => {
        Promise.allSettled(membersPromises)
          .then(results => {
            results?.forEach((result, index) => {
              if (result.status === "fulfilled") {
                if (result.value?.data?.members?.length > 0) {
                  const operators = result.value?.data?.members?.filter(it => it.teamId?.toString() === pickedTeams?.[index]?.toString()) ?? [];
                  const prev = JSON.parse(JSON.stringify(valuesV2Ref.current));
                  setValuesV2({
                    ...prev,
                    members: [...prev.members, ...operators],
                  });
                }
              }
            })
          })
          .finally(() => resolve());
      });

      const b = () => new Promise(resolve => {
        Promise.allSettled(statsPromises)
          .then(results => {
            results?.forEach(result => {
              if (result.status === "fulfilled") {
                if (result.value?.data?.length > 0) {
                  const prev = JSON.parse(JSON.stringify(valuesV2Ref.current));
                  setValuesV2({
                    ...prev,
                    stats: [...prev.stats, ...result.value?.data],
                  });
                }
              }
            })
          })
          .finally(() => {
            resolve();
          });
      });
      const c = () => new Promise(resolve => {
        Promise.allSettled(alertsPromises)
          .then(results => {
            results?.forEach(result => {
              if (result.status === "fulfilled") {
                if (result.value?.data?.length > 0) {
                  const prev = JSON.parse(JSON.stringify(valuesV2Ref.current));
                  const updated = [
                    ...prev.alerts,
                    ...(
                      result.value?.data?.map(it => ({
                          ...it,
                          utcTs: it.ts,
                        })
                      )
                    )];
                  const uniqueUpdated = [];
                  for (const entry of updated) {
                    if (!uniqueUpdated.some(x => (entry.utcTs === x.utcTs) && (entry.userId === x.userId))) { uniqueUpdated.push(entry) }
                  }

                  setValuesV2({
                    ...prev,
                    alerts: uniqueUpdated,
                  });
                }
              }
            })
          })
          .finally(() => {
            resolve();
          });
      });
      const e = () => new Promise(resolve => {
        Promise.allSettled(devicePromises)
          .then(results => {
            results?.forEach(result => {
              if (result.status === "fulfilled") {
                if (result.value?.data?.length > 0) {
                  const prev = JSON.parse(JSON.stringify(valuesV2Ref.current));
                  setValuesV2({
                    ...prev,
                    devices: [...prev.devices, ...result.value?.data],
                  });
                }
              }
            })
          })
          .finally(() => {
            resolve();
          });
      });
      setLoading(true);
      Promise.allSettled([a(), b(), c(), e()])
        .then(() => {
          const d = new Date().getTime();
          setHorizon(d);
          subscribe(d, source.token);
          setPage(1);
        })
        .finally(() => {
          setLoading(false);
        });
    }
    return () => {
      source.cancel("cancel by user");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedTeams, refreshCount]);
  React.useEffect(() => {
    setTeam(null);
    updateUrlParam({param: {key: 'organization', value: organization}});
    localStorage.setItem("kop-params", location.search);
  }, [organization]);
  React.useEffect(() => {
    let arr = [];
    valuesV2.members?.forEach(member => {
      const stat = valuesV2.stats?.find(it => it.userId?.toString() === member.userId?.toString());
      const userDevices = valuesV2.devices?.find(it => it.userId?.toString() === member.userId?.toString())?.devices;
      const userKenzenDevice = userDevices?.find(it => it.type === "kenzen" && it.deviceId === stat?.deviceId);
      const alertsForMe = valuesV2.alerts?.filter(it => it.userId?.toString() === member.userId?.toString());
      const alert = alertsForMe
        ?.sort(function (a, b) {
          return new Date(b.utcTs) - new Date(a.utcTs);
        })?.[0];
      const numberOfAlerts = alertsForMe?.length;
      const alertObj = formatAlert(alert?.alertStageId);
      const connectionObj = formatConnectionStatusV2({
        flag: stat?.onOffFlag,
        connected: userKenzenDevice?.connected,
        lastTimestamp: stat?.tempHumidityTs,
        deviceId: stat?.deviceId,
        numberOfAlerts,
        stat,
        alert,
      });
      const lastSync = getLatestDate(
        getLatestDate(stat?.heartRateTs ? new Date(stat?.heartRateTs) : null, stat?.deviceLogTs ? new Date(stat?.deviceLogTs) : null),
        getLatestDate(stat?.tempHumidityTs ? new Date(stat?.tempHumidityTs) : null, alert?.utcTs ? new Date(alert?.utcTs) : null)
      );
      const lastSyncStr = formatLastSync(lastSync);

      const invisibleAlerts = ["1"].includes(connectionObj?.value?.toString()) || !numberOfAlerts;
      const invisibleDeviceMac = ["1"].includes(connectionObj?.value?.toString());
      const invisibleBattery = ["1", "8"].includes(connectionObj?.value?.toString()) ||
        (["2", "4"].includes(connectionObj?.value?.toString()) && numMinutesBetween(new Date(), new Date(stat?.deviceLogTs)) > 240);
      const invisibleHeatRisk = ["1", "2", "8"].includes(connectionObj?.value?.toString());
      const invisibleLastSync = (new Date(lastSync).getTime() > (new Date().getTime() + (60 * 1000))) || ["1"].includes(connectionObj?.value?.toString());

      arr.push({
        ...member,
        stat,
        alert,
        numberOfAlerts,
        alertsForMe,
        alertObj,
        connectionObj,
        lastSync,
        lastSyncStr,
        invisibleAlerts,
        invisibleDeviceMac,
        invisibleBattery,
        invisibleHeatRisk,
        invisibleLastSync,
      })
    });

    const priorities = {
      "1": 6,
      "2": 5,
      "3": 1,
      "4": 2,
      "7": 3,
      "8": 4,
    };

    if ([1, 2].includes(filter?.lastSync)) { // sort by last sync
      arr = arr?.sort((a, b) => {
        if (a.invisibleLastSync) {
          return 1;
        } else if (b.invisibleLastSync) {
          return -1;
        } else {
          return filter?.lastSync === 1 ? new Date(b.lastSync) - new Date(a.lastSync) : new Date(a.lastSync) - new Date(b.lastSync);
        }
      });
    }
    if ([1, 2].includes(filter?.alerts)) { // sort by number of alerts
      arr = arr?.sort((a, b) => {
        return filter?.alerts === 1 ? b.numberOfAlerts - a.numberOfAlerts : a.numberOfAlerts - b.numberOfAlerts;
      });
    }
    if ([1, 2].includes(filter?.username)) { // sort by username
      arr = arr?.sort((a, b) => {
        return filter?.username === 1 ? a.lastName?.localeCompare(b.lastName) : b.lastName?.localeCompare(a.lastName);
      });
    }
    if ([1, 2].includes(filter?.heatRisk)) { // sort by heat risk
      arr = arr?.sort((a, b) => {
        let v;
        if (a.invisibleHeatRisk ^ b.invisibleHeatRisk) {
          v = a.invisibleHeatRisk ? 1 : -1;
        } else {
          let flag = false;
          if (a.invisibleHeatRisk) {
            flag = true;
          } else {
            v = filter?.heatRisk === 1 ? a.alertObj?.value - b.alertObj?.value : b.alertObj?.value - a.alertObj?.value;
            if (v === 0) {
              flag = true;
            }
          }

          if (flag) {
            v = priorities[a.connectionObj?.value] - priorities[b.connectionObj?.value];
            if (v === 0) {
              if (a.invisibleLastSync) {
                v = 1;
              } else if (b.invisibleLastSync) {
                v = -1;
              } else {
                v = new Date(b.lastSync) - new Date(a.lastSync);
              }
            }
          }
        }
        return v;
      });
    }
    if ([1, 2].includes(filter?.connection)) {
      arr = arr?.sort((a, b) => {
        let v = filter?.connection === 1 ? priorities[a.connectionObj?.value] - priorities[b.connectionObj?.value] : priorities[b.connectionObj?.value] - priorities[a.connectionObj?.value];
        if (v === 0) {
          if (a.invisibleLastSync) {
            v = 1;
          } else if (b.invisibleLastSync) {
            v = -1;
          } else {
            v = new Date(b.lastSync) - new Date(a.lastSync);
          }
        }

        return v;
      });
    }
    setFormattedMembers(arr);
    console.log(`last rendering done at ${new Date().toLocaleString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuesV2.members, valuesV2.alerts, valuesV2.stats, valuesV2.devices, filter, count]);

  const subscribe = (ts, cancelToken) => {
    // fixme check whether the function that removes previous subscribe is correct
    if (pickedTeams?.length > 0) {
      let sinceTs = horizonRef.current;
      let subscribeAgain = true;
      subscribeDataEvents({
        filter: {
          teamIds: pickedTeams ?? [],
        },
        orgId: organization,
        horizon: ts,
        cancelToken,
      })
        .then(res => {
          if (res.status?.toString() === "200") {
            const events = res.data;
            if (events?.length > 0) {
              const latestTs = events?.sort((a, b) => b.ts - a.ts)?.[0]?.ts;
              if (latestTs) {
                setHorizon(latestTs);
                sinceTs = latestTs;
              }
              const alerts = events?.filter(it => it.type === "Alert");
              if (alerts?.length > 0) {
                const prev = JSON.parse(JSON.stringify(valuesV2Ref.current));
                const updated = [...prev.alerts, ...(alerts?.map(it => it.data))];
                const uniqueUpdated = [];
                for (const entry of updated) {
                  if (!uniqueUpdated.some(x => (entry.utcTs === x.utcTs) && (entry.userId === x.userId))) { uniqueUpdated.push(entry) }
                }
                setValuesV2({
                  ...prev,
                  alerts: uniqueUpdated,
                });
              }
              valuesV2Ref.current?.members?.forEach(member => {
                const memberEvents = events?.filter(it => it.userId?.toString() === member.userId.toString());
                const latestHeartRate = memberEvents?.filter(it => it.type === "HeartRate")
                  ?.sort((a, b) => new Date(b.data.utcTs).getTime() - new Date(a.data.utcTs).getTime())?.[0]?.data;

                // update member's devices list
                const memberDeviceLogs = memberEvents?.filter(it => it.type === "DeviceLog");
                const latestDeviceLog = memberDeviceLogs
                  ?.sort((a, b) => new Date(b.data.utcTs).getTime() - new Date(a.data.utcTs).getTime())?.[0]?.data;

                if (memberDeviceLogs?.length > 0) {
                  const devicesTemp = JSON.parse(JSON.stringify(valuesV2Ref.current?.devices));
                  const devicesMemberIndex = devicesTemp.findIndex(it => it.userId?.toString() === member.userId?.toString()) ?? [];
                  const memberDeviceLogsData = memberDeviceLogs?.map(it => ({...it.data, ts: it.data?.utcTs}));
                  let memberDevices = [];
                  if (devicesMemberIndex !== -1) {
                    memberDevices = devicesTemp[devicesMemberIndex].devices ?? [];
                  }
                  // fixme I assumed all device logs as kenzen device logs
                  memberDeviceLogsData?.forEach(it => {
                    const index = memberDevices.findIndex(ele => ele.deviceId === it.deviceId)
                    if (index !== -1) {
                      memberDevices.splice(index, 1, {...it, type: 'kenzen'});
                    } else {
                      memberDevices.push({...it, type: 'kenzen'});
                    }
                  })
                  if (devicesMemberIndex !== -1) {
                    devicesTemp.splice(devicesMemberIndex, 1, {userId: member.userId, devices: memberDevices});
                  } else {
                    devicesTemp.push({userId: member.userId, devices: memberDevices});
                  }
                  setValuesV2({
                    ...valuesV2Ref.current,
                    devices: devicesTemp,
                  });
                }

                const latestTempHumidity = memberEvents?.filter(it => it.type === "TempHumidity")
                  ?.sort((a, b) => new Date(b.data.utcTs).getTime() - new Date(a.data.utcTs).getTime())?.[0]?.data;
                const prev = JSON.parse(JSON.stringify(valuesV2Ref.current));
                const statIndex = prev.stats?.findIndex(it => it.userId?.toString() === member?.userId?.toString());
                if (statIndex !== -1) {
                  const temp = JSON.parse(JSON.stringify(prev.stats));
                  const newEle = {
                    batteryPercent: latestDeviceLog ? latestDeviceLog?.batteryPercent : temp[statIndex].batteryPercent,
                    chargingFlag: latestDeviceLog ? latestDeviceLog?.charging : temp[statIndex].chargingFlag,
                    cbtAvg: latestHeartRate ? latestHeartRate?.heartCbtAvg : temp[statIndex].cbtAvg,
                    deviceId: latestDeviceLog ? latestDeviceLog?.deviceId : temp[statIndex].deviceId,
                    deviceLogTs: latestDeviceLog ? latestDeviceLog?.utcTs : temp[statIndex].deviceLogTs,
                    heartRateAvg: latestHeartRate ? latestHeartRate?.heartRateAvg : temp[statIndex].heartRateAvg,
                    heartRateTs: latestHeartRate ? latestHeartRate?.utcTs : temp[statIndex].heartRateTs,
                    onOffFlag: latestDeviceLog ? latestDeviceLog?.onOff : temp[statIndex].onOffFlag,
                    skinTemp: latestTempHumidity ? latestTempHumidity?.skinTemp : temp[statIndex].skinTemp,
                    tempHumidityTs: latestTempHumidity ? latestTempHumidity?.utcTs : temp[statIndex].tempHumidityTs,
                    userId: member.userId,
                  };
                  temp.splice(statIndex, 1, newEle);
                  setValuesV2({
                    ...prev,
                    stats: temp,
                  });
                }
              });
            }
          } else if (res.status?.toString() === "204") {
            // when there is no updates
          }
        })
        .catch(error => {
          console.error("subscribe error", error);
          // fixme check what possible error codes can be
          subscribeAgain = false;
        })
        .finally(() => {
          subscribeAgain && subscribe(sinceTs, cancelToken);
          forceUpdate();
          setCount(prev => (prev + 1) % 100);
        });
    }
  }
  const startTimeout = () => {
    timeout = setTimeout(() => {
      fetch();
    }, timeoutCycle);
  };
  const fetch = () => {
    if (team.value) {
      fetchTeamStats(team.value);
      fetchTeamAlerts(team.value);
    } else {
      clearTimeout(timeout);
    }
  };
  const fetchTeamMembers = id => {
    setLoading(true);
    queryTeamMembers(id)
      .then(res => {
        setValues(prev => ({
          ...prev,
          members: res.data?.members ? res.data?.members?.filter(it => it.teamId?.toString() === team.value?.toString())?.sort((a, b) => {
            if (a?.["lastName"]?.localeCompare(b?.["lastName"]) !== 0) {
              return a?.["lastName"]?.localeCompare(b?.["lastName"]);
            } else if (a?.["firstName"]?.localeCompare(b?.["firstName"]) !== 0) {
              return a?.["firstName"]?.localeCompare(b?.["firstName"]);
            } else {
              return a?.email?.localeCompare(b?.email);
            }
          }) : [],
        }));
      })
      .catch(e => {
        // todo show error
        console.error(e);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  // eslint-disable-next-line no-unused-vars
  const fetchTeamStats = id => {
    getTeamStats(id)
      .then(res => {
        setValues(prev => ({
          ...prev,
          stats: res.data?.length > 0 ? res.data : [],
        }));
      })
      .catch(e => {
        // todo show error
        console.error(e);
      });
  };
  // eslint-disable-next-line no-unused-vars
  const fetchTeamAlerts = (id) => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const since = d.toISOString();
    getTeamAlerts(id, since)
      .then(res => {
        setValues(prev => ({
          ...prev,
          alerts: res.data?.length > 0 ? res.data : [],
        }));
      })
      .catch(e => {
        console.error(e);
        // todo show error
      })
      .finally(() => {
        startTimeout();
      });
  };

  const formatDevice4Digits = str => {
    const splits = str?.split(":");
    const lastTwo = splits?.slice(-2);
    return lastTwo?.length === 2 ? `Kenzen_${lastTwo.join("")}` : '';
  }

  const formatConnectionStatusV2 = (
    {
      flag,
      deviceId,
      connected,
      stat,
      alert,
    }) => {
    if (!deviceId || deviceId?.toString().includes("none")) { // if no device
      return {
        label: t("never connected"),
        value: 1,
      };
    }
    if (stat?.chargingFlag) {
      return {
        label: t("charging"),
        value: 2,
      };
    }

    if (flag && connected) {
      if (
        numMinutesBetween(new Date(), new Date(alert?.utcTs)) <= 60 ||
        numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 60
      ) {
        if (numMinutesBetween(new Date(), new Date(stat?.deviceLogTs)) <= 30) {
          return {
            label: t('device connected'),
            value: 3,
          };
        } else {
          return {
            label: t('limited connectivity'),
            value: 4,
          };
        }
      } else if (
        numMinutesBetween(new Date(), new Date(alert?.utcTs)) > 60 &&
        numMinutesBetween(new Date(), new Date(alert?.utcTs)) <= 90 &&
        numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) > 60 &&
        numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 90
      ) {
        return {
          label: t('limited connectivity'),
          value: 4,
        };
      } else if (
        (
          numMinutesBetween(new Date(), new Date(alert?.utcTs)) > 90 &&
          numMinutesBetween(new Date(), new Date(alert?.utcTs)) <= 120
        ) ||
        numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 120
      ) {
        return {
          label: t('no connection'),
          value: 7,
        };
      } else {
        return {
          label: t('no connection'),
          value: 8,
        };
      }
    }

    if (!flag) {
      if (numMinutesBetween(new Date(), new Date(stat?.deviceLogTs)) <= 30) {
        return {
          label: t('no connection'),
          value: 7,
        };
      } else {
        return {
          label: t('no connection'),
          value: 8,
        };
      }
    }

    if (
      !connected
    ) {
      if (numMinutesBetween(new Date(), new Date(stat?.deviceLogTs)) <= 30) {
        return {
          label: t('no connection'),
          value: 7,
        };
      } else {
        return {
          label: t('no connection'),
          value: 8,
        };
      }
    }

    return {
      label: t('no connection'),
      value: 8,
    };
  }

  const formatConnectionStatus = date => {
    if (date) {
      if (numMinutesBetween(new Date(), new Date(date)) > 15) {
        {
          return {
            label: t('no network'),
            value: 1,
          };
        }
      } else {
        return {
          label: t('connected'),
          value: 2,
        };
      }
    } else {
      return {
        label: t('device is off'),
        value: 3,
      };
    }
  }

  const formatLastSync = lastTimestamp => {
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
  }

  const formatAlert = stageId => {
    if (!stageId) {
      return {
        label: "Safe",
        value: 5,
      };
    }

    switch (stageId?.toString()) {
      case "1":
        return {
          label: "At Risk",
          value: 1,
        };
      case "2":
        return {
          label: "Elevated Risk",
          value: 2,
        };
      case "3":
        return {
          label: "Safe",
          value: 3,
        };
      case "4":
        return {
          label: "Safe",
          value: 4,
        };
      default:
        return {
          label: "N/A",
          value: null,
        };
    }
  }

  const formatAlertForDetail = stageId => {
    switch (stageId?.toString()) {
      case "1":
        return "At Risk, Stop Work";
      case "2":
        return "Elevated Risk, Stop Work";
      case "3":
        return "Safe, Return to Work";
      case "4":
        return "Alert Reset";
      default:
        return "N/A";
    }
  }

  const formatHeartCbt = cbt => {
    if ([null, undefined, "0", ""].includes(cbt?.toString())) {
      return "--";
    }
    if (metric) {
      return cbt.toFixed(1);
    } else {
      return celsiusToFahrenheit(cbt);
    }
  }

  const formatHeartRate = rate => {
    if ([null, undefined, "0", ""].includes(rate?.toString())) {
      return "--";
    }
    return Math.ceil(parseFloat(rate));
  }

  const getHeartRateZone = (birthday, heartRate) => {
    if (!heartRate) {
      return {
        label: null,
        value: null,
      }
    }
    const arr = birthday?.split("-");
    if (arr?.length === 3) {
      const ageDifMs = Date.now() - new Date(arr[0], parseInt(arr[1]) - 1, arr[2]).getTime();
      const ageDate = new Date(ageDifMs); // milliseconds from epoch
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      const maxHR = 208 - (0.7 * age);
      if (heartRate <= 0.57 * maxHR) {
        return {
          label: t("very light"),
          value: 1,
        };
      } else if (heartRate <= 0.64 * maxHR) {
        return {
          label: t('light'),
          value: 2,
        };
      } else if (heartRate <= 0.75 * maxHR) {
        return {
          label: t("moderate"),
          value: 3,
        };
      } else {
        return {
          label: t('high'),
          value: 4,
        };
      }
    }

    return {
      label: null,
      value: null,
    }
  }

  const formattedTeams = React.useMemo(() => {
    const ret = [];
    teams?.forEach(team => {
      if (isAdmin) {
        if (organization) {
          if (team?.orgId?.toString() === organization?.toString()) {
            ret.push({
              value: team.id,
              label: team.name,
            });
          }
        }
      } else {
        ret.push({
          value: team.id,
          label: team.name,
        });
      }
    });

    return ret;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, teams]);

  const formattedOrganizations = React.useMemo(() => {
    return organizations?.map(organization => (
      {
        value: organization.id,
        label: organization.name,
        country: organization.country,
      }
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizations]);

  const trimmedKeyword = React.useMemo(() => keyword.trim(), [keyword]);

  React.useEffect(() => {
    updateUrlParam({param: {key: 'keyword', value: trimmedKeyword}});
    localStorage.setItem("kop-params", location.search);
    setPage(1);
  }, [trimmedKeyword]);

  const filteredMembers = React.useMemo(() => {
    return formattedMembers?.filter(it => {
      if (["", null, undefined].includes(trimmedKeyword)) {
        return true;
      }
      return it.firstName?.toLowerCase()?.includes(trimmedKeyword?.toLowerCase()) ||
        it.lastName?.toLowerCase()?.includes(trimmedKeyword?.toLowerCase()) ||
        it.email?.toLowerCase()?.includes(trimmedKeyword?.toLowerCase());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedMembers, trimmedKeyword]);

  const paginatedMembers = React.useMemo(() => {
    return filteredMembers?.slice(((page - 1) * sizePerPage), (page * sizePerPage))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredMembers, page]);

  React.useEffect(() => {
    if (member) {
      const updatedMember = paginatedMembers?.find(it => it.userId?.toString() === member?.userId?.toString());
      setMember(updatedMember);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginatedMembers]);

  const removeMembersFromView = userIds => {
    const filtered = valuesV2.members?.filter(it => userIds?.every(ele => ele.toString() !== it.userId?.toString()));
    setValuesV2({
      ...valuesV2,
      members: filtered,
    });
  };

  const removeMember = async members => {
    return new Promise((resolve) => {
      const removeObj = [];
      members?.forEach(member => {
        const index = removeObj?.findIndex(it => it.teamId?.toString() === member.teamId?.toString());
        if (index !== -1) {
          removeObj.splice(index, 1,  {
            ...removeObj[index],
            emails: [...removeObj[index].emails, member.email],
          })
        } else {
          removeObj.push({
            teamId: member.teamId,
            emails: [member.email],
          });
        }
      });
      if (removeObj.length > 0) {
        const promises = removeObj.map(it => inviteTeamMember(it.teamId, {remove: it.emails}));
        setLoading(true);
        let cnt = 0;
        Promise.allSettled(promises)
          .then(results => {
            results?.forEach(result => {
              if (result.status === "fulfilled") {
                cnt += result.value?.data?.removed?.length;
                setValuesV2({
                  ...valuesV2Ref.current,
                  members: valuesV2Ref.current.members?.filter(it => !(result.value?.data?.removed?.includes(it.email))),
                })
              }
            });
          })
          .finally(() => {
            setLoading(false);
            resolve({cnt});
          });
      }
    });
  }

  const moveMember = async (members, teamId) => {
    if (!teamId)
      return;

    return new Promise((resolve, reject) => {
      const addObj = [];
      members?.forEach(member => {
        if (member.teamId?.toString() !== teamId?.toString()) { // check if user from another team
          const userTypes = [USER_TYPE_OPERATOR];
          if (member.teams?.some(it => it.teamId?.toString() === teamId?.toString())) { // check if user is a team admin
            userTypes.push(USER_TYPE_TEAM_ADMIN);
          }
          addObj.push({
            email: member.email,
            userTypes,
            userId: member.userId,
          });
        } else {
          addNotification(
            t('msg user already on the team', {user: `${member.firstName} ${member.lastName}`}),
            'success',
          );
        }
      });
      if (addObj.length > 0) {
        setLoading(true);
        inviteTeamMember(teamId, {
          add: addObj,
        })
          .then(() => {
            if (pickedTeams?.every(it => it.toString() !== teamId.toString())) {
              const userIdsToRemove = addObj.map(it => it.userId);
              removeMembersFromView(userIdsToRemove);
            }
            setVisibleMemberModal(false);
            setMember(null);
            resolve();
          })
          .catch(e => {
            addNotification(
              e.response?.data?.message,
              'error',
            );
            reject(e);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  }

  const providerValue = {
    teams,
    team,
    setTeam,
    pickedTeams,
    setPickedTeams,
    organization,
    setOrganization,
    values: multiMode ? valuesV2Ref.current : values,
    setMember,
    setVisibleMemberModal,
    formattedTeams,
    formattedOrganizations,
    isAdmin,
    setMultiMode,
    formattedMembers,
    filteredMembers,
    paginatedMembers,
    filter,
    setFilter,
    page,
    setPage,
    sizePerPage,
    keyword,
    setKeyword,
    formatDevice4Digits,
    formatConnectionStatus,
    formatAlert,
    formatAlertForDetail,
    formatLastSync,
    formatHeartCbt,
    formatHeartRate,
    getHeartRateZone,
    formatConnectionStatusV2,
    removeMembersFromView,
    moveMember,
    setRefreshCount,
    removeMember,
  };

  return (
    <DashboardContext.Provider value={providerValue}>
      {children}
      <MemberDetail
        data={member}
        open={visibleMemberModal}
        closeModal={() => setVisibleMemberModal(false)}
      />
    </DashboardContext.Provider>
  );
};

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
});

export const DashboardProvider = connect(
  mapStateToProps,
  null,
)(withTranslation()(DashboardProviderDraft));

export const useDashboardContext = () => {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardContext must be used within DashboardProvider");
  }
  return context;
};