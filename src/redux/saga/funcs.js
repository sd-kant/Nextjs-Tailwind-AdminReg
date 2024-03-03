import { put, call, select } from 'redux-saga/effects';
import { actionTypes } from '../type';
import i18n from '../../i18nextInit';
import { updateProfileV2 } from '../../http';
import { get } from 'lodash';

export function* updateProfileSaga({ payload: { body, nextPath, apiCall, navigate } }) {
  try {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: true
      }
    });
    const state = yield select();
    const token = get(state, 'auth.registerToken');
    const profile = get(state, 'profile.profile');

    if (apiCall) {
      if (token) {
        const apiRes = yield call(updateProfileV2, body, token);
        const responseData = apiRes.data;
        yield put({
          type: actionTypes.PROFILE_UPDATED,
          payload: {
            profile: responseData
          }
        });
      }
    } else {
      yield put({
        type: actionTypes.PROFILE_UPDATED,
        payload: {
          profile: {
            ...profile,
            ...body
          }
        }
      });
    }
    if (nextPath) {
      navigate(nextPath);
    }
  } catch (e) {
    console.log('update profile error', e);
    yield put({
      type: actionTypes.ERROR_NOTIFICATION,
      payload: {
        msg: i18n.t(e.response?.data?.message)
      }
    });
  } finally {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: false
      }
    });
  }
}
