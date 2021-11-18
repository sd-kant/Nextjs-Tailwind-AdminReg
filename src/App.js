import React from 'react';
import {connect} from "react-redux";
import './App.scss';
import Router from "./Router";
import "./i18nextInit";
import {Backdrop} from "./views/components/Backdrop";
import {Loader} from "./views/components/Loader";
import {get} from 'lodash';

function App({loading}) {
  return (
    <div>
      {
        loading && (
          <>
            <Backdrop/>
            <Loader/>
          </>
        )
      }
      <Router/>
    </div>
  );
}

const mapStateToProps = (state) => ({
  loading: get(state, 'ui.loading'),
});

export default connect(mapStateToProps, null)(App);
