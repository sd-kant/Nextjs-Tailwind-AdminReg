import * as React from 'react';
import {
  getTeamAlerts,
  getTeamDevices,
  getTeamStats, inviteTeamMemberV2,
  queryAllOrganizations,
  queryTeamMembers,
  queryTeams,
  subscribeDataEvents, unlockUser
} from "../http";
import axios from "axios";
import {
  getLatestDateBeforeNow as getLatestDate,
  getParamFromUrl,
  numMinutesBetweenWithNow as numMinutesBetween,
  updateUrlParam,
} from "../utils";
import {withTranslation} from "react-i18next";
import {get} from "lodash";
import {
  ALERT_STAGE_ID_LIST,
  USER_TYPE_ADMIN,
  USER_TYPE_OPERATOR,
  USER_TYPE_ORG_ADMIN,
  USER_TYPE_TEAM_ADMIN
} from "../constant";
import useForceUpdate from "../hooks/useForceUpdate";
import {useNotificationContext} from "./NotificationProvider";
import {formatLastSync, sortMembers} from "../utils/dashboard";
import {setLoadingAction} from "../redux/action/ui";
import {useUtilsContext} from "./UtilsProvider";

const AnalyticsContext = React.createContext(null);

export const AnalyticsProvider = (
  {
    children,
  }) => {
  const [users, setUsers] = React.useState([]);
  const [pickedUsers, setPickedUsers] = React.useState([]);
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const metrics = [
    {
      label: 'Metric 1',
      value: 1,
    },
    {
      label: 'Metric 2',
      value: 2,
    }
  ];
  const [metric, setMetric] = React.useState(null);
  const formattedUsers = React.useMemo(() => {
    const ret = [];
    users?.forEach(user => {
      ret.push({
        value: user.id,
        label: `${user.firstName} ${user.lastName}`,
      });
    });

    return ret;
  }, [users]);

  const providerValue = {
    users,
    setUsers,
    formattedUsers,
    pickedUsers,
    setPickedUsers,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    metrics,
    metric,
    setMetric,
  };

  return (
    <AnalyticsContext.Provider value={providerValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => {
  const context = React.useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalyticsContext must be used within AnalyticsProvider");
  }
  return context;
};
