import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route } from 'react-router-dom';
import SignInLayout from '../layouts/SignInLayout';
import { clean } from 'react-redux-toastr/lib/actions';

const SignInRoute = ({ render, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(matchProps) => <SignInLayout {...rest}>{render(matchProps)}</SignInLayout>}
    />
  );
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      cleanToastr: clean
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(SignInRoute);
