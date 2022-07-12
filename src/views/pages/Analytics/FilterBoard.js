import * as React from "react";
import clsx from "clsx";
import style from "./FilterBoard.module.scss";

import ResponsiveSelect from "../../components/ResponsiveSelect";
import {useTranslation} from "react-i18next";
import {useBasicContext} from "../../../providers/BasicProvider";
import MultiSelectPopup from "../../components/MultiSelectPopup";
import {customStyles} from "../DashboardV2";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";

const FilterBoard = () => {
  const {t} = useTranslation();
  const {
    formattedOrganizations: organizations,
    organization, setOrganization,
    formattedTeams: teams, pickedTeams, setPickedTeams,
  } = useBasicContext();
  const {
    startDate, setStartDate, endDate, setEndDate,
    metrics, metric, setMetric,
    formattedUsers: users, pickedUsers, setPickedUsers,
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
    if (pickedUsers?.length > 0) {
      if (users?.length > 1 && (pickedUsers?.length === users?.length)) {
        return t("all users");
      } else if (pickedUsers?.length > 1) {
        return t("n users selected", {n: pickedUsers.length});
      } else {
        return users?.find(it => it.value?.toString() === pickedUsers?.[0]?.toString())?.label;
      }
    } else {
      return t("select user");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedUsers, users]);
  const selectedUsers = React.useMemo(() => {
    return users?.filter(it => pickedUsers.some(ele => ele.toString() === it.value?.toString()))
  }, [pickedUsers, users]);

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
        users?.length > 0 ?
          <div className={"d-flex flex-column mt-40"}>
            <label className='font-input-label mb-10'>
              Users
            </label>

            <MultiSelectPopup
              label={label}
              options={users}
              value={selectedUsers}
              onChange={v => {
                setPickedUsers(v?.map(it => it.value));
              }}
            />
          </div> : null
      }

      <div className="mt-40 d-flex flex-column">
        <label className='font-input-label'>
          {t("dob")}
        </label>

        <input
          className={clsx('input mt-10 font-heading-small text-white', style.InputField)}
          type='date'
          value={startDate}
          onChange={v => setStartDate(v.target.value)}
        />

        <input
          className={clsx('input mt-15 font-heading-small text-white', style.InputField)}
          type='date'
          value={endDate}
          onChange={v => setEndDate(v.target.value)}
        />
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
      </div>
    </div>
  )
}

export default FilterBoard;
