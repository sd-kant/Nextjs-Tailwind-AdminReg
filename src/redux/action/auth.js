import {actionTypes} from "../type";

export const loginAction = (email, password) => ({
  type: actionTypes.LOGIN,
  payload: {
    email,
    password,
  }
});