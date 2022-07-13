import * as React from "react";
import clsx from "clsx";
import style from "./FilterBoard.module.scss";

import ResponsiveSelect from "../../components/ResponsiveSelect";
import {useTranslation} from "react-i18next";
import {useBasicContext} from "../../../providers/BasicProvider";
import MultiSelectPopup from "../../components/MultiSelectPopup";
import {customStyles} from "../DashboardV2";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";
import {dateFormat} from "../../../utils";

const FilterBoard = () => {
  const {t} = useTranslation();
  const {
    formattedOrganizations: organizations,
    organization, setOrganization,
    formattedTeams: teams, pickedTeams, setPickedTeams,
  } = useBasicContext();
  const [submitTried, setSubmitTried] = React.useState(false);
  const {
    startDate, setStartDate, endDate, setEndDate,
    metrics, metric, setMetric,
    formattedMembers: members, pickedMembers, setPickedMembers,
  } = useAnalyticsContext();
  const selectedOrganization = React.useMemo(() => {
    return organizations?.find(it => it.value?.toString() === organization?.toString())
  }, [organizations, organization]);
  const selectedMetric = React.useMemo(() => {
    return metrics?.find(it => it.value?.toString() === metric?.toString())
  }, [metric, metrics]);
  const label = React.useMemo(() => {
    if (pickedTeams?.length > 0) {
      if (teams?.length > 1 && (pickedTeams?.length === teams?.length)) {
        return t("all teams");
      } else if (pickedTeams?.length > 1) {
        return t("n teams selected", {n: pickedTeams.length});
      } else {
        return teams?.find(it => it.value?.toString() === pickedTeams?.[0]?.toString())?.label;
      }
    } else {
      return t("select team");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedTeams, teams]);
  const selectedTeams = React.useMemo(() => {
    return teams?.filter(it => pickedTeams.some(ele => ele.toString() === it.value?.toString()))
  }, [pickedTeams, teams]);
  const userLabel = React.useMemo(() => {
    if (pickedMembers?.length > 0) {
      if (members?.length > 1 && (pickedMembers?.length === members?.length)) {
        return t("all users");
      } else if (pickedMembers?.length > 1) {
        return t("n users selected", {n: pickedMembers.length});
      } else {
        return members?.find(it => it.value?.toString() === pickedMembers?.[0]?.toString())?.label;
      }
    } else {
      return t("select user");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedMembers, members]);
  const selectedMembers = React.useMemo(() => {
    return members?.filter(it => pickedMembers.some(ele => ele.toString() === it.value?.toString()))
  }, [pickedMembers, members]);
  const submit = () => {
    setSubmitTried(true);
    if (Object.values(errors).some(it => !!it)) {
      console.log("please fix error");
    } else {
      console.log("submit!");
    }
  }
  const errors = React.useMemo(() => {
    const errors = {
      dateRange: null,
      metric: null,
    };
    if (!startDate || !endDate || startDate >= endDate) {
      errors.dateRange = t("date range invalid")
    }
    if (!metric) {
      errors.metric = t("metric required");
    }
    return errors;
  }, [startDate, endDate, metric]);

  const d = new Date();
  const startDateMax = dateFormat(d);
  d.setDate(d.getDate() + 1)
  const endDateMax = dateFormat(d);

  return (
    <div>
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
          onChange={v => setOrganization(v.value)}
        />
      </div>

      {
        teams?.length > 0 ?
          <div className={"d-flex flex-column mt-40"}>
            <label className='font-input-label mb-10'>
              {t("team")}
            </label>

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
        members?.length > 0 ?
          <div className={"d-flex flex-column mt-40"}>
            <label className='font-input-label mb-10'>
              Users
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

      <div className="mt-40 d-flex flex-column">
        <label className='font-input-label'>
          {t("date range")}
        </label>

        <input
          className={clsx('input mt-10 font-heading-small text-white', style.InputField)}
          type='date'
          value={startDate}
          max={startDateMax}
          onChange={v => setStartDate(v.target.value)}
        />

        <input
          className={clsx('input mt-15 font-heading-small text-white', style.InputField)}
          type='date'
          value={endDate}
          max={endDateMax}
          onChange={v => setEndDate(v.target.value)}
        />

        {
          submitTried && errors?.dateRange && (
            <span className="font-helper-text text-error mt-10">{errors.dateRange}</span>
          )
        }
      </div>

      <div className="mt-40 d-flex flex-column">
        <label className='font-input-label'>
          {t("select metric")}
        </label>

        <ResponsiveSelect
          className='mt-10 font-heading-small text-black'
          isClearable
          options={metrics}
          value={selectedMetric}
          styles={customStyles()}
          placeholder={t("select company")}
          onChange={v => setMetric(v.value)}
        />

        {
          submitTried && errors?.metric && (
            <span className="font-helper-text text-error mt-10">{errors.metric}</span>
          )
        }
      </div>

      <div className="mt-40">
        <button
          className={`active cursor-pointer button`}
          onClick={submit}
        ><span className='font-button-label text-white text-uppercase'>{t("process")}</span>
        </button>
      </div>
    </div>
  )
}

export default FilterBoard;
