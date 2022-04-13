import * as React from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";
import {get} from "lodash";
import {
  celsiusToFahrenheit,
  numMinutesBetweenWithNow as numMinutesBetween,
} from "../utils";

const UtilsContext = React.createContext(null);

export const UtilsProviderDraft = (
  {
    t,
    metric,
    children,
  }) => {

  const formatConnectionStatusV2 = ({flag, deviceId, connected, stat, alert}) => {
    if (!deviceId || deviceId?.toString().includes("none")) { // if no device
      return {
        label: t("never connected"),
        value: 1,
      };
    }
    if (stat?.chargingFlag) {
      return {
        label: t("charging"),
        value: 2,
      };
    }

    if (flag && connected) {
      if (
        numMinutesBetween(new Date(), new Date(alert?.utcTs)) <= 60 ||
        numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 60
      ) {
        if (numMinutesBetween(new Date(), new Date(stat?.deviceLogTs)) <= 30) {
          return {
            label: t('device connected'),
            value: 3,
          };
        } else {
          return {
            label: t('limited connectivity'),
            value: 4,
          };
        }
      } else if (
        numMinutesBetween(new Date(), new Date(alert?.utcTs)) > 60 &&
        numMinutesBetween(new Date(), new Date(alert?.utcTs)) <= 90 &&
        numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) > 60 &&
        numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 90
      ) {
        return {
          label: t('limited connectivity'),
          value: 4,
        };
      } else if (
        (
          numMinutesBetween(new Date(), new Date(alert?.utcTs)) > 90 &&
          numMinutesBetween(new Date(), new Date(alert?.utcTs)) <= 120
        ) ||
        numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 120
      ) {
        return {
          label: t('no connection'),
          value: 7,
        };
      } else {
        return {
          label: t('no connection'),
          value: 8,
        };
      }
    }

    if (!flag) {
      if (numMinutesBetween(new Date(), new Date(stat?.deviceLogTs)) <= 30) {
        return {
          label: t('no connection'),
          value: 7,
        };
      } else {
        return {
          label: t('no connection'),
          value: 8,
        };
      }
    }

    if (
      !connected
    ) {
      if (numMinutesBetween(new Date(), new Date(stat?.deviceLogTs)) <= 30) {
        return {
          label: t('no connection'),
          value: 7,
        };
      } else {
        return {
          label: t('no connection'),
          value: 8,
        };
      }
    }

    return {
      label: t('no connection'),
      value: 8,
    };
  };

  const formatAlert = stageId => {
    if (!stageId) {
      return {
        label: "Safe",
        value: 5,
      };
    }

    switch (stageId?.toString()) {
      case "1":
        return {
          label: "At Risk",
          value: 1,
        };
      case "2":
        return {
          label: "Elevated Risk",
          value: 2,
        };
      case "3":
        return {
          label: "Safe",
          value: 3,
        };
      case "4":
        return {
          label: "Safe",
          value: 4,
        };
      default:
        return {
          label: "N/A",
          value: null,
        };
    }
  };
  // fixme translation
  const formatAlertForDetail = stageId => {
    switch (stageId?.toString()) {
      case "1":
        return "At Risk, Stop Work";
      case "2":
        return "Elevated Risk, Stop Work";
      case "3":
        return "Safe, Return to Work";
      case "4":
        return "Alert Reset";
      default:
        return "N/A";
    }
  };

  const formatActivityLog = activity => {
    if (!activity?.event)
      return "N/A";
    switch (activity.event?.toLowerCase()?.trim()) {
      case "createuser":
        return t("activity create user");
      case "login":
        if (activity.data?.source?.toLowerCase() === "web") { // web
          if (activity.data?.type?.toLowerCase() === "username") { // username
            return t("activity login username web");
          } else { // 2FA
            return t("activity login 2fa web");
          }
        } else { // mobile
          if (activity.data?.type?.toLowerCase() === "username") { // username
            return t("activity login username mobile");
          } else { // 2FA
            return t("activity login 2fa mobile");
          }
        }
      case "logout":
        return t("activity password changed");
      case "failedlogin":
        return t("activity failed login");
      case "usernameassigned":
        return t("activity username assigned");
      case "phoneassigned":
        return t("activity phone assigned");
      case "passwordchanged":
        return t("activity password changed");
      case "userdeleted":
        return t("activity user deleted");
      default:
        return activity.event;
    }
  };

  const formatHeartCbt = cbt => {
    if ([null, undefined, "0", ""].includes(cbt?.toString())) {
      return "--";
    }
    if (metric) {
      return cbt.toFixed(1);
    } else {
      return celsiusToFahrenheit(cbt);
    }
  };

  const getHeartRateZone = (birthday, heartRate) => {
    if (!heartRate) {
      return {
        label: null,
        value: null,
      }
    }
    const arr = birthday?.split("-");
    if (arr?.length === 3) {
      const ageDifMs = Date.now() - new Date(arr[0], parseInt(arr[1]) - 1, arr[2]).getTime();
      const ageDate = new Date(ageDifMs); // milliseconds from epoch
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      const maxHR = 208 - (0.7 * age);
      if (heartRate <= 0.57 * maxHR) {
        return {
          label: t("very light"),
          value: 1,
        };
      } else if (heartRate <= 0.64 * maxHR) {
        return {
          label: t('light'),
          value: 2,
        };
      } else if (heartRate <= 0.75 * maxHR) {
        return {
          label: t("moderate"),
          value: 3,
        };
      } else {
        return {
          label: t('high'),
          value: 4,
        };
      }
    }

    return {
      label: null,
      value: null,
    }
  };

  const providerValue = {
    getHeartRateZone,
    formatHeartCbt,
    formatAlertForDetail,
    formatAlert,
    formatConnectionStatusV2,
    formatActivityLog,
  };

  return (
    <UtilsContext.Provider value={providerValue}>
      {children}
    </UtilsContext.Provider>
  );
};

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
  metric: get(state, 'ui.metric'),
});

export const UtilsProvider = connect(
  mapStateToProps,
  null,
)(withTranslation()(UtilsProviderDraft));

export const useUtilsContext = () => {
  const context = React.useContext(UtilsContext);
  if (!context) {
    throw new Error("useUtilsContext must be used within UtilsProvider");
  }
  return context;
};