import {actionTypes} from "../type";

export const queryAllOrganizationsAction = () => ({
  type: actionTypes.QUERY_ALL_ORGANIZATIONS,
  payload: {}
});

export const queryAllTeamsAction = () => ({
  type: actionTypes.QUERY_ALL_TEAMS,
  payload: {}
});

export const removeTeamMemberAction = (userId) => ({
  type: actionTypes.REMOVE_TEAM_MEMBER,
  payload: {
    userId: userId,
  }
});

export const deleteUserAction = (userId) => ({
  type: actionTypes.DELETE_USER,
  payload: {
    userId: userId,
  }
});
