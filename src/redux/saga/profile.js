import {
  takeLatest,
  put,
  call,
  select,
} from 'redux-saga/effects';
import {actionTypes} from '../type';
import i18n from '../../i18nextInit';
import {
  getMedicalQuestionsV2,
  getMedicalResponsesV2,
  getProfileV2,
  updateProfileV2
} from "../../http";
import {get} from "lodash";

function* actionWatcher() {
  yield takeLatest(actionTypes.UPDATE_PROFILE, updateProfileSaga);
  yield takeLatest(actionTypes.GET_PROFILE, getProfileSaga);
  yield takeLatest(actionTypes.GET_MEDICAL_QUESTIONS, getMedicalQuestionsSaga);
  yield takeLatest(actionTypes.GET_MEDICAL_RESPONSES, getMedicalResponsesSaga);
}

function* updateProfileSaga(
  {
    payload: {
      body,
      nextPath,
      apiCall,
      navigate,
    }
  }) {
  try {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: true,
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
            profile: responseData,
          }
        });
      }
    } else {
      yield put({
        type: actionTypes.PROFILE_UPDATED,
        payload: {
          profile: {
            ...profile,
            ...body,
          },
        }
      });
    }
    if (nextPath) {
      navigate(nextPath);
    }
  } catch (e) {
    console.log("update profile error", e);
    yield put({
      type: actionTypes.ERROR_NOTIFICATION,
      payload: {
        msg: i18n.t(e.response?.data?.message),
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

function* getProfileSaga() {
  try {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: true,
      }
    });
    const state = yield select();
    const token = get(state, 'auth.registerToken');
    if (token) {
      const apiRes = yield call(getProfileV2, token);
      const responseData = apiRes.data;
      const {userTypes} = responseData;
      localStorage.setItem("kop-v2-user-type", JSON.stringify(userTypes));
      yield put({
        type: actionTypes.SET_USER_TYPE,
        payload: {
          userType: userTypes,
        }
      });

      yield put({
        type: actionTypes.PROFILE_UPDATED,
        payload: {
          profile: responseData,
        }
      });
    }
  } catch (e) {
    console.log("get profile error", e);
    yield put({
      type: actionTypes.ERROR_NOTIFICATION,
      payload: {
        msg: i18n.t(e.response?.data?.message),
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

function* getMedicalQuestionsSaga() {
  try {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: true,
      }
    });
    const state = yield select();
    const token = get(state, 'auth.registerToken');
    if (token) {
      const apiRes = yield call(getMedicalQuestionsV2, token);
      const responseData = apiRes.data;
      yield put({
        type: actionTypes.SET_MEDICAL_QUESTIONS,
        payload: {
          medicalQuestions: responseData,
        }
      });
    }
  } catch (e) {
    console.log("get medical questions error", e);
    yield put({
      type: actionTypes.ERROR_NOTIFICATION,
      payload: {
        msg: i18n.t(e.response?.data?.message),
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

function* getMedicalResponsesSaga() {
  try {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: true,
      }
    });
    const state = yield select();
    const token = get(state, 'auth.registerToken');
    if (token) {
      const apiRes = yield call(getMedicalResponsesV2, token);
      const responseData = apiRes.data;
      yield put({
        type: actionTypes.SET_MEDICAL_RESPONSES,
        payload: {
          medicalResponses: responseData,
        }
      });
    }
  } catch (e) {
    console.log("get medical responses error", e);
    yield put({
      type: actionTypes.ERROR_NOTIFICATION,
      payload: {
        msg: i18n.t(e.response?.data?.message),
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