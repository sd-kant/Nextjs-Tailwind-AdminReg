import * as React from "react";
import {connect} from "react-redux";

import clsx from "clsx";
import style from "./QueryResult.module.scss";
import ResultTableHeader from "./ResultTableHeader";
import ResultTableBody from "./ResultTableBody";
import {get} from "lodash";
import Toggle from "../../components/Toggle";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";

const QueryResult = (
  {
    metric,
  }) => {
  const {statsBy, setStatsBy} = useAnalyticsContext();

  return (
    <div className={clsx(style.Wrapper)}>
      <div className={clsx(style.InnerWrapper)}>
        <div className={clsx(style.TableWrapper)}>
          <table className={clsx(style.Table)}>
            <ResultTableHeader metric={metric}/>
            <ResultTableBody metric={metric}/>
          </table>
        </div>
      </div>

      <div className={clsx(style.StatsSelectWrapper)}>
        <Toggle
          on={statsBy === 'team'}
          titleOn={'User'}
          titleOff={'Team'}
          handleSwitch={v => {
            setStatsBy(v ? 'team' : 'user');
          }}
        />
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.metric'),
});

export default connect(
  mapStateToProps,
  null
)(QueryResult);
