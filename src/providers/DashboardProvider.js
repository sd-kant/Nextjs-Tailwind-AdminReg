import * as React from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
  getTeamAlerts,
  getTeamDevices,
  getTeamStats, inviteTeamMember,
  queryAllOrganizations,
  queryTeamMembers,
  queryTeams,
  subscribeDataEvents, unlockUser
} from "../http";
import axios from "axios";
import {
  getLatestDateBeforeNow as getLatestDate,
  getParamFromUrl,
  numMinutesBetweenWithNow as numMinutesBetween,
  updateUrlParam,
} from "../utils";
import {withTranslation} from "react-i18next";
import {get} from "lodash";
import {USER_TYPE_ADMIN, USER_TYPE_OPERATOR, USER_TYPE_ORG_ADMIN, USER_TYPE_TEAM_ADMIN} from "../constant";
import useForceUpdate from "../hooks/useForceUpdate";
import {useNotificationContext} from "./NotificationProvider";
import {formatLastSync, sortMembers} from "../utils/dashboard";
import {setLoadingAction} from "../redux/action/ui";
import {useUtilsContext} from "./UtilsProvider";

const DashboardContext = React.createContext(null);

const DashboardProviderDraft = (
  {
    children,
    setLoading,
    userType,
    t,
  }) => {
  const [isAdmin, setIsAdmin] = React.useState(false);

  const sortBy = getParamFromUrl('sortBy');
  const sortDirection = getParamFromUrl('sortDirection');
  const keywordInUrl = getParamFromUrl('keyword');
  const organizationInUrl = getParamFromUrl("organization");
  const teamsInUrl = getParamFromUrl('teams');

  const [organizations, setOrganizations] = React.useState([]);
  const [organization, setOrganization] = React.useState(organizationInUrl ?? null);
  const [teams, setTeams] = React.useState([]);
  const [pickedTeams, setPickedTeams] = React.useState(teamsInUrl ? teamsInUrl.split(',') : []);

  const [member, setMember] = React.useState(null);
  const [visibleMemberModal, setVisibleMemberModal] = React.useState(false);

  const [refreshCount, setRefreshCount] = React.useState(0);
  const [filter, setFilter] = React.useState(sortBy ? {[sortBy]: parseInt(sortDirection)} : {});
  const [page, setPage] = React.useState(null);
  const [sizePerPage] = React.useState(10);
  const [keyword, setKeyword] = React.useState(keywordInUrl ?? "");
  const trimmedKeyword = React.useMemo(() => keyword.trim(), [keyword]);
  const [count, setCount] = React.useState(0);

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
  const [horizon, _setHorizon] = React.useState(null);
  const horizonRef = React.useRef(horizon);
  const setHorizon = v => {
    horizonRef.current = v;
    _setHorizon(v);
  };

  const {addNotification} = useNotificationContext();
  const {formatAlert, formatConnectionStatusV2} = useUtilsContext();

  const forceUpdate = useForceUpdate();

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
    updateUrlParam({param: {key: 'keyword', value: trimmedKeyword}});
    localStorage.setItem("kop-params", location.search);
    setPage(1);
  }, [trimmedKeyword]);

  React.useEffect(() => {
    setIsAdmin(userType?.some(it => [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].includes(it)));
  }, [userType]);

  React.useEffect(() => {
    if (isAdmin) {
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
    }
  }, [isAdmin]);

  React.useEffect(() => {
    updateUrlParam({param: {key: 'organization', value: organization}});
    localStorage.setItem("kop-params", location.search);
  }, [organization]);

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
  }, [organization, teams, isAdmin]);

  React.useEffect(() => {
    if (formattedTeams?.length > 0) {
      const validPickedTeams = pickedTeams?.filter(ele => formattedTeams?.some(it => it.value?.toString() === ele.toString()));
      updateUrlParam({param: {key: 'teams', value: validPickedTeams?.toString()}});
      localStorage.setItem("kop-params", location.search);

      if (validPickedTeams?.length !== pickedTeams?.length) {
        setPickedTeams(validPickedTeams);
      } else {
        setPage(null);
        setValuesV2({
          members: [],
          alerts: [],
          stats: [],
          devices: [],
        });
        const source = axios.CancelToken.source();
        if (validPickedTeams?.length > 0) {
          const membersPromises = [];
          const statsPromises = [];
          const alertsPromises = [];
          const devicePromises = [];
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          // d.setDate(d.getDate() - 1);
          // todo filter daily alerts every time you got response from subscribe
          const since = d.toISOString();
          validPickedTeams.forEach(team => {
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
                      const operators = result.value?.data?.members?.filter(it => it.teamId?.toString() === validPickedTeams?.[index]?.toString()) ?? [];
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
                        if (!uniqueUpdated.some(x => (entry.utcTs === x.utcTs) && (entry.userId === x.userId))) {
                          uniqueUpdated.push(entry)
                        }
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
              // fixme there might be new events between the time when api returned and now
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
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedTeams, refreshCount, formattedTeams]);

  const formattedOrganizations = React.useMemo(() => {
    return organizations?.map(organization => (
      {
        value: organization.id,
        label: organization.name,
        country: organization.country,
      }
    ));
  }, [organizations]);

  const formattedMembers = React.useMemo(() => {
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
      });
    });

    return sortMembers({arrOrigin: arr, filter})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuesV2.members, valuesV2.alerts, valuesV2.stats, valuesV2.devices, filter, count]);

  const filteredMembers = React.useMemo(() => {
    return formattedMembers?.filter(it => {
      if (it.hidden) {
        return false;
      }
      if (["", null, undefined].includes(trimmedKeyword)) {
        return true;
      }
      return it.firstName?.toLowerCase()?.includes(trimmedKeyword?.toLowerCase()) ||
        it.lastName?.toLowerCase()?.includes(trimmedKeyword?.toLowerCase()) ||
        it.email?.toLowerCase()?.includes(trimmedKeyword?.toLowerCase());
    });
  }, [formattedMembers, trimmedKeyword]);

  const paginatedMembers = React.useMemo(() => {
    return filteredMembers?.slice(((page - 1) * sizePerPage), (page * sizePerPage))
  }, [filteredMembers, page, sizePerPage]);

  React.useEffect(() => {
    if (member) {
      const updatedMember = paginatedMembers?.find(it => it.userId?.toString() === member?.userId?.toString());
      setMember(updatedMember);
    }
  }, [paginatedMembers, member]);

  const subscribe = React.useCallback((ts, cancelToken) => {
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
                  if (!uniqueUpdated.some(x => (entry.utcTs === x.utcTs) && (entry.userId === x.userId))) {
                    uniqueUpdated.push(entry)
                  }
                }
                setValuesV2({
                  ...prev,
                  alerts: uniqueUpdated,
                });
              }

              let valuesV2Temp = JSON.parse(JSON.stringify(valuesV2Ref.current));

              valuesV2Temp?.members?.forEach(member => {
                const memberEvents = events?.filter(it => it.userId?.toString() === member.userId.toString());
                const latestHeartRate = memberEvents?.filter(it => it.type === "HeartRate")
                  ?.sort((a, b) => new Date(b.data.utcTs).getTime() - new Date(a.data.utcTs).getTime())?.[0]?.data;

                // update member's devices list
                const memberDeviceLogs = memberEvents?.filter(it => it.type === "DeviceLog");
                const latestDeviceLog = memberDeviceLogs
                  ?.sort((a, b) => new Date(b.data.utcTs).getTime() - new Date(a.data.utcTs).getTime())?.[0]?.data;

                if (memberDeviceLogs?.length > 0) {
                  const devicesTemp = JSON.parse(JSON.stringify(valuesV2Temp?.devices));
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
                      memberDevices.splice(index, 1, {...it, type: 'kenzen', version: memberDevices[index].version});
                    } else {
                      memberDevices.push({...it, type: 'kenzen'});
                    }
                  })
                  if (devicesMemberIndex !== -1) {
                    devicesTemp.splice(devicesMemberIndex, 1, {userId: member.userId, devices: memberDevices});
                  } else {
                    devicesTemp.push({userId: member.userId, devices: memberDevices});
                  }

                  valuesV2Temp = {
                    ...valuesV2Temp,
                    devices: devicesTemp
                  };
                }

                const latestTempHumidity = memberEvents?.filter(it => it.type === "TempHumidity")
                  ?.sort((a, b) => new Date(b.data.utcTs).getTime() - new Date(a.data.utcTs).getTime())?.[0]?.data;
                const prev = JSON.parse(JSON.stringify(valuesV2Temp));
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
                  valuesV2Temp = {
                    ...valuesV2Temp,
                    stats: temp,
                  };
                }
              });

              setValuesV2(valuesV2Temp);
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
          console.log(`last signal received at ${new Date().toLocaleString()}`);
        });
    }
  }, [organization, pickedTeams, forceUpdate]);

  const removeMember = React.useCallback(async members => {
    return new Promise((resolve) => {
      const removeObj = [];
      members?.forEach(member => {
        const index = removeObj?.findIndex(it => it.teamId?.toString() === member.teamId?.toString());
        if (index !== -1) {
          removeObj.splice(index, 1, {
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
  }, [setLoading]);

  const moveMember = React.useCallback((members, teamId) => {
    const updateMembersFromView = (userIds, teamId) => {
      const updated = valuesV2Ref.current.members?.map(it => ({
        ...it,
        teamId: teamId,
      }));
      setValuesV2({
        ...valuesV2Ref.current,
        members: updated,
      });
    };
    const removeMembersFromView = userIds => {
      const filtered = valuesV2Ref.current.members?.map(it => !(userIds?.some(ele => ele.toString() === it.userId?.toString())) ? it : {
        ...it,
        hidden: true
      });
      setValuesV2({
        ...valuesV2Ref.current,
        members: filtered,
      });
    };

    return new Promise((resolve, reject) => {
      if (!teamId)
        reject("teamId not set");

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
            const userIdsToProcess = addObj.map(it => it.userId);
            if (pickedTeams?.every(it => it.toString() !== teamId.toString())) {
              removeMembersFromView(userIdsToProcess);
              updateMembersFromView(userIdsToProcess, teamId);
            } else {
              updateMembersFromView(userIdsToProcess, teamId);
            }
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
  }, [setLoading, t, pickedTeams, addNotification]);

  const unlockMember = React.useCallback(member => {
    return new Promise((resolve, reject) => {
      if (member?.locked && member?.userId && member?.teamId) {
        setLoading(true)
        unlockUser({
          teamId: member?.teamId,
          userId: member?.userId,
        })
          .then(() => {
            const updated = valuesV2Ref.current.members?.map(it => it.userId?.toString() === member?.userId?.toString() ? ({...it, locked: false}) : it);
            setValuesV2({
              ...valuesV2Ref.current,
              members: updated,
            });
            resolve();
          })
          .catch(e => {
            console.error("unlock user error", e);
            reject(e);
          })
          .finally(() => setLoading(false));
      } else {
        reject("not able to unlock");
      }
    })

  }, [setLoading]);

  const providerValue = {
    pickedTeams,
    setPickedTeams,
    organization,
    setOrganization,
    values: valuesV2Ref.current,
    member,
    setMember,
    visibleMemberModal,
    setVisibleMemberModal,
    formattedTeams,
    formattedOrganizations,
    isAdmin,
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
    moveMember,
    setRefreshCount,
    removeMember,
    unlockMember,
  };

  return (
    <DashboardContext.Provider value={providerValue}>
      {children}
    </DashboardContext.Provider>
  );
};

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
    },
    dispatch
  );

export const DashboardProvider = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation()(DashboardProviderDraft));

export const useDashboardContext = () => {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardContext must be used within DashboardProvider");
  }
  return context;
};