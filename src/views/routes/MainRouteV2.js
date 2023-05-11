import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route } from 'react-router-dom';
import MainLayoutV2 from '../layouts/MainLayoutV2';

const MainRouteV2 = ({ render, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(matchProps) => <MainLayoutV2 {...rest}>{render(matchProps)}</MainLayoutV2>}
    />
  );
};

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(null, mapDispatchToProps)(MainRouteV2);
