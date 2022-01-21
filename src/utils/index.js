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
