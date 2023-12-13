import i18n from '../i18nextInit';

export const USER_TYPE_ADMIN = 'Admin';
export const USER_TYPE_ORG_ADMIN = 'OrgAdmin';
export const USER_TYPE_TEAM_ADMIN = 'TeamAdmin';
export const USER_TYPE_OPERATOR = 'Operator';

export const EXPORT_OPTIONS = [
  {
    label: 'CSV',
    value: 'csv'
  },
  {
    label: 'XLSX',
    value: 'xlsx'
  }
];
export const AVAILABLE_COUNTRIES = [
  {
    value: 'AU',
    label: i18n.t('australia')
  },
  {
    value: 'CA',
    label: i18n.t('canada')
  },
  {
    value: 'FR',
    label: i18n.t('france')
  },
  {
    value: 'IN',
    label: i18n.t('india')
  },
  {
    value: 'JP',
    label: i18n.t('japan')
  },
  {
    value: 'QA',
    label: i18n.t('qatar')
  },
  {
    value: 'SA',
    label: i18n.t('saudi arabia')
  },
  {
    value: 'ZA',
    label: i18n.t('south africa')
  },
  {
    value: 'CH',
    label: i18n.t('switzerland')
  },
  {
    value: 'GB',
    label: i18n.t('united kingdom')
  },
  {
    value: 'US',
    label: i18n.t('usa')
  }
];
export const AVAILABLE_JOBS = [
  {
    value: 'agriculture',
    label: i18n.t('job agriculture')
  },
  {
    value: 'carpenter',
    label: i18n.t('job carpenter')
  },
  {
    value: 'driver',
    label: i18n.t('job driver')
  },
  {
    value: 'electrician',
    label: i18n.t('job electrician')
  },
  {
    value: 'emergency-worker',
    label: i18n.t('job emergency worker')
  },
  {
    value: 'engineer',
    label: i18n.t('job engineer')
  },
  {
    value: 'government-employee',
    label: i18n.t('job government employee')
  },
  {
    value: 'health-safety',
    label: i18n.t('job health safety')
  },
  {
    value: 'laborer-lineman',
    label: i18n.t('job laborer lineman')
  },
  {
    value: 'machine-operator',
    label: i18n.t('job machine operator')
  },
  {
    value: 'maintenance-mechanic',
    label: i18n.t('job maintenance mechanic')
  },
  {
    value: 'marine-worker',
    label: i18n.t('job marine worker')
  },
  {
    value: 'metallurgy',
    label: i18n.t('job metallurgy')
  },
  {
    value: 'miner',
    label: i18n.t('job miner')
  },
  {
    value: 'no-role',
    label: i18n.t('job no role defined')
  },
  {
    value: 'other',
    label: i18n.t('job other')
  },
  {
    value: 'pipeline',
    label: i18n.t('job pipeline')
  },
  {
    value: 'production',
    label: i18n.t('job production')
  },
  {
    value: 'supervisor-foreman',
    label: i18n.t('job supervisor foreman')
  },
  {
    value: 'surveyor',
    label: i18n.t('job surveyor')
  },
  {
    value: 'welder',
    label: i18n.t('job welder')
  }
];
export const permissionLevels = [
  {
    value: 3,
    label: i18n.t('super admin')
  },
  {
    value: 4,
    label: i18n.t('org admin')
  },
  {
    value: 1,
    label: i18n.t('administrator')
  },
  {
    value: 2,
    label: i18n.t('operator')
  }
];
export const RISK_PRIORITIES = {
  low: 1,
  medium: 2,
  high: 3,
  extreme: 4
};
export const PRIORITIES = {
  1: 6,
  2: 3,
  3: 1,
  4: 2,
  7: 4,
  8: 5
};
export const actions = [
  {
    value: 1,
    label: i18n.t('re-invite user')
  },
  {
    value: 2,
    label: i18n.t('remove from team')
  },
  {
    value: 3,
    label: i18n.t('delete user')
  }
];
export const yesNoOptions = [
  {
    value: true,
    label: i18n.t('yes')
  },
  {
    value: false,
    label: i18n.t('no')
  }
];
export const twoFAOptions = [
  {
    title: i18n.t('on'),
    value: true
  },
  {
    title: i18n.t('off'),
    value: false
  }
];
export const passwordMinLengthOptions = [
  {
    title: 6,
    value: 6
  },
  {
    title: 8,
    value: 8
  },
  {
    title: 10,
    value: 10
  }
];
export const passwordExpirationDaysOptions = [
  {
    title: 60,
    value: 60
  },
  {
    title: 90,
    value: 90
  },
  {
    title: 180,
    value: 180
  },
  {
    title: i18n.t('off'),
    value: 0
  }
];
export const hideCbtHROptions = [
  {
    value: true,
    title: i18n.t('yes')
  },
  {
    value: false,
    title: i18n.t('no')
  }
];

export const IMPERIAL = 'imperial';
export const METRIC = 'metric';
export const MALE = 'male';
export const FEMALE = 'female';
export const QUESTION_TYPE_RADIO = 'radio';
export const QUESTION_TYPE_BOOLEAN = 'boolean';

export const HEAT_SUSCEPTIBILITY_HIGH = 'High';
export const HEAT_SUSCEPTIBILITY_MEDIUM = 'Medium';
export const HEAT_SUSCEPTIBILITY_LOW = 'Low';
export const SWEAT_HIGH = 'High';
export const SWEAT_MODERATE = 'MODERATE';
export const SWEAT_LOW = 'Low';
export const ALERT_STAGE_ID_LIST = ['1', '2', '3', '4', '5'];

export const HEAT_SUSCEPTIBILITY_PRIORITIES = {
  [HEAT_SUSCEPTIBILITY_HIGH.toLowerCase()]: 1,
  [HEAT_SUSCEPTIBILITY_MEDIUM.toLowerCase()]: 2,
  [HEAT_SUSCEPTIBILITY_LOW.toLowerCase()]: 3
};

export const SWEAT_PRIORITIES = {
  [SWEAT_HIGH.toLowerCase()]: 1,
  [SWEAT_MODERATE.toLowerCase()]: 2,
  [SWEAT_LOW.toLowerCase()]: 3
};

export const HEAT_SWEAT_CHART_COLORS = ['#ffe699', '#ffc000', '#ed7d31'];
export const COLOR_WHITE = '#fff';
export const INIT_USER_CHART_ALERT_DATA = {
  datasets: [
    {
      label: ``,
      data: [],
      borderWidth: 3,
      borderColor: ``,
      backgroundColor: ``
    }
  ]
};
export const CHART_DATASET = 'Chart Dataset';
export const TABLE_DATA = 'Table Data';
export const NO_EXPORT_DATA = 'No Export Data';
export const VISIBLE_EXPORT_DATA = {
  [NO_EXPORT_DATA]: 0,
  [TABLE_DATA]: 1,
  [CHART_DATASET]: 2
};
export const TYPES = [
  {
    value: 1,
    label: i18n.t('day')
  }
  /*{
    value: 2,
    label: i18n.t('week')
  },*/
];
export const LABELS_HEAT_DOUGHNUT = [i18n.t('low %'), i18n.t('medium'), i18n.t('high')];
export const LABELS_SWEAT_DOUGHNUT = [i18n.t('low %'), i18n.t('moderate'), i18n.t('high')];
export const LABELS_CBT_ZONES_DOUGHNUT = (metric) => [
  metric ? 'Safe to Work < 38.0˚C' : 'Safe to Work < 100.4 ˚F',
  metric ? 'Mild Hyperthermia 38.0˚C - 38.4˚C' : 'Mild Hyperthermia 100.4˚F - 101.2˚F',
  metric ? 'Moderate Hyperthermia >= 38.5˚C' : 'Moderate Hyperthermia >= 101.3˚F'
];
export const HEAT_LOW_MEDIUM_HIGH = ['low', 'medium', 'high'];
export const SWEAT_LOW_MEDIUM_HIGH = ['low', 'moderate', 'high'];

export const ANALYTICS_API_KEYS = {
  WEAR_TIME: 'wearTime',
  ALERT_METRICS: 'alertMetrics',
  MAX_CBT: 'maxCbt',
  MAX_CBT_ALL: 'maxCbtAll',
  MAX_HR_ALL: 'maxHrAll',
  TEMP_CATE_DATA: 'tempCateData',
  DEVICE_DATA: 'deviceData',
  USERS_IN_CBT_ZONES: 'usersInCBTZones',
  TEMP_HUMIDITY: 'tempHumidity',
  SWR_FLUID: 'swrFluid',
  ALERT_USER_COUNT: 'alertedUserCount',
  ACTIVE_USERS: 'activeUsers',
  TEMP_CATE_IN_CBT_ZONES: 'tempCateInCBTZones',
  FLUID_METRICS_BY_TEAM: 'fluidMetricsByTeam',
  CHART_CBT: 'chartCbt',
  TEAM_MEMBER_ALERTS: 'teamMemberAlerts',
  HEART_RATE: 'heartRate'
};

export const METRIC_USER_TABLE_VALUES = {
  WEAR_TIME: 1,
  ALERTS: 2,
  MAX_HEART_CBT: 3, // No usage
  SWR_ACCLIM_SWEAT: 4, // Deprecated
  SWR_ACCLIM_HEAT: 5,
  TIME_SPENT_IN_CBT_ZONES: 6,
  DEVICE_DATA: 7,
  USERS_IN_VARIOUS_CBT_ZONES: 8
};
export const METRIC_TEAM_TABLE_VALUES = {
  AMBIENT_TEMP_HUMIDITY: 20,
  PERCENT_WORKERS_ALERTS: 21,
  ACTIVE_USERS: 22,
  NO_USERS_IN_SWR_CATE: 23,
  NO_USERS_IN_HEAT_CATE: 24,
  NO_USERS_IN_CBT_ZONES: 25,
  NO_USERS_UNACCLIMATED_ACCLIMATED: 26
};
export const METRIC_USER_CHART_VALUES = {
  CBT: 40,
  HR: 41
};
export const METRIC_TEAM_CHART_VALUES = {
  NUMBER_ALERTS_WEEK: 31,
  HIGHEST_CBT_TIME_DAY_WEEK: 32,
  DAY_MAXIMUM_CBT: 33
};

export const DAY_LIST = [
  i18n.t('sun'),
  i18n.t('mon'),
  i18n.t('tues'),
  i18n.t('wed'),
  i18n.t('thurs'),
  i18n.t('fri'),
  i18n.t('sat')
];

export const TIME_LIST = [
  '00:00:00',
  '01:00:00',
  '02:00:00',
  '03:00:00',
  '04:00:00',
  '05:00:00',
  '06:00:00',
  '07:00:00',
  '08:00:00',
  '09:00:00',
  '10:00:00',
  '11:00:00',
  '12:00:00',
  '13:00:00',
  '14:00:00',
  '15:00:00',
  '16:00:00',
  '17:00:00',
  '18:00:00',
  '19:00:00',
  '20:00:00',
  '21:00:00',
  '22:00:00',
  '23:00:00'
];

export const HIGHEST_CHART_CELSIUS_MAX = 101.8;
export const HIGHEST_CHART_CELSIUS_MIN = 98.5;

export const KA_CATEGORY_VALUES = {
  DASHBOARD_SUMMARY: 100,
  WEAR_TIME: 101,
  ALERTS: 102,
  CORE_BODY_TEMPERATURE: 103,
  HEART_RATE: 104
};

export const USER_STATUS_METRICS = [
  {
    label: `${i18n.t('table')} - ${i18n.t('wear time')}`,
    value: METRIC_USER_TABLE_VALUES.WEAR_TIME, // 1,
    category: KA_CATEGORY_VALUES.WEAR_TIME
  },
  {
    label: `${i18n.t('table')} - ${i18n.t('alerts')}`,
    value: METRIC_USER_TABLE_VALUES.ALERTS, // 2
    category: KA_CATEGORY_VALUES.ALERTS
  },
  {
    label: `${i18n.t('table')} - ${i18n.t('swr')}`,
    value: METRIC_USER_TABLE_VALUES.SWR_ACCLIM_SWEAT, // 4
    category: KA_CATEGORY_VALUES.DASHBOARD_SUMMARY
  },
  {
    label: `${i18n.t('table')} - ${i18n.t('heat susceptibility')}`,
    value: METRIC_USER_TABLE_VALUES.SWR_ACCLIM_HEAT, // 5
    category: KA_CATEGORY_VALUES.DASHBOARD_SUMMARY
  },
  {
    label: `${i18n.t('table')} - ${i18n.t('time spent in cbt zones')}`,
    value: METRIC_USER_TABLE_VALUES.TIME_SPENT_IN_CBT_ZONES, // 6
    category: KA_CATEGORY_VALUES.CORE_BODY_TEMPERATURE
  },
  {
    label: `${i18n.t('table')} - ${i18n.t('device data')}`,
    value: METRIC_USER_TABLE_VALUES.DEVICE_DATA, // 7
    category: KA_CATEGORY_VALUES.DASHBOARD_SUMMARY
  },
  {
    // label: `${i18n.t('table')} - ${i18n.t('users in various cbt zones')}`,
    label: `${i18n.t('table')} - Percent of Time in CBT Zones`,
    value: METRIC_USER_TABLE_VALUES.USERS_IN_VARIOUS_CBT_ZONES, // 8
    category: KA_CATEGORY_VALUES.DASHBOARD_SUMMARY
  },
  {
    label: `${i18n.t('chart')} - ${i18n.t('cbt')}`,
    value: METRIC_USER_CHART_VALUES.CBT, // 40
    category: KA_CATEGORY_VALUES.CORE_BODY_TEMPERATURE
  },
  {
    label: `${i18n.t('chart')} - ${i18n.t('hr')}`,
    value: METRIC_USER_CHART_VALUES.HR, // 41
    category: KA_CATEGORY_VALUES.HEART_RATE
  }
];

export const TEAM_STATUS_METRICS = [
  {
    label: `${i18n.t('table')} - ${i18n.t('ambient temp/humidity')}`,
    value: METRIC_TEAM_TABLE_VALUES.AMBIENT_TEMP_HUMIDITY, // 20
    category: KA_CATEGORY_VALUES.ALERTS
  },
  {
    label: `${i18n.t('table')} - ${i18n.t('% of workers with alerts')}`,
    value: METRIC_TEAM_TABLE_VALUES.PERCENT_WORKERS_ALERTS, // 21
    category: KA_CATEGORY_VALUES.ALERTS
  },
  {
    label: `${i18n.t('table')} - ${i18n.t('active users')}`,
    value: METRIC_TEAM_TABLE_VALUES.ACTIVE_USERS, // 22
    category: KA_CATEGORY_VALUES.DASHBOARD_SUMMARY
  },
  {
    label: `${i18n.t('table')} - ${i18n.t('no. of users in swr categories')}`,
    value: METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE, // 23
    category: KA_CATEGORY_VALUES.DASHBOARD_SUMMARY
  },
  {
    label: `${i18n.t('table')} - ${i18n.t('no. of users in heat susceptibility categories')}`,
    value: METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE, // 24
    category: KA_CATEGORY_VALUES.DASHBOARD_SUMMARY
  },
  // {
  //   label: `${i18n.t('table')} - ${i18n.t('no. of users in cbt zones')}`,
  //   value: METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_CBT_ZONES, // 25
  // },
  {
    label: `${i18n.t('table')} - ${i18n.t(
      'no. of users unacclimated, acclimated and previous illness'
    )}`,
    value: METRIC_TEAM_TABLE_VALUES.NO_USERS_UNACCLIMATED_ACCLIMATED, // 26
    category: KA_CATEGORY_VALUES.DASHBOARD_SUMMARY
  },
  // {
  //   label: `${i18n.t('chart')} - ${i18n.t('number of alerts by week')}`,
  //   value: METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK // 31
  // },
  {
    label: `${i18n.t('chart')} - ${i18n.t('highest cbt by time of day and day of week')}`,
    value: METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK, // 32
    category: KA_CATEGORY_VALUES.CORE_BODY_TEMPERATURE
  },
  {
    label: 'Maximum CBT Time of Day',
    value: METRIC_TEAM_CHART_VALUES.DAY_MAXIMUM_CBT,
    category: KA_CATEGORY_VALUES.CORE_BODY_TEMPERATURE
  }
];
export const KA_CATEGORY_SELECT_OPTIONS = [
  {
    label: 'Dashboard Summary',
    value: KA_CATEGORY_VALUES.DASHBOARD_SUMMARY
  },
  {
    label: 'Wear Time',
    value: KA_CATEGORY_VALUES.WEAR_TIME
  },
  {
    label: 'Alerts',
    value: KA_CATEGORY_VALUES.ALERTS
  },
  {
    label: 'Core Body Temperature',
    value: KA_CATEGORY_VALUES.CORE_BODY_TEMPERATURE
  },
  {
    label: 'Heart Rate',
    value: KA_CATEGORY_VALUES.HEART_RATE
  }
];

// export const KA_METRIC_SELECT_OPTIONS = [
//   {
//     label: 'Team Usage Summary',
//     value: METRIC_TEAM_TABLE_VALUES.ACTIVE_USERS,
//     type: 'team',
//     category: KA_CATEGORY_VALUES.DASHBOARD_SUMMARY
//   },
//   {
//     label: 'Heat Susceptibiliy',
//     value: METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE,
//     type: 'team',
//     category: KA_CATEGORY_VALUES.DASHBOARD_SUMMARY
//   },
//   {
//     label: 'Sweat Rate',
//     value: METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE,
//     type: 'team',
//     category: KA_CATEGORY_VALUES.DASHBOARD_SUMMARY
//   },
//   {
//     label: 'User Summary',
//     value: 0,
//     type: 'team',
//     category: KA_CATEGORY_VALUES.DASHBOARD_SUMMARY
//   },
//   {
//     label: 'Total and Average Wear Time Per Team',
//     value: 0,
//     type: 'team',
//     category: KA_CATEGORY_VALUES.WEAR_TIME
//   },
//   {
//     label: 'Total and Average Wear Time Per User',
//     value: METRIC_USER_TABLE_VALUES.WEAR_TIME,
//     type: 'user',
//     category: KA_CATEGORY_VALUES.WEAR_TIME
//   },
//   {
//     label: 'Total Number of Alerts',
//     value: 0,
//     type: 'team',
//     category: KA_CATEGORY_VALUES.ALERTS
//   },
//   {
//     label: 'Percent of Workers with Alerts',
//     value: METRIC_TEAM_TABLE_VALUES.PERCENT_WORKERS_ALERTS,
//     type: 'team',
//     category: KA_CATEGORY_VALUES.ALERTS
//   },
//   {
//     label: 'List of Alerts',
//     value: 0,
//     type: 'team',
//     category: KA_CATEGORY_VALUES.ALERTS
//   },
//   {
//     label: 'List of Alerts by Specific User',
//     value: METRIC_USER_TABLE_VALUES.ALERTS,
//     type: 'user',
//     category: KA_CATEGORY_VALUES.ALERTS
//   },
//   {
//     label: 'Percent of Time Spent in Each Core Body Temperature Zone',
//     value: 0,
//     type: 'team',
//     category: KA_CATEGORY_VALUES.CORE_BODY_TEMPERATURE
//   },
//   {
//     label: 'Maximum Core Body Temperature',
//     value: METRIC_TEAM_CHART_VALUES.DAY_MAXIMUM_CBT,
//     type: 'team',
//     category: KA_CATEGORY_VALUES.CORE_BODY_TEMPERATURE
//   },
//   {
//     label: 'Core Body Temperature Graph',
//     value: METRIC_USER_CHART_VALUES.CBT,
//     type: 'user',
//     category: KA_CATEGORY_VALUES.CORE_BODY_TEMPERATURE
//   },
//   {
//     label: 'Core Body Temperature Percent of Time',
//     value: METRIC_USER_TABLE_VALUES.USERS_IN_VARIOUS_CBT_ZONES,
//     type: 'user',
//     category: KA_CATEGORY_VALUES.CORE_BODY_TEMPERATURE
//   },
//   {
//     label: 'Users Who Reached Identified Heart Rate',
//     value: 0,
//     type: 'team',
//     category: KA_CATEGORY_VALUES.HEART_RATE
//   },
//   {
//     label: 'Heart Rate Graph',
//     value: METRIC_USER_CHART_VALUES.HR,
//     type: 'user',
//     category: KA_CATEGORY_VALUES.HEART_RATE
//   }
// ];

export const SORT_TITLES = [
  i18n.t('a - z'),
  i18n.t('z - a'),
  i18n.t('min to max'),
  i18n.t('max to min'),
  i18n.t('most recent'),
  i18n.t('oldest'),
  i18n.t('risk to safe'),
  i18n.t('safe to risk'),
  i18n.t('extreme to low'),
  i18n.t('low to extreme'),
  i18n.t('high to low'),
  i18n.t('low to high')
];

export const ACTIVITIES_FILTERS = [
  {
    value: 1,
    label: i18n.t('24 hours'),
    noText: i18n.t('no activity logs in 24 hours')
  },
  {
    value: 7,
    label: i18n.t('week'),
    noText: i18n.t('no activity logs in week')
  },
  {
    value: 30,
    label: i18n.t('month'),
    noText: i18n.t('no activity logs in month')
  }
];

export const INVALID_VALUES1 = ['-1', '', null, undefined];
export const INVALID_VALUES2 = [null, undefined, '0', ''];
export const INVALID_VALUES3 = [null, undefined, 'null', 'undefined', ''];
export const INVALID_VALUES4 = ['', null, undefined];
export const MINUTE_OPTIONS = ['00', '15', '30', '45'];
export const ALERT_STAGE_STATUS = {
  AT_RISK: 1,
  ELEVATED_RISK: 2,
  SAFE: 3,
  SAFE_4: 4,
  MANUAL_TEST_ALERT: 5
};
export const STAGE_VALUES = [
  {
    label: 'N/A',
    value: null
  },
  {
    label: 'At Risk',
    value: 1
  },
  {
    label: 'Elevated Risk',
    value: 2
  },
  {
    label: 'Safe',
    value: 3
  },
  {
    label: 'Safe',
    value: 4
  },
  {
    label: 'Manual Test Alert',
    value: 5
  }
];

export const HEART_CBT_VALUES = [
  {
    label: null,
    value: null
  },
  {
    label: 'Safe',
    value: 1
  },
  {
    label: 'At Risk',
    value: 2
  },
  {
    label: 'Extreme Risk',
    value: 3
  }
];
export const HEART_RATE_VALUES = [
  {
    label: null,
    value: null
  },
  {
    label: i18n.t('very light'),
    value: 1
  },
  {
    label: i18n.t('light'),
    value: 2
  },
  {
    label: i18n.t('moderate'),
    value: 3
  },
  {
    label: i18n.t('high'),
    value: 4
  }
];
export const PREFERRED_COUNTRIES = [
  'us',
  'ca',
  'fr',
  'de',
  'jp',
  'cn',
  'au',
  'za',
  'in',
  'qa',
  'gb',
  'sa',
  'es'
];

export const TIME_FORMAT_YYYYMDHM = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
};

export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'June',
  'July',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

export const FT_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
export const IN_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const M_OPTIONS = [1, 2, 3];
export const CM_OPTIONS = Array.from(Array(101).keys()).reverse();

export const NEWS_PAGINATION = 10;
export const NEWS_RECENT_PAGINATION = 5;

export const DEVICE_CONNECTION_STATUS = {
  NEVER_CONNECTION: 1, // deviceId includes none
  CHARGING: 2, // chargingFlag == true && stat.deviceLogTs << 2 mins
  CONNECTED: 3, // ( alert.utcTs << 60 mins || stat.heartRateTs << 60 mins ) && stat.deviceLogTs << 20 mins
  LIMITED_CONNECTION: 4, // stat.deviceLogTs >> 20 mins
  CHECK_DEVICE: 7, // onOff == false && lastOnTs << 20 mins
  NO_CONNECTION: 8 // ( chargingFlag == true && stat.deviceLogTs >> 2 mins ) || ( connected == false && onOff == false)
};

export const ACME_INSTANCE_BASE_URI = 'api.acme.dev.kenzen.com';

export const DEMO_DATA_MINUTE = {
  FULL_CYCLE: 0,
  FIRST: 1,
  FIFTH: 5,
  NONE: -1,
  WITHIN_24_HR: 1140,
  WITHIN_20_MINUTES: 20,
  WITHIN_AN_HOUR: 60,
  OUT_20_MINUTES: -20,
  OUT_24_HR: -1140,
  OUT_AN_HOUR: -60
};

export const SUBSCRIBE_EVENT_DATA_TYPE = {
  ALERT: 'Alert',
  HEART_RATE: 'HeartRate',
  DEVICE_LOG: 'DeviceLog',
  TEMP_HUMIDITY: 'TempHumidity'
};
