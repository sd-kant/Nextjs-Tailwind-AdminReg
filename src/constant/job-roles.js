import i18n from "../i18nextInit";

const AVAILABLE_JOBS = [
  {
    value: "1",
    label: "job health safety",
  },
  {
    value: "2",
    label: "job superintendent",
  },
  {
    value: "3",
    label: "job supervisor",
  },
  {
    value: "4",
    label: "job project manager",
  },
  {
    value: "5",
    label: "job healthcare professional",
  },
  {
    value: "6",
    label: "job welder",
  },
  {
    value: "7",
    label: "job engineer",
  },
  {
    value: "8",
    label: "job it security",
  },
  {
    value: "9",
    label: "job electrician",
  },
  {
    value: "10",
    label: "job site security",
  },
  {
    value: "11",
    label: "job laborer",
  },
  {
    value: "12",
    label: "job surveyor",
  },
  {
    value: "13",
    label: "job carpenter",
  },
  {
    value: "14",
    label: "job no role defined",
  },
];

let Export_Available_Jobs = [];

function updateTranslations () {
  Export_Available_Jobs = AVAILABLE_JOBS.map(job => ({
    ...job,
    label: i18n.t(job.label),
  }));
}

// i18next seems ready -> initial fill translations
if (i18n.isInitialized) {
  updateTranslations();
}

// reset translations to new values on language change
i18n.on('languageChanged', function(lng) {
  updateTranslations();
});

// we loaded some translation file? reset needed?!?
// https://www.i18next.com/overview/api#store-events
i18n.on('loaded', function(lng) {
  updateTranslations();
});

export default Export_Available_Jobs;