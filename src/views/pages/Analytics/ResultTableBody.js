import * as React from "react";
import clsx from "clsx";
import style from "./ResultTableBody.module.scss";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";
import {useUtilsContext} from "../../../providers/UtilsProvider";
import {formatHeartRate} from "../../../utils/dashboard";

const ResultTableBody = (
  {
    metric: unitMetric,
  }) => {
  const {
    analytics,
    metric,
    getUserNameFromUserId,
    getTeamNameFromUserId,
    getTeamNameFromTeamId,
    formatRiskLevel,
    members,
  } = useAnalyticsContext();
  const data = React.useMemo(() => {
    let ret = [];
    if (metric === 1) {
      ret = analytics?.wearTime;
    } else if (metric === 2) {
      ret = analytics?.alertMetrics;
    } else if (metric === 3) {
      ret = analytics?.maxCbt;
    } else if (metric === 5) {
      ret = analytics?.swrFluid;
    } else if (metric === 22) { // active users in team
      // analytics?.activeUsers
      analytics?.activeUsers?.forEach(it => {
        const member = members?.find(ele => ele.userId === it.userId);
        const memberTeamId = member.teamId;
        const index = ret?.findIndex(e => e.teamId === memberTeamId);

        if (index !== -1) {
          ret.splice(index, 1, {
            teamId: memberTeamId,
            cnt: ret[index].cnt + 1,
          });
        } else {
          ret.push({
            teamId: memberTeamId,
            cnt: 1,
          })
        }
      });
    } else if (metric === 23) {
      analytics?.swrFluid.forEach(it => {
        const index = ret?.findIndex(e => e.teamId === it.teamId);
        if (["low", "moderate", "high"].includes(it.sweatRateCategory?.toLowerCase())) {
          if (index !== -1) {
            ret.splice(index, 1, {
              ...ret[index],
              [it.sweatRateCategory?.toLowerCase()]: (ret[index][it.sweatRateCategory?.toLowerCase()] ?? 0) + 1,
            });
          } else {
            ret.push(
              {
                teamId: it.teamId,
                [it.sweatRateCategory?.toLowerCase()]: 1,
              }
            )
          }
        }
      });
    } else if (metric === 24) {
      analytics?.swrFluid.forEach(it => {
        const index = ret?.findIndex(e => e.teamId === it.teamId);
        if (["low", "medium", "high"].includes(it.heatSusceptibility?.toLowerCase())) {
          if (index !== -1) {
            ret.splice(index, 1, {
              ...ret[index],
              [it.heatSusceptibility?.toLowerCase()]: (ret[index][it.heatSusceptibility?.toLowerCase()] ?? 0) + 1,
            });
          } else {
            ret.push(
              {
                teamId: it.teamId,
                [it.heatSusceptibility?.toLowerCase()]: 1,
              }
            )
          }
        }
      });
    }
    if (ret?.length > 0) return ret;
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => ({userId: null}));
  }, [analytics, metric, members]);
  const {formatAlert, formatHeartCbt} = useUtilsContext();
  console.log(data);

  return (
    <tbody>
    {
      data?.map((it, index) =>
        <tr key={`query-record-${index}`}>
          {
            metric === 1 &&
            <React.Fragment>
              <td className={clsx(style.Cell)}>
                {getUserNameFromUserId(it.userId)}
              </td>
              <td className={clsx(style.Cell)}>
                {getTeamNameFromUserId(it.userId)}
              </td>
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
                {getUserNameFromUserId(it.userId)}
              </td>
              <td className={clsx(style.Cell)}>
                {getTeamNameFromUserId(it.userId)}
              </td>
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
          {
            metric === 3 &&
            <React.Fragment>
              <td className={clsx(style.Cell)}>
                {getUserNameFromUserId(it.userId)}
              </td>
              <td className={clsx(style.Cell)}>
                {getTeamNameFromUserId(it.userId)}
              </td>
              <td className={clsx(style.Cell)}>
                {it.maxCbt ? formatHeartCbt(it.maxCbt) : ''}
              </td>
            </React.Fragment>
          }
          {
            metric === 4 &&
            <React.Fragment>
              <td className={clsx(style.Cell)}>
                {getUserNameFromUserId(it.userId)}
              </td>
              <td className={clsx(style.Cell)}>
                {getTeamNameFromUserId(it.userId)}
              </td>
              <td className={clsx(style.Cell)}>
                {it.count ?? ''}
              </td>
            </React.Fragment>
          }
          {
            metric === 5 &&
            <React.Fragment>
              <td className={clsx(style.Cell)}>
                {getUserNameFromUserId(it.userId)}
              </td>
              <td className={clsx(style.Cell)}>
                {getTeamNameFromUserId(it.userId)}
              </td>
              <td className={clsx(style.Cell)}>
                {it.sweatRateCategory ?? ''}
              </td>
              <td className={clsx(style.Cell)}>
                {it.sweatRate ?? ''}
              </td>
              {
                unitMetric ?
                  <td className={clsx(style.Cell)}>
                    {it.fluidRecommendationL ?? ''}
                  </td> :
                  <td className={clsx(style.Cell)}>
                    {it.fluidRecommendationG ?? ''}
                  </td>
              }
              <td className={clsx(style.Cell)}>
                {it.previousIllness ?? ''}
              </td>
              <td className={clsx(style.Cell)}>
                {it.acclimatizationStatus ?? ''}
              </td>
              <td className={clsx(style.Cell)}>
                {it.heatSusceptibility ?? ''}
              </td>
            </React.Fragment>
          }
          {
            metric === 22 &&
            <React.Fragment>
              <td className={clsx(style.Cell)}>
                {getTeamNameFromTeamId(it.teamId)}
              </td>
              <td className={clsx(style.Cell)}>
                {it.cnt}
              </td>
            </React.Fragment>
          }
          {
            metric === 23 &&
            <React.Fragment>
              <td className={clsx(style.Cell)}>
                {getTeamNameFromTeamId(it.teamId)}
              </td>
              <td className={clsx(style.Cell)}>
                {it['low']}
              </td>
              <td className={clsx(style.Cell)}>
                {it['moderate']}
              </td>
              <td className={clsx(style.Cell)}>
                {it['high']}
              </td>
            </React.Fragment>
          }
          {
            metric === 24 &&
            <React.Fragment>
              <td className={clsx(style.Cell)}>
                {getTeamNameFromTeamId(it.teamId)}
              </td>
              <td className={clsx(style.Cell)}>
                {it['low']}
              </td>
              <td className={clsx(style.Cell)}>
                {it['medium']}
              </td>
              <td className={clsx(style.Cell)}>
                {it['high']}
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
