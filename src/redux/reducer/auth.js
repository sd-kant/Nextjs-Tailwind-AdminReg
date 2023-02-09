import {produce} from 'immer';
import {actionTypes} from "../type";
import {
  USER_TYPE_ADMIN,
  USER_TYPE_ORG_ADMIN
} from "../../constant";
const userType = localStorage.getItem("kop-v2-user-type") ?
    JSON.parse(localStorage.getItem("kop-v2-user-type"))
    :
    null;
const initialState = {
  token: localStorage.getItem("kop-v2-token"),
  registerToken: localStorage.getItem("kop-v2-register-token"),
  userType,
  loggedIn: localStorage.getItem("kop-v2-logged-in")?.toString() === "true",
  organizationId: localStorage.getItem("kop-v2-picked-organization-id"),
  isAdmin: userType?.some(it => [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].includes(it?.toString())),
  mobileToken: null,
  baseUri: null,
  smsAuthFailedCount: 0,
  passwordExpired: false,
};

const authReducer =  (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_SUCCESS:
      return produce(state, draft => {
        draft.token = action.payload.token;
        draft.registerToken = action.payload.token;
        draft.userType = action.payload.userType;
        draft.organizationId = action.payload.organizationId;
        draft.isAdmin = action.payload.userType?.some(it => [USER_TYPE_ADMIN, USER_TYPE_ORG_ADMIN].includes(it?.toString()));
      });
    case actionTypes.PASSWORD_EXPIRED:
      return produce(state, draft => {
        draft.passwordExpired = action.payload.passwordExpired;
      });
    case actionTypes.LOGGED_IN:
      return produce(state, draft => {
        draft.loggedIn = action.payload.loggedIn;
      });

    case actionTypes.SET_USER_TYPE:
      return produce(state, draft => {
        draft.userType = action.payload.userType;
      });

    case actionTypes.SET_MOBILE_TOKEN:
      return produce(state, draft => {
        draft.mobileToken = action.payload.token;
      });

    case actionTypes.SET_BASE_URI:
      return produce(state, draft => {
        draft.baseUri = action.payload.baseUri;
      });

    case actionTypes.LOGIN_FAILED:
      return produce(state, draft => {
        draft.smsAuthFailedCount++;
      });

    case actionTypes.REGISTER_LOGIN_SUCCESS:
      return produce(state, draft => {
        draft.registerToken = action.payload.token;
      });

    default:
      return state;
  }
};

export default authReducer;
