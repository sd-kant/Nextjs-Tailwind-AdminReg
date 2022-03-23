import i18n from '../i18nextInit';

export const USER_TYPE_ADMIN = "Admin";
export const USER_TYPE_ORG_ADMIN = "OrgAdmin";
export const USER_TYPE_TEAM_ADMIN = "TeamAdmin";
export const USER_TYPE_OPERATOR = "Operator";

export const CURRENT_VERSION = "3.2.3";
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
    value: "1",
    label: i18n.t("job health safety"),
  },
  {
    value: "2",
    label: i18n.t("job superintendent"),
  },
  {
    value: "3",
    label: i18n.t("job supervisor"),
  },
  {
    value: "4",
    label: i18n.t("job project manager"),
  },
  {
    value: "5",
    label: i18n.t("job healthcare professional"),
  },
  {
    value: "6",
    label: i18n.t("job welder"),
  },
  {
    value: "7",
    label: i18n.t("job engineer"),
  },
  {
    value: "8",
    label: i18n.t("job it security"),
  },
  {
    value: "9",
    label: i18n.t("job electrician"),
  },
  {
    value: "10",
    label: i18n.t("job site security"),
  },
  {
    value: "11",
    label: i18n.t("job laborer"),
  },
  {
    value: "12",
    label: i18n.t("job surveyor"),
  },
  {
    value: "13",
    label: i18n.t("job carpenter"),
  },
  {
    value: "14",
    label: i18n.t("job no role defined"),
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

export const IMPERIAL = "Imperial";
export const METRIC = "Metric";
export const QUESTION_TYPE_RADIO = "radio";
export const QUESTION_TYPE_BOOLEAN = "boolean";
