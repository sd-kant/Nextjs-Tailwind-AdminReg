import * as React from 'react';
import {
  queryOrganizationWearTime,
  getTeamAlerts,
  getTeamDevices,
  getTeamStats, inviteTeamMemberV2,
  queryAllOrganizations,
  queryTeamMembers,
  queryTeams,
  subscribeDataEvents, unlockUser, queryOrganizationAlertMetrics
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
import {useBasicContext} from "./BasicProvider";

const AnalyticsContext = React.createContext(null);

export const AnalyticsProvider = (
  {
    children,
  }) => {
  const [pickedMembers, setPickedMembers] = React.useState([]);
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const {pickedTeams, organization} = useBasicContext();
  const [members, _setMembers] = React.useState();
  const membersRef = React.useRef(members);
  const setMembers = v => {
    _setMembers(v);
    membersRef.current = v;
  }
  const [analytics, setAnalytics] = React.useState(null);
  const metrics = [
    {
      label: 'Wear Time',
      value: 1,
    },
    {
      label: 'Alerts Metric',
      value: 2,
    }
  ];
  const [metric, setMetric] = React.useState(null);
  const formattedMembers = React.useMemo(() => {
    const ret = [];
    members?.forEach(user => {
      ret.push({
        value: user.userId,
        label: `${user.firstName} ${user.lastName}`,
      });
    });

    return ret;
  }, [members]);
  React.useEffect(() => {
    const membersPromises = [];
    if (pickedTeams?.length > 0) {
      pickedTeams.forEach(team => {
        membersPromises.push(queryTeamMembers(team));
      });
      const a = () => new Promise(resolve => {
        Promise.allSettled(membersPromises)
          .then(results => {
            results?.forEach((result, index) => {
              if (result.status === "fulfilled") {
                if (result.value?.data?.members?.length > 0) {
                  const operators = result.value?.data?.members?.filter(it => it.teamId?.toString() === pickedTeams?.[index]?.toString()) ?? [];
                  setMembers(operators);
                }
              }
            })
          })
          .finally(() => resolve());
      });
      Promise.allSettled([a()]).then();
    } else {

    }
  }, [pickedTeams]);

  const processQuery = () => {
    if (pickedTeams?.length > 0) {
      setAnalytics(null);
      if (startDate && endDate && metric) {
        switch (metric) {
          case 1:
            queryOrganizationWearTime(organization, {
              teamIds: pickedTeams,
              startDate: "2022-07-01",
              endDate: "2022-07-12",
            })
              .then(data => console.log("data", data));
            break;
          case 2:
            queryOrganizationAlertMetrics(organization, {
              teamIds: pickedTeams,
              startDate: "2022-07-01",
              endDate: "2022-07-12",
            }).then(data => console.log("alertMetrics", data));
            break;
          default:
            console.log("metric is not available");
        }
      }
    }
  };

  const providerValue = {
    members,
    setMembers,
    formattedMembers,
    pickedMembers,
    setPickedMembers,
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
