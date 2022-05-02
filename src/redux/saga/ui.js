import {takeLatest} from "redux-saga/effects";
import {actionTypes} from "../type";
import {toastr} from "react-redux-toastr";
import i18n from '../../i18nextInit';

function* actionWatcher() {
  yield takeLatest(actionTypes.SUCCESS_NOTIFICATION, showSuccessNotificationSaga);
  yield takeLatest(actionTypes.ERROR_NOTIFICATION, showErrorNotificationSaga);
}

function showSuccessNotificationSaga({payload: {msg = i18n.t("msg something went wrong"), title = ""}}) {
  toastr.success(
    title, // title
    msg,
  );
}

function showErrorNotificationSaga({payload: {msg = i18n.t("msg something went wrong"), title = ""}}) {
  toastr.error(
    title, // title
    msg,
    {
      timeOut: 6000,
    }
  );
}

export default actionWatcher;