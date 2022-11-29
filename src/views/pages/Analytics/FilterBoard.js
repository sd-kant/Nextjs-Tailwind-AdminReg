import * as React from "react";
import clsx from "clsx";
import style from "./FilterBoard.module.scss";

import {customStyles} from "../DashboardV2";
import ResponsiveSelect from "../../components/ResponsiveSelect";
import MultiSelectPopup from "../../components/MultiSelectPopup";
import {useTranslation} from "react-i18next";
import {useBasicContext} from "../../../providers/BasicProvider";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";
import CustomDatePicker from "../../components/CustomDatePicker";
import calendarIcon from "../../../assets/images/calendar.png";
import Toggle from "../../components/Toggle";
import {
  METRIC_USER_TABLE_VALUES,
  METRIC_TEAM_TABLE_VALUES,
  METRIC_USER_CHART_VALUES,
  METRIC_TEAM_CHART_VALUES,
} from "../../../constant";
import {
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
    formattedTeams: teams, setPickedTeams
  } = useBasicContext();
  const [submitTried, setSubmitTried] = React.useState(false);
  const {
    startDate, setStartDate, endDate, setEndDate,
    metrics, metric, setMetric,
    formattedMembers: members,
    setPickedMembers,
    processQuery,
    showBy,
    statsBy,
    setShowBy,
    selectedMetric,
    selectedTeams,
    selectedMembers,
    pickedMembers,
    selectedUsers,
  } = useAnalyticsContext();
  const selectedOrganization = React.useMemo(() => {
    return organizations?.find(it => it.value?.toString() === organization?.toString())
  }, [organizations, organization]);

  const label = React.useMemo(() => {
    if (selectedTeams?.length > 0) {
      if (teams?.length > 1 && (selectedTeams?.length === teams?.length)) {
        return t("all teams");
      } else if (selectedTeams?.length > 1) {
        return t("n teams selected", {n: selectedTeams?.length});
      } else {
        return teams?.find(it => it.value?.toString() === selectedTeams[0]?.value?.toString())?.label;
      }
    } else {
      return t("select team");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeams, teams]);

  const userLabel = React.useMemo(() => {
    if (selectedMembers?.length > 0) {
      if (members?.length > 1 && (selectedMembers?.length === members?.length)) {
        return t("all users");
      } else if (selectedMembers?.length > 1) {
        return t("n users selected", {n: selectedMembers?.length});
      } else {
        return members?.find(it => it.value?.toString() === selectedMembers?.[0]?.value?.toString())?.label;
      }
    } else {
      return t("select user");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMembers, members, organization]);

  const submitActivated = React.useMemo(() => {
    return organization &&
        selectedTeams?.length > 0 &&
        (
            showBy === 'table' || (
                showBy === 'chart' && (
                    statsBy === 'team' ||
                (statsBy === 'user' && pickedMembers?.length > 0 && selectedUsers?.length > 0)))
        );
  }, [organization, selectedTeams, statsBy, showBy, pickedMembers, selectedUsers]);

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
                (showBy === 'table' && (
                    (statsBy === 'user' && !METRIC_USER_TABLE_VALUES.includes(metric)) ||
                    (statsBy === 'team' && !METRIC_TEAM_TABLE_VALUES.includes(metric))
                )) ||
                (showBy === 'chart' && (
                    (statsBy === 'user' && !METRIC_USER_CHART_VALUES.includes(metric)) ||
                    (statsBy === 'team' && !METRIC_TEAM_CHART_VALUES.includes(metric))
                ))
            ))
    ) {
      errors.metric = showBy === 'table' ? t("metric required") : t("chart required");
    }
    return errors;
  }, [startDate, endDate, metric, statsBy, showBy, t]);

  React.useEffect(() => {
    if (!selectedMetric) return;
    if (METRIC_USER_CHART_VALUES.includes(selectedMetric?.value)) {
      // local time
      setEndDate(new Date());
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      setStartDate(start);
    } else if (
        METRIC_TEAM_CHART_VALUES[1] === selectedMetric?.value ||
        METRIC_TEAM_CHART_VALUES[2] === selectedMetric?.value
    ) {
      const week = getThisWeek();
      setStartDate(week.startDate);
      setEndDate(week.endDate);
    }
  }, [selectedMetric, setStartDate, setEndDate]);

  const startDateMax = new Date();
  const endDateMax = new Date();
  endDateMax.setDate(endDateMax.getDate() + 1);

  return (
      <div>
        <div className="d-flex flex-column">

          <div className='mb-10'>
            <Toggle
                on={showBy === 'chart'}
                titleOn={t("table")}
                titleOff={t("chart")}
                handleSwitch={v => {
                  setShowBy(v ? 'chart' : 'table');
                }}
            />
          </div>

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
              <div className={"d-flex flex-column mt-40"}>
            <span className='font-input-label mb-10'>
              {t("team")}
            </span>

                <MultiSelectPopup
                    label={label}
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
              <div className={"d-flex flex-column mt-40"}>
            <span className='font-input-label mb-10'>
              {t("users")}
            </span>

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

        <div className="mt-40 d-flex flex-column">
        <span className='font-input-label'>
          {t("date range")}
        </span>

          <CustomDatePicker
              date={startDate}
              setDate={setStartDate}
              CustomInput={CustomInput}
              maxDate={startDateMax}
              selectedMetric={selectedMetric}
          />
          <CustomDatePicker
              date={endDate}
              setDate={setEndDate}
              CustomInput={CustomInput}
              maxDate={endDateMax}
              selectedMetric={selectedMetric}
          />

          {
            submitTried && errors?.dateRange && (
                <span className="font-helper-text text-error mt-10">{errors.dateRange}</span>
            )
          }
        </div>

        <div className="mt-40 d-flex flex-column">
        <span className='font-input-label'>
          {showBy === 'table' ? t("select metric") : t('select chart')}
        </span>

          <ResponsiveSelect
              className='mt-10 font-heading-small text-black'
              isClearable
              options={metrics}
              value={selectedMetric}
              styles={customStyles()}
              placeholder={showBy === 'table' ? t("select metric") : t("select chart")}
              onChange={v => setMetric(v?.value)}
          />

          {
            submitTried && errors?.metric && (
                <span className="font-helper-text text-error mt-10">{errors.metric}</span>
            )
          }
        </div>

        <div className="mt-40">
          <button
              className={`${(submitActivated && !errors.metric && !errors.dateRange) ? 'active cursor-pointer' : 'inactive cursor-default'} button`}
              onClick={submit}
          ><span className='font-button-label text-white text-uppercase'>{t("process")}</span>
          </button>
        </div>
      </div>
  )
};

export default FilterBoard;
