import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  getTeamAlerts,
  getTeamDevices,
  getTeamStats,
  inviteTeamMemberV2,
  queryAllOrganizations,
  queryTeamMembers,
  queryTeams,
  subscribeDataEvents,
  unlockUser,
  updateUserByAdmin
} from '../http';
import axios from 'axios';
import {
  getLastDigitsOfDeviceId,
  getLatestDateBeforeNow as getLatestDate,
  getParamFromUrl,
  hasStatusValue,
  numMinutesBetweenWithNow as numMinutesBetween,
  updateUrlParam
} from '../utils';
import { withTranslation } from 'react-i18next';
import _, { get, unionBy } from 'lodash';
import {
  ACME_INSTANCE_BASE_URI,
  ALERT_STAGE_ID_LIST,
  ALERT_STAGE_STATUS,
  DEMO_DATA_MINUTE,
  DEVICE_CONNECTION_STATUS,
  EVENT_DATA_TYPE,
  USER_TYPE_ADMIN,
  USER_TYPE_OPERATOR,
  USER_TYPE_ORG_ADMIN,
  USER_TYPE_TEAM_ADMIN
} from '../constant';
import useForceUpdate from '../hooks/useForceUpdate';
import { useNotificationContext } from './NotificationProvider';
import { formatLastSync, sortMembers } from '../utils/dashboard';
import { setLoadingAction } from '../redux/action/ui';
import { useUtilsContext } from './UtilsProvider';
import { TEAM_ALERT_API_DATA, TEAM_DEVICE_API_DATA } from '../constant/demoDashboard';
import moment from 'moment';

const DashboardContext = React.createContext(null);

const DashboardProviderDraft = ({ children, setLoading, userType, t, myOrganization, baseUri }) => {
  const [isAdmin, setIsAdmin] = React.useState(false);

  const sortBy = getParamFromUrl('sortBy');
  const sortDirection = getParamFromUrl('sortDirection');
  const keywordInUrl = getParamFromUrl('keyword');
  const organizationInUrl = getParamFromUrl('organization');
  const teamsInUrl = getParamFromUrl('teams');

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

  const [valuesV2, _setValuesV2] = React.useState({
    members: [],
    alerts: [],
    stats: [],
    devices: []
  });
  const valuesV2Ref = React.useRef(valuesV2);
  const setValuesV2 = (v) => {
    valuesV2Ref.current = v;
    _setValuesV2(v);
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
        const stat = valuesV2Ref.current.stats?.find((d) => d.userId === it.userId);
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
  }, []);

  React.useEffect(() => {
    updateUrlParam({ param: { key: 'keyword', value: trimmedKeyword } });
    localStorage.setItem('kop-params', location.search);
    setPage(1);
  }, [trimmedKeyword]);

  React.useEffect(() => {
    setIsAdmin(userType?.some((it) => [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].includes(it)));
  }, [userType]);

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

  React.useEffect(() => {
    if (!isAdmin && myOrganization?.id) {
      setOrganization(myOrganization?.id);
    }
  }, [myOrganization?.id, isAdmin]);

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

  React.useEffect(() => {
    if (formattedTeams?.length === 1 && pickedTeams?.length === 0) {
      const teamId = formattedTeams[0].value?.toString();
      if (teamId) {
        updateUrlParam({ param: { key: 'teams', value: teamId } });
        setPickedTeams([teamId]);
        localStorage.setItem('kop-params', location.search);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedTeams]);
  // Load Initial Data
  React.useEffect(() => {
    if (formattedTeams?.length > 0) {
      const validPickedTeams = pickedTeams?.filter((ele) =>
        formattedTeams?.some((it) => it.value?.toString() === ele.toString())
      );
      updateUrlParam({ param: { key: 'teams', value: validPickedTeams?.toString() } });
      localStorage.setItem('kop-params', location.search);

      if (validPickedTeams?.length !== pickedTeams?.length) {
        setPickedTeams(validPickedTeams);
      } else {
        setPage(null);
        setValuesV2({
          members: [],
          alerts: [],
          stats: [],
          devices: []
        });
        const source = axios.CancelToken.source();
        if (validPickedTeams?.length > 0) {
          const membersPromises = [];
          const statsPromises = [];
          const alertsPromises = [];
          const devicePromises = [];
          validPickedTeams.forEach((team) => {
            membersPromises.push(queryTeamMembers(team));
            statsPromises.push(getTeamStats(team));
            alertsPromises.push(getTeamAlerts(team, moment().startOf('day').toISOString()));
            devicePromises.push(getTeamDevices(team));
          });
          // Member List API Promises
          const membersApiPromise = () =>
            new Promise((resolve) => {
              Promise.allSettled(membersPromises)
                .then((results) => {
                  results?.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                      if (result.value?.data?.members?.length > 0) {
                        const operators =
                          result.value?.data?.members?.filter(
                            (it) => it.teamId?.toString() === validPickedTeams?.[index]?.toString()
                          ) ?? [];
                        //const prev = JSON.parse(JSON.stringify(valuesV2Ref.current));
                        setValuesV2({
                          ...valuesV2Ref.current,
                          members: unionBy(valuesV2Ref.current?.members, operators, 'userId')
                        });
                      }
                    }
                  });
                })
                .finally(() => resolve());
            });
          // Stat List API Promises
          const statsApiPromise = () =>
            new Promise((resolve) => {
              Promise.allSettled(statsPromises)
                .then((results) => {
                  results?.forEach((result) => {
                    if (result.status === 'fulfilled') {
                      if (result.value?.data?.length > 0) {
                        // const prev = JSON.parse(JSON.stringify(valuesV2Ref.current));
                        setValuesV2({
                          ...valuesV2Ref.current,
                          stats: _.unionBy(
                            result.value?.data,
                            valuesV2Ref.current?.stats,
                            (it) => it.userId + it.deviceId
                          )
                        });
                      }
                    }
                  });
                })
                .finally(() => {
                  resolve();
                });
            });
          // Alerts List API Promises
          const alertsApiPromise = () =>
            new Promise((resolve) => {
              Promise.allSettled(alertsPromises)
                .then((results) => {
                  results?.forEach((result) => {
                    if (result.status === 'fulfilled') {
                      if (result.value?.data?.length > 0) {
                        const uniqueUpdated = _.chain(valuesV2Ref.current?.alerts)
                          .concat(
                            result.value?.data?.map((it) => {
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

                        setValuesV2({
                          ...valuesV2Ref.current,
                          alerts: uniqueUpdated
                        });
                      }
                    }
                  });
                })
                .finally(() => {
                  resolve();
                });
            });
          // Device List API Promies
          const devicesApiPromise = () =>
            new Promise((resolve) => {
              Promise.allSettled(devicePromises)
                .then((results) => {
                  results?.forEach((result) => {
                    if (result.status === 'fulfilled') {
                      if (result.value?.data?.length > 0) {
                        //const prev = JSON.parse(JSON.stringify(valuesV2Ref.current));
                        setValuesV2({
                          ...valuesV2Ref.current,
                          devices: [...valuesV2Ref.current?.devices, ...result.value?.data]
                        });
                      }
                    }
                  });
                })
                .finally(() => {
                  resolve();
                });
            });
          setLoading(true);
          Promise.allSettled([
            membersApiPromise(),
            statsApiPromise(),
            alertsApiPromise(),
            devicesApiPromise()
          ])
            .then(() => {
              if (organization < 0) {
                //
                generateDemoData();
                console.log('first demo event data', demoEventData.current);
                updateDataFromEvents(demoEventData.current);
              }
              // fixme there might be new events between the time when api returned and now
              const d = new Date().getTime();
              setHorizon(d);
              subscribe(d, source.token);
              setPage(1);
            })
            .catch((err) => {
              console.error('initial loading error', err);
              source.cancel('cancel by user');
            })
            .finally(() => {
              setLoading(false);
            });
        }

        return () => {
          source.cancel('cancel by user');
        };
      }
    } else {
      setValuesV2({
        members: [],
        alerts: [],
        stats: [],
        devices: []
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedTeams, refreshCount, formattedTeams]);

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

  const formattedMembers = React.useMemo(() => {
    let arr = [];
    valuesV2.members?.forEach((member) => {
      if (!hasStatusValue(member.teamId, pickedTeams)) return;

      const stats = valuesV2.stats
        ?.filter((it) => it.userId?.toString() === member.userId?.toString())
        .sort((a, b) => new Date(b.deviceLogTs).getTime() - new Date(a.deviceLogTs).getTime());
      const userDevices = valuesV2.devices?.find(
        (it) => it.userId?.toString() === member.userId?.toString()
      )?.devices;
      const alertsForMe = valuesV2.alerts?.filter(
        (it) =>
          it.userId?.toString() === member.userId?.toString() &&
          (!(it?.alertStageId?.toString() === '5') ||
            numMinutesBetween(new Date(), new Date(it.utcTs)) <= 1)
      );
      // get a latest alert
      const alert = alertsForMe?.sort(function (a, b) {
        return new Date(b.utcTs) - new Date(a.utcTs);
      })?.[0];
      const numberOfAlerts = (
        alertsForMe?.filter((it) =>
          hasStatusValue(it?.alertStageId, [
            ALERT_STAGE_STATUS.AT_RISK,
            ALERT_STAGE_STATUS.ELEVATED_RISK,
            ALERT_STAGE_STATUS.SAFE
          ])
        ) ?? []
      )?.length;
      const alertObj = formatAlert(alert?.alertStageId);
      let i = 0,
        subArr = [],
        availableDevices = [];
      function calData(stat = null) {
        const userKenzenDevices = userDevices
          ?.filter(
            (it) =>
              it.deviceId?.toLowerCase() === stat?.deviceId?.toLowerCase() &&
              ['kenzen'].includes(it?.type)
          )
          ?.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
        const sourceDevice = userDevices?.find(d => d.deviceId == stat?.sourceDeviceId);
        if (stat?.deviceId) availableDevices.push(stat?.deviceId);

        const lastSync = getLatestDate(
          getLatestDate(
            stat?.heartRateTs ? new Date(stat?.heartRateTs) : null,
            stat?.deviceLogTs ? new Date(stat?.deviceLogTs) : null
          ),
          getLatestDate(
            stat?.tempHumidityTs ? new Date(stat?.tempHumidityTs) : null,
            alert?.utcTs ? new Date(alert?.utcTs) : null
          )
        );

        const connectionObj = formatConnectionStatusV2({
          flag: stat?.onOffFlag,
          connected: userKenzenDevices?.[0]?.connected,
          lastSyncDataDateTime: lastSync,
          deviceId: stat?.deviceId,
          numberOfAlerts,
          stat,
          alert,
          deviceType: sourceDevice?.type
        });

        const lastSyncStr = formatLastSync(lastSync);

        const invisibleAlerts = ['1'].includes(connectionObj?.value?.toString()) || !numberOfAlerts;
        const invisibleDeviceMac = ['1'].includes(connectionObj?.value?.toString());
        const invisibleBattery =
          [
            DEVICE_CONNECTION_STATUS.NEVER_CONNECTION, 
            DEVICE_CONNECTION_STATUS.NO_CONNECTION
          ].includes(connectionObj?.value) ||
          ([DEVICE_CONNECTION_STATUS.CHARGING, DEVICE_CONNECTION_STATUS.LIMITED_CONNECTION].includes(connectionObj?.value) &&
            numMinutesBetween(new Date(), new Date(stat?.deviceLogTs)) > 240);
        const invisibleHeatRisk =
          !alert || ['1', '2', '8'].includes(connectionObj?.value?.toString());
        const invisibleLastSync =
          new Date(lastSync).getTime() > new Date().getTime() + 60 * 1000 ||
          ['1'].includes(connectionObj?.value?.toString());
        const invisibleLastUpdates = ['1', '2', '8'].includes(connectionObj?.value?.toString());
        (i === 0 ? arr : subArr).push({
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
          invisibleLastUpdates
        });
        i = i + 1;
      }

      if (stats?.length > 0) {
        stats.forEach((s) => calData(s));
      } else {
        calData();
      }

      if (subArr.length > 0) {
        arr[arr.length - 1]['others'] = subArr;
      }

      arr[arr.length - 1]['devices'] = availableDevices;
    });

    return sortMembers({ arrOrigin: arr, filter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuesV2.members, valuesV2.alerts, valuesV2.stats, valuesV2.devices, filter, count]);

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
        const alerts = events?.filter((it) => it.type === EVENT_DATA_TYPE.ALERT);
        if (alerts?.length > 0) {
          const uniqueUpdated = _.chain(valuesV2Ref.current.alerts)
            .concat(alerts?.map((it) => it.data))
            .uniqBy(function (_alert) {
              return _alert.utcTs + _alert.userId;
            })
            .filter(function (_alert) {
              return hasStatusValue(_alert.alertStageId, ALERT_STAGE_ID_LIST);
            })
            .value();

          setValuesV2({
            ...valuesV2Ref.current,
            alerts: uniqueUpdated
          });
        }

        let valuesV2Temp = JSON.parse(JSON.stringify(valuesV2Ref.current));

        valuesV2Temp?.members?.forEach((member, memberIndex) => {
          const memberEvents = events?.filter(
            (it) => it.userId?.toString() === member.userId.toString()
          );
          const latestHeartRate = memberEvents
            ?.filter((it) => it.type === EVENT_DATA_TYPE.HEART_RATE)
            ?.sort(
              (a, b) => new Date(b.data.utcTs).getTime() - new Date(a.data.utcTs).getTime()
            )?.[0]?.data;
          // update member's devices list
          const memberDeviceLogs = memberEvents?.filter(
            (it) => it.type === EVENT_DATA_TYPE.DEVICE_LOG
          );
          const latestDeviceLog = memberDeviceLogs?.sort(
            (a, b) => new Date(b.data.utcTs).getTime() - new Date(a.data.utcTs).getTime()
          )?.[0]?.data;

          if (latestHeartRate) {
            const membersTemp = JSON.parse(JSON.stringify(valuesV2Temp?.members));
            const updatedMember = {
              ...member,
              heatSusceptibility: latestHeartRate.heatSusceptibility
            };
            membersTemp.splice(memberIndex, 1, updatedMember);
            valuesV2Temp = {
              ...valuesV2Temp,
              members: membersTemp
            };
          }

          if (memberDeviceLogs?.length > 0) {
            const devicesTemp = JSON.parse(JSON.stringify(valuesV2Temp?.devices));
            const devicesMemberIndex =
              devicesTemp.findIndex((it) => it.userId?.toString() === member.userId?.toString()) ??
              [];
            const memberDeviceLogsData = memberDeviceLogs?.map((it) => ({
              ...it.data,
              ts: it.data?.utcTs
            }));
            let memberDevices = [];
            if (devicesMemberIndex !== -1) {
              memberDevices = devicesTemp[devicesMemberIndex].devices ?? [];
            }
            // fixme I assumed all device logs as kenzen device logs
            memberDeviceLogsData?.forEach((it) => {
              const index = memberDevices.findIndex(
                (ele) => ele.deviceId?.toLowerCase() === it.deviceId?.toLowerCase()
              );
              if (index !== -1) {
                memberDevices.splice(index, 1, {
                  ...it,
                  type: it.type ?? memberDevices[index]?.type,
                  version: it.version ?? memberDevices[index].version
                });
              } else {
                memberDevices.push({ ...it, type: it.type ?? 'kenzen' });
              }
            });
            if (devicesMemberIndex !== -1) {
              devicesTemp.splice(devicesMemberIndex, 1, {
                userId: member.userId,
                devices: memberDevices
              });
            } else {
              devicesTemp.push({ userId: member.userId, devices: memberDevices });
            }
            valuesV2Temp = {
              ...valuesV2Temp,
              devices: devicesTemp
            };
          }

          const latestTempHumidity = memberEvents
            ?.filter((it) => it.type === EVENT_DATA_TYPE.TEMP_HUMIDITY)
            ?.sort(
              (a, b) => new Date(b.data.utcTs).getTime() - new Date(a.data.utcTs).getTime()
            )?.[0]?.data;
          const prev = JSON.parse(JSON.stringify(valuesV2Temp));
          let statIndex = -1;
          if (latestDeviceLog) {
            statIndex = prev.stats?.findIndex(
              (it) =>
                it.userId?.toString() === member?.userId?.toString() &&
                it?.deviceId == latestDeviceLog.deviceId
            );
          }

          if (statIndex === -1) {
            statIndex = prev.stats?.findIndex(
              (it) => it.userId?.toString() === member?.userId?.toString()
            );
          }

          if (statIndex !== -1) {
            let temp = JSON.parse(JSON.stringify(prev.stats));
            let updatedLastConnectedTs = temp[statIndex].lastConnectedTs;
            let updatedLastOnTs = temp[statIndex].lastOnTs;

            if (latestDeviceLog) {
              if (latestDeviceLog.onOff === true) {
                updatedLastOnTs = latestDeviceLog.utcTs;
              }
              if (latestDeviceLog.connected === true) {
                updatedLastConnectedTs = latestDeviceLog.utcTs;
              }
            }
            const newEle = {
              ...temp[statIndex],
              batteryPercent: latestDeviceLog
                ? latestDeviceLog?.batteryPercent
                : temp[statIndex].batteryPercent,
              chargingFlag: latestDeviceLog
                ? latestDeviceLog?.charging
                : temp[statIndex].chargingFlag,
              cbtAvg: latestHeartRate ? latestHeartRate?.heartCbtAvg : temp[statIndex].cbtAvg,
              deviceId: latestDeviceLog ? latestDeviceLog?.deviceId : temp[statIndex].deviceId,
              deviceLogTs: latestDeviceLog ? latestDeviceLog?.utcTs : temp[statIndex].deviceLogTs,
              heartRateAvg: latestHeartRate
                ? latestHeartRate?.heartRateAvg
                : temp[statIndex].heartRateAvg,
              heartRateTs: latestHeartRate ? latestHeartRate?.utcTs : temp[statIndex].heartRateTs,
              onOffFlag: latestDeviceLog ? latestDeviceLog?.onOff : temp[statIndex].onOffFlag,
              skinTemp: latestTempHumidity
                ? latestTempHumidity?.skinTemp
                : temp[statIndex].skinTemp,
              tempHumidityTs: latestTempHumidity
                ? latestTempHumidity?.utcTs
                : temp[statIndex].tempHumidityTs,
              userId: member.userId,
              lastConnectedTs: updatedLastConnectedTs,
              lastOnTs: updatedLastOnTs
            };
            if (latestDeviceLog && latestDeviceLog?.deviceId !== temp[statIndex].deviceId) {
              temp = [...temp.slice(0, statIndex + 1), newEle, ...temp.slice(statIndex + 1)];
            } else {
              temp.splice(statIndex, 1, newEle);
            }

            valuesV2Temp = {
              ...valuesV2Temp,
              stats: temp
            };
          }
        });

        setValuesV2(valuesV2Temp);
      }
    },
    [valuesV2Ref]
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
                  setValuesV2({
                    ...valuesV2Ref.current,
                    members: valuesV2Ref.current.members?.filter(
                      (it) => !result.value?.data?.removed?.includes(it.userId)
                    )
                  });
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
        const updated = valuesV2Ref.current.members?.map((it) => ({
          ...it,
          teamId: teamId
        }));
        setValuesV2({
          ...valuesV2Ref.current,
          members: updated
        });
      };
      const removeMembersFromView = (userIds) => {
        const filtered = valuesV2Ref.current.members?.map((it) =>
          !userIds?.some((ele) => ele.toString() === it.userId?.toString())
            ? it
            : {
                ...it,
                hidden: true
              }
        );
        setValuesV2({
          ...valuesV2Ref.current,
          members: filtered
        });
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
                  const member = valuesV2Ref.current.members?.find(
                    (m) => m.userId == userData.userId
                  );
                  member.orgId = userData.orgId;
                  member.teamId = userData.teamId;
                  cnt += 1;
                }
              });
              setValuesV2({
                ...valuesV2Ref.current
              });
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
              const updated = valuesV2Ref.current.members?.map((it) =>
                it.userId?.toString() === member?.userId?.toString()
                  ? {
                      ...it,
                      locked: false
                    }
                  : it
              );
              setValuesV2({
                ...valuesV2Ref.current,
                members: updated
              });
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
    [setLoading]
  );

  const providerValue = {
    pickedTeams,
    setPickedTeams,
    organization,
    setOrganization,
    values: valuesV2Ref.current,
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
