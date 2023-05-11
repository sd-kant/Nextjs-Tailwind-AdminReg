import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { useLocation, Navigate } from 'react-router-dom';
import { isAdmin } from '../../utils';

function RequireAdminRole({ children, userType }) {
  let location = useLocation();
  if (!isAdmin(userType)) {
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }

  return children;
}

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType')
});

export default connect(mapStateToProps, null)(RequireAdminRole);
