import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { get } from 'lodash';
import { celsiusToFahrenheit, numMinutesBetweenWithNow as numMinutesBetween } from '../utils';
import { isProductionMode } from '../App';
import {
  DEVICE_CONNECTION_STATUS,
  HEART_CBT_VALUES,
  HEART_RATE_VALUES,
  INVALID_VALUES2,
  STAGE_VALUES
} from '../constant';

const UtilsContext = React.createContext(null);

export const UtilsProviderDraft = ({ t, metric, children }) => {
  const formatConnectionStatusV2 = ({
    flag: onOffFlag,
    deviceId,
    connected,
    stat,
    alert,
    deviceType,
    lastSyncDataDateTime
  }) => {
    const calc = () => {
      if (
        numMinutesBetween(new Date(), new Date(alert?.utcTs)) <= 60 ||
        numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 60
      ) {
        if (numMinutesBetween(new Date(), new Date(stat?.deviceLogTs)) <= 20) {
          return {
            label: t('device connected'),
            value: DEVICE_CONNECTION_STATUS.CONNECTED
          };
        } else {
          return {
            label: t('limited connectivity'),
            value: DEVICE_CONNECTION_STATUS.LIMITED_CONNECTION
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
          value: DEVICE_CONNECTION_STATUS.LIMITED_CONNECTION
        };
      } 
      // else if (
      //   (numMinutesBetween(new Date(), new Date(alert?.utcTs)) > 90 &&
      //     numMinutesBetween(new Date(), new Date(alert?.utcTs)) <= 120) ||
      //   numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 120
      // ) {
      //   return {
      //     label: t('no connection'),
      //     value: DEVICE_CONNECTION_STATUS.CHECK_DEVICE
      //   };
      // } 
      else {
        return {
          label: t('check device'),
          value: DEVICE_CONNECTION_STATUS.CHECK_DEVICE
        };
      }
    };

    if (!deviceId || deviceId?.toString().includes('none')) {
      // if no device
      return {
        label: t('no connection'),
        value: DEVICE_CONNECTION_STATUS.NO_CONNECTION
      };
    }
    if (stat?.chargingFlag) {
      if (numMinutesBetween(new Date(), new Date(stat?.deviceLogTs)) <= 2) {
        return {
          label: t('charging'),
          value: DEVICE_CONNECTION_STATUS.CHARGING
        };
      }
      return {
        label: t('no connection'),
        value: DEVICE_CONNECTION_STATUS.NO_CONNECTION
      };
    }

    if (connected && onOffFlag) {
      return calc();
    } else {
      if (
        numMinutesBetween(new Date(), new Date(stat?.lastConnectedTs)) <= 5 &&
        numMinutesBetween(new Date(), new Date(stat?.lastOnTs)) <= 5
      ) {
        return calc();
      } else if (
        connected &&
        !onOffFlag &&
        numMinutesBetween(new Date(), new Date(stat?.lastOnTs)) <= 20
      ) {
        return {
          label: t('check device'),
          value: DEVICE_CONNECTION_STATUS.CHECK_DEVICE
        };
      } else if (
        onOffFlag &&
        !connected &&
        numMinutesBetween(new Date(), new Date(stat?.lastConnectedTs)) <= 20
      ) {
        return {
          label: deviceType === 'hub' ? t('check device'):t('check app'),
          value: DEVICE_CONNECTION_STATUS.CHECK_DEVICE
        };
      } else if(
        (onOffFlag || connected) &&
        numMinutesBetween(new Date(), new Date(lastSyncDataDateTime)) <= 20){
        return {
          label: deviceType === 'hub' ? t('check device') : t('check app'),
          value: DEVICE_CONNECTION_STATUS.NO_CONNECTION
        };
      } else {
        return {
          label: deviceType === 'hub' ? t('no hub connection') : t('no connection'),
          value: DEVICE_CONNECTION_STATUS.NO_CONNECTION
        };
      }
    }
  };

  const formatAlert = (stageId) => {
    if (!stageId) {
      return STAGE_VALUES[0]; // N/A
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
      case '5':
        return STAGE_VALUES[5]; // Manual Test Alert
      default:
        return STAGE_VALUES[0]; // N/A
    }
  };
  const alertPriorities = (direction) => ({
    'at risk': direction === 'asc' ? 2 : 1,
    'elevated risk': direction === 'asc' ? 1 : 2,
    safe: 3,
    'n/a': 3,
    'manual test alert': 3
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
      case '5':
        return 'Manual Test Alert';
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

      if (heartRate <= 0.57 * maxHR) return HEART_RATE_VALUES[1];
      else if (heartRate <= 0.64 * maxHR) return HEART_RATE_VALUES[2];
      else if (heartRate <= 0.75 * maxHR) return HEART_RATE_VALUES[3];
      else return HEART_RATE_VALUES[4]; // high
    }

    return HEART_RATE_VALUES[0];
  };

  const getHeartCBTZone = (cbt) => {
    if (!cbt) return HEART_CBT_VALUES[0];
    if (cbt <= 38.5) {
      return HEART_CBT_VALUES[1];
    } else if (cbt <= 39.5) {
      return HEART_CBT_VALUES[2];
    } else {
      return HEART_CBT_VALUES[3];
    }
  };

  const heartRateZoneStyles = {
    1: {
      color: '#0DAAEE'
    },
    2: {
      color: '#35EA6C'
    },
    3: {
      color: '#FFD600'
    },
    4: {
      color: '#F1374E'
    }
  };
  const heartCBTZoneStyles = {
    1: {
      color: '#35EA6C'
    },
    2: {
      color: '#F1374E'
    },
    3: {
      color: '#F1374E'
    }
  };

  const providerValue = {
    getHeartRateZone,
    getHeartCBTZone,
    formatHeartCbt,
    formatAlertForDetail,
    formatAlert,
    formatConnectionStatusV2,
    formatActivityLog,
    alertPriorities,
    heartRateZoneStyles,
    heartCBTZoneStyles
  };

  return <UtilsContext.Provider value={providerValue}>{children}</UtilsContext.Provider>;
};

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType'),
  metric: get(state, 'ui.measure')
});

export const UtilsProvider = connect(mapStateToProps, null)(withTranslation()(UtilsProviderDraft));

export const useUtilsContext = () => {
  const context = React.useContext(UtilsContext);
  if (!context) {
    throw new Error('useUtilsContext must be used within UtilsProvider');
  }
  return context;
};
