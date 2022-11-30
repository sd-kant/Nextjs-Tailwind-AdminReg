import i18n from '../i18nextInit';

export const USER_TYPE_ADMIN = "Admin";
export const USER_TYPE_ORG_ADMIN = "OrgAdmin";
export const USER_TYPE_TEAM_ADMIN = "TeamAdmin";
export const USER_TYPE_OPERATOR = "Operator";

export const CURRENT_VERSION = "3.8.27";
export const AVAILABLE_COUNTRIES = [
  {
    "value": "AU",
    "label": i18n.t("australia"),
  },
  {
    "value": "CA",
    "label": i18n.t("canada"),
  },
  {
    "value": "FR",
    "label": i18n.t("france"),
  },
  {
    "value": "IN",
    "label": i18n.t("india"),
  },
  {
    "value": "JP",
    "label": i18n.t("japan"),
  },
  {
    "value": "QA",
    "label": i18n.t("qatar"),
  },
  {
    "value": "SA",
    "label": i18n.t("saudi arabia"),
  },
  {
    "value": "ZA",
    "label": i18n.t("south africa"),
  },
  {
    "value": "CH",
    "label": i18n.t("switzerland"),
  },
  {
    "value": "GB",
    "label": i18n.t("united kingdom"),
  },
  {
    "value": "US",
    "label": i18n.t("usa"),
  },
];
export const AVAILABLE_JOBS = [
  {
    value: "agriculture",
    label: i18n.t("job agriculture"),
  },
  {
    value: "carpenter",
    label: i18n.t("job carpenter"),
  },
  {
    value: "driver",
    label: i18n.t("job driver"),
  },
  {
    value: "electrician",
    label: i18n.t("job electrician"),
  },
  {
    value: "emergency-worker",
    label: i18n.t("job emergency worker"),
  },
  {
    value: "engineer",
    label: i18n.t("job engineer"),
  },
  {
    value: "government-employee",
    label: i18n.t("job government employee"),
  },
  {
    value: "health-safety",
    label: i18n.t("job health safety"),
  },
  {
    value: "laborer-lineman",
    label: i18n.t("job laborer lineman"),
  },
  {
    value: "machine-operator",
    label: i18n.t("job machine operator"),
  },
  {
    value: "maintenance-mechanic",
    label: i18n.t("job maintenance mechanic"),
  },
  {
    value: "marine-worker",
    label: i18n.t("job marine worker"),
  },
  {
    value: "metallurgy",
    label: i18n.t("job metallurgy"),
  },
  {
    value: "miner",
    label: i18n.t("job miner"),
  },
  {
    value: "no-role",
    label: i18n.t("job no role defined"),
  },
  {
    value: "other",
    label: i18n.t("job other"),
  },
  {
    value: "pipeline",
    label: i18n.t("job pipeline"),
  },
  {
    value: "production",
    label: i18n.t("job production"),
  },
  {
    value: "supervisor-foreman",
    label: i18n.t("job supervisor foreman"),
  },
  {
    value: "surveyor",
    label: i18n.t("job surveyor"),
  },
  {
    value: "welder",
    label: i18n.t("job welder"),
  },
];
export const permissionLevels = [
  {
    value: 3,
    label: i18n.t('super admin'),
  },
  {
    value: 4,
    label: i18n.t('org admin'),
  },
  {
    value: 1,
    label: i18n.t('administrator'),
  },
  {
    value: 2,
    label: i18n.t('operator'),
  },
];
export const actions = [
  {
    value: 1,
    label: i18n.t('re-invite user'),
  },
  {
    value: 2,
    label: i18n.t('remove from team'),
  },
  {
    value: 3,
    label: i18n.t('delete user'),
  },
];
export const yesNoOptions = [
  {
    value: true,
    label: i18n.t('yes'),
  },
  {
    value: false,
    label: i18n.t('no'),
  },
];
export const twoFAOptions = [
  {
    title: i18n.t('on'),
    value: true,
  }, {
    title: i18n.t('off'),
    value: false,
  },
];
export const passwordMinLengthOptions = [
  {
    title: 6,
    value: 6,
  }, {
    title: 8,
    value: 8,
  }, {
    title: 10,
    value: 10,
  },
];
export const passwordExpirationDaysOptions = [
  {
    title: 60,
    value: 60,
  }, {
    title: 90,
    value: 90,
  }, {
    title: 180,
    value: 180,
  }, {
    title: i18n.t('off'),
    value: 0,
  },
];
export const hideCbtHROptions = [
  {
    value: true,
    title: i18n.t('yes'),
  },
  {
    value: false,
    title: i18n.t('no'),
  },
];

export const IMPERIAL = "imperial";
export const METRIC = "metric";
export const MALE = "male";
export const FEMALE = "female";
export const QUESTION_TYPE_RADIO = "radio";
export const QUESTION_TYPE_BOOLEAN = "boolean";

export const HEAT_SUSCEPTIBILITY_LOW = "Low";
export const HEAT_SUSCEPTIBILITY_MEDIUM = "Medium";
export const HEAT_SUSCEPTIBILITY_HIGH = "High";
export const ALERT_STAGE_ID_LIST = ["1", "2", "3", "4"];

export const HEAT_SWEAT_CHART_COLORS = ['#ffe699', '#ffc000', '#ed7d31'];
export const COLOR_WHITE = '#fff';
export const INIT_USER_CHART_ALERT_DATA = {
  labels: [],
  datasets: [
    {
      label: ``,
      data: [],
      borderWidth: 3,
      borderColor: ``,
      backgroundColor: ``,
    },
  ],
};
export const TYPES = [
  {
    value: 1,
    label: i18n.t('day')
  },
  {
    value: 2,
    label: i18n.t('week')
  },
];
export const LABELS_DOUGHNUT = [
  i18n.t('low %'),
  i18n.t('medium'),
  i18n.t('high')
];
export const HEAT_LOW_MEDIUM_HIGH = [
  "low", "medium", "high"
];

export const ANALYTICS_API_KEYS = {
  WEAR_TIME: 'wearTime',
  ALERT_METRICS: 'alertMetrics',
  MAX_CBT: 'maxCbt',
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
};

export const METRIC_USER_TABLE_VALUES = {
  WEAR_TIME:  1,
  ALERTS: 2,
  MAX_HEART_CBT: 3,
  SWR_ACCLIM: 5,
  TIME_SPENT_IN_CBT_ZONES: 6,
  DEVICE_DATA: 7,
  USERS_IN_VARIOUS_CBT_ZONES: 8,
};
export const METRIC_TEAM_TABLE_VALUES = {
  AMBIENT_TEMP_HUMIDITY: 20,
  PERCENT_WORKERS_ALERTS: 21,
  ACTIVE_USERS: 22,
  NO_USERS_IN_SWR_CATE: 23,
  NO_USERS_IN_HEAT_CATE: 24,
  NO_USERS_IN_CBT_ZONES: 25,
  NO_USERS_UNACCLIMATED_ACCLIMATED: 26,
};
export const METRIC_USER_CHART_VALUES = {
  CBT: 40,
  HR: 41,
};
export const METRIC_TEAM_CHART_VALUES = {
  HEAT_SUSCEPTIBILITY_SWEAT_RATE: 30,
  NUMBER_ALERTS_WEEK: 31,
  HIGHEST_CBT_TIME_DAY_WEEK: 32,
};

export const DAY_LIST = [
  i18n.t('sun'),
  i18n.t('mon'),
  i18n.t('tues'),
  i18n.t('wed'),
  i18n.t('thurs'),
  i18n.t('fri'),
  i18n.t('sat'),
];
export const MONTH_LIST = [
  i18n.t("jan"),
  i18n.t("feb"),
  i18n.t("mar"),
  i18n.t("apr"),
  i18n.t("may"),
  i18n.t("june"),
  i18n.t("july"),
  i18n.t("aug"),
  i18n.t("sep"),
  i18n.t("oct"),
  i18n.t("nov"),
  i18n.t("dec")
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