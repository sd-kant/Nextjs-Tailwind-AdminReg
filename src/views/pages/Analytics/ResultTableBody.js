import * as React from "react";
import clsx from "clsx";
import style from "./ResultTableBody.module.scss";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";
import {useUtilsContext} from "../../../providers/UtilsProvider";
import {formatHeartRate} from "../../../utils/dashboard";

const ResultTableBody = () => {
  const {analytics, metric, getUserNameFromUserId, getTeamNameFromUserId, formatRiskLevel} = useAnalyticsContext();
  const data = React.useMemo(() => {
    let ret = [];
    if (metric === 1) {
      ret = analytics?.wearTime;
    } else if (metric === 2) {
      ret = analytics?.alertMetrics;
    }
    if (ret?.length > 0) return ret;
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => ({userId: null}));
  }, [analytics, metric]);
  const {formatAlert, formatHeartCbt} = useUtilsContext();

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
                  {it.avgWearTime ?? ''}
                </td>
                <td className={clsx(style.Cell)}>
                  {it.wearTime ?? ''}
                </td>
              </React.Fragment>
          }
          {
            metric === 2 &&
            <React.Fragment>
              <td className={clsx(style.Cell)}>
                {it.ts ? new Date(it.ts)?.toLocaleString() : ''}
              </td>
              <td className={clsx(style.Cell)}>
                {it.alertStageId ? formatAlert(it.alertStageId)?.label : ''}
              </td>
              <td className={clsx(style.Cell)}>
                {it.risklevelId ? formatRiskLevel(it.risklevelId) : ''}
              </td>
              <td className={clsx(style.Cell)}>
                {it.heartCbtAvg ? formatHeartCbt(it.heartCbtAvg) : ''}
              </td>
              <td className={clsx(style.Cell)}>
                {it.temperature ? formatHeartCbt(it.temperature) : ''}
              </td>
              <td className={clsx(style.Cell)}>
                {it.humidity ?? ''}
              </td>
              <td className={clsx(style.Cell)}>
                {it.heartRateAvg ? formatHeartRate(it.heartRateAvg) : ''}
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
