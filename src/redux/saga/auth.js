import { takeLatest, put, call } from 'redux-saga/effects';
import { actionTypes } from '../type';
import { instance, login, lookupByUsername } from '../../http';
import i18n from '../../i18nextInit';
import { getDeviceId, setStorageAfterLogin, setStorageAfterRegisterLogin } from '../../utils';
import { apiBaseUrl } from '../../config';

function* actionWatcher() {
  yield takeLatest(actionTypes.LOGIN, loginSaga);
}

function* loginSaga({
  payload: { username, password, phoneNumber, loginCode, fromRegister = false, navigate }
}) {
  let mode = 1; // 1: username, 2: sms
  try {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: true
      }
    });
    let body, apiRes;
    if (username && password) {
      body = {
        username,
        password
      };
      instance.defaults.baseURL = apiBaseUrl;
      const lookupRes = yield call(lookupByUsername, username);
      if (lookupRes.data?.baseUri) {
        instance.defaults.baseURL = lookupRes.data?.baseUri;
      }
    } else if (phoneNumber && loginCode) {
      body = {
        phoneNumber,
        loginCode
      };
      mode = 2;
    }
    // attach deviceId
    if (!body.deviceId) {
      const deviceId = getDeviceId();
      body['deviceId'] = `web:${deviceId}`;
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
      passwordExpired
    } = responseData;

    yield put({
      type: fromRegister ? actionTypes.REGISTER_LOGIN_SUCCESS : actionTypes.LOGIN_SUCCESS,
      payload: {
        token,
        userType,
        organizationId: orgId
      }
    });
    yield put({
      type: actionTypes.PASSWORD_EXPIRED,
      payload: {
        passwordExpired: passwordExpired
      }
    });

    if (!passwordExpired) {
      yield put({
        type: actionTypes.LOGGED_IN,
        payload: {
          loggedIn: !mfa
        }
      });
      yield put({
        type: actionTypes.SET_BASE_URI,
        payload: {
          baseUri: instance.defaults.baseURL
        }
      });
      if (fromRegister) {
        setStorageAfterRegisterLogin({
          token,
          baseUrl: instance.defaults.baseURL,
          username: username
        });

        if (!mfa) {
          // if multi-factor authentication off
          navigate('/create-account/name');
        } else {
          navigate('/create-account/phone-register');
        }
      } else {
        localStorage.setItem('kop-v2-logged-in', !mfa ? 'true' : 'false');

        if (!mfa) {
          // if multi-factor authentication off
          setStorageAfterLogin({
            token,
            refreshToken,
            userType,
            orgId,
            baseUrl: instance.defaults.baseURL
          });
          navigate('/select-mode');
        } else {
          if (havePhone) {
            navigate('/phone-verification/1');
          } else {
            navigate('/phone-register');
          }
        }
      }
    } else {
      navigate('/password-expired');
    }
  } catch (e) {
    console.log('login error', e);
    if (e.response?.data?.status?.toString() === '400' && mode === 2) {
      yield put({
        type: actionTypes.LOGIN_FAILED,
        payload: {}
      });
      yield put({
        type: actionTypes.ERROR_NOTIFICATION,
        payload: {
          msg: i18n.t('msg wrong code')
        }
      });
    } else if (e.response?.data?.error === 'error.auth.invalidCredentials') {
      yield put({
        type: actionTypes.ERROR_NOTIFICATION,
        payload: {
          msg: i18n.t('msg credentials invalid')
        }
      });
    } else {
      yield put({
        type: actionTypes.ERROR_NOTIFICATION,
        payload: {
          msg: i18n.t(e.response?.data?.message)
        }
      });
    }
  } finally {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: false
      }
    });
  }
}

export default actionWatcher;
