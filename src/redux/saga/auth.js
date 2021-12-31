import {
  takeLatest,
  put,
  call,
} from 'redux-saga/effects';
import {actionTypes} from '../type';
import {login} from "../../http";
import i18n from '../../i18nextInit';
import {ableToLogin} from "../../utils";
import history from "../../history";

function* actionWatcher() {
  yield takeLatest(actionTypes.LOGIN, loginSaga);
}

function* loginSaga({payload: {
  username,
  password,
  phoneNumber,
  loginCode,
}}) {
  try {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: true,
      }
    });
    let body, apiRes;
    if (username && password) {
      body = {
        username,
        password,
      };
    } else if (phoneNumber && loginCode) {
      body = {
        phoneNumber,
        loginCode,
      };
    }
    apiRes = yield call(login, body);
    const responseData = apiRes.data;
    const {
      accessToken: token,
      userType,
      orgId,
      mfa,
      havePhone,
    } = responseData;


    if (ableToLogin(userType)) {
      yield put({
        type: actionTypes.LOGIN_SUCCESS,
        payload: {
          token,
          userType,
        }
      });
      yield put({
        type: actionTypes.LOGGED_IN,
        payload: {
          loggedIn: !mfa,
        }
      });
      localStorage.setItem("kop-v2-logged-in", !mfa ? "true" : "false");

      if (!mfa) { // if multi-factor authentication off
        localStorage.setItem("kop-v2-token", token);
        localStorage.setItem("kop-v2-user-type", JSON.stringify(userType));
        localStorage.setItem("kop-v2-picked-organization-id", orgId);
        history.push("/invite");
      } else {
        if (havePhone) {
          history.push('/phone-verification/1');
        } else {
          history.push('/phone-register');
        }
      }
    } else {
      // todo show notification: normal user is not allowed to login to admin portal
    }
  } catch (e) {
    console.log(e);
    yield put({
      type: actionTypes.ERROR_NOTIFICATION,
      payload: {
        msg: i18n.t(e.response?.data?.message ?? "msg something went wrong"),
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