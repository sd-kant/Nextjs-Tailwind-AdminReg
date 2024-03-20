import * as React from 'react';
import clsx from 'clsx';
import style from './News.module.scss';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  setLoadingAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from '../../../redux/action/ui';
import { get } from 'lodash';

import QueryResult from './QueryResult';
import { NewsProvider } from '../../../providers/NewsProvider';

const News = ({ setLoading }) => {
  return (
    <div className={clsx(style.Wrapper)}>
      <NewsProvider setLoading={setLoading}>
        <QueryResult />
      </NewsProvider>
    </div>
  );
};

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.measure')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(News);
