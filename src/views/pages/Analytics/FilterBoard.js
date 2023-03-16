import * as React from "react";
import clsx from "clsx";
import ReactToPrint from "react-to-print";
import {useTranslation} from "react-i18next";

import style from "./FilterBoard.module.scss";
import {customStyles} from "../DashboardV2";
import ResponsiveSelect from "../../components/ResponsiveSelect";
import MultiSelectPopup from "../../components/MultiSelectPopup";
import {useBasicContext} from "../../../providers/BasicProvider";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";
import CustomDatePicker from "../../components/CustomDatePicker";
import calendarIcon from "../../../assets/images/calendar.png";

import {
  METRIC_USER_TABLE_VALUES,
  METRIC_TEAM_TABLE_VALUES,
  METRIC_USER_CHART_VALUES,
  METRIC_TEAM_CHART_VALUES,
} from "../../../constant";
import {
  checkMetric,
  getKeyApiCall,
  getThisWeek
} from "../../../utils/anlytics";

const CustomInput = React.forwardRef(({value, onClick}, ref) => (
    <div className={clsx(style.CustomInputWrapper)} onClick={onClick}>
      <input
          className={clsx('input mt-10 font-heading-small text-white', style.InputField)}
          type='text'
          ref={ref}
          placeholder={'mm/dd/yyyy'}
          value={value}
          readOnly
      />
      <img src={calendarIcon} className={clsx(style.CalendarIcon)} alt="calendar"/>
    </div>
));

CustomInput.displayName = 'CustomInput';

const FilterBoard = () => {
  const {t} = useTranslation();
  const {
    formattedOrganizations: organizations,
    organization, setOrganization,
    formattedTeams: teams,
    setPickedTeams,
  } = useBasicContext();
  const [submitTried, setSubmitTried] = React.useState(false);
  const {
    startDate, setStartDate, endDate, setEndDate,
    metrics, metric, setMetric,
    formattedMembers: members,
    setPickedMembers,
    processQuery,
    statsBy,
    selectedMetric,
    selectedTeams,
    selectedMembers,
    pickedMembers,
    selectedUsers,
    teamLabel,
    userLabel,
    chartRef,
    setLoading,
    isEnablePrint,
    organizationAnalytics,
  } = useAnalyticsContext();
  const selectedOrganization = React.useMemo(() => {
    return organizations?.find(it => it.value?.toString() === organization?.toString())
  }, [organizations, organization]);

  const onBeforeGetContentResolve = React.useRef(null);

  const submitActivated = React.useMemo(() => {
    return organization &&
        selectedTeams?.length > 0 && (
            statsBy === 'team' ||
            (
                statsBy === 'user' && (
                    checkMetric(METRIC_USER_TABLE_VALUES, metric) || (
                        checkMetric(METRIC_USER_CHART_VALUES, metric) && pickedMembers?.length > 0 && selectedUsers?.length > 0)
                )
            )
        );
  }, [organization, selectedTeams, statsBy, pickedMembers, selectedUsers, metric]);

  const submit = () => {
    if (!submitActivated && !errors.metric && !errors.dateRange) return;
    setSubmitTried(true);
    if (!(Object.values(errors).some(it => !!it))) {
      processQuery();
    }
  };
  const errors = React.useMemo(() => {
    const errors = {
      dateRange: null,
      metric: null,
    };
    if (!startDate || !endDate || startDate >= endDate) {
      errors.dateRange = t("date range invalid")
    }
    if (
        !metric ||
        (
            metric && (
                (statsBy === 'user' && (!checkMetric(METRIC_USER_TABLE_VALUES, metric) && !checkMetric(METRIC_USER_CHART_VALUES, metric))) ||
                (statsBy === 'team' && (!checkMetric(METRIC_TEAM_TABLE_VALUES, metric) && !checkMetric(METRIC_TEAM_CHART_VALUES, metric)))
            ))
    ) {
      errors.metric = t("metric required");
    }
    return errors;
  }, [startDate, endDate, metric, statsBy, t]);

  const showChart = React.useCallback(() => {
    if (!selectedMetric) return false;
    else {
      return (
          [
            METRIC_USER_TABLE_VALUES.SWR_ACCLIM,
            METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE,
            METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE,
            METRIC_TEAM_CHART_VALUES.HEAT_SUSCEPTIBILITY_SWEAT_RATE,
            METRIC_USER_TABLE_VALUES.ALERTS,
            METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK,
            METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK,
            METRIC_USER_CHART_VALUES.CBT,
            METRIC_USER_CHART_VALUES.HR,
          ].includes(selectedMetric?.value) && isEnablePrint
      )
    }
  }, [selectedMetric, isEnablePrint]);

  const fileName = React.useMemo(() => {
    if (
        selectedMetric?.value === METRIC_USER_TABLE_VALUES.SWR_ACCLIM ||
        selectedMetric?.value === METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_SWR_CATE ||
        selectedMetric?.value === METRIC_TEAM_TABLE_VALUES.NO_USERS_IN_HEAT_CATE ||
        selectedMetric?.value === METRIC_TEAM_CHART_VALUES.HEAT_SUSCEPTIBILITY_SWEAT_RATE
    ) // 5, 23, 24, 30
      return "Heat-Sweat-Chart";
    else if (
        selectedMetric?.value === METRIC_USER_TABLE_VALUES.ALERTS ||
        selectedMetric?.value === METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK
    ) // 2, 31
      return "Alert-Chart";
    else if (selectedMetric?.value === METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK) // 32
      return "Max-Cbt-Chart";
    else if (selectedMetric?.value === METRIC_USER_CHART_VALUES.CBT) // 40
      return "Cbt-Chart";
    else if (selectedMetric?.value === METRIC_USER_CHART_VALUES.HR) // 41
      return "Hr-Chart";
  }, [selectedMetric]);

  React.useEffect(() => {
    if (!selectedMetric) return;
    if (checkMetric(METRIC_USER_CHART_VALUES, selectedMetric?.value)) {
      // local time
      setEndDate(new Date());
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      setStartDate(start);
    } else if (
        METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK === selectedMetric?.value ||
        METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK === selectedMetric?.value
    ) {
      const week = getThisWeek();
      setStartDate(week.startDate);
      setEndDate(week.endDate);
    }
  }, [selectedMetric, setStartDate, setEndDate]);

  /**
   * print chart
   * onAfterPrint called
   */
  const handleAfterPrint = React.useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  /**
   * onBeforePrint called
   */
  const handleBeforePrint = React.useCallback(() => {
    setLoading(true);
  }, [setLoading]);

  /**
   * onBeforeGetContent called
   */
  const handleOnBeforeGetContent = React.useCallback(() => {
    if (showChart())
      setLoading(true);
    return new Promise((resolve) => {
      onBeforeGetContentResolve.current = resolve;

      setTimeout(() => {
        resolve();
        setLoading(false);
      }, 2000);
    });
  }, [setLoading, showChart]);

  const reactToPrintContent = React.useCallback(() => {
    return chartRef.current;
  }, [chartRef]);

  const reactToPrintTrigger = React.useCallback(() => {
    return (
        <button
            className={
              `${showChart() && selectedMetric?.value && Object.keys(organizationAnalytics).includes(getKeyApiCall(selectedMetric?.value).keys[0]) ? 
                'active cursor-pointer' 
                : 
                'inactive cursor-default'} button`
            }>
          <span className='font-button-label text-white text-uppercase'>{t("print")}</span>
        </button>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMetric, isEnablePrint, organizationAnalytics]);

  const startDateMax = new Date();
  const endDateMax = new Date();
  endDateMax.setDate(endDateMax.getDate() + 1);

  return (
      <div>
        <div className={clsx(style.FilterDiv, "d-flex justify-start")}>
          <div className="d-flex flex-column">

            <label className='font-input-label'>
              {t("company name")}
            </label>

            <ResponsiveSelect
                className='mt-10 font-heading-small text-black'
                isClearable
                options={organizations}
                value={selectedOrganization}
                styles={customStyles()}
                placeholder={t("select company")}
                onChange={v => setOrganization(v?.value)}
            />
          </div>

          {
            teams?.length > 0 ?
                <div className={"d-flex flex-column"}>
                  <label className='font-input-label mb-10'>
                    {t("team")}
                  </label>

                  <MultiSelectPopup
                      label={teamLabel}
                      options={teams}
                      value={selectedTeams}
                      onChange={v => {
                        setPickedTeams(v?.map(it => it.value));
                      }}
                  />
                </div> : null
          }

          {
            (selectedTeams?.length > 0 && members?.length > 0) ?
                <div className={"d-flex flex-column"}>
                  <label className='font-input-label mb-10'>
                    {t("users")}
                  </label>

                  <MultiSelectPopup
                      label={userLabel}
                      options={members}
                      value={selectedMembers}
                      onChange={v => {
                        setPickedMembers(v?.map(it => it.value));
                      }}
                  />
                </div> : null
          }

          <div className="d-flex flex-column">
            <label className='font-input-label'>
              {t("start date")}
            </label>
            <div className={clsx(style.FlexLeft)}>
              <CustomDatePicker
                  date={startDate}
                  setDate={setStartDate}
                  CustomInput={CustomInput}
                  maxDate={startDateMax}
                  selectedMetric={selectedMetric}
              />
            </div>
            {
              submitTried && errors?.dateRange && (
                  <span className="font-helper-text text-error mt-10">{errors.dateRange}</span>
              )
            }
          </div>

          <div className="d-flex flex-column">
            <label className='font-input-label'>
              {t("end date")}
            </label>
            <div className={clsx(style.FlexLeft)}>
              <CustomDatePicker
                  date={endDate}
                  setDate={setEndDate}
                  CustomInput={CustomInput}
                  maxDate={endDateMax}
                  selectedMetric={selectedMetric}
              />
            </div>
          </div>

          <div className="d-flex flex-column">
            <label className='font-input-label'>
              {t("select metric")}
            </label>

            <ResponsiveSelect
                className='mt-10 font-heading-small text-black'
                isClearable
                options={metrics}
                value={selectedMetric}
                styles={customStyles()}
                placeholder={t("select metric")}
                onChange={v => setMetric(v?.value)}
            />

            {
              submitTried && errors?.metric && (
                  <span className="font-helper-text text-error mt-10">{errors.metric}</span>
              )
            }
          </div>
          <span className="mt-40">
            <button
                className={`${(submitActivated && !errors.metric && !errors.dateRange) ? 'active cursor-pointer' : 'inactive cursor-default'} button`}
                onClick={submit}
            ><span className='font-button-label text-white text-uppercase'>{t("process")}</span>
            </button>
          </span>
          <span className="mt-40">
            <ReactToPrint
                content={reactToPrintContent}
                documentTitle={fileName}
                onAfterPrint={handleAfterPrint}
                onBeforeGetContent={handleOnBeforeGetContent}
                onBeforePrint={handleBeforePrint}
                removeAfterPrint
                trigger={reactToPrintTrigger}
            />
          </span>
        </div>
      </div>
  )
};

export default FilterBoard;
