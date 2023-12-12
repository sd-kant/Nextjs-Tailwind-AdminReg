import { ALERT_STAGE_STATUS, DEMO_DATA_MINUTE } from '.';
// teamId = 4
export const TEAM_ALERT_API_DATA = [
  {
    userId: 1010028,
    teamId: 4,
    ts: (idx) => {
      let c = idx % 5;
      if (c === DEMO_DATA_MINUTE.FULL_CYCLE || c === DEMO_DATA_MINUTE.FIRST) return c;
      else return DEMO_DATA_MINUTE.NONE;
    },
    gmt: 'GMT-4:00',
    alertStageId: (_ts) => {
      return _ts ? ALERT_STAGE_STATUS.AT_RISK : ALERT_STAGE_STATUS.SAFE;
    },
    alertResponseId: 0,
    alertCounter: 0,
    heartCbtAvg: (_ts) => {
      return _ts ? 38.5 : 37.8;
    },
    heartRateAvg: (_ts) => {
      return _ts ? 73.9 : 35;
    }
  },
  {
    userId: 1010029,
    teamId: 4,
    ts: (idx) => {
      let c = idx % 8;
      if (c === DEMO_DATA_MINUTE.FULL_CYCLE || c === DEMO_DATA_MINUTE.FIRST) return c;
      else {
        c = idx % 5;
        if (c === DEMO_DATA_MINUTE.FULL_CYCLE) return DEMO_DATA_MINUTE.FIFTH;
        return DEMO_DATA_MINUTE.NONE;
      }
    },
    gmt: 'GMT-4:00',
    alertStageId: (_ts) => {
      if (_ts === 1) return ALERT_STAGE_STATUS.AT_RISK;
      else if (_ts === 5) return ALERT_STAGE_STATUS.ELEVATED_RISK;
      else if (_ts === 0) return ALERT_STAGE_STATUS.SAFE;
    },
    alertResponseId: 0,
    alertCounter: 0,
    heartCbtAvg: (_ts) => {
      if (_ts === DEMO_DATA_MINUTE.FIRST) return 38.5;
      else if (_ts === DEMO_DATA_MINUTE.FIFTH) return 38.3;
      else if (_ts === DEMO_DATA_MINUTE.FULL_CYCLE) return 37.8;
    },
    heartRateAvg: (_ts) => {
      if (_ts === DEMO_DATA_MINUTE.FIRST) return 76.7;
      else if (_ts === DEMO_DATA_MINUTE.FIFTH) return 68.3;
      else if (_ts === DEMO_DATA_MINUTE.FULL_CYCLE) return 35;
    }
  },
  {
    userId: 1010037,
    teamId: 5,
    ts: () => DEMO_DATA_MINUTE.WITHIN_AN_HOUR,
    gmt: 'GMT-4:00',
    alertStageId: ALERT_STAGE_STATUS.SAFE,
    alertResponseId: 0,
    alertCounter: 0,
    heartCbtAvg: 38.1,
    heartRateAvg: 36.7
  },
  {
    userId: 1010039,
    teamId: 5,
    ts: () => DEMO_DATA_MINUTE.WITHIN_24_HR,
    gmt: 'GMT-4:00',
    alertStageId: ALERT_STAGE_STATUS.SAFE,
    alertResponseId: 0,
    alertCounter: 0,
    heartCbtAvg: 38.2,
    heartRateAvg: 37.2
  }
];

export const TEAM_DEVICE_API_DATA = [
  {
    userId: 1010028,
    deviceId: 1,
    type: 'kenzen',
    utcTs: DEMO_DATA_MINUTE.WITHIN_20_MINUTES,
    version: '1.9.16',
    osVersion: '17.1.1',
    batteryPercent: 70,
    charging: false,
    onOff: true,
    connected: true
  },
  {
    userId: 1010029,
    deviceId: 1,
    type: 'kenzen',
    utcTs: DEMO_DATA_MINUTE.WITHIN_20_MINUTES,
    version: '1.9.16',
    osVersion: '17.1.1',
    batteryPercent: 70,
    charging: false,
    onOff: true,
    connected: true
  },
  {
    userId: 1010036,
    deviceId: 1,
    type: 'kenzen',
    utcTs: DEMO_DATA_MINUTE.WITHIN_20_MINUTES,
    version: '1.9.16',
    osVersion: '17.1.1',
    batteryPercent: 70,
    charging: false,
    onOff: true,
    connected: false
  },
  {
    userId: 1010037,
    deviceId: 1,
    type: 'kenzen',
    utcTs: DEMO_DATA_MINUTE.WITHIN_20_MINUTES,
    version: '1.9.16',
    osVersion: '17.1.1',
    batteryPercent: 70,
    charging: false,
    onOff: true,
    connected: true
  },
  {
    userId: 1010040,
    deviceId: 1,
    type: 'kenzen',
    utcTs: DEMO_DATA_MINUTE.WITHIN_20_MINUTES,
    version: '1.9.16',
    osVersion: '17.1.1',
    batteryPercent: 70,
    charging: false,
    onOff: true,
    connected: true
  },
  {
    userId: 1010042,
    deviceId: 1,
    type: 'kenzen',
    utcTs: DEMO_DATA_MINUTE.OUT_20_MINUTES,
    version: '1.9.16',
    osVersion: '17.1.1',
    batteryPercent: 70,
    charging: false,
    onOff: true,
    connected: true
  },
  {
    userId: 1010043,
    deviceId: 1,
    type: 'kenzen',
    utcTs: DEMO_DATA_MINUTE.OUT_24_HR,
    version: '1.9.16',
    osVersion: '17.1.1',
    batteryPercent: 70,
    charging: false,
    onOff: true,
    connected: true
  }
];
