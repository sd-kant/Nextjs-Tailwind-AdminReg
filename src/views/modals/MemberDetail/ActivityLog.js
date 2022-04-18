import * as React from "react";
import clsx from "clsx";
import style from "./ActivityLogs.module.scss";
import thermometer from '../../../assets/images/thermometer-orange.svg';
import heart from '../../../assets/images/heart.svg';
import {formatHeartRate} from "../../../utils/dashboard";
import {useUtilsContext} from "../../../providers/UtilsProvider";
import {timeOnOtherZone} from "../../../utils";

const ActivityLog = ({item, timezone}) => {
  const {formatHeartCbt, formatAlertForDetail, formatActivityLog} = useUtilsContext();
  return (
    <div className={clsx(style.DataRow)}>
      <div className={clsx(style.DataLabel)}>
        <div className={clsx('font-binary', style.Rounded)}>
          {
            item.type === "Alert" ?
              formatAlertForDetail(item.alertStageId)
              : formatActivityLog(item)
          }
        </div>
      </div>

      <div className={clsx(item.type !== "Alert" ? style.HideSM : null)}>
        <div className={clsx('font-binary', style.Rounded)}>
          <img className={style.MobileOnly} src={thermometer} alt="thermometer" width={8}
               style={{marginRight: '3px'}}/>
          <span
            className={clsx(style.HeartCBTSpan)}>{item.type === "Alert" ? formatHeartCbt(item.heartCbtAvg) : '--'}</span>
        </div>

        <div className={clsx('font-binary', style.Rounded, 'ml-15')}>
          <img className={style.MobileOnly} src={heart} alt="heart" width={13}
               style={{marginRight: '3px'}}/>
          <span
            className={clsx(style.HeartCBTSpan)}>{item.type === "Alert" ? formatHeartRate(item.heartRateAvg) : '--'}</span>
        </div>
      </div>

      <div>
        <span className={clsx('font-binary text-gray-2 mt-5', style.Padding)}>
          {timeOnOtherZone(item.utcTs, timezone)} <span className={clsx(style.MobileOnly)}>({timezone.displayName})</span>
        </span>
      </div>
    </div>
  )
}

export default React.memo(ActivityLog);
