import {USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN, USER_TYPE_TEAM_ADMIN} from "../constant";
import {
  isValidPhoneNumber,
} from 'libphonenumber-js';

export const getTokenFromUrl = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  // replace space because + was replaced with space
  return urlParams.get('token') && urlParams.get('token').replace(" ", "+");
}

export const getParamFromUrl = key => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get('key');
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

export const formatTokenForHeader = (token) => {
  if (token) {
    return token.replaceAll(" ", "+");
  }
  return null;
}

export const formatTokenForQueryParam = (token) => {
  if (token) {
    return encodeURIComponent(token.replaceAll(" ", "+"));
  }
  return null;
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
