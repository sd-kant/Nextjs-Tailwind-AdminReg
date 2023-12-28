declare global {
  interface T_ApiValidationError {
    field: string;
    messageCode: string;
    message: string;
  }

  interface T_ApiError {
    timestamp: number;
    path: string;
    status: number;
    error: string;
    message: string;
    requestId: string;
    stackTrace: string;
    validationErrors: T_ApiValidationError[];
  }

  interface T_Team {
    teamId: number;
    teamName: string;
  }

  interface T_Member {
    userId: number;
    orgId: number;
    teamId: number;
    email: string;
    phoneNumber: string;
    firstName: string;
    middleNames: string;
    lastName: string;
    job: string;
    gmt: string;
    locale: string;
    locked: boolean;
    dateOfBirth: string;
    heatSusceptibility: string;
    settings: unknown;
    userTypes: string[];
    teams: T_Team[];
  }

  interface T_Alert {
    userId: 0;
    teamId: 0;
    ts: 'string';
    gmt: 'string';
    alertStageId: 0;
    alertResponseId: 0;
    alertCounter: 0;
    heartCbtAvg: 0;
    heartRateAvg: 0;
  }

  interface T_Device {
    deviceId: string;
    ts: string;
    gmt: string;
    type: 'android' | string;
    version: string;
    osVersion: string;
    accuWeatherApiKey: string;
    settings: {};
    pushId: string;
    newFwVersion: string;
  }

  interface T_DeviceLog {
    deviceId: string;
    type: 'android' | string;
    version: string;
    osVersion: string;
    batteryPercent: 0;
    charging: boolean;
    ppg: boolean;
    onOff: boolean;
    connected: boolean;
  }

  interface T_MemberStat {
    userId: number;
    deviceId: string;
    sourceDeviceId: string;
    batteryPercent: number;
    chargingFlag: boolean;
    onOffFlag: boolean;
    heartRateAvg: number;
    cbtAvg: number;
    skinTemp: number;
    lastTimestamp: string;
    deviceLogTs: string;
    lastConnectedTs: string;
    lastOnTs: string;
    heartRateTs: string;
    tempHumidityTs: string;
  }

  interface MemberDetailDataProperties {
    alert: unknown | null;
    alertObj: { label: string; value: unknown | null };
    alertsForMe: unknown[];
    connectionObj: { label: string; value: number };
    dateOfBirth: string;
    email: string;
    firstName: string;
    gmt: string;
    heatSusceptibility: string;
    invisibleAlerts: boolean;
    invisibleBattery: boolean;
    invisibleDeviceMac: boolean;
    invisibleHeatRisk: boolean;
    invisibleLastSync: boolean;
    invisibleLastUpdates: boolean;
    job: string;
    lastName: string;
    lastSync: string;
    lastSyncStr: string;
    locale: string;
    locked: boolean;
    numberOfAlerts: number;
    orgId: number;
    settings: { teamAlerts: number[] };
    stat: T_MemberStat;
    teamId?: number;
    userId: number;
    userTypes: string[];
  }

  type T_METRIC = {
    label: string;
    value: number;
    type: 'user' | 'team';
    category: number;
  };

  interface TeamV2TableRow {
    alert: unknown;
    alertObj: { label: string; value: unknown };
    alertsForMe: unknown[];
    connectionObj: { label: string; value: number };
    dateOfBirth: string;
    email: string;
    firstName: string;
    gmt: string;
    heatSusceptibility: string;
    invisibleAlerts: boolean;
    invisibleBattery: boolean;
    invisibleDeviceMac: boolean;
    invisibleHeatRisk: boolean;
    invisibleLastSync: boolean;
    invisibleLastUpdates: boolean;
    job: string;
    lastName: string;
    lastSync: Date;
    lastSyncStr: string;
    locale: string;
    locked: boolean;
    numberOfAlerts: number;
    orgId: number;
    phoneNumber: string;
    settings: {
      hideCbtHR: boolean;
      teamAlerts: { enabled: boolean; notificationLevels: number[]; teamId: number }[];
    };
    stat: T_MemberStat[];
    teamId: number;
    teams: T_Team[];
    userId: number;
    userTypes: string; // Operator, TeamAdmin, ...
  }

  interface EVENT_HEART_RATE {
    utcTs: string;
    heartCbtAvg: number;
    heartRateAvg: number;
  }
}

export {};
