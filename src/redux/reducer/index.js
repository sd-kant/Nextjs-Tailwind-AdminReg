import ui from "./ui";
import auth from "./auth";
import base from "./base";
import {combineReducers} from "redux";
import {reducer as toastrReducer} from 'react-redux-toastr';

const rootReducer = combineReducers({
  ui,
  auth,
  base,
  toastr: toastrReducer,
});

export default rootReducer;