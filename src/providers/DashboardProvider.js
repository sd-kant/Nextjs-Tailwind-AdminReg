import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  getAlertsByTeamIDs,
  getDevicesByTeamIds,
  getStatsByTeamIds,
  inviteTeamMemberV2,
  queryAllOrganizations,
  queryMembersByTeamIds,
  queryTeams,
  subscribeDataEvents,
  unlockUser,
  updateUserByAdmin
} from '../http';
import axios, { HttpStatusCode } from 'axios';
import {
  getLastDigitsOfDeviceId,
  hasStatusValue,
  updateUrlParam
} from '../utils';
import { withTranslation } from 'react-i18next';
import _, { get, unionBy } from 'lodash';
import {
  ACME_INSTANCE_BASE_URI,
  ALERT_STAGE_ID_LIST,
  ALERT_STAGE_STATUS,
  DASHBOARD_TEAMS_CHUNK_SIZE,
  DEMO_DATA_MINUTE,
  DEVICE_CONNECTION_STATUS,
  EVENT_DATA_TYPE,
  HEAT_SUSCEPTIBILITY_PRIORITIES,
  PRIORITIES,
  STAGE_VALUES,
  USER_TYPE_ADMIN,
  USER_TYPE_OPERATOR,
  USER_TYPE_ORG_ADMIN,
  USER_TYPE_TEAM_ADMIN
} from '../constant';
import useForceUpdate from '../hooks/useForceUpdate';
import { useNotificationContext } from './NotificationProvider';
import * as dashboardUtils from '../utils/dashboard';
import { setLoadingAction } from '../redux/action/ui';
import { useUtilsContext } from './UtilsProvider';
import { TEAM_ALERT_API_DATA, TEAM_DEVICE_API_DATA } from '../constant/demoDashboard';
import moment from 'moment';

const DashboardContext = React.createContext(null);

const DashboardProviderDraft = ({ children, setLoading, userType, t, myOrganization, baseUri }) => {
  const {
    sortBy, sortDirection, keywordInUrl, organizationInUrl, teamsInUrl
  } = dashboardUtils.getUrlParams();

  const [organizations, setOrganizations] = React.useState([]);
  const [organization, setOrganization] = React.useState(organizationInUrl ?? null);
  const [teams, setTeams] = React.useState([]);
  const [pickedTeams, setPickedTeams] = React.useState(teamsInUrl ? teamsInUrl.split(',') : []);

  const [selectedMember, setSelectedMember] = React.useState(null);
  const [visibleMemberModal, setVisibleMemberModal] = React.useState(false);

  const [refreshCount, setRefreshCount] = React.useState(0);
  const [filter, setFilter] = React.useState(
    sortBy ? { [sortBy]: parseInt(sortDirection) } : { heatRisk: 1 }
  );
  const [page, setPage] = React.useState(null);
  const [sizePerPage, setSizePerPage] = React.useState(10);
  const [keyword, setKeyword] = React.useState(keywordInUrl ?? '');
  const trimmedKeyword = React.useMemo(() => keyword?.trim(), [keyword]);
  const [count, setCount] = React.useState(0);
  const [formattedMembers, setFormattedMembers] = React.useState([]);

  const [members, _setMembers] = React.useState([]);
  const membersRef = React.useRef([]);
  const setMembers = (v) => {
    membersRef.current = v;
    _setMembers(v);
  };
  const [alerts, _setAlerts] = React.useState([]);
  const alertsRef = React.useRef([]);
  const setAlerts = (v) => {
    alertsRef.current = v;
    _setAlerts(v);
  };
  const [stats, _setStats] = React.useState([]);
  const statsRef = React.useRef([]);
  const setStats = (v) => {
    statsRef.current = v;
    _setStats(v);
  };
  const [devices, _setDevices] = React.useState([]);
  const devicesRef = React.useRef([]);
  const setDevices = (v) => {
    devicesRef.current = v;
    _setDevices(v);
  };

  const [horizon, _setHorizon] = React.useState(null);
  const horizonRef = React.useRef(horizon);
  const setHorizon = (v) => {
    horizonRef.current = v;
    _setHorizon(v);
  };

  const { addNotification } = useNotificationContext();
  const { formatAlert, formatConnectionStatusV2 } = useUtilsContext();

  const forceUpdate = useForceUpdate();

  const intervalDemoDataRef = React.useRef(0);
  const demoEventData = React.useRef(null);

  const numMinutesDemoData = React.useRef(0);
  const [worker, setWorker] = React.useState(null);
  const [workerForEvents, setWorkerForEvents] = React.useState(null);


  React.useEffect(() => {
    // Create a new Web Worker instance when the component mounts
    const newWorker = new Worker(new URL('./worker.js', import.meta.url));
    const newWorkerForEvents = new Worker(new URL('./workerForEvents.js', import.meta.url));
    
    // Set up a listener for messages from the worker
    newWorker.onmessage = function (e) {
      setFormattedMembers(e.data);
    };

    newWorkerForEvents.onmessage = function(e) {
      const data = e.data;
      if(data.alerts) setAlerts(data.alerts);
      if(data.members) setMembers(data.members);
      if(data.stats) setStats(data.stats);
      if(data.devices) setDevices(data.devices);
    };

    setWorker(newWorker);
    setWorkerForEvents(newWorkerForEvents);

    // Clean up the worker when the component unmounts
    return () => {
      newWorker.terminate();
      newWorkerForEvents.terminate();
    };
  }, []);

  const generateDemoData = () => {
    // ...
    let tempAlerts = [],
      tempDevices = [];
    const currentTIme = new Date().getTime();

    tempAlerts = _.chain(TEAM_ALERT_API_DATA)
      .filter((it) => {
        const ts = it.ts(numMinutesDemoData.current);
        if (numMinutesDemoData.current === 0) {
          return (
            ts !== DEMO_DATA_MINUTE.NONE &&
            [
              DEMO_DATA_MINUTE.WITHIN_AN_HOUR,
              DEMO_DATA_MINUTE.WITHIN_24_HR,
              DEMO_DATA_MINUTE.OUT_AN_HOUR
            ].includes(ts)
          );
        } else {
          return ts !== DEMO_DATA_MINUTE.NONE;
        }
      })
      .map((it) => {
        const type = it.ts(numMinutesDemoData.current);
        let ts = moment();
        switch (type) {
          case DEMO_DATA_MINUTE.FIRST:
            ts.subtract(30, 'seconds');
            break;
          case DEMO_DATA_MINUTE.FIFTH:
            ts.subtract(1, 'minutes');
            break;
          case DEMO_DATA_MINUTE.FULL_CYCLE:
            ts.subtract(2, 'minutes');
            break;
          case DEMO_DATA_MINUTE.WITHIN_AN_HOUR:
            ts.subtract(40, 'minutes');
            break;
          case DEMO_DATA_MINUTE.WITHIN_24_HR:
            ts.subtract(20, 'hours');
            break;
          case DEMO_DATA_MINUTE.OUT_AN_HOUR:
            ts.subtract(70, 'minutes');
            break;
        }

        return {
          ...it,
          ts: undefined,
          utcTs: ts.toISOString(),
          alertStageId:
            typeof it.alertStageId === 'function' ? it.alertStageId(type) : it.alertStageId,
          heartCbtAvg: typeof it.heartCbtAvg === 'function' ? it.heartCbtAvg(type) : it.heartCbtAvg,
          heartRateAvg:
            typeof it.heartRateAvg === 'function' ? it.heartRateAvg(type) : it.heartRateAvg
        };
      })
      .groupBy('userId')
      .map((items, userId) => {
        return {
          userId: parseInt(userId),
          data: items[0],
          ts: currentTIme,
          type: EVENT_DATA_TYPE.ALERT
        };
      })
      .value();

    tempDevices = _.chain(TEAM_DEVICE_API_DATA)
      .map((it) => {
        let ts = moment();
        switch (it.utcTs) {
          case DEMO_DATA_MINUTE.WITHIN_20_MINUTES:
            ts.subtract(13, 'minutes');
            break;
          case DEMO_DATA_MINUTE.OUT_20_MINUTES:
            ts.subtract(25, 'minutes');
            break;
          case DEMO_DATA_MINUTE.OUT_24_HR:
            ts.subtract(30, 'hours');
        }
        const stat = statsRef.current?.find((d) => d.userId === it.userId);
        return { ...it, utcTs: ts.toISOString(), deviceId: stat?.deviceId };
      })
      .groupBy('userId')
      .map((items, userId) => {
        return {
          userId: parseInt(userId),
          data: items[0],
          type: EVENT_DATA_TYPE.DEVICE_LOG,
          ts: currentTIme
        };
      })
      .value();

    demoEventData.current = [
      ...tempAlerts,
      ...tempAlerts.map((it) => {
        return { ...it, type: EVENT_DATA_TYPE.HEART_RATE };
      }),
      ...tempDevices
    ];

    numMinutesDemoData.current = numMinutesDemoData.current + 1;
  };
  // Querying Teams, sorting by name
  React.useEffect(() => {
    queryTeams()
      .then((res) => {
        const allTeams = res.data;
        allTeams.sort((a, b) => {
          return a.name?.toLowerCase() > b.name?.toLowerCase() ? 1 : -1;
        });
        setTeams(allTeams);
      })
      .catch((e) => {
        console.error('getting teams error', e);
        // todo show error
      });
  }, [refreshCount]);

  React.useEffect(() => {
    updateUrlParam({ param: { key: 'keyword', value: trimmedKeyword } });
    localStorage.setItem('kop-params', location.search);
    setPage(1);
  }, [trimmedKeyword]);

  const isAdmin = React.useMemo(() => {
    return userType?.some((it) => [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].includes(it));
  }, [userType])

  // Query all organizations, sorting by name
  React.useEffect(() => {
    if (isAdmin) {
      queryAllOrganizations()
        .then((res) => {
          const allOrganizations = res.data;
          allOrganizations.sort((a, b) => {
            return a.name?.toLowerCase() > b.name?.toLowerCase() ? 1 : -1;
          });
          setOrganizations(allOrganizations);
        })
        .catch((e) => {
          console.error('getting companies error', e);
          // todo show error
        });
    }
  }, [isAdmin, refreshCount]);

  // Set my organization if not Admin role.
  React.useEffect(() => {
    if (!isAdmin && myOrganization?.id) {
      setOrganization(myOrganization?.id);
    }
  }, [myOrganization?.id, isAdmin]);

  // Update organization query param whenever changing organization
  React.useEffect(() => {
    function startDemoData() {
      numMinutesDemoData.current = 0;
      const intervalId = setInterval(generateDemoData, 60 * 1000);
      intervalDemoDataRef.current = intervalId;
    }

    function stopDemoData() {
      const intervalId = intervalDemoDataRef.current;
      if (intervalId) clearInterval(intervalId);
    }

    updateUrlParam({ param: { key: 'organization', value: organization } });
    localStorage.setItem('kop-params', location.search);

    if (organization < 0) {
      startDemoData();
    } else {
      stopDemoData();
    }

    return () => {
      stopDemoData();
    };
  }, [organization]);

  const hideCbtHR = React.useMemo(() => {
    const item = organizations?.find((it) => it.id == Math.abs(organization));
    return item?.settings?.hideCbtHR;
  }, [organization, organizations]);

  //Update sortBy, sortDirection Query params whenever changing filter options
  React.useEffect(() => {
    const sortBy = Object.keys(filter)?.[0];
    let sortDirection = undefined;
    if (sortBy) {
      sortDirection = filter[sortBy];
    }
    updateUrlParam({ param: { key: 'sortBy', value: sortBy } });
    updateUrlParam({ param: { key: 'sortDirection', value: sortDirection } });
    localStorage.setItem('kop-params', location.search);
  }, [filter]);

  const formattedTeams = React.useMemo(() => {
    const ret = [];
    teams?.forEach((team) => {
      if (isAdmin) {
        if (organization > 0) {
          if (team?.orgId?.toString() === organization?.toString()) {
            ret.push({
              value: team.id,
              label: team.name
            });
          }
        } else if (baseUri?.includes(ACME_INSTANCE_BASE_URI) && organization < 0) {
          if (team?.orgId == Math.abs(organization)) {
            ret.push({
              value: team.id,
              label: team.name
            });
          }
        }
      } else {
        ret.push({
          value: team.id,
          label: team.name
        });
      }
    });

    return ret;
  }, [organization, teams, isAdmin, baseUri]);

  const selectedTeams = React.useMemo(() => {
    return formattedTeams?.filter((it) =>
      pickedTeams.some((ele) => ele.toString() === it.value?.toString())
    );
  }, [formattedTeams, pickedTeams]);

  const validPickedTeams = React.useMemo(() => {
      return pickedTeams?.filter((ele) =>
          formattedTeams?.some((it) => it.value?.toString() === ele.toString())
        );
    }, [formattedTeams, pickedTeams]
  );

  // Update teams Query params
  React.useEffect(() => {
    if (formattedTeams?.length === 1 && pickedTeams?.length === 0) {
      const teamId = formattedTeams[0].value?.toString();
      if (teamId) {
        updateUrlParam({ param: { key: 'teams', value: teamId } });
        setPickedTeams([teamId]);
        localStorage.setItem('kop-params', location.search);
      }
    }
  }, [formattedTeams, pickedTeams]);

  const formattedOrganizations = React.useMemo(() => {
    let orgs = organizations?.map((organization) => ({
      value: organization.id,
      label: organization.name,
      country: organization.country
    }));
    if (baseUri?.includes(ACME_INSTANCE_BASE_URI)) {
      let kenzenOrg = organizations?.find((org) => org.name == 'Kenzen');
      if (kenzenOrg) {
        orgs.push({
          value: -kenzenOrg.id,
          label: 'Demo Kenzen'
        });
      }
    }
    return orgs;
  }, [organizations, baseUri]);

  const selectedOrganization = React.useMemo(() => {
    return formattedOrganizations?.find((it) => it.value == organization);
  }, [formattedOrganizations, organization]);

  React.useEffect(() => {
    if (
      formattedOrganizations.length === 1 &&
      ['null', 'undefined', null, undefined].includes(organization)
    ) {
      setOrganization(formattedOrganizations[0].value);
      setPickedTeams([]);
    }
  }, [formattedOrganizations, organization]);

  React.useEffect(() => {
    if (worker) {
      worker.postMessage({
        members, alerts, stats, devices, teams: validPickedTeams, filter, constants: {
          ALERT_STAGE_STATUS, DEVICE_CONNECTION_STATUS, STAGE_VALUES, PRIORITIES, HEAT_SUSCEPTIBILITY_PRIORITIES
        }
      }); // Send the number to the worker
    }
  }, [members, alerts, stats, devices, filter, count, validPickedTeams, formatConnectionStatusV2, formatAlert, worker]);

  const filteredMembers = React.useMemo(() => {
    return formattedMembers?.filter((it) => {
      if (it.hidden) {
        return false;
      }
      if (['', null, undefined].includes(trimmedKeyword)) {
        return true;
      }
      const lowerCaseKeyword = trimmedKeyword?.toLowerCase();

      const isFirstValid =
        it.firstName?.toLowerCase()?.includes(lowerCaseKeyword) ||
        it.lastName?.toLowerCase()?.includes(lowerCaseKeyword) ||
        it.email?.toLowerCase()?.includes(lowerCaseKeyword) ||
        (!isNaN(lowerCaseKeyword) && it.userId == lowerCaseKeyword);
      if (isFirstValid) return true;

      return (
        lowerCaseKeyword.length >= 4 &&
        it.devices?.length > 0 &&
        !it.devices?.every((d) => d === '<none>') &&
        it.devices?.some(
          (d) =>
            getLastDigitsOfDeviceId(d).toLowerCase() ===
            getLastDigitsOfDeviceId(lowerCaseKeyword).toLowerCase()
        )
      );
    });
  }, [formattedMembers, trimmedKeyword]);

  const columnStats = React.useMemo(() => {
    let connectedUsers = 0;
    let notConnectedUsers = 0;
    let atRiskUsers = 0;
    let safeUsers = 0;
    let totalAlerts = 0;
    formattedMembers.forEach((member) => {
      if ([3, 4].includes(member.connectionObj?.value)) {
        connectedUsers++;
      } else {
        notConnectedUsers++;
      }
      if (!member.invisibleHeatRisk) {
        if ([1, 2].includes(member.alertObj?.value)) {
          atRiskUsers++;
        } else if ([3, 4, 5].includes(member.alertObj?.value)) {
          safeUsers++;
        }
      }
      totalAlerts += member.numberOfAlerts ?? 0;
    });

    return {
      connectedUsers,
      notConnectedUsers,
      atRiskUsers,
      safeUsers,
      totalAlerts
    };
  }, [formattedMembers]);

  const paginatedMembers = React.useMemo(() => {
    return filteredMembers?.slice((page - 1) * sizePerPage, page * sizePerPage);
  }, [filteredMembers, page, sizePerPage]);

  const updateDataFromEvents = React.useCallback(
    (events) => {
      if (events?.length > 0) {
        const latestTs = events?.sort((a, b) => b.ts - a.ts)?.[0]?.ts;
        if (latestTs) {
          setHorizon(latestTs);
        }
        if(workerForEvents){
          workerForEvents.postMessage({
            events,
            constants: {
              EVENT_DATA_TYPE, ALERT_STAGE_ID_LIST
            },
            alerts: alertsRef.current,
            members: membersRef.current,
            devices: devicesRef.current,
            stats: statsRef.current
          });
        }
      }
    },
    [alertsRef, membersRef, devicesRef, statsRef, workerForEvents]
  );

  const subscribe = React.useCallback(
    (ts, cancelToken) => {
      // fixme check whether the function that removes previous subscribe is correct
      //let sinceTs = horizonRef.current;
      if (pickedTeams?.length > 0) {
        let subscribeAgain = true;
        subscribeDataEvents({
          filter: {
            teamIds: pickedTeams ?? []
          },
          orgId: Math.abs(organization),
          horizon: ts,
          cancelToken
        })
          .then((res) => {
            if (organization > 0) {
              if (res.status?.toString() === '200') {
                // update data with events
                updateDataFromEvents(res.data);
              }
            }
          })
          .catch((error) => {
            console.error('subscribe error', error);
            // fixme check what possible error codes can be
            subscribeAgain = false;
          })
          .finally(() => {
            if (organization < 0) {
              //
              console.log('demo event data', demoEventData.current);
              updateDataFromEvents(demoEventData.current);
            }
            subscribeAgain && subscribe(horizonRef.current, cancelToken);
            forceUpdate();
            setCount((prev) => (prev + 1) % 100);
            console.log(`last signal received at ${new Date().toLocaleString()}`);
          });
      }
    },
    [organization, pickedTeams, forceUpdate, updateDataFromEvents]
  );

  const removeMember = React.useCallback(
    async (members) => {
      return new Promise((resolve) => {
        const removeObj = [];
        members?.forEach((member) => {
          const index = removeObj?.findIndex(
            (it) => it.teamId?.toString() === member.teamId?.toString()
          );
          if (index !== -1) {
            removeObj.splice(index, 1, {
              ...removeObj[index],
              ids: [...removeObj[index].ids, member.userId]
            });
          } else {
            removeObj.push({
              teamId: member.teamId,
              ids: [member.userId]
            });
          }
        });
        if (removeObj.length > 0) {
          const promises = removeObj.map((it) => inviteTeamMemberV2(it.teamId, { remove: it.ids }));
          setLoading(true);
          let cnt = 0;
          Promise.allSettled(promises)
            .then((results) => {
              results?.forEach((result) => {
                if (result.status === 'fulfilled') {
                  cnt += result.value?.data?.removed?.length;
                  setMembers( membersRef.current?.filter(
                      (it) => !result.value?.data?.removed?.includes(it.userId)
                    )
                  );
                }
              });
            })
            .finally(() => {
              setLoading(false);
              resolve({ cnt });
            });
        }
      });
    },
    [setLoading]
  );

  const moveMember = React.useCallback(
    (members, teamId) => {
      const updateMembersFromView = (userIds, teamId) => {
        const updated = membersRef.current?.map((it) => ({
          ...it,
          teamId: teamId
        }));
        setMembers(updated);
      };
      const removeMembersFromView = (userIds) => {
        const filtered = membersRef.current?.map((it) =>
          !userIds?.some((ele) => ele.toString() === it.userId?.toString())
            ? it
            : {
                ...it,
                hidden: true
              }
        );
        setMembers(filtered);
      };

      return new Promise((resolve, reject) => {
        if (!teamId) reject('teamId not set');

        const addObj = [];
        members?.forEach((member) => {
          if (member.teamId?.toString() !== teamId?.toString()) {
            // check if user from another team
            const userTypes = [USER_TYPE_OPERATOR];
            if (member.teams?.some((it) => it.teamId?.toString() === teamId?.toString())) {
              // check if user is a team admin
              userTypes.push(USER_TYPE_TEAM_ADMIN);
            }
            addObj.push({
              userTypes,
              userId: member.userId
            });
          } else {
            addNotification(
              t('msg user already on the team', { user: `${member.firstName} ${member.lastName}` }),
              'success'
            );
          }
        });
        if (addObj.length > 0) {
          setLoading(true);
          inviteTeamMemberV2(teamId, {
            add: addObj
          })
            .then(() => {
              const userIdsToProcess = addObj.map((it) => it.userId);
              if (pickedTeams?.every((it) => it.toString() !== teamId.toString())) {
                removeMembersFromView(userIdsToProcess);
                updateMembersFromView(userIdsToProcess, teamId);
              } else {
                updateMembersFromView(userIdsToProcess, teamId);
              }
              resolve();
            })
            .catch((e) => {
              addNotification(e.response?.data?.message, 'error');
              reject(e);
            })
            .finally(() => {
              setLoading(false);
            });
        }
      });
    },
    [setLoading, t, pickedTeams, addNotification]
  );

  const moveMemberToOrg = React.useCallback(
    (members, orgId) => {
      return new Promise((resolve, reject) => {
        if (!orgId) reject('orgId not set');

        const updateUserPromises = [];
        members?.forEach((member) => {
          if (member.orgId?.toString() !== orgId?.toString()) {
            updateUserPromises.push(
              updateUserByAdmin(member.orgId, member.userId, {
                orgId: orgId,
                teamId: null
              })
            );
          } else {
            addNotification(
              t('msg user already on the org', { user: `${member.firstName} ${member.lastName}` }),
              'success'
            );
          }
        });
        if (updateUserPromises.length > 0) {
          setLoading(true);
          let cnt = 0;
          Promise.allSettled(updateUserPromises)
            .then((results) => {
              results?.forEach((result) => {
                if (result.status === 'fulfilled') {
                  const userData = result.value?.data;
                  const member = membersRef.current?.find(
                    (m) => m.userId == userData.userId
                  );
                  member.orgId = userData.orgId;
                  member.teamId = userData.teamId;
                  cnt += 1;
                }
              });
              setMembers(
                membersRef.current
              );
              setCount((prev) => (prev + 1) % 100);
            })
            .catch((e) => {
              addNotification(e.response?.data?.message, 'error');
              reject(e);
            })
            .finally(() => {
              setLoading(false);
              resolve({ cnt });
            });
        }
      });
    },
    [setLoading, t, addNotification]
  );

  const unlockMember = React.useCallback(
    (member) => {
      return new Promise((resolve, reject) => {
        if (member?.locked && member?.userId && member?.teamId) {
          setLoading(true);
          unlockUser({
            teamId: member?.teamId,
            userId: member?.userId
          })
            .then(() => {
              const updated = membersRef.current?.map((it) =>
                it.userId?.toString() === member?.userId?.toString()
                  ? {
                      ...it,
                      locked: false
                    }
                  : it
              );
              setMembers( updated );
              resolve();
            })
            .catch((e) => {
              console.error('unlock user error', e);
              reject(e);
            })
            .finally(() => setLoading(false));
        } else {
          reject('not able to unlock');
        }
      });
    },
    [setLoading, membersRef]
  );

  // Load Initial Data
  React.useEffect(() => {

    let lazyLoadedTeamsCount = 0;
    const newVer = (source) => {
      if (validPickedTeams?.length > 0) {
        setLoading(true);
        for(let i = 0; i < validPickedTeams.length; i += DASHBOARD_TEAMS_CHUNK_SIZE) {
          const chunkTeamsCSV = validPickedTeams.slice(i, i + DASHBOARD_TEAMS_CHUNK_SIZE);
          // Member List API Promises
          const membersApiPromise = () =>
            new Promise((resolve) => {
              queryMembersByTeamIds(chunkTeamsCSV)
                .then((result) => {
                    if (result.status === HttpStatusCode.Ok) {
                      if (result?.data?.length > 0) {
                        const operators = [];
                        result?.data?.forEach((it) => {
                          operators.push(...it.members);
                        });
                        const newmembers = unionBy(membersRef.current, operators, 'userId');
                        setMembers(newmembers);
                      }
                    }
                  
                })
                .finally(() => resolve());
          });
          // Stat List API Promises
          const statsApiPromise = () =>
            new Promise((resolve) => {
              getStatsByTeamIds(chunkTeamsCSV)
                .then((result) => {
                    if (result.status === HttpStatusCode.Ok) {
                      if (result?.data?.length > 0) {
                        const operators = [];
                        result?.data?.forEach((it) => {
                          operators.push(...it.stats);
                        });
                        setStats(_.unionBy(
                          operators,
                          statsRef.current,
                          (it) => it.userId + it.deviceId
                        ));
                      }
                    }
                })
                .finally(() => {
                  resolve();
                });
          });

          // Alerts List API Promises
          const alertsApiPromise = () =>
            new Promise((resolve) => {
              getAlertsByTeamIDs(chunkTeamsCSV, moment().startOf('day').toISOString())
                .then((result) => {
                    if (result.status === HttpStatusCode.Ok) {
                      if (result?.data?.length > 0) {
                        const uniqueUpdated = _.chain(alertsRef.current)
                          .concat(
                            result?.data?.map((it) => {
                              return { ...it, utcTs: it.ts };
                            })
                          )
                          .uniqBy(function (_alert) {
                            return _alert.utcTs + _alert.userId;
                          })
                          .filter(function (_alert) {
                            return hasStatusValue(_alert.alertStageId, ALERT_STAGE_ID_LIST);
                          })
                          .value();

                        setAlerts(uniqueUpdated);
                      }
                    }
                })
                .finally(() => {
                  resolve();
                });
          });

          // Device List API Promies
          const devicesApiPromise = () =>
          new Promise((resolve) => {
            getDevicesByTeamIds(chunkTeamsCSV)
              .then((result) => {
                  if (result.status === HttpStatusCode.Ok) {
                    if (result?.data?.length > 0) {
                      const operators = [];
                        result?.data?.forEach((it) => {
                          operators.push(...it.devices);
                        });
                      setDevices([...devicesRef.current, ...operators]);
                    }
                  }
              })
              .finally(() => {
                resolve();
              });
          });

          Promise.allSettled([
            membersApiPromise(),
            statsApiPromise(),
            alertsApiPromise(),
            devicesApiPromise()
          ])
            .then(() => {
              lazyLoadedTeamsCount += 1;
            })
            .catch((err) => {
              console.error('initial loading error', err);
              source.cancel('cancel by user');
            })
            .finally(() => {
              setLoading(false);
            });
        }
      }
    }
    if (formattedTeams?.length > 0) {
      updateUrlParam({ param: { key: 'teams', value: validPickedTeams?.toString() } });
      localStorage.setItem('kop-params', location.search);

      if (validPickedTeams?.length !== pickedTeams?.length) {
        setPickedTeams(validPickedTeams);
      } else {
        setPage(1);
        setMembers([]);
        setAlerts([]);
        setStats([]);
        setDevices([]);
        const source = axios.CancelToken.source();
        //oldVer(source);
        newVer(source);
        let checkIfDoneLazyLoading = null
        checkIfDoneLazyLoading = setInterval(() => {
          if(lazyLoadedTeamsCount * DASHBOARD_TEAMS_CHUNK_SIZE >= validPickedTeams.length){
            if (organization < 0) {
              //
              generateDemoData();
              updateDataFromEvents(demoEventData.current);
            }
            // fixme there might be new events between the time when api returned and now
            const d = new Date().getTime();
            setHorizon(d);
            subscribe(d, source.token);
            
            checkIfDoneLazyLoading && clearInterval(checkIfDoneLazyLoading);
          }
        }, 1000);
        return () => {
          source.cancel('cancel by user');
        };
      }
    } else {
        setMembers([]);
        setAlerts([]);
        setStats([]);
        setDevices([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedTeams, refreshCount, formattedTeams, validPickedTeams]);

  const providerValue = {
    pickedTeams,
    setPickedTeams,
    organization,
    setOrganization,
    values: { members: membersRef.current, stats: statsRef.current, alerts: alertsRef.current, devices: devicesRef.current },
    member: selectedMember,
    setMember: setSelectedMember,
    visibleMemberModal,
    setVisibleMemberModal,
    formattedTeams,
    teams,
    selectedTeams,
    formattedOrganizations,
    organizations,
    selectedOrganization,
    isAdmin,
    formattedMembers,
    filteredMembers,
    paginatedMembers,
    filter,
    setFilter,
    page,
    setPage,
    sizePerPage,
    setSizePerPage,
    keyword,
    setKeyword,
    moveMember,
    moveMemberToOrg,
    setRefreshCount,
    removeMember,
    unlockMember,
    hideCbtHR,
    columnStats,
    demoEventData
  };

  return <DashboardContext.Provider value={providerValue}>{children}</DashboardContext.Provider>;
};

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
  myOrganization: get(state, 'profile.organization'),
  baseUri: get(state, 'auth.baseUri')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction
    },
    dispatch
  );

export const DashboardProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(DashboardProviderDraft));

export const useDashboardContext = () => {
  const context = React.useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within DashboardProvider');
  }
  return context;
};
