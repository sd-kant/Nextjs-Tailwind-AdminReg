import {
  takeLatest,
  put,
  call,
} from 'redux-saga/effects';
import {actionTypes} from '../type';
import {instance, login, lookupByUsername} from "../../http";
import i18n from '../../i18nextInit';
import {ableToLogin} from "../../utils";
import {apiBaseUrl} from "../../config";

function* actionWatcher() {
  yield takeLatest(actionTypes.LOGIN, loginSaga);
}

function* loginSaga({payload: {
  username,
  password,
  phoneNumber,
  loginCode,
  fromRegister = false,
  navigate,
}}) {
  let mode = 1; // 1: username, 2: sms
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
      instance.defaults.baseURL = apiBaseUrl;
      const lookupRes = yield call(lookupByUsername, username);
      if (lookupRes.data?.baseUri) {
        instance.defaults.baseURL = lookupRes.data?.baseUri;
      }
    } else if (phoneNumber && loginCode) {
      body = {
        phoneNumber,
        loginCode,
      };
      mode = 2;
    }
    apiRes = yield call(login, body);
    const responseData = apiRes.data;
    const {
      accessToken: token,
      refreshToken,
      userType,
      orgId,
      mfa,
      havePhone,
      passwordExpired,
    } = responseData;

    yield put({
      type: fromRegister ? actionTypes.REGISTER_LOGIN_SUCCESS : actionTypes.LOGIN_SUCCESS,
      payload: {
        token,
        userType,
        organizationId: orgId,
      }
    });
    yield put({
      type: actionTypes.PASSWORD_EXPIRED,
      payload: {
        passwordExpired: passwordExpired,
      },
    });

    if (!passwordExpired) {
      yield put({
        type: actionTypes.LOGGED_IN,
        payload: {
          loggedIn: !mfa,
        }
      });

      if (fromRegister) {
        localStorage.setItem("kop-v2-register-token", token);
        localStorage.setItem("kop-v2-base-url", instance.defaults.baseURL);

        if (!mfa) { // if multi-factor authentication off
          navigate("/create-account/name");
        } else {
          navigate('/create-account/phone-register');
        }
      } else {
        localStorage.setItem("kop-v2-logged-in", !mfa ? "true" : "false");

        if (!mfa) { // if multi-factor authentication off
          localStorage.setItem("kop-v2-token", token);
          localStorage.setItem("kop-v2-refresh-token", refreshToken);
          localStorage.setItem("kop-v2-register-token", token);
          localStorage.setItem("kop-v2-user-type", JSON.stringify(userType));
          localStorage.setItem("kop-v2-picked-organization-id", orgId);
          if (ableToLogin(userType)) {
            navigate("/select-mode");
          } else {
            navigate("/profile");
          }

          localStorage.setItem("kop-v2-base-url", instance.defaults.baseURL);
        } else {
          if (havePhone) {
            navigate('/phone-verification/1');
          } else {
            navigate('/phone-register');
          }
        }
      }
    } else {
      navigate("/password-expired");
    }
  } catch (e) {
    console.log("login error", e);
    if (e.response?.data?.status?.toString() === "400" && mode === 2) {
      yield put({
        type: actionTypes.LOGIN_FAILED,
        payload: {},
      });
      yield put({
        type: actionTypes.ERROR_NOTIFICATION,
        payload: {
          msg: i18n.t("msg wrong code"),
        }
      });
    } else {
      yield put({
        type: actionTypes.ERROR_NOTIFICATION,
        payload: {
          msg: i18n.t(e.response?.data?.message ?? "msg something went wrong"),
        }
      });
    }
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