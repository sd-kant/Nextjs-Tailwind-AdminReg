import React from 'react';
import { connect } from 'react-redux';
import './App.scss';
import Router from './Router';
import './i18nextInit';
import Backdrop from './views/components/Backdrop';
import Loader from './views/components/Loader';
import { get } from 'lodash';
import { WidthProvider } from './providers/WidthProvider';
import { GlobalDebug } from './utils/remove-console';

export const isProductionMode = process.env.REACT_APP_ENV === 'PRODUCTION';

function App({ loading }) {
  React.useEffect(() => {
    isProductionMode && GlobalDebug(false);
  }, []);

  return (
    <WidthProvider>
      <div>
        {loading && (
          <>
            <Backdrop />
            <Loader />
          </>
        )}
        <Router />
      </div>
    </WidthProvider>
  );
}

const mapStateToProps = (state) => ({
  loading: get(state, 'ui.loading')
});

export default connect(mapStateToProps, null)(App);
