import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { get } from 'lodash';
import { celsiusToFahrenheit, numMinutesBetweenWithNow as numMinutesBetween } from '../utils';
import { isProductionMode } from '../App';
import { HEART_RATE_VALUES, INVALID_VALUES2, STAGE_VALUES } from '../constant';

const UtilsContext = React.createContext(null);

export const UtilsProviderDraft = ({ t, metric, children }) => {
  const formatConnectionStatusV2 = ({ flag, deviceId, connected, stat, alert }) => {
    const calc = () => {
      if (
        numMinutesBetween(new Date(), new Date(alert?.utcTs)) <= 60 ||
        numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 60
      ) {
        if (numMinutesBetween(new Date(), new Date(stat?.deviceLogTs)) <= 20) {
          return {
            label: t('device connected'),
            value: 3
          };
        } else {
          return {
            label: t('limited connectivity'),
            value: 4
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
          value: 4
        };
      } else if (
        (numMinutesBetween(new Date(), new Date(alert?.utcTs)) > 90 &&
          numMinutesBetween(new Date(), new Date(alert?.utcTs)) <= 120) ||
        numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 120
      ) {
        return {
          label: t('no connection'),
          value: 7
        };
      } else {
        return {
          label: t('no connection'),
          value: 8
        };
      }
    };

    if (!deviceId || deviceId?.toString().includes('none')) {
      // if no device
      return {
        label: t('never connected'),
        value: 1
      };
    }
    if (stat?.chargingFlag) {
      return {
        label: t('charging'),
        value: 2
      };
    }

    if (connected && flag) {
      return calc();
    } else {
      if (
        numMinutesBetween(new Date(), new Date(stat?.lastConnectedTs)) <= 5 &&
        numMinutesBetween(new Date(), new Date(stat?.lastOnTs)) <= 5
      ) {
        return calc();
      } else if (!flag && numMinutesBetween(new Date(), new Date(stat?.lastOnTs)) <= 20) {
        return {
          label: t('check device'),
          value: 7
        };
      } else if (
        !connected &&
        numMinutesBetween(new Date(), new Date(stat?.lastConnectedTs)) <= 20
      ) {
        return {
          label: t('check app'),
          value: 7
        };
      } else {
        return {
          label: t('no connection'),
          value: 8
        };
      }
    }
  };

  const formatAlert = (stageId) => {
    if (!stageId) {
      return STAGE_VALUES[5]; // Safe
    }

    switch (stageId?.toString()) {
      case '1':
        return STAGE_VALUES[1]; // At Risk
      case '2':
        return STAGE_VALUES[2]; // Elevated Risk
      case '3':
        return STAGE_VALUES[3]; // Safe
      case '4':
        return STAGE_VALUES[4]; // Safe
      default:
        return STAGE_VALUES[0]; // N/A
    }
  };
  const alertPriorities = (direction) => ({
    'at risk': direction === 'asc' ? 2 : 1,
    'elevated risk': direction === 'asc' ? 1 : 2,
    safe: 3,
    'n/a': 3
  });
  // fixme translation
  const formatAlertForDetail = (stageId) => {
    switch (stageId?.toString()) {
      case '1':
        return 'At Risk, Stop Work';
      case '2':
        return 'Elevated Risk, Stop Work';
      case '3':
        return 'Safe, Return to Work';
      case '4':
        return isProductionMode ? 'Safe, Return to Work' : 'Alert Reset';
      default:
        return 'N/A';
    }
  };

  const formatActivityLog = (activity) => {
    if (!activity?.event) return 'N/A';
    switch (activity.event?.toLowerCase()?.trim()) {
      case 'createuser':
        return t('activity create user');
      case 'login':
        if (activity.data?.source?.toLowerCase() === 'web') {
          // web
          if (activity.data?.type?.toLowerCase() === 'username') {
            // username
            return t('activity login username web');
          } else if (activity.data?.type?.toLowerCase() === 'saml') {
            // sso login
            return t('activity login saml web');
          } else {
            // 2FA
            return t('activity login 2fa web');
          }
        } else {
          // mobile
          if (activity.data?.type?.toLowerCase() === 'username') {
            // username
            return t('activity login username mobile');
          } else if (activity.data?.type?.toLowerCase() === 'saml') {
            // sso login
            return t('activity login saml mobile');
          } else {
            // 2FA
            return t('activity login 2fa mobile');
          }
        }
      case 'logout':
        return t('activity logout');
      case 'failedlogin':
        return t('activity failed login');
      case 'usernameassigned':
        return t('activity username assigned');
      case 'phoneassigned':
        return t('activity phone assigned');
      case 'passwordchanged':
        return t('activity password changed');
      case 'userdeleted':
        return t('activity user deleted');
      default:
        return activity.event;
    }
  };

  const formatHeartCbt = (cbt) => {
    if (INVALID_VALUES2.includes(cbt?.toString())) {
      return '--';
    }
    if (metric) {
      return Math.round(cbt * 10) / 10;
    } else {
      return celsiusToFahrenheit(cbt);
    }
  };

  const getHeartRateZone = (birthday, heartRate) => {
    if (!heartRate) {
      return HEART_RATE_VALUES[0];
    }

    const arr = birthday?.split('-');
    if (arr?.length === 3) {
      const ageDifMs = Date.now() - new Date(arr[0], parseInt(arr[1]) - 1, arr[2]).getTime();
      const ageDate = new Date(ageDifMs); // milliseconds from epoch
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      const maxHR = 208 - 0.7 * age;

      if (heartRate <= 0.57 * maxHR) return HEART_RATE_VALUES[1]; // very light
      else if (heartRate <= 0.64 * maxHR) return HEART_RATE_VALUES[2]; // light
      else if (heartRate <= 0.75 * maxHR) return HEART_RATE_VALUES[3]; // moderate
      else return HEART_RATE_VALUES[4]; // high
    }

    return HEART_RATE_VALUES[0];
  };

  const providerValue = {
    getHeartRateZone,
    formatHeartCbt,
    formatAlertForDetail,
    formatAlert,
    formatConnectionStatusV2,
    formatActivityLog,
    alertPriorities
  };

  return <UtilsContext.Provider value={providerValue}>{children}</UtilsContext.Provider>;
};

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
  metric: get(state, 'ui.metric')
});

export const UtilsProvider = connect(mapStateToProps, null)(withTranslation()(UtilsProviderDraft));

export const useUtilsContext = () => {
  const context = React.useContext(UtilsContext);
  if (!context) {
    throw new Error('useUtilsContext must be used within UtilsProvider');
  }
  return context;
};
