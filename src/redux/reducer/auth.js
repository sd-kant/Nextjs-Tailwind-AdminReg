import {produce} from 'immer';
import {actionTypes} from "../type";
import {USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN} from "../../constant";
const userType = localStorage.getItem("kop-v2-user-type") ? JSON.parse(localStorage.getItem("kop-v2-user-type")) : null;
const initialState = {
  token: localStorage.getItem("kop-v2-token"),
  userType,
  loggedIn: localStorage.getItem("kop-v2-logged-in")?.toString() === "true",
  organizationId: localStorage.getItem("kop-v2-picked-organization-id"),
  isAdmin: userType?.some(it => [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].includes(it?.toString())),
  mobileToken: null,
  baseUri: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_SUCCESS:
      return produce(state, draft => {
        draft.token = action.payload.token;
        draft.userType = action.payload.userType;
        draft.organizationId = action.payload.organizationId;
        draft.isAdmin = action.payload.userType?.some(it => [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].includes(it?.toString()));
      });
    case actionTypes.LOGGED_IN:
      return produce(state, draft => {
        draft.loggedIn = action.payload.loggedIn;
      });

    case actionTypes.SET_MOBILE_TOKEN:
      return produce(state, draft => {
        draft.mobileToken = action.payload.token;
      });

    case actionTypes.SET_BASE_URI:
      return produce(state, draft => {
        draft.baseUri = action.payload.baseUri;
      });

    default:
      return state;
  }
}