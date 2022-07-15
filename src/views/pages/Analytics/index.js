import * as React from "react";
import clsx from "clsx";
import style from "./Analytics.module.scss";

import FilterBoard from "./FilterBoard";
import QueryResult from "./QueryResult";
import {BasicProvider} from "../../../providers/BasicProvider";
import {AnalyticsProvider} from "../../../providers/AnalyticsProvider";
import {UtilsProvider} from "../../../providers/UtilsProvider";

const Analytics = () => {
  return (
    <div className={clsx(style.Wrapper)}>
      <BasicProvider>
        <AnalyticsProvider>
          <UtilsProvider>
            <FilterBoard/>
            <QueryResult/>
          </UtilsProvider>
        </AnalyticsProvider>
      </BasicProvider>
    </div>
  )
}

export default Analytics;
