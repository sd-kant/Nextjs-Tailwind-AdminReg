import * as React from "react";
import clsx from "clsx";
import style from "./ResultTableHeader.module.scss";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";

const ResultTableHeader = () => {
  const {headers} = useAnalyticsContext();

  return (
    <thead className={clsx(style.Header)}>
    <tr>
      {
        headers?.map((it, index) => (
          <td
            className={clsx(style.HeaderCell, index === 0 ? style.FirstColumn : null)}
            key={`header-${index}`}
          >
            {it}
          </td>
        ))
      }
    </tr>
    </thead>
  )
}

export default ResultTableHeader;
