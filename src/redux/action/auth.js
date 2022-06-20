import {actionTypes} from "../type";

export const loginAction = ({username, password, fromRegister = false, navigate}) => ({
  type: actionTypes.LOGIN,
  payload: {
    username,
    password,
    fromRegister,
    navigate,
  }
});

export const loginWithCodeAction = ({phoneNumber, loginCode, fromRegister = false, navigate}) => ({
  type: actionTypes.LOGIN,
  payload: {
    phoneNumber,
    loginCode,
    fromRegister,
    navigate,
  }
});

export const setTokenAction = token => ({
  type: actionTypes.LOGIN_SUCCESS,
  payload: {
    token,
  }
});

export const setBaseUriAction = baseUri => ({
  type: actionTypes.SET_BASE_URI,
  payload: {
    baseUri,
  }
});

export const setMobileTokenAction = token => ({
  type: actionTypes.SET_MOBILE_TOKEN,
  payload: {
    token,
  }
});

export const setPasswordExpiredAction = flag => ({
  type: actionTypes.PASSWORD_EXPIRED,
  payload: {
    passwordExpired: flag,
  }
});

export const setLoginSuccessAction = ({token, userType, organizationId}) => ({
  type: actionTypes.LOGIN_SUCCESS,
  payload: {
    token,
    userType,
    organizationId,
  }
});

export const setRegisterLoginSuccessAction = ({token, userType, organizationId}) => ({
  type: actionTypes.REGISTER_LOGIN_SUCCESS,
  payload: {
    token,
    userType,
    organizationId,
  }
});

export const setLoggedInAction = ({loggedIn}) => ({
  type: actionTypes.LOGGED_IN,
  payload: {
    loggedIn,
  }
});
