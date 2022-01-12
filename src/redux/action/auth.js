import {actionTypes} from "../type";

export const loginAction = (username, password) => ({
  type: actionTypes.LOGIN,
  payload: {
    username,
    password,
  }
});

export const loginWithCodeAction = (phoneNumber, loginCode) => ({
  type: actionTypes.LOGIN,
  payload: {
    phoneNumber,
    loginCode,
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
