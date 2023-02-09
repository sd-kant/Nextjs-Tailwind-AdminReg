import {produce} from 'immer';
import {actionTypes} from "../type";

const initialState = {
  allOrganizations: [],
  allTeams: [],
  teamMembers: [],
};

const baseReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.ALL_ORGANIZATIONS:
      return produce(state, draft => {
        draft.allOrganizations = action.payload.allOrganizations;
      });

    case actionTypes.ALL_TEAMS:
      return produce(state, draft => {
        draft.allTeams = action.payload.allTeams;
      });

    case actionTypes.TEAM_MEMBERS:
      return produce(state, draft => {
        draft.teamMembers = action.payload.teamMembers;
      });

    default:
      return state;
  }
};

export default baseReducer;
