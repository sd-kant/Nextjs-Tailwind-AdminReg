import * as React from 'react';
import { withTranslation } from 'react-i18next';
import { get } from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setLoadingAction } from 'redux/action/ui';
import { gerUserData, getUserAlerts, getUserOrganization } from 'http/user';
import { formatLastSync, formatHeartRate } from 'utils/dashboard';
import { ACTIVITIES_FILTERS, ALERT_STAGE_ID_LIST } from 'constant';
import {
  getLatestDateBeforeNow as getLatestDate,
  getParamFromUrl,
  numMinutesBetweenWithNow as numMinutesBetween,
  updateUrlParam
} from 'utils';
import { useUtilsContext } from 'providers/UtilsProvider';

const OperatorDashboardContext = React.createContext(null);

const OperatorDashboardProviderDraft = ({ children, profile }) => {
  const [loading, setLoading] = React.useState(false);
  const activitiesFilters = ACTIVITIES_FILTERS;
  const [activitiesFilter, setActivitiesFilter] = React.useState(activitiesFilters[0]);
  const [metricsFilter, setMetricsFilter] = React.useState(activitiesFilters[0]);
  const { formatAlert, formatConnectionStatusV2, formatHeartCbt } = useUtilsContext();

  const [userData, setUserData] = React.useState({
    devices: [],
    events: [],
    alertObj: {},
    alerts: [],
    stat: {
      batteryPercent: 0,
      cbtAvg: 0,
      chargingFlag: false,
      deviceId: '',
      deviceLogTs: '',
      heartRateAvg: 0,
      heartRateTs: '',
      lastTimestamp: '',
      onOffFlag: false,
      skinTemp: 0,
      sourceDeviceId: 'test',
      tempHumidityTs: '',
      userId: 0
    }
  });

  React.useEffect(() => {
    // fetch user data
    setLoading(true);

    if (profile) {
      const userDataPromises = [gerUserData(), getUserAlerts(), getUserOrganization(profile.orgId)];
      Promise.all(userDataPromises)
        .then((resArr) => {
          console.log(' ----- promise all ----');
          console.log('resArr ==>', resArr);
          const { stat, alert, devices, events } = resArr[0].data;
          const alerts = resArr[1].data;
          const organization = resArr[2].data;

          const alertObj = formatAlert(alert?.alertStageId);

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
          const lastSyncStr = formatLastSync(lastSync);

          const userKenzenDevice = devices
            ?.filter(
              (it) =>
                it.type === 'kenzen' && it.deviceId?.toLowerCase() === stat?.deviceId?.toLowerCase()
            )
            ?.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())?.[0];

          const numberOfAlerts = (
            alerts?.filter((it) => ['1', '2', '3'].includes(it?.alertStageId?.toString())) ?? []
          )?.length;

          const connectionObj = formatConnectionStatusV2({
            flag: stat?.onOffFlag,
            connected: userKenzenDevice?.connected,
            lastTimestamp: stat?.tempHumidityTs,
            deviceId: stat?.deviceId,
            numberOfAlerts,
            stat,
            alert
          });

          const invisibleHeatRisk =
            !alert || ['1', '2', '8'].includes(connectionObj?.value?.toString());

          // const logs = getLogs(alerts, events);

          setUserData({
            events,
            stat,
            alerts,
            devices,
            lastSyncStr,
            alertObj,
            numberOfAlerts,
            invisibleHeatRisk,
            connectionObj,
            organization
          });
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
        });
    }

    // gerUserData().then(({ data }) => {
    //   const { stat, alert, devices } = data;

    //   const alertObj = formatAlert(alert?.alertStageId);

    //   const lastSync = getLatestDate(
    //     getLatestDate(
    //       stat?.heartRateTs ? new Date(stat?.heartRateTs) : null,
    //       stat?.deviceLogTs ? new Date(stat?.deviceLogTs) : null
    //     ),
    //     getLatestDate(
    //       stat?.tempHumidityTs ? new Date(stat?.tempHumidityTs) : null,
    //       alert?.utcTs ? new Date(alert?.utcTs) : null
    //     )
    //   );
    //   const lastSyncStr = formatLastSync(lastSync);

    //   const userKenzenDevice = devices
    //     ?.filter(
    //       (it) =>
    //         it.type === 'kenzen' && it.deviceId?.toLowerCase() === stat?.deviceId?.toLowerCase()
    //     )
    //     ?.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())?.[0];

    //     const alertsForMe = valuesV2.alerts?.filter(
    //       (it) =>
    //         it.userId?.toString() === member.userId?.toString() &&
    //         (!(it?.alertStageId?.toString() === '5') ||
    //           numMinutesBetween(new Date(), new Date(it.utcTs)) <= 1)
    //     );

    //   const alert = alertsForMe?.sort(function (a, b) {
    //     return new Date(b.utcTs) - new Date(a.utcTs);
    //   })?.[0];
    //   const numberOfAlerts = (
    //     alertsForMe?.filter((it) => ['1', '2', '3'].includes(it?.alertStageId?.toString())) ?? []
    //   )?.length;

    //   const connectionObj = formatConnectionStatusV2({
    //     flag: stat?.onOffFlag,
    //     connected: userKenzenDevice?.connected,
    //     lastTimestamp: stat?.tempHumidityTs,
    //     deviceId: stat?.deviceId,
    //     numberOfAlerts,
    //     stat,
    //     alert
    //   });

    //   const invisibleHeatRisk =
    //     !alert || ['1', '2', '8'].includes(connectionObj?.value?.toString());

    //   setUserData({ ...data, lastSyncStr, alertObj });
    //   setLoading(false);
    // });
  }, [profile]);

  const logs = React.useMemo(() => {
    const { alerts, events } = userData;

    let merged = [
      ...(alerts?.map((it) => ({ ...it, type: 'Alert' })) ?? []),
      ...(events?.map((it) => ({ ...it, type: 'Event' })) ?? [])
    ];
    const d = new Date();
    d.setDate(d.getDate() - (activitiesFilter?.value ?? 1));
    merged = merged
      ?.filter((it) => new Date(it.utcTs).getTime() > d.getTime())
      ?.sort((a, b) => new Date(b.utcTs).getTime() - new Date(a.utcTs).getTime());
    const unique = [];
    for (const entry of merged) {
      if (!unique.some((x) => entry.utcTs === x.utcTs && entry.type === x.type)) {
        unique.push(entry);
      }
    }
    return unique;
  }, [userData, activitiesFilter?.value]);

  const metricStats = React.useMemo(() => {
    const { alerts } = userData;
    console.log('alerts ===>', alerts);
    const d = new Date();
    d.setDate(d.getDate() - (metricsFilter?.value ?? 1));
    let tempAlerts = [...alerts]
      ?.filter((it) => new Date(it.utcTs).getTime() > d.getTime())
      ?.sort((a, b) => new Date(b.utcTs).getTime() - new Date(a.utcTs).getTime());

    const unique = [];
    for (const entry of tempAlerts) {
      if (!unique.some((x) => entry.utcTs === x.utcTs)) {
        unique.push(entry);
      }
    }

    const validAlerts =
      unique?.filter((it) => ['1', '2', '3'].includes(it?.alertStageId?.toString())) ?? [];

    return {
      totalAlerts: validAlerts?.length || 0,
      stopAlerts: validAlerts?.filter((it) => ['1', '2'].includes(it?.alertStageId?.toString()))
        ?.length,
      highestCbt:
        validAlerts?.length > 0
          ? formatHeartCbt(
              validAlerts?.sort((a, b) => (b?.heartCbtAvg ?? 0) - (a?.heartCbtAvg ?? 0))[0]
                ?.heartCbtAvg
            )
          : 0,
      highestHr:
        validAlerts?.length > 0
          ? formatHeartRate(
              validAlerts?.sort((a, b) => (b?.heartRateAvg ?? 0) - (a?.heartRateAvg ?? 0))[0]
                ?.heartRateAvg
            )
          : 0
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, metricsFilter?.value]);

  const providerValue = {
    userData,
    loading,
    logs,
    metricStats,
    activitiesFilter,
    activitiesFilters,
    metricsFilter,
    setActivitiesFilter,
    setMetricsFilter
  };

  return (
    <OperatorDashboardContext.Provider value={providerValue}>
      {children}
    </OperatorDashboardContext.Provider>
  );
};

const mapStateToProps = (state) => ({
  profile: get(state, 'profile.profile')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction
    },
    dispatch
  );

export const OperatorDashboardProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(OperatorDashboardProviderDraft));

export const useOperatorDashboardContext = () => {
  const context = React.useContext(OperatorDashboardContext);
  if (!context) {
    throw new Error('useOperatorDashboardContext must be used within UserSubscriptionProvider');
  }
  return context;
};
