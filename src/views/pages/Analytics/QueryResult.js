import * as React from "react";
import {connect} from "react-redux";

import clsx from "clsx";
import style from "./QueryResult.module.scss";
import ResultTableHeader from "./ResultTableHeader";
import ResultTableBody from "./ResultTableBody";
import {get} from "lodash";

const QueryResult = (
  {
    metric,
  }) => {
  return (
    <div className={clsx(style.Wrapper)}>
      <table className={clsx(style.Table)}>
        <ResultTableHeader metric={metric}/>
        <ResultTableBody metric={metric}/>
      </table>
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
