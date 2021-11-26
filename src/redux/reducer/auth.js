import {produce} from 'immer';
import {actionTypes} from "../type";

const initialState = {
  token: localStorage.getItem("kop-v2-token"),
  userType: localStorage.getItem("kop-v2-user-type") ? JSON.parse(localStorage.getItem("kop-v2-user-type")) : null,
  loggedIn: localStorage.getItem("kop-v2-logged-in")?.toString() === "true",
  // organizationId: localStorage.getItem("kop-organization-id"),
};

export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_SUCCESS:
      return produce(state, draft => {
        draft.token = action.payload.token;
        draft.userType = action.payload.userType;
        // draft.organizationId = action.payload.organizationId;
      });
    case actionTypes.LOGGED_IN:
      return produce(state, draft => {
        draft.loggedIn = action.payload.loggedIn;
      });

    default:
      return state;
  }
}