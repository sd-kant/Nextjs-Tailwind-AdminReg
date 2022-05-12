import i18n from '../i18nextInit';

export const USER_TYPE_ADMIN = "Admin";
export const USER_TYPE_ORG_ADMIN = "OrgAdmin";
export const USER_TYPE_TEAM_ADMIN = "TeamAdmin";
export const USER_TYPE_OPERATOR = "Operator";

export const CURRENT_VERSION = "3.7.64";
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
  },{
    title: 90,
    value: 90,
  },{
    title: 180,
    value: 180,
  },{
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
