import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import {clean} from "react-redux-toastr/lib/actions";

const MainRoute = ({ render, cleanToastr, location, ...rest }) => {

  return (
    <Route
      {...rest}
      render={matchProps => (
        <MainLayout
          {...rest}
        >
          {render(matchProps)}
        </MainLayout>
      )}
    />
  );
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      cleanToastr: clean,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(MainRoute);