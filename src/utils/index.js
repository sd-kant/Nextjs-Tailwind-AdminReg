import {USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN, USER_TYPE_TEAM_ADMIN} from "../constant";
import {
  isValidPhoneNumber,
} from 'libphonenumber-js';

export const getTokenFromUrl = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  // replace space because + was replaced with space
  return urlParams.get('token')?.replace(/ /g, '+');
}

export const getParamFromUrl = key => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(key)?.replace(/ /g, '+');
}

export const checkPasswordValidation = (password) => {
  const regex=  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,1024}$/;
  return password && password.match(regex);
}

export const checkAlphaNumeric = str => {
  const regex=  /^[a-z0-9]+$/i;
  return str?.match(regex);
}

export const checkPhoneNumberValidation = (value, country) => {
  if (!value) {
    return false;
  }
  return isValidPhoneNumber(value, country?.toUpperCase() ?? 'US');
}

export const ableToLogin = userType => {
  const validRoles = [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN, USER_TYPE_TEAM_ADMIN];
  let ableToLogin = false;
  validRoles.forEach(it => {
    if (userType?.includes(it)) {
      ableToLogin = true;
    }
  });

  return ableToLogin;
};

export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-mixed-operators
    let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const updateUrlParam = ({param: {key, value}, reload = false}) => {
  const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?${key}=${value}`;
  if (!reload) {
    window.history.pushState({path: newUrl},'', newUrl);
  } else {
    window.location.href = newUrl;
  }
}

export const convertImperialToMetric = (imperial) => {
  if (!(imperial && imperial.includes("ft"))) {
    return null;
  }

  const strArr = imperial.split("ft");
  if (strArr && strArr.length > 1) {
    const feet = strArr && strArr[0];
    const inchArr = strArr && strArr[1] && strArr[1].split('in');
    const inch = inchArr && inchArr[0];

    const totalCm = (parseFloat(feet) * 30.48) + (parseFloat(inch) * 2.54);

    const m = Math.floor(totalCm / 100);
    const cm = Math.round(totalCm % 100);

    return {
      m,
      cm: cm < 10 ? '0' + cm : cm
    };
  }
  return null;
}

export const convertCmToImperial = value => {
  const numericValue = parseInt(value);
  if (!numericValue) {
    return {
      feet: 0,
      inch: 0,
    };
  }

  const feet = Math.floor(numericValue / 30.48);
  const inch = Math.round((numericValue - (feet * 30.48)) / 2.54);

  return {
    feet,
    inch,
  };
};

export const convertCmToMetric = value => {
  const numericValue = parseInt(value);
  if (!numericValue) {
    return {
      m: 0,
      cm: 0,
    };
  }
  return {
    m: Math.floor(numericValue / 100),
    cm: (numericValue % 100),
  }
};

export const format2Digits = (value) => {
  if (!["", null, undefined].includes(value)) {
    return String(value).padStart(2, '0');
  } else return null;
}
