import {
  takeLatest,
  put,
  call,
} from 'redux-saga/effects';
import {actionTypes} from '../type';
import {login} from "../../http";
import i18n from '../../i18nextInit';
import {SUPER_ADMIN_EMAIL, USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN, USER_TYPE_TEAM_ADMIN} from "../../constant";
import {ableToLogin} from "../../utils";

function* actionWatcher() {
  yield takeLatest(actionTypes.LOGIN, loginSaga);
}

function* loginSaga({payload: {email, password}}) {
  try {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: true,
      }
    });
    const body = {
      username: email,
      password,
    };
    const apiRes = yield call(login, body);
    const responseData = apiRes.data;
    const {
      accessToken: token,
      userType,
    } = responseData;

    if (ableToLogin(userType)) {
      localStorage.setItem("kop-v2-token", token);
      localStorage.setItem("kop-v2-user-type", JSON.stringify(userType));
      localStorage.setItem("kop-v2-email", email);
    }

    yield put({
      type: actionTypes.LOGIN_SUCCESS,
      payload: {
        token,
        userType,
        email,
      }
    });
  } catch (e) {
    console.log(e);
    yield put({
      type: actionTypes.ERROR_NOTIFICATION,
      payload: {
        msg: i18n.t("msg something went wrong"),
      }
    });
  } finally {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: false,
      }
    });
  }
}

export default actionWatcher;