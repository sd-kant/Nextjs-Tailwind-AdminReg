import {actionTypes} from "../type";
import {CLEAN_TOASTR} from "react-redux-toastr/lib/constants";

export const setRestBarClassAction = (restBarClass) => ({
  type: actionTypes.SET_REST_BAR_CLASS,
  payload: {
    restBarClass,
  }
});

export const setLoadingAction = (loading) => ({
  type: actionTypes.LOADING,
  payload: {
    loading,
  }
});

export const showSuccessNotificationAction = (msg, title = "") => ({
  type: actionTypes.SUCCESS_NOTIFICATION,
  payload: {
    msg,
    title,
  }
});

export const showErrorNotificationAction = (msg, title = "") => ({
  type: actionTypes.ERROR_NOTIFICATION,
  payload: {
    msg,
    title,
  }
});

export const setVisibleSuccessModalAction = (visible) => ({
  type: actionTypes.SET_VISIBLE_SUCCESS_MODAL,
  payload: {
    visible,
  }
});