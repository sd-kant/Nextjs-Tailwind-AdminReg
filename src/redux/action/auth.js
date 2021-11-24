import {actionTypes} from "../type";

export const loginAction = (email, password) => ({
  type: actionTypes.LOGIN,
  payload: {
    email,
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
