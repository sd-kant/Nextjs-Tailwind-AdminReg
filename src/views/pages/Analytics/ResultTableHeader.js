import * as React from "react";
import clsx from "clsx";
import style from "./ResultTableHeader.module.scss";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";

const ResultTableHeader = () => {
  const {metric} = useAnalyticsContext();

  return (
    <thead>
    <tr>
      <td className={clsx(style.HeaderCell)}>
        Name
      </td>
      <td className={clsx(style.HeaderCell)}>
        Team
      </td>
      {
        metric === 1 &&
        <React.Fragment>
          <td className={clsx(style.HeaderCell)}>
            Avg Wear Time
          </td>
          <td className={clsx(style.HeaderCell)}>
            Total Wear Time
          </td>
        </React.Fragment>
      }
    </tr>
    </thead>
  )
}

export default ResultTableHeader;
