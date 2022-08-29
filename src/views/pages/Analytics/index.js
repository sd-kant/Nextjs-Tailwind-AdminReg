import * as React from "react";
import clsx from "clsx";
import style from "./Analytics.module.scss";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {setLoadingAction, showErrorNotificationAction, showSuccessNotificationAction} from "../../../redux/action/ui";

import FilterBoard from "./FilterBoard";
import QueryResult from "./QueryResult";
import {BasicProvider} from "../../../providers/BasicProvider";
import {AnalyticsProvider} from "../../../providers/AnalyticsProvider";
import {UtilsProvider} from "../../../providers/UtilsProvider";

const Analytics = (
  {
    setLoading,
  }) => {
  return (
    <div className={clsx(style.Wrapper)}>
      <BasicProvider>
        <AnalyticsProvider
          setLoading={setLoading}
        >
          <UtilsProvider>
            <FilterBoard/>
            <QueryResult/>
          </UtilsProvider>
        </AnalyticsProvider>
      </BasicProvider>
    </div>
  )
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction,
      showErrorNotification: showErrorNotificationAction,
      showSuccessNotification: showSuccessNotificationAction,
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps,
)(Analytics);
