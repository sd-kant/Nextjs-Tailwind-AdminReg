import {
  takeLatest,
  put,
  call,
  select,
} from 'redux-saga/effects';
import {get} from 'lodash';
import {actionTypes} from '../type';
import {
  deleteUser,
  queryAllOrganizations,
  queryTeamMembers,
  queryTeams,
  removeTeamMember,
} from "../../http";
import i18n from '../../i18nextInit';

function* actionWatcher() {
  yield takeLatest(actionTypes.QUERY_ALL_ORGANIZATIONS, queryAllOrganizationsSaga);
  yield takeLatest(actionTypes.QUERY_ALL_TEAMS, queryAllTeamsSaga);
  yield takeLatest(actionTypes.QUERY_TEAM_MEMBERS, queryTeamMembersSaga);
  yield takeLatest(actionTypes.REMOVE_TEAM_MEMBER, removeTeamMemberSaga);
  yield takeLatest(actionTypes.DELETE_USER, deleteUserSaga);
}

function* queryAllOrganizationsSaga() {
  try {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: true,
      }
    });

    const apiRes = yield call(queryAllOrganizations);
    const allOrganizations = apiRes?.data;
    allOrganizations.sort((a, b) => {
      return a.name > b.name ? 1 : -1;
    });

    yield put({
      type: actionTypes.ALL_ORGANIZATIONS,
      payload: {
        allOrganizations,
      }
    });
  } catch (e) {
    console.log(e);
    yield put({
      type: actionTypes.ERROR_NOTIFICATION,
      payload: {
        msg: e.response?.data?.message ?? (e?.message === "Network Error" ? i18n.t("no internet connection") : i18n.t("msg something went wrong")),
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

function* queryAllTeamsSaga() {
  try {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: true,
      }
    });
    const apiRes = yield call(queryTeams);
    const allTeams = apiRes.data;
    allTeams.sort((a, b) => {
      return a.name?.toLowerCase() > b.name?.toLowerCase() ? 1 : -1;
    });

    yield put({
      type: actionTypes.ALL_TEAMS,
      payload: {
        allTeams,
      }
    });
  } catch (e) {
    console.log(e);
    yield put({
      type: actionTypes.ERROR_NOTIFICATION,
      payload: {
        msg: e.response?.data?.message ?? (e?.message === "Network Error" ? i18n.t("no internet connection") : i18n.t("msg something went wrong")),
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

function* queryTeamMembersSaga({payload: {teamId}}) {
  try {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: true,
      }
    });
      const apiRes = yield call(queryTeamMembers, teamId);
      const responseData = apiRes.data;

      if (responseData?.status === 200) {
        const teamMembers = responseData?.data;

        yield put({
          type: actionTypes.TEAM_MEMBERS,
          payload: {
            teamMembers,
          }
        });
      } else {
        yield put({
          type: actionTypes.ERROR_NOTIFICATION,
          payload: {
            msg: responseData?.msg
          }
        });
      }
  } catch (e) {
    console.log(e);
    yield put({
      type: actionTypes.ERROR_NOTIFICATION,
      payload: {
        msg: e.response?.data?.message ?? (e?.message === "Network Error" ? i18n.t("no internet connection") : i18n.t("msg something went wrong")),
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

function* removeTeamMemberSaga({payload: {userId}}) {
  try {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: true,
      }
    });
      const apiRes = yield call(removeTeamMember, userId);
      const responseData = apiRes.data;

      if (responseData?.status === 200) {
        const state = yield select();
        const teamMembers = get(state, 'base.teamMembers');

        const removedTeamMember = teamMembers?.find(it => it.userId?.toString() === userId?.toString());
        if (removedTeamMember) {
          yield put({
            type: actionTypes.SUCCESS_NOTIFICATION,
            payload: {
              msg: i18n.t("msg user removed success", {user: `${removedTeamMember.firstName} ${removedTeamMember.lastName}`}),
            }
          });
        }

        const newTeamMembers = teamMembers?.filter(it => it.userId?.toString() !== userId?.toString());

        yield put({
          type: actionTypes.TEAM_MEMBERS,
          payload: {
            teamMembers: newTeamMembers,
          }
        });
      } else {
        yield put({
          type: actionTypes.ERROR_NOTIFICATION,
          payload: {
            msg: responseData?.msg
          }
        });
      }
  } catch (e) {
    console.log(e);
    yield put({
      type: actionTypes.ERROR_NOTIFICATION,
      payload: {
        msg: e.response?.data?.message ?? (e?.message === "Network Error" ? i18n.t("no internet connection") : i18n.t("msg something went wrong")),
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

function* deleteUserSaga({payload: {userId}}) {
  try {
    yield put({
      type: actionTypes.LOADING,
      payload: {
        loading: true,
      }
    });
    const apiRes = yield call(deleteUser, userId);
    const responseData = apiRes.data;

    if (responseData?.status === 200) {
      const state = yield select();
      const teamMembers = get(state, 'base.teamMembers');

      const deletedTeamMember = teamMembers?.find(it => it.userId?.toString() === userId?.toString());
      if (deletedTeamMember) {
        yield put({
          type: actionTypes.SUCCESS_NOTIFICATION,
          payload: {
            msg: i18n.t("msg user deleted success", {user: `${deletedTeamMember.firstName} ${deletedTeamMember.lastName}`}),
          }
        });
      }

      const newTeamMembers = teamMembers?.filter(it => it.userId?.toString() !== userId?.toString());

      yield put({
        type: actionTypes.TEAM_MEMBERS,
        payload: {
          teamMembers: newTeamMembers,
        }
      });
    } else {
      yield put({
        type: actionTypes.ERROR_NOTIFICATION,
        payload: {
          msg: responseData?.msg
        }
      });
    }
  } catch (e) {
    console.log(e);
    yield put({
      type: actionTypes.ERROR_NOTIFICATION,
      payload: {
        msg: e.response?.data?.message ?? (e?.message === "Network Error" ? i18n.t("no internet connection") : i18n.t("msg something went wrong")),
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