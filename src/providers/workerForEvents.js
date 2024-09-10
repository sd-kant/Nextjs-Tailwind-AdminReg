const _ = require('lodash');
// constants: EVENT_DATA_TYPE, ALERT_STAGE_ID_LIST
self.onmessage = (e) => {
    const { data } = e;
    const { events, constants } = data;
    let {  alerts, members, devices, stats } = data;
    if (events?.length > 0) {

        const alertsInEvent = events?.filter((it) => it.type === constants.EVENT_DATA_TYPE.ALERT);
        let modifiedAlerts = 0;
        let uniqueUpdated = [];
        if (alertsInEvent?.length > 0) {
          uniqueUpdated = _.chain(alerts)
            .concat(alertsInEvent?.map((it) => it.data))
            .uniqBy(function (_alert) {
              return _alert.utcTs + _alert.userId;
            })
            .filter(function (_alert) {
              return constants.ALERT_STAGE_ID_LIST.findIndex(a => a == _alert.alertStageId) >= 0;
            })
            .value();
          console.log(`Events: ${uniqueUpdated.length} alerts are updated`)
          modifiedAlerts = uniqueUpdated.length;
        }

        // let valuesV2Temp = JSON.parse(JSON.stringify(valuesV2Ref.current));
        let modifiedMembers = 0;
        let modifiedDevices = 0;
        let modifiedStats = 0;
        members?.forEach((member) => {
          const memberEvents = events?.filter(
            (it) => it.userId?.toString() === member.userId.toString()
          );
          const latestHeartRate = memberEvents
            ?.filter((it) => it.type === constants.EVENT_DATA_TYPE.HEART_RATE)
            ?.sort(
              (a, b) => new Date(b.data.utcTs).getTime() - new Date(a.data.utcTs).getTime()
            )?.[0]?.data;
          // update member's devices list
          const memberDeviceLogs = memberEvents?.filter(
            (it) => it.type === constants.EVENT_DATA_TYPE.DEVICE_LOG
          );
          const latestDeviceLog = memberDeviceLogs?.sort(
            (a, b) => new Date(b.data.utcTs).getTime() - new Date(a.data.utcTs).getTime()
          )?.[0]?.data;

          if (latestHeartRate) {
            member.heatSusceptibility = latestHeartRate.heatSusceptibility;
            modifiedMembers = modifiedDevices + 1;
          }
          
          if (memberDeviceLogs?.length > 0) {
            const devicesMemberIndex =
              devices.findIndex((it) => it.userId?.toString() === member.userId?.toString()) ??
              [];
            const memberDeviceLogsData = memberDeviceLogs?.map((it) => ({
              ...it.data,
              ts: it.data?.utcTs
            }));
            let memberDevices = [];
            if (devicesMemberIndex !== -1) {
              memberDevices = devices[devicesMemberIndex].devices ?? [];
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
              devices.splice(devicesMemberIndex, 1, {
                userId: member.userId,
                devices: memberDevices
              });
            } else {
              devices.push({ userId: member.userId, devices: memberDevices });
            }
            modifiedDevices = modifiedDevices + 1;
          }

          const latestTempHumidity = memberEvents
            ?.filter((it) => it.type === constants.EVENT_DATA_TYPE.TEMP_HUMIDITY)
            ?.sort(
              (a, b) => new Date(b.data.utcTs).getTime() - new Date(a.data.utcTs).getTime()
            )?.[0]?.data;
          // const prev = JSON.parse(JSON.stringify(valuesV2Temp));
          let statIndex = -1;
          if (latestDeviceLog) {
            statIndex = stats?.findIndex(
              (it) =>
                it.userId?.toString() === member?.userId?.toString() &&
                it?.deviceId == latestDeviceLog.deviceId
            );
          }

          if (statIndex === -1) {
            statIndex = stats?.findIndex(
              (it) => it.userId?.toString() === member?.userId?.toString()
            );
          }

          if (statIndex !== -1) {
            let updatedLastConnectedTs = stats[statIndex].lastConnectedTs;
            let updatedLastOnTs = stats[statIndex].lastOnTs;

            if (latestDeviceLog) {
              if (latestDeviceLog.onOff === true) {
                updatedLastOnTs = latestDeviceLog.utcTs;
              }
              if (latestDeviceLog.connected === true) {
                updatedLastConnectedTs = latestDeviceLog.utcTs;
              }
            }
            const newEle = {
              ...stats[statIndex],
              batteryPercent: latestDeviceLog
                ? latestDeviceLog?.batteryPercent
                : stats[statIndex].batteryPercent,
              chargingFlag: latestDeviceLog
                ? latestDeviceLog?.charging
                : stats[statIndex].chargingFlag,
              cbtAvg: latestHeartRate ? latestHeartRate?.heartCbtAvg : stats[statIndex].cbtAvg,
              deviceId: latestDeviceLog ? latestDeviceLog?.deviceId : stats[statIndex].deviceId,
              deviceLogTs: latestDeviceLog ? latestDeviceLog?.utcTs : stats[statIndex].deviceLogTs,
              heartRateAvg: latestHeartRate
                ? latestHeartRate?.heartRateAvg
                : stats[statIndex].heartRateAvg,
              heartRateTs: latestHeartRate ? latestHeartRate?.utcTs : stats[statIndex].heartRateTs,
              onOffFlag: latestDeviceLog ? latestDeviceLog?.onOff : stats[statIndex].onOffFlag,
              skinTemp: latestTempHumidity
                ? latestTempHumidity?.skinTemp
                : stats[statIndex].skinTemp,
              tempHumidityTs: latestTempHumidity
                ? latestTempHumidity?.utcTs
                : stats[statIndex].tempHumidityTs,
              userId: member.userId,
              lastConnectedTs: updatedLastConnectedTs,
              lastOnTs: updatedLastOnTs
            };
            if (latestDeviceLog && latestDeviceLog?.deviceId !== stats[statIndex].deviceId) {
              stats = [...stats.slice(0, statIndex + 1), newEle, ...stats.slice(statIndex + 1)];
            } else {
              stats.splice(statIndex, 1, newEle);
            }

            modifiedStats = modifiedStats + 1;
          }
        });
        console.log(`Events: ${modifiedAlerts} alerts, ${modifiedMembers} members, ${modifiedDevices} devices, ${modifiedStats} stats are modified`);
        const result = {};
        if(modifiedAlerts > 0) result.alerts = uniqueUpdated;
        if(modifiedMembers > 0) result.members = members;
        if(modifiedDevices > 0) result.devices = devices;
        if(modifiedStats > 0) result.stats = stats;
        self.postMessage(result);
      }
}