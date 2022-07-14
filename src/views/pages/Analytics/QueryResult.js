import * as React from "react";
import clsx from "clsx";
import style from "./QueryResult.module.scss";

import ResultTableHeader from "./ResultTableHeader";
import ResultTableBody from "./ResultTableBody";

const QueryResult = () => {
  return (
    <div>
      <table className={clsx(style.Table)}>
        <ResultTableHeader/>
        <ResultTableBody/>
      </table>
    </div>
  )
}

export default QueryResult;
