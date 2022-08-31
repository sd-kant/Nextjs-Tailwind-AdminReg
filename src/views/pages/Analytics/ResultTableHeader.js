import * as React from "react";
import clsx from "clsx";
import style from "./ResultTableHeader.module.scss";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";

const ResultTableHeader = (
  {
    metric: unitMetric,
  }) => {
  const {metric} = useAnalyticsContext();

  return (
    <thead className={clsx(style.Header)}>
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
      {
        metric === 2 &&
        <React.Fragment>
          <td className={clsx(style.HeaderCell)}>
            Alert time
          </td>
          <td className={clsx(style.HeaderCell)}>
            Alert
          </td>
          <td className={clsx(style.HeaderCell)}>
            Heat Risk
          </td>
          <td className={clsx(style.HeaderCell)}>
            CBT
          </td>
          <td className={clsx(style.HeaderCell)}>
            Temp
          </td>
          <td className={clsx(style.HeaderCell)}>
            Humidity
          </td>
          <td className={clsx(style.HeaderCell)}>
            Heart Rate Avg
          </td>
        </React.Fragment>
      }
      {
        metric === 3 &&
        <React.Fragment>
          <td className={clsx(style.HeaderCell)}>
            Max CBT
          </td>
        </React.Fragment>
      }
      {
        metric === 4 &&
        <React.Fragment>
          <td className={clsx(style.HeaderCell)}>
            Count(HR)
          </td>
        </React.Fragment>
      }
      {
        metric === 5 &&
        <React.Fragment>
          <td className={clsx(style.HeaderCell)}>
            SWR Category
          </td>
          <td className={clsx(style.HeaderCell)}>
            SWR (L/h)
          </td>
          {
            unitMetric ?
              <td className={clsx(style.HeaderCell)}>
                Fluid Recmdt (L)
              </td> :
              <td className={clsx(style.HeaderCell)}>
                Fluid Recmdt (Gal)
              </td>
          }
          <td className={clsx(style.HeaderCell)}>
            Previous illness
          </td>
          <td className={clsx(style.HeaderCell)}>
            Acclim Status
          </td>
          <td className={clsx(style.HeaderCell)}>
            Heat Risk
          </td>
        </React.Fragment>
      }
    </tr>
    </thead>
  )
}

export default ResultTableHeader;
