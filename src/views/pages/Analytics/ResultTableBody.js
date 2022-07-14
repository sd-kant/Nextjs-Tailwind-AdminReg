import * as React from "react";
import clsx from "clsx";
import style from "./ResultTableBody.module.scss";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";

const ResultTableBody = () => {
  const {analytics, metric, getUserNameFromUserId, getTeamNameFromUserId} = useAnalyticsContext();
  const data = React.useMemo(() => {
    if (metric === 1) {
      return analytics?.wearTime;
    }
    return [];
  }, [analytics, metric]);

  return (
    <tbody>
    {
      data?.map((it, index) =>
        <tr key={`query-record-${index}`}>
          <td className={clsx(style.Cell)}>
            {getUserNameFromUserId(it.userId)}
          </td>
          <td className={clsx(style.Cell)}>
            {getTeamNameFromUserId(it.userId)}
          </td>
          {
            metric === 1 &&
              <React.Fragment>
                <td className={clsx(style.Cell)}>
                  {it.avgWearTime}
                </td>
                <td className={clsx(style.Cell)}>
                  {it.wearTime}
                </td>
              </React.Fragment>
          }
        </tr>
      )
    }
    </tbody>
  )
}

export default ResultTableBody;
