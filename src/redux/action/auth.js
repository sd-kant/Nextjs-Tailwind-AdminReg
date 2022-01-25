import {actionTypes} from "../type";

export const loginAction = (username, password, fromRegister = false) => ({
  type: actionTypes.LOGIN,
  payload: {
    username,
    password,
    fromRegister,
  }
});

export const loginWithCodeAction = (phoneNumber, loginCode, fromRegister= false) => ({
  type: actionTypes.LOGIN,
  payload: {
    phoneNumber,
    loginCode,
    fromRegister,
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
