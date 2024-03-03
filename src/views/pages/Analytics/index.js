import * as React from 'react';
import clsx from 'clsx';
import style from './Analytics.module.scss';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  setLoadingAction,
  showErrorNotificationAction,
  showSuccessNotificationAction
} from '../../../redux/action/ui';
import { get } from 'lodash';

import FilterBoard from './FilterBoard';
import QueryResult from './QueryResult';
import { BasicProvider } from '../../../providers/BasicProvider';
import { AnalyticsProvider } from '../../../providers/AnalyticsProvider';
import { UtilsProvider } from '../../../providers/UtilsProvider';

const Analytics = ({ metric, setLoading }) => {
  return (
    <div className={clsx(style.Wrapper)}>
      <BasicProvider>
        <UtilsProvider>
          <AnalyticsProvider metric={metric} setLoading={setLoading}>
            <FilterBoard />
            <QueryResult />
          </AnalyticsProvider>
        </UtilsProvider>
      </BasicProvider>
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

export default connect(mapStateToProps, mapDispatchToProps)(Analytics);
