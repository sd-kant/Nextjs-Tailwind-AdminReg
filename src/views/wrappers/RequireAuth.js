import React from "react";
import {connect} from "react-redux";
import {useLocation, Navigate} from "react-router-dom";
import {get} from "lodash";

function RequireAuth({children, token, loggedIn, requireLoggedIn = false}) {
  let location = useLocation();
  if (!token || (requireLoggedIn && !loggedIn)) {
    return <Navigate to="/login" state={{from: location}} replace/>;
  }

  return children;
}

const mapStateToProps = (state) => ({
  token: get(state, 'auth.token'),
  loggedIn: get(state, 'auth.loggedIn'),
});

export default connect(mapStateToProps, null)(RequireAuth);
