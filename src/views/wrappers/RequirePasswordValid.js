import React from "react";
import {connect} from "react-redux";
import {useLocation, Navigate} from "react-router-dom";
import {get} from "lodash";

function RequirePasswordValid({children, passwordExpired}) {
  let location = useLocation();
  if (passwordExpired) {
    return <Navigate to="/password-expired" state={{from: location}} replace/>;
  }

  return children;
}

const mapStateToProps = (state) => ({
  passwordExpired: get(state, 'auth.passwordExpired'),
});

export default connect(mapStateToProps, null)(RequirePasswordValid);
