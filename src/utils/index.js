import {
  IMPERIAL,
  INVALID_VALUES3,
  INVALID_VALUES4,
  TIME_FORMAT_YYYYMDHM,
  USER_TYPE_ADMIN,
  USER_TYPE_OPERATOR,
  USER_TYPE_ORG_ADMIN,
  USER_TYPE_TEAM_ADMIN
} from '../constant';
import { isValidPhoneNumber } from 'libphonenumber-js';
import queryString from 'query-string';
import spacetime from 'spacetime';

export const getTokenFromUrl = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const param = urlParams.get('token');
  return param ? decodeURIComponent(param) : undefined;
};

export const checkAlphaNumeric = (str) => {
  const regex = /^[a-z0-9]+$/i;
  return str?.match(regex);
};

export const countString = (str, letter) => {
  let count = 0;

  // looping through the items
  for (let i = 0; i < str?.length; i++) {
    // check if the character is at that position
    if (str.charAt(i) === letter) {
      count += 1;
    }
  }
  return count;
};

export const checkUsernameValidation1 = (str) => {
  const dotCount = countString(str, '.');
  if (dotCount < 2) {
    const regex = /^(?!.*\\..*\\..*)[A-Za-z]([A-Za-z0-9.]*[A-Za-z0-9])?$/;
    return str?.match(regex);
  }

  return false;
};

export const checkUsernameValidation2 = (str) => {
  return str?.charAt(str.length - 1) !== '.';
};

export const checkIfEmail = (value) => {
  const regexExp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
  return regexExp.test(value);
};

export const getParamFromUrl = (key) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const param = urlParams.get(key);
  return param ? decodeURIComponent(param) : undefined;
};

export const checkPasswordValidation = (password, minLength) => {
  const regex = new RegExp(
    `^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\\s).{${minLength ?? 6},1024}$`,
    'gi'
  );
  return password && password.match(regex);
};

export const checkPhoneNumberValidation = (value, country) => {
  if (!value) {
    return false;
  }
  return isValidPhoneNumber(value, country?.toUpperCase() ?? 'US');
};

export const isAdmin = (userType) => {
  const validRoles = [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN, USER_TYPE_TEAM_ADMIN];
  return validRoles.some((it) => userType?.includes(it));
};

export const isOperator = (userType) => {
  return userType && userType.length === 1 && userType[0] === USER_TYPE_OPERATOR;
};

export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-mixed-operators
    let r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const convertImperialToMetric = (imperial) => {
  if (!(imperial && imperial.includes('ft'))) {
    return null;
  }

  const strArr = imperial.split('ft');
  if (strArr && strArr.length > 1) {
    const feet = strArr && strArr[0];
    const inchArr = strArr && strArr[1] && strArr[1].split('in');
    const inch = inchArr && inchArr[0];

    const totalCm = parseFloat(feet) * 30.48 + parseFloat(inch) * 2.54;

    const m = Math.floor(totalCm / 100);
    const cm = Math.round(totalCm % 100);

    return {
      m,
      cm: cm < 10 ? '0' + cm : cm
    };
  }
  return null;
};

export const convertCmToImperial = (value) => {
  const numericValue = parseInt(value);
  if (!numericValue) {
    return {
      feet: 0,
      inch: 0
    };
  }

  let feet = Math.floor(numericValue / 30.48);
  let inch = Math.round((numericValue - feet * 30.48) / 2.54);

  if (inch === 12) {
    feet += 1;
    inch = 0;
  }

  return {
    feet,
    inch
  };
};

export const convertCmToMetric = (value) => {
  const numericValue = parseInt(value);
  if (!numericValue) {
    return {
      m: 0,
      cm: 0
    };
  }
  return {
    m: Math.floor(numericValue / 100),
    cm: numericValue % 100
  };
};

export const convertLbsToKilos = (value) => {
  return Math.round(value * 45.359237) / 100;
};

export const convertKilosToLbs = (value) => {
  return Math.round((100 * value) / 0.45359237) / 100;
};

export const format2Digits = (value) => {
  if (!INVALID_VALUES4.includes(value)) {
    return String(value).padStart(2, '0');
  } else return null;
};

export const numMinutesBetween = (d1 = new Date(), d2 = new Date(1900, 1, 1)) => {
  const diff = d1.getTime() - d2.getTime();
  // const diff = Math.abs(d1.getTime() - d2.getTime());
  return Math.ceil(diff / (1000 * 60));
};

export const numMinutesBetweenWithNow = (d1 = new Date(), d2 = new Date(1900, 1, 1)) => {
  if (d2.getTime() > d1.getTime() + 60 * 1000) {
    return 100000;
  }
  const diff = d1.getTime() - d2.getTime();
  // const diff = Math.abs(d1.getTime() - d2.getTime());
  return Math.ceil(diff / (1000 * 60));
};

export const minutesToDaysHoursMinutes = (minutes) => {
  if (!minutes) {
    return {
      days: null,
      hours: null,
      minutes: null
    };
  }
  return {
    days: Math.floor(minutes / 24 / 60),
    hours: Math.floor((minutes / 60) % 24),
    minutes: Math.ceil(minutes % 60)
  };
};

export const celsiusToFahrenheit = (t) => {
  const a = (t * 9) / 5 + 32;
  return Math.round(a * 10) / 10;
};

export const getLatestDate = (d1, d2) => {
  if (!d1) return d2;
  if (!d2) return d1;
  if (d2?.getTime() <= d1?.getTime()) {
    return d1;
  }

  return d2;
};

export const getLatestDateBeforeNow = (d1, d2) => {
  const now = new Date().getTime();
  const gap1 = now - d1;
  const gap2 = now - d2;
  if (gap1 < 0 && gap2 < 0) {
    return null;
  }
  if (gap1 < 0) {
    return d2;
  }
  if (gap2 < 0) {
    return d1;
  }
  if (!d1) return d2;
  if (!d2) return d1;
  if (d2?.getTime() <= d1?.getTime()) {
    return d1;
  }

  return d2;
};

export const getUrlParamAsJson = () => {
  const cachedSearchUrl = localStorage.getItem('kop-params');
  const q = queryString.parse(cachedSearchUrl);

  if (
    INVALID_VALUES3.includes(q?.organization) &&
    (localStorage.getItem('kop-v2-user-type').includes(USER_TYPE_ORG_ADMIN) ||
      localStorage.getItem('kop-v2-user-type').includes(USER_TYPE_TEAM_ADMIN))
  ) {
    q.organization = localStorage.getItem('kop-v2-picked-organization-id');
  }

  return q;
};

export const concatAsUrlParam = (q) => {
  let str = '';
  Object.keys(q)?.forEach((it, index) => {
    str +=
      index !== 0 ? `&${it}=${encodeURIComponent(q[it])}` : `${it}=${encodeURIComponent(q[it])}`;
  });

  return str;
};

export const updateUrlParam = ({ param: { key, value }, reload = false }) => {
  // parse the query string into an object
  const q = queryString.parse(location.search);
  q[key] = value;
  const str = concatAsUrlParam(q);
  const newUrl =
    window.location.protocol + '//' + window.location.host + window.location.pathname + `?${str}`;
  if (!reload) {
    window.history.pushState({ path: newUrl }, '', newUrl);
  } else {
    window.location.href = newUrl;
  }
};

/**
 * @typedef TimezoneObj
 * @property {string} name
 * @property {boolean} valid
 * @property {string} displayName
 */

/**
 * @description time display as on timezone
 * @param {string} time in utc
 * @param {TimezoneObj} timezone
 */
export const timeOnOtherZone = (time, timezone) => {
  const os = new Date().getTimezoneOffset();
  let ret = new Date(time);
  if (!timezone.valid) {
    let gmt = timezone.name;
    if (gmt) {
      const arr = gmt?.toLowerCase()?.replace('gmt', '')?.split(':');
      if (arr.length === 2) {
        let offset = parseInt(arr[0]) * 60 + parseInt(arr[1]);
        ret = new Date(new Date(time).getTime() + (offset + os) * 60 * 1000);
      }
    }

    return ret.toLocaleString([], TIME_FORMAT_YYYYMDHM);
  } else {
    return spacetime(time).goto(timezone.name).unixFmt('yyyy.MM.dd h:mm a');
  }
};

export const getDeviceId = () => {
  let deviceId = localStorage.getItem('kop-v2-device-id');
  if (INVALID_VALUES3.includes(deviceId)) {
    deviceId = uuidv4();
    localStorage.setItem('kop-v2-device-id', deviceId);
  }

  return deviceId;
};

export const setStorageAfterLogin = ({ token, refreshToken, userType, orgId, baseUrl }) => {
  localStorage.setItem('kop-v2-token', token);
  localStorage.setItem('kop-v2-refresh-token', refreshToken);
  localStorage.setItem('kop-v2-register-token', token);
  localStorage.setItem('kop-v2-user-type', JSON.stringify(userType));
  localStorage.setItem('kop-v2-picked-organization-id', orgId);
  localStorage.setItem('kop-v2-base-url', baseUrl);
};

export const setStorageAfterRegisterLogin = ({ token, baseUrl, username = null }) => {
  localStorage.setItem('kop-v2-register-token', token);
  localStorage.setItem('kop-v2-base-url', baseUrl);
  if (username) {
    localStorage.setItem('kop-v2-register-username', username);
  }
};

export const dateFormat = (d) => {
  // return 2022-07-02
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const formattedMonth = String(month).padStart(2, '0');
  const date = d.getDate();
  const formattedDate = String(date).padStart(2, '0');
  return `${year}-${formattedMonth}-${formattedDate}`;
};

export const getHeightAsMetric = ({ measure, feet, inch, m, cm }) => {
  if (measure === IMPERIAL) {
    const { m: _m, cm: _cm } = convertImperialToMetric(`${feet}ft${inch}in`);
    return parseInt(_m) * 100 + parseInt(_cm);
  } else {
    return parseInt(m) * 100 + parseInt(cm);
  }
};

export const isValidMacAddress = (str) => {
  if (!str) return false;
  const tStr = str?.trim();
  const regexMacAddress = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/i;
  return tStr?.match(regexMacAddress);
};

export const isValidSerialNumber = (str) => {
  if (!str) return false;
  const tStr = str?.trim();
  const regexSerialNumber = /^([0-9A-Za-z]{4})[-]([0-9A-Za-z]{5})[-]([0-9A-Za-z]{4})$/i;
  return tStr?.match(regexSerialNumber);
};

export const getLastDigitsOfDeviceId = (deviceId, digits = 4) => {
  return deviceId.replace(/\W/g, '')?.slice(-digits);
};

export const hasStatusValue = (value, statusValues) => {
  if (value === null || value === undefined) return false;

  return statusValues
    .map((it) => it.toString().trim().toLowerCase())
    .includes(value.toString().trim().toLowerCase());
};
