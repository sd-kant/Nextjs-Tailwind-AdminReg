import { takeLatest } from 'redux-saga/effects';
import { actionTypes } from '../type';
import { toastr } from 'react-redux-toastr';
import { updateProfileSaga } from './funcs';

function* actionWatcher() {
  yield takeLatest(actionTypes.SUCCESS_NOTIFICATION, showSuccessNotificationSaga);
  yield takeLatest(actionTypes.ERROR_NOTIFICATION, showErrorNotificationSaga);
  yield takeLatest(actionTypes.SET_METRIC, updateProfileSaga);
}

function showSuccessNotificationSaga({ payload: { msg, title = '' } }) {
  if (msg || title) {
    toastr.success(
      title, // title
      msg
    );
  }
}

function showErrorNotificationSaga({ payload: { msg, title = '' } }) {
  if (msg || title) {
    toastr.error(
      title, // title
      msg,
      {
        timeOut: 6000
      }
    );
  }
}

export default actionWatcher;
